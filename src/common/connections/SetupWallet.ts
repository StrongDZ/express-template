import inquirer from "inquirer";
import * as crypto from "crypto";
import fs from "fs";
import { CryptoConfig } from "../config";
import { loadFromFile, saveToFile } from "../../utils/FileUtils";
import getLogger from "../../utils/LoggerUtils";
import { validatePrivateKey } from "../../utils/WalletHelper";

const logger = getLogger("SetupWallet");

// Simple AES-256-CTR encryption for secrets (mnemonic/private key)
function encryptSecret(secret: string, password: string): string {
    const algorithm = "aes-256-ctr";
    const secretKey = crypto.scryptSync(password, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(secret, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Combine IV and encrypted data
    return iv.toString("hex") + ":" + encrypted;
}

// Simple AES-256-CTR decryption for secrets (mnemonic/private key)
function decryptSecret(encryptedData: string, password: string): string {
    const algorithm = "aes-256-ctr";
    const secretKey = crypto.scryptSync(password, "salt", 32);

    const parts = encryptedData.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

async function loadPassword(): Promise<string> {
    if (!CryptoConfig.PASSWORD) {
        const answers = await inquirer.prompt([
            {
                type: "password",
                name: "password",
                message: "Enter password to encrypt private keys:",
                validate: (input) => input.trim() !== "" || "Password is required",
            },
        ]);
        CryptoConfig.PASSWORD = answers.password;
    }
    if (!CryptoConfig.PASSWORD) {
        throw new Error("Password is required");
    }

    return CryptoConfig.PASSWORD;
}

// Get decrypted private key from file
export function getPrivateKeyFromFile(key: string): string {
    const { path } = CryptoConfig.getPrivateKeyConfig(key);
    const encryptedData = loadFromFile(path);
    const password = CryptoConfig.PASSWORD;
    return decryptSecret(encryptedData, password);
}

type PrivateKeyStatus = {
    key: string;
    path: string;
    chainIds: string[];
    initialized: boolean;
};

function getPrivateKeyStatuses(): PrivateKeyStatus[] {
    return Object.entries(CryptoConfig.privateKeyConfigs).map(([key, config]) => ({
        key,
        path: config.path,
        chainIds: config.chainIds,
        initialized: fs.existsSync(config.path),
    }));
}

function logPrivateKeyStatuses(statuses: PrivateKeyStatus[]) {
    const displayData = statuses.map(({ key, initialized, chainIds }) => ({
        key,
        chainIds: chainIds.join(","),
        initialized,
    }));
    console.table(displayData);
}

async function promptPrivateKeyUpdate(password: string) {
    while (true) {
        const statuses = getPrivateKeyStatuses();
        const allInitialized = statuses.every((status) => status.initialized);

        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "Do you want to initialize/refresh private keys?",
                choices: ["yes", "no"],
                default: "no",
            },
        ]);

        if (action === "no") {
            if (!allInitialized) {
                logger.warn("Some private keys are not initialized. Please initialize all files before exiting.");
                continue;
            }
            return;
        }

        const { key } = await inquirer.prompt([
            {
                type: "list",
                name: "key",
                message: "Select key to initialize/refresh:",
                choices: statuses.map((status) => ({
                    name: `${status.key} (${status.initialized ? "initialized" : "not initialized"})`,
                    value: status.key,
                })),
            },
        ]);

        const { privateKey } = await inquirer.prompt([
            {
                type: "password",
                name: "privateKey",
                message: `Enter private key for "${key}":`,
                validate: (input) => input.trim() !== "" || "Private key is required",
            },
        ]);

        const encryptedPrivateKey = encryptSecret(privateKey, password);
        const { path } = CryptoConfig.getPrivateKeyConfig(key);
        saveToFile(encryptedPrivateKey, path);
        logger.info(`✓ Private key encrypted and saved to: ${path}`);
        logPrivateKeyStatuses(getPrivateKeyStatuses());
    }
}

async function setupPrivateKeys() {
    logger.info("=== Setup Wallet ===");

    const statuses = getPrivateKeyStatuses();
    logPrivateKeyStatuses(statuses);

    const password = await loadPassword();

    try {
        await promptPrivateKeyUpdate(password);
    } catch (error: any) {
        if (error.isTtyError || error.name === "ExitPromptError") {
            logger.info("\nOperation cancelled by user.");
            return;
        }
        logger.error("Error setting up wallet:", error);
    }
}

function verifyPassword() {
    const statuses = getPrivateKeyStatuses();

    for (const { key, chainIds, initialized } of statuses) {
        if (!initialized) {
            throw new Error(`Private key file for "${key}" is not initialized`);
        }

        for (const chainId of chainIds) {
            const isValid = validatePrivateKey(key, chainId);
            if (!isValid) {
                throw new Error(`Invalid private key for key "${key}" (chain ${chainId})`);
            }
        }
    }

    logger.info("All private key files are valid.");
}

export async function setup() {
    CryptoConfig.PASSWORD = "";
    await setupPrivateKeys();
    verifyPassword();
}
