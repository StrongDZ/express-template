import winston from "winston";
import { Config, PROJECT_DIR } from "../common/config";
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
                  new winston.transports.File({
                      filename: path.join(PROJECT_DIR, "logs/error.log"),
                      level: "error",
                      format: fileFormat,
                  }),
                  new winston.transports.File({
                      filename: path.join(PROJECT_DIR, "logs/debug.log"),
                      level: "debug",
                      format: fileFormat,
                  }),
              ]
            : [new winston.transports.Console({ format: consoleFormat })],
    });
};

export default getLogger;
