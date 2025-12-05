import { ConfirmOptions, Connection, Keypair } from "@solana/web3.js";
import { RpcProviders } from "../../common/constants/NetworkConstants";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getSolanaWalletFromKey } from "./SolanaWalletHelper";

export function createAnchorProvider(key: string, chainId: string) {
    const options: ConfirmOptions = {
        commitment: "confirmed",
    };
    const connection = new Connection(RpcProviders[chainId], options.commitment);

    const payer: Keypair = getSolanaWalletFromKey(key, chainId);
    const wallet: Wallet = new Wallet(payer);

    return {
        payer: payer,
        provider: new AnchorProvider(connection, wallet, options),
    };
}
