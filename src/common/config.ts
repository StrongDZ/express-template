import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

export const PROJECT_DIR = path.resolve(__dirname, "..", "..");
export const SECRETS_DIR = path.join(PROJECT_DIR, "secrets");

export const Config = {
    IS_PRODUCTION: process.env.IS_PRODUCTION === "true",
    HOST: process.env.HOST ?? "localhost",
    PORT: process.env.PORT ?? 8000,
    API_SCHEMES: process.env.API_SCHEMES ?? "http",
    API_KEY: process.env.API_KEY ?? "your_api_key",
};

export const OrchaiDBConfig = {
    CONNECTION_URL: process.env.ORCHAI_DB_CONNECTION_URL ?? "mongodb://localhost:27017",
    USERNAME: process.env.ORCHAI_DB_USERNAME,
    PASSWORD: process.env.ORCHAI_DB_PASSWORD,

    ORCHAI_DATABASE: process.env.ORCHAI_DB_DATABASE ?? "orchai_database",
    SOLANA_SMART_LIQUIDITY_DATABASE: process.env.SOLANA_SMART_LIQUIDITY_DATABASE ?? "solana_smart_liquidity",
    MONEY_MARKET_V2_DATABASE: process.env.MONEY_MARKET_V2_DATABASE ?? "money_market_v2",
};

export const RedisConfig = {
    URL: process.env.REDIS_URL,
    HOST: process.env.REDIS_HOST ?? "127.0.0.1",
    PORT: Number(process.env.REDIS_PORT ?? 6379),
    PASSWORD: process.env.REDIS_PASSWORD,
    DEFAULT_TTL_SECONDS: Number(process.env.REDIS_DEFAULT_TTL_SECONDS ?? 10),
};

export const CryptoConfig = {
    PASSWORD: process.env.PASSWORD ?? "",
    MNEMONIC_FILE: path.join(SECRETS_DIR, process.env.MNEMONIC_FILE ?? "mnemonic.txt"),
};
