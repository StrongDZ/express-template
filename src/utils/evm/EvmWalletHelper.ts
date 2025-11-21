import { ethers, Signer } from "ethers";
import { RpcProviders } from "../../common/constants/NetworkConstants";
import getLogger from "../LoggerUtils";
import { getMnemonicFromFile } from "../../common/connections/SetupWallet";

const logger = getLogger("ContractUtils");

export function getProvider(rpcUrl: string) {
    return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getEvmWallet(chainId: string): Promise<Signer> {
    const provider = new ethers.JsonRpcProvider(RpcProviders[chainId]);
    const mnemonic = await getMnemonicFromFile();
    return ethers.Wallet.fromPhrase(mnemonic).connect(provider);
}
