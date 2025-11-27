import { ConfirmOptions, Connection, Keypair } from "@solana/web3.js";
import { Chains, RpcProviders } from "../../common/constants/NetworkConstants";
import { AnchorProvider as AnchorProviderCoral, Wallet as CoralWallet } from "@coral-xyz/anchor";
import { getSolanaWalletFromKey } from "./SolanaWalletHelper";

export async function createAnchorProvider(key: string, chainId: string) {
    const options: ConfirmOptions = {
        commitment: "confirmed",
    };
    const connection = new Connection(RpcProviders[Chains.SOLANA], options.commitment);

    const payer: Keypair = await getSolanaWalletFromKey(key, chainId);
    const wallet: CoralWallet = new CoralWallet(payer);

    return {
        payer: payer,
        provider: new AnchorProviderCoral(connection, wallet, options),
    };
}
