export enum JobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}

export interface JobResult {
    success: boolean;
    data?: any;
    error?: Error;
    duration: number;
    startTime: Date;
    endTime: Date;
}

export interface JobConfig {
    name: string;
    startedAt?: number;
    configKey?: string;
    timeout?: number; // milliseconds
    retryCount?: number;
    retryDelay?: number; // milliseconds
}
