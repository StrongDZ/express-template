import { JobStatus } from "../../models/JobConfig";

export class JobManager {
    private static instance: JobManager;
    private jobStatuses: Map<string, JobStatus> = new Map();

    private constructor() {}

    public static getInstance(): JobManager {
        if (!JobManager.instance) {
            JobManager.instance = new JobManager();
        }
        return JobManager.instance;
    }

    public setJobStatus(jobName: string, status: JobStatus): void {
        this.jobStatuses.set(jobName, status);
    }

    public getJobStatus(jobName: string): JobStatus {
        return this.jobStatuses.get(jobName) || JobStatus.PENDING;
    }

    public isJobRunning(jobName: string): boolean {
        return this.getJobStatus(jobName) === JobStatus.RUNNING;
    }
}

export const jobManager = JobManager.getInstance();
