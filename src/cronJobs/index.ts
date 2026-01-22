import getLogger from "../utils/LoggerUtils";
import { autoExampleJob } from "./Example";

const logger = getLogger("Cron Jobs");

export namespace CronJobs {
    
    export async function stop() {
        try {
            autoExampleJob.stop();
        } catch (error) {
            logger.error(`Cron jobs error: ${error}`);
            console.log(error);
        }
    }

    export async function start() {
        try {
            autoExampleJob.start();
        } catch (error) {
            logger.error(`Cron jobs error: ${error}`);
            console.log(error);
        }
    }
}
