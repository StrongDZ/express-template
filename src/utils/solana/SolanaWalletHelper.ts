import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { getMnemonicFromFile } from "../../common/connections/SetupWallet";
import { CryptoConfig } from "../../common/config";

export async function getSolanaWalletFromMnemonic(mnemonic: string, accountIndex = 0) {
    // Tạo seed từ mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Solana derivation path theo BIP44: m/44'/501'/{account}'/0'
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    // Tạo keypair từ private key
    const keypair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    return keypair;
}

export async function getSolanaWalletFromKey(key: string, chainId: string) {
    const config = CryptoConfig.getMnemonicConfig(key);
    const accountIndex = config.accounts.find((account) => account.chainId === chainId)?.index;
    if (!accountIndex) {
        throw new Error(`Account index not found for key "${key}" on chain "${chainId}"`);
    }

    const mnemonic = await getMnemonicFromFile(key);
    return getSolanaWalletFromMnemonic(mnemonic, accountIndex);
}
