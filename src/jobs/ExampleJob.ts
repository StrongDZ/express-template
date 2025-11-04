import { JobConfig } from "../models/JobConfig";
import getLogger from "../utils/LoggerUtils";
import { JobBase } from "./base/JobBase";

const logger = getLogger("ExampleJob");

export class ExampleJob extends JobBase {
    constructor(config: JobConfig) {
        super(config);
    }

    public async executeJob() {
        try {
            this.logger.info("Example job started");
        } catch (error: any) {
            this.logger.error(`Error: ${error}`);
        }
    }
}
