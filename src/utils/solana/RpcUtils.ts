import { ConfirmOptions, Connection, Keypair } from "@solana/web3.js";
import { Chains, RpcProviders } from "../../common/constants/NetworkConstants";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { getSolanaWalletFromKey } from "./SolanaWalletHelper";
import { CryptoConfig } from "../../common/config";

class ProviderManager {
    private anchorProviders: Map<string, { payer: Keypair; provider: AnchorProvider }> = new Map();

    constructor() {}

    async init() {
        for (const key of Object.values(CryptoConfig.mnemonicKeys)) {
            const config = CryptoConfig.getMnemonicConfig(key);
            for (const account of config.accounts) {
                const provider = await this.createAnchorProvider(key, account.chainId);
                this.anchorProviders.set(`${key}-${account.chainId}`, provider);
            }
        }
    }

    async createAnchorProvider(key: string, chainId: string) {
        const options: ConfirmOptions = {
            commitment: "confirmed",
        };
        const connection = new Connection(RpcProviders[Chains.SOLANA], options.commitment);

        const payer: Keypair = await getSolanaWalletFromKey(key, chainId);
        const wallet: Wallet = new Wallet(payer);

        return {
            payer: payer,
            provider: new AnchorProvider(connection, wallet, options),
        };
    }

    public getAnchorProvider(key: string, chainId: string): { payer: Keypair; provider: AnchorProvider } {
        const providerKey = `${key}-${chainId}`;
        const anchorProvider = this.anchorProviders.get(providerKey);

        if (!anchorProvider) {
            throw new Error(`Anchor provider not found for key "${key}" on chain "${chainId}"`);
        }

        return anchorProvider;
    }
}

export const providerManager = new ProviderManager();
