import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { getPrivateKeyFromFile } from "../../common/connections/SetupWallet";
import { CryptoConfig } from "../../common/config";

function getSolanaWalletFromPrivateKey(privateKey: string) {
    let secretKey: Uint8Array;
    secretKey = bs58.decode(privateKey.trim());
    const keypair = Keypair.fromSecretKey(secretKey);

    return keypair;
}

export function getSolanaWalletFromKey(key: string, chainId: string) {
    const config = CryptoConfig.getPrivateKeyConfig(key);
    if (!config.chainIds.includes(chainId)) {
        throw new Error(`Key "${key}" is not configured for chain "${chainId}"`);
    }

    const privateKey = getPrivateKeyFromFile(key);
    return getSolanaWalletFromPrivateKey(privateKey);
}
