import * as mongoose from "mongoose";
import { OrchaiDBConfig } from "../config";
import getLogger from "../../utils/LoggerUtils";

const logger = getLogger("MongoDB Connection");

const createConnection = (url: string, dbName: string, username?: string, password?: string) => {
    const connection = mongoose.createConnection(url, {
        autoCreate: false,
        autoIndex: false,
        dbName: dbName,
        user: username,
        pass: password,
    });

    // Thêm các sự kiện lắng nghe
    connection.on("connected", () => {
        logger.info(`MongoDB connected to ${dbName}`);
    });

    connection.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err}`);
    });

    connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
    });

    return connection;
};

export const OrchaiDB = createConnection(
    OrchaiDBConfig.CONNECTION_URL,
    OrchaiDBConfig.ORCHAI_DATABASE,
    OrchaiDBConfig.USERNAME,
    OrchaiDBConfig.PASSWORD
);
