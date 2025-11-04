import { Logger } from "winston";
import getLogger from "../../utils/LoggerUtils";
import { BackoffStrategy, retry } from "../../utils/RetryUtils";

export interface CrawlerRunOptions {
    batchSize?: number;
    maxBatches?: number;
    maxRetries?: number;
    retryStartDelaySeconds?: number;
    retryStrategy?: keyof typeof BackoffStrategy;
    stopOnEmptyBatch?: boolean;
}

export interface CrawlBatchResult<TRaw, TCursor> {
    items: TRaw[];
    nextCursor?: TCursor;
}

export abstract class TxsCrawler<TRaw, TTransformed, TExportResult, TCursor> {
    protected readonly name: string;
    protected readonly logger: Logger;

    constructor(name: string) {
        this.name = name;
        this.logger = getLogger(this.name);

        this.crawlBatch = this.crawlBatch.bind(this);
        this.transformBatch = this.transformBatch.bind(this);
        this.exportBatch = this.exportBatch.bind(this);
    }

    // Phase 1: Crawl - Lấy dữ liệu thô theo batch, dùng cursor để phân trang/tiếp tục
    protected abstract crawlBatch(cursor: TCursor | undefined, batchSize: number): Promise<CrawlBatchResult<TRaw, TCursor>>;

    // Phase 2: Transform - Chuyển đổi dữ liệu thô về cấu trúc nội bộ/chuẩn hoá
    protected abstract transformBatch(items: TRaw[]): Promise<TTransformed[]>;

    // Phase 3: Export - Xuất dữ liệu đã transform sang nơi đích (DB, queue, file...)
    protected abstract exportBatch(items: TTransformed[]): Promise<TExportResult>;

    // Hook tuỳ chọn trước/after các phase
    protected async beforeRun(_options: CrawlerRunOptions): Promise<void> {}
    protected async afterRun(_options: CrawlerRunOptions): Promise<void> {}

    public async run(options: CrawlerRunOptions = {}): Promise<void> {
        const { batchSize = 100, maxRetries = 3, retryStartDelaySeconds = 0.5, retryStrategy = "linear", stopOnEmptyBatch = true } = options;

        this.logger.info(`Start crawler with batchSize=${batchSize}`);
        await this.beforeRun(options);

        let cursor: TCursor | undefined = undefined;
        let batchIndex = 0;

        while (true) {
            // Crawl
            const crawlRes: CrawlBatchResult<TRaw, TCursor> = await retry(
                this.crawlBatch,
                [cursor, batchSize],
                maxRetries,
                retryStartDelaySeconds,
                BackoffStrategy[retryStrategy]
            );

            const rawItems = crawlRes.items ?? [];
            cursor = crawlRes.nextCursor;
            this.logger.debug(`Crawled batch#${batchIndex} size=${rawItems.length}`);

            if (rawItems.length === 0 && stopOnEmptyBatch) {
                this.logger.info(`empty batch -> stop`);
                break;
            }

            // Transform
            const transformed = await this.transformBatch(rawItems);
            this.logger.debug(`Transformed batch#${batchIndex} size=${transformed.length}`);

            if (transformed.length === 0 && stopOnEmptyBatch) {
                this.logger.info(`Empty transformed batch -> stop`);
                if (!cursor) break;
            }

            // Export
            await retry(this.exportBatch, [transformed], maxRetries, retryStartDelaySeconds, BackoffStrategy[retryStrategy]);
            this.logger.debug(`Exported batch#${batchIndex}`);

            if (!cursor) {
                this.logger.info(`No next cursor -> done`);
                break;
            }
        }

        await this.afterRun(options);
        this.logger.info(`Crawler completed`);
    }
}

export default TxsCrawler;
