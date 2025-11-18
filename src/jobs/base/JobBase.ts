import getLogger from "../../utils/LoggerUtils";
import { performance } from "perf_hooks";
import { JobConfig, JobResult, JobStatus } from "../../models/JobConfig";
import { sleep } from "../../utils/TimeUtils";
import { JobManager } from "./JobManager";

export abstract class JobBase {
    protected readonly logger = getLogger(this.constructor.name);
    protected jobConfig: JobConfig;
    protected retryAttempts: number = 0;
    protected jobManager = JobManager.getInstance();
    protected startedAt = Math.floor(Date.now() / 1000);

    constructor(config: JobConfig) {
        this.jobConfig = config;
    }

    protected abstract executeJob(): Promise<any>;

    public async run(): Promise<JobResult> {
        const startTime = new Date();
        const startPerf = performance.now();

        if (this.jobManager.isJobRunning(this.jobConfig.name)) {
            this.logger.info(`Job already running: ${this.jobConfig.name}`);
            return {
                success: false,
                error: new Error(`Job already running: ${this.jobConfig.name}`),
                duration: 0,
                startTime,
                endTime: startTime,
            };
        }

        this.logger.info(`Starting job: ${this.jobConfig.name}`);
        this.jobManager.setJobStatus(this.jobConfig.name, JobStatus.RUNNING);

        try {
            const timeoutPromise = this.jobConfig.timeout
                ? new Promise((_, reject) =>
                      setTimeout(() => reject(new Error(`Job timeout after ${this.jobConfig.timeout}ms`)), this.jobConfig.timeout)
                  )
                : null;

            const jobPromise = this.executeWithRetry();
            const result = timeoutPromise ? await Promise.race([jobPromise, timeoutPromise]) : await jobPromise;

            const endTime = new Date();
            const duration = performance.now() - startPerf;

            this.jobManager.setJobStatus(this.jobConfig.name, JobStatus.COMPLETED);
            this.logger.info(`Job completed successfully: ${this.jobConfig.name} (${(duration / 1000).toFixed(2)}s)`);

            return {
                success: true,
                data: result,
                duration,
                startTime,
                endTime,
            };
        } catch (error) {
            const endTime = new Date();
            const duration = performance.now() - startPerf;

            this.jobManager.setJobStatus(this.jobConfig.name, JobStatus.FAILED);
            this.logger.error(`Job failed: ${this.jobConfig.name}`, error);

            return {
                success: false,
                error: error as Error,
                duration,
                startTime,
                endTime,
            };
        }
    }

    protected async init(): Promise<void> {}

    private async executeWithRetry(): Promise<any> {
        let lastError: Error;

        for (this.retryAttempts = 0; this.retryAttempts <= (this.jobConfig.retryCount || 0); this.retryAttempts++) {
            try {
                if (this.retryAttempts > 0) {
                    this.logger.info(`Retry attempt ${this.retryAttempts}/${this.jobConfig.retryCount} for job: ${this.jobConfig.name}`);
                    await sleep(this.jobConfig.retryDelay || 1);
                }
                await this.init();

                return await this.executeJob();
            } catch (error) {
                lastError = error as Error;

                if (this.retryAttempts === (this.jobConfig.retryCount || 0)) {
                    throw lastError;
                }

                this.logger.warn(`Job attempt ${this.retryAttempts + 1} failed: ${this.jobConfig.name}`, error);
            }
        }

        throw lastError!;
    }
}
