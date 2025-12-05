import * as dotenv from "dotenv";
import path from "path";
import { Chains } from "./constants/NetworkConstants";

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

export class CryptoConfig {
    static PASSWORD: string = process.env.PASSWORD ?? "";
    static readonly KeyFiles = {
        BOT1: "bot1",
        BOT2: "bot2",
    } satisfies Record<string, string>;

    static readonly privateKeyConfigs = {
        [CryptoConfig.KeyFiles.BOT1]: {
            path: path.join(SECRETS_DIR, `${CryptoConfig.KeyFiles.BOT1}_private_key.txt`),
            chainIds: [Chains.SOLANA],
        },
        [CryptoConfig.KeyFiles.BOT2]: {
            path: path.join(SECRETS_DIR, `${CryptoConfig.KeyFiles.BOT2}_private_key.txt`),
            chainIds: [Chains.BASE],
        },
    } satisfies Record<string, { path: string; chainIds: string[] }>;

    static getPrivateKeyConfig(key: string): { path: string; chainIds: string[] } {
        const config = this.privateKeyConfigs[key];
        if (!config) {
            throw new Error(`Unknown private key file: ${key}`);
        }
        return config;
    }
}
