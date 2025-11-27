import inquirer from "inquirer";
import * as crypto from "crypto";
import fs from "fs";
import { CryptoConfig } from "../config";
import { loadFromFile, saveToFile } from "../../utils/FileUtils";
import getLogger from "../../utils/LoggerUtils";
import { validateMnemonic } from "../../utils/WalletHelper";

const logger = getLogger("SetupWallet");

// Simple AES-256-CTR encryption
function encryptMnemonic(mnemonic: string, password: string): string {
    const algorithm = "aes-256-ctr";
    const secretKey = crypto.scryptSync(password, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(mnemonic, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Combine IV and encrypted data
    return iv.toString("hex") + ":" + encrypted;
}

// Simple AES-256-CTR decryption
function decryptMnemonic(encryptedData: string, password: string): string {
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
                message: "Enter password to encrypt mnemonic:",
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

// Get decrypted mnemonic from file
export async function getMnemonicFromFile(key: string): Promise<string> {
    const { path } = CryptoConfig.getMnemonicConfig(key);
    const encryptedData = loadFromFile(path);
    const password = await loadPassword();
    return decryptMnemonic(encryptedData, password);
}

type MnemonicStatus = {
    key: string;
    path: string;
    accounts: { chainId: string; index: number }[];
    initialized: boolean;
};

function getMnemonicStatuses(): MnemonicStatus[] {
    return Object.entries(CryptoConfig.mnemonicConfigs).map(([key, config]) => ({
        key,
        path: config.path,
        accounts: config.accounts,
        initialized: fs.existsSync(config.path),
    }));
}

function logMnemonicStatuses(statuses: MnemonicStatus[]) {
    const displayData = statuses.map(({ key, initialized, accounts }) => ({
        key,
        chains: accounts.map(({ chainId, index }) => `${chainId} - index:${index}`).join(", "),
        initialized,
    }));
    console.table(displayData);
}

async function promptMnemonicUpdate(password: string) {
    while (true) {
        const statuses = getMnemonicStatuses();
        const allInitialized = statuses.every((status) => status.initialized);

        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "Do you want to initialize/refresh mnemonics?",
                choices: ["yes", "no"],
                default: "no",
            },
        ]);

        if (action === "no") {
            if (!allInitialized) {
                logger.warn("Some mnemonics are not initialized. Please initialize all files before exiting.");
                continue;
            }
            return;
        }

        const { key } = await inquirer.prompt([
            {
                type: "list",
                name: "key",
                message: "Select mnemonic key to initialize/refresh:",
                choices: statuses.map((status) => ({
                    name: `${status.key} (${status.initialized ? "initialized" : "not initialized"})`,
                    value: status.key,
                })),
            },
        ]);

        const { mnemonic } = await inquirer.prompt([
            {
                type: "password",
                name: "mnemonic",
                message: `Enter mnemonic for "${key}":`,
                validate: (input) => input.trim() !== "" || "Mnemonic is required",
            },
        ]);

        const encryptedMnemonic = encryptMnemonic(mnemonic, password);
        const { path } = CryptoConfig.getMnemonicConfig(key);
        saveToFile(encryptedMnemonic, path);
        logger.info(`✓ Mnemonic encrypted and saved to: ${path}`);
        logMnemonicStatuses(getMnemonicStatuses());
    }
}

async function setupMnemonic() {
    logger.info("=== Setup Wallet ===");

    const statuses = getMnemonicStatuses();
    logMnemonicStatuses(statuses);

    const password = await loadPassword();

    try {
        await promptMnemonicUpdate(password);
    } catch (error: any) {
        if (error.isTtyError || error.name === "ExitPromptError") {
            logger.info("\nOperation cancelled by user.");
            return;
        }
        logger.error("Error setting up wallet:", error);
    }
}

async function verifyPassword() {
    const statuses = getMnemonicStatuses();

    for (const { key, accounts, initialized } of statuses) {
        if (!initialized) {
            throw new Error(`Mnemonic file for "${key}" is not initialized`);
        }

        accounts.forEach(({ chainId }) => {
            if (!validateMnemonic(key, chainId)) {
                throw new Error(`Invalid mnemonic for key "${key}" (chain ${chainId})`);
            }
        });
    }

    logger.info("All mnemonic files are valid.");
}

export async function setup() {
    CryptoConfig.PASSWORD = "";
    await setupMnemonic();
    await verifyPassword();
}
