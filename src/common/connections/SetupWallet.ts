import inquirer from "inquirer";
import * as crypto from "crypto";
import { CryptoConfig } from "../config";
import { loadFromFile, saveToFile } from "../../utils/FileUtils";
import { getEvmWallet } from "../../utils/evm/EvmWalletHelper";
import getLogger from "../../utils/LoggerUtils";

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
export async function getMnemonicFromFile(): Promise<string> {
    const mnemonicFile = CryptoConfig.MNEMONIC_FILE;
    const encryptedData = loadFromFile(mnemonicFile);
    const password = await loadPassword();
    return decryptMnemonic(encryptedData, password);
}

async function setupMnemonic() {
    logger.info("=== Setup Wallet ===");

    const password = await loadPassword();
    let setup = true;

    try {
        loadFromFile(CryptoConfig.MNEMONIC_FILE);
    } catch (error) {
        setup = false;
    }

    if (setup) {
        const { refreshMnemonic } = await inquirer.prompt([
            {
                type: "list",
                name: "refreshMnemonic",
                message: "Do you want to refresh the mnemonic?",
                choices: ["yes", "no"],
                default: "no",
            },
        ]);

        if (refreshMnemonic === "no") {
            return;
        }
    }

    try {
        const answers = await inquirer.prompt([
            {
                type: "password",
                name: "mnemonic",
                message: "Enter mnemonic:",
                validate: (input) => input.trim() !== "" || "Mnemonic is required",
            },
        ]);

        const { mnemonic } = answers;

        const encryptedMnemonic = encryptMnemonic(mnemonic, password);
        saveToFile(encryptedMnemonic, CryptoConfig.MNEMONIC_FILE);

        logger.info(`✓ Mnemonic encrypted and saved to: ${CryptoConfig.MNEMONIC_FILE}`);
        return;
    } catch (error: any) {
        if (error.isTtyError || error.name === "ExitPromptError") {
            logger.info("\nOperation cancelled by user.");
            return;
        }
        logger.error("Error setting up wallet:", error);
        return;
    }
}

async function verifyPassword(password: string) {
    try {
        await getEvmWallet(password);
        logger.info("Valid password!");
    } catch (error) {
        logger.error("The password is incorrect");
        throw new Error("Invalid password");
    }
}

export async function setup() {
    CryptoConfig.PASSWORD = "";
    await setupMnemonic();
    await verifyPassword(CryptoConfig.PASSWORD);
}
