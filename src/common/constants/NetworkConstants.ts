import * as dotenv from "dotenv";

dotenv.config();

export const BLOCK_PER_YEAR = 37101176;

export class NetworkType {
    static readonly SOLANA = "solana";
    static readonly SOLANA_DEVNET = "solana_devnet";
    static readonly ORAICHAIN = "oraichain";
    static readonly EVM_ORAICHAIN = "evm_oraichain";
    static readonly EVM_ORAICHAIN_TESTNET = "evm_oraichain_testnet";
    static readonly ETHEREUM = "ethereum";
    static readonly BSC = "bsc";
    static readonly BSC_TESTNET = "bsc_testnet";
    static readonly ARBITRUM = "arbitrum";
    static readonly BASE = "base";
}

export class Chains {
    static readonly SOLANA = "solana";
    static readonly SOLANA_DEVNET = "solana_devnet";
    static readonly ORAICHAIN = "Oraichain";
    static readonly EVM_ORAICHAIN = "108160679";
    static readonly EVM_ORAICHAIN_TESTNET = "4143398064";
    static readonly ETHEREUM = "1";
    static readonly BSC = "56";
    static readonly BSC_TESTNET = "97";
    static readonly ARBITRUM = "42161";
    static readonly BASE = "8453";

    static readonly mapping: Record<string, string> = {
        [NetworkType.SOLANA]: Chains.SOLANA,
        [NetworkType.SOLANA_DEVNET]: Chains.SOLANA_DEVNET,
        [NetworkType.ORAICHAIN]: Chains.ORAICHAIN,
        [NetworkType.EVM_ORAICHAIN]: Chains.EVM_ORAICHAIN,
        [NetworkType.EVM_ORAICHAIN_TESTNET]: Chains.EVM_ORAICHAIN_TESTNET,
        [NetworkType.ETHEREUM]: Chains.ETHEREUM,
        [NetworkType.BSC]: Chains.BSC,
        [NetworkType.BSC_TESTNET]: Chains.BSC_TESTNET,
        [NetworkType.ARBITRUM]: Chains.ARBITRUM,
        [NetworkType.BASE]: Chains.BASE,
    };

    static readonly networks: Record<string, string> = {
        [Chains.SOLANA]: NetworkType.SOLANA,
        [Chains.SOLANA_DEVNET]: NetworkType.SOLANA_DEVNET,
        [Chains.ORAICHAIN]: NetworkType.ORAICHAIN,
        [Chains.EVM_ORAICHAIN]: NetworkType.EVM_ORAICHAIN,
        [Chains.EVM_ORAICHAIN_TESTNET]: NetworkType.EVM_ORAICHAIN_TESTNET,
        [Chains.ETHEREUM]: NetworkType.ETHEREUM,
        [Chains.BSC]: NetworkType.BSC,
        [Chains.BSC_TESTNET]: NetworkType.BSC_TESTNET,
        [Chains.ARBITRUM]: NetworkType.ARBITRUM,
        [Chains.BASE]: NetworkType.BASE,
    };
}

export const RpcProviders: Record<string, string> = {
    [Chains.ORAICHAIN]: process.env.ORAICHAIN_PROVIDER ?? "https://oraichain-rpc.publicnode.com/",
    [Chains.EVM_ORAICHAIN]: process.env.ORAICHAIN_EVM_PROVIDER ?? "https://oraichain-mainnet-evm.itrocket.net",
    [Chains.EVM_ORAICHAIN_TESTNET]: process.env.ORAICHAIN_EVM_TESTNET_PROVIDER ?? "https://testnet-v2.evm.orai.io/ ",
    [Chains.SOLANA]: process.env.SOLANA_PROVIDER ?? "https://solana-mainnet.core.chainstack.com/13dd9ef445fe8c91fde9f443a15704c9",
    [Chains.SOLANA_DEVNET]: process.env.SOLANA_DEVNET_PROVIDER ?? "https://api.devnet.solana.com",
    [Chains.ETHEREUM]: process.env.ETHEREUM_PROVIDER ?? "https://ethereum.publicnode.com",
    [Chains.BSC]: process.env.BSC_PROVIDER ?? "https://bsc-dataseed2.binance.org",
    [Chains.BSC_TESTNET]: process.env.BSC_TESTNET_PROVIDER ?? "https://bsc-testnet.blockpi.network/v1/rpc/public",
    [Chains.ARBITRUM]: process.env.ARBITRUM ?? "https://arbitrum.rpc.subquery.network/public",
    [Chains.BASE]: process.env.BASE ?? "https://base-rpc.publicnode.com/",
};
