import type { NetworkId } from "./index.js";

export type NetworkStage = "available" | "planned";
export type NetworkFamily = "solana" | "evm" | "utxo" | "bridge" | "exchange";

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
    stage: "planned",
    environment: "mainnet",
    finalityModel: "confirmed/finalized commitment",
    explorerBaseUrl: "https://explorer.solana.com/",
  },
  {
    id: "ethereum-sepolia",
    label: "Ethereum Sepolia",
    family: "evm",
    stage: "planned",
    environment: "testnet",
    chainId: "11155111",
    finalityModel: "EVM block finality",
    explorerBaseUrl: "https://sepolia.etherscan.io/",
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
  },
  {
    id: "tempo-testnet",
    label: "Tempo Testnet",
    family: "evm",
    stage: "planned",
    environment: "testnet",
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
    id: "wormhole-integration",
    label: "Wormhole Integration",
    family: "bridge",
    stage: "planned",
    environment: "integration",
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
