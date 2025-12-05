import { Chains, VmType } from "../common/constants/NetworkConstants";
import { getEvmWalletFromKey } from "./evm/EvmWalletHelper";
import { getSolanaWalletFromKey } from "./solana/SolanaWalletHelper";

export function validatePrivateKey(key: string, chainId: string): boolean {
    try {
        switch (Chains.vmType[chainId]) {
            case VmType.EVM:
                getEvmWalletFromKey(key, chainId);
                break;
            case VmType.SOLANA:
                getSolanaWalletFromKey(key, chainId);
                break;
            default:
                return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}
