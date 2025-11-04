export enum TimeConstants {
    A_MINUTE = 60,
    AN_HOUR = 3600,
    A_DAY = 86400,
    A_WEEK = A_DAY * 7,
    A_MONTH = A_DAY * 30
}

export const cronTime = {
    per5Seconds: '*/5 * * * * *',
    per10Seconds: '*/10 * * * * *', 
    per30Seconds: '*/30 * * * * *',
    perMinute: "0 * * * * *",
    per5Minutes: "*/5 * * * *",
    perDay: "0 0 * * *",
    per2Hours: "0 */2 * * *",
    per10Hours: "0 */10 * * *",
};
