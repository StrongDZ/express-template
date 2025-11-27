import { ethers } from "ethers";
import { Chains, VmType } from "../common/constants/NetworkConstants";
import { getEvmWalletFromKey } from "./evm/EvmWalletHelper";
import { getSolanaWalletFromKey } from "./solana/SolanaWalletHelper";

export function validateMnemonic(key: string, chainId: string): boolean {
    try {
        switch (Chains.vmType[chainId]) {
            case VmType.EVM:
                getEvmWalletFromKey(key, chainId);
            case VmType.SOLANA:
                getSolanaWalletFromKey(key, chainId);
            default:
                return false;
        }
    } catch (error) {
        return false;
    }
}
