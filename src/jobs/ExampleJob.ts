import { JobConfig } from "../models/JobConfig";
import { JobBase } from "./base/JobBase";

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
