import { ethers, HDNodeWallet } from "ethers";
import { RpcProviders } from "../../common/constants/NetworkConstants";
import getLogger from "../LoggerUtils";
import { getMnemonicFromFile } from "../../common/connections/SetupWallet";
import { CryptoConfig } from "../../common/config";

const logger = getLogger("ContractUtils");

export function getProvider(rpcUrl: string) {
    return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getEvmWalletFromMnemonic(chainId: string, mnemonic: string, accountIndex: number): Promise<ethers.Signer> {
    const provider = new ethers.JsonRpcProvider(RpcProviders[chainId]);

    // Tạo ví từ mnemonic với derivation path dựa theo index
    const derivationPath = `m/44'/60'/0'/0/${accountIndex}`;
    const wallet = HDNodeWallet.fromPhrase(mnemonic, "", derivationPath);

    return wallet.connect(provider);
}

export async function getEvmWalletFromKey(key: string, chainId: string): Promise<ethers.Signer> {
    const config = CryptoConfig.getMnemonicConfig(key);
    const accountIndex = config.accounts.find((account) => account.chainId === chainId)?.index;
    if (!accountIndex) {
        throw new Error(`Account index not found for key "${key}" on chain "${chainId}"`);
    }
    const mnemonic = await getMnemonicFromFile(key);
    return getEvmWalletFromMnemonic(chainId, mnemonic, accountIndex);
}
