import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Config, LOG_DIR } from "../common/config";
import path from "path";

const getLogger = (loggerName: string) => {
    const consoleFormat = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        winston.format.printf((info) => `${info.timestamp} [${loggerName}] [${info.level}]: ${info.message}`)
    );

    const fileFormat = winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        winston.format.printf((info) => `${info.timestamp} [${loggerName}] [${info.level}]: ${info.message}`)
    );

    return winston.createLogger({
        level: "debug",
        transports: Config.IS_PRODUCTION
            ? [
                  new winston.transports.Console({ format: consoleFormat }),
                  new DailyRotateFile({
                      filename: path.join(LOG_DIR, "error-%DATE%.log"),
                      datePattern: "YYYY-MM-DD",
                      level: "error",
                      format: fileFormat,
                      maxSize: "20m", // Khi file đạt 20MB sẽ rotate
                      maxFiles: "14d", // Giữ lại 14 ngày, sau đó tự động xóa file cũ
                      zippedArchive: true, // Nén file cũ để tiết kiệm dung lượng
                  }),
                  new DailyRotateFile({
                      filename: path.join(LOG_DIR, "debug-%DATE%.log"),
                      datePattern: "YYYY-MM-DD",
                      level: "debug",
                      format: fileFormat,
                      maxSize: "20m", // Khi file đạt 20MB sẽ rotate
                      maxFiles: "14d", // Giữ lại 14 ngày, sau đó tự động xóa file cũ
                      zippedArchive: true, // Nén file cũ để tiết kiệm dung lượng
                  }),
              ]
            : [new winston.transports.Console({ format: consoleFormat })],
    });
};

export default getLogger;
