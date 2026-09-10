import type { NetworkId } from "./index.js";

export type NetworkStage = "available" | "planned";
export type NetworkFamily = "solana" | "evm" | "utxo" | "exchange";

export interface NetworkDescriptor {
  id: NetworkId;
  label: string;
  family: NetworkFamily;
  stage: NetworkStage;
  environment: "devnet" | "testnet" | "mainnet" | "integration";
  chainId?: string;
  finalityModel?: string;
  explorerBaseUrl?: string;
  adapterId?: string;
}

export const NETWORK_MATRIX: readonly NetworkDescriptor[] = [
  {
    id: "solana-devnet",
    label: "Solana Devnet",
    family: "solana",
    stage: "available",
    environment: "devnet",
    finalityModel: "confirmed/finalized commitment",
    explorerBaseUrl: "https://explorer.solana.com/?cluster=devnet",
    adapterId: "solana-devnet",
  },
  {
    id: "solana-mainnet-beta",
    label: "Solana Mainnet",
    family: "solana",
    stage: "available",
    environment: "mainnet",
    finalityModel: "confirmed/finalized commitment",
    explorerBaseUrl: "https://explorer.solana.com/",
    adapterId: "solana-mainnet-beta",
  },
  {
    id: "ethereum-sepolia",
    label: "Ethereum Sepolia",
    family: "evm",
    stage: "available",
    environment: "testnet",
    chainId: "11155111",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://sepolia.etherscan.io/",
    adapterId: "evm-ethereum-sepolia",
  },
  {
    id: "ethereum-mainnet",
    label: "Ethereum Mainnet",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    chainId: "1",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://etherscan.io/",
    adapterId: "evm",
  },
  {
    id: "arbitrum-sepolia",
    label: "Arbitrum Sepolia",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "421614",
    finalityModel: "Arbitrum batch/finality lifecycle",
    explorerBaseUrl: "https://sepolia.arbiscan.io/",
    adapterId: "evm",
  },
  {
    id: "arbitrum-one",
    label: "Arbitrum One",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    chainId: "42161",
    finalityModel: "Arbitrum batch/finality lifecycle",
    explorerBaseUrl: "https://arbiscan.io/",
    adapterId: "evm",
  },
  {
    id: "bnb-testnet",
    label: "BNB Smart Chain Testnet",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "97",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://testnet.bscscan.com/",
    adapterId: "evm",
  },
  {
    id: "bnb-mainnet",
    label: "BNB Smart Chain",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    chainId: "56",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://bscscan.com/",
    adapterId: "evm",
  },
  {
    id: "base-sepolia",
    label: "Base Sepolia",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "84532",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://sepolia.basescan.org/",
    adapterId: "evm",
  },
  {
    id: "base-mainnet",
    label: "Base Mainnet",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    chainId: "8453",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://basescan.org/",
    adapterId: "evm",
  },
  {
    id: "robinhood-testnet",
    label: "Robinhood Chain Testnet",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "46630",
    finalityModel: "Arbitrum rollup finality lifecycle",
    explorerBaseUrl: "https://explorer.testnet.chain.robinhood.com/",
    adapterId: "evm",
  },
  {
    id: "robinhood-mainnet",
    label: "Robinhood Chain",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    chainId: "4663",
    finalityModel: "Arbitrum rollup finality lifecycle",
    explorerBaseUrl: "https://robinhoodchain.blockscout.com/",
    adapterId: "evm",
  },
  {
    id: "tempo-testnet",
    label: "Tempo Testnet",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "42431",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://explore.tempo.xyz/",
    adapterId: "evm",
  },
  {
    id: "tempo-mainnet",
    label: "Tempo Mainnet",
    family: "evm",
    stage: "planned",
    environment: "mainnet",
    finalityModel: "EVM block finality",
    adapterId: "evm",
  },
  {
    id: "zcash-testnet",
    label: "Zcash Testnet",
    family: "utxo",
    stage: "planned",
    environment: "testnet",
    finalityModel: "shielded transaction confirmation",
  },
  {
    id: "hyperliquid-testnet",
    label: "Hyperliquid Testnet",
    family: "exchange",
    stage: "planned",
    environment: "testnet",
  },
];

export function getNetwork(networkId: NetworkId): NetworkDescriptor {
  const descriptor = NETWORK_MATRIX.find((network) => network.id === networkId);
  if (!descriptor) throw new Error(`Unknown PrivateDAO network: ${networkId}`);
  return descriptor;
}

export function isNetworkAvailable(networkId: NetworkId): boolean {
  return getNetwork(networkId).stage === "available";
}
