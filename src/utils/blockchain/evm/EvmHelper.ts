import { JsonRpcProvider, Wallet, Signer, Network } from "ethers";
import { RpcProviders } from "../../../common/constants/NetworkConstants";
import { getPrivateKeyFromFile } from "../../../common/connections/SetupWallet";
import { CryptoConfig } from "../../../common/config";

function getEvmWalletFromPrivateKey(chainId: string, privateKey: string): Signer {
    const provider = getProvider(chainId);
    const normalizedPrivateKey = privateKey.trim().startsWith("0x") ? privateKey.trim() : `0x${privateKey.trim()}`;
    const wallet = new Wallet(normalizedPrivateKey, provider);
    return wallet;
}

export function getEvmWalletFromKey(key: string, chainId: string): Signer {
    const config = CryptoConfig.getPrivateKeyConfig(key);
    if (!config.chainIds.includes(chainId)) {
        throw new Error(`Key "${key}" is not configured for chain "${chainId}"`);
    }
    const privateKey = getPrivateKeyFromFile(key);
    return getEvmWalletFromPrivateKey(chainId, privateKey);
}

export function getProvider(chainId: string): JsonRpcProvider {
    const rpcUrl = RpcProviders[chainId];
    if (!rpcUrl) {
        throw new Error(`RPC URL not found for chain ID: ${chainId}`);
    }

    // Use staticNetwork to skip network detection and avoid startup errors
    const network = Network.from(chainId);
    return new JsonRpcProvider(rpcUrl, network, { staticNetwork: true });
}