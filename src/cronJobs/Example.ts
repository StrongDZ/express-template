import getLogger from "../utils/LoggerUtils";
import cron from "node-cron";
import { CronTime } from "../common/constants/TimeConstants";
import { JobConfig } from "../models/JobConfig";
import { ExampleJob } from "../jobs/ExampleJob";

const logger = getLogger("Example");

export const autoExampleJob = cron.schedule(CronTime.per10Seconds, async () => {
    try {
        const config: JobConfig = {
            name: "Example",
            configKey: "example_key",
            retryCount: 0,
        };

        const job = new ExampleJob(config);
        await job.run();
    } catch (error: any) {
        logger.error(`Error when doing example job: ${error}`);
    }
});

// This is important to stop the cronjob until the setup phase is done. Do this for every cronjob.
autoExampleJob.stop();
