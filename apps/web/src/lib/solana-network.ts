import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

type SupportedSolanaNetwork = "mainnet-beta" | "testnet" | "devnet";

function resolveConfiguredNetwork(): SupportedSolanaNetwork {
  const rawNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase();
  if (rawNetwork === "mainnet" || rawNetwork === "mainnet-beta") return "mainnet-beta";
  if (rawNetwork === "devnet") return "devnet";
  return "testnet";
}

export const SOLANA_NETWORK = resolveConfiguredNetwork();

export const SOLANA_NETWORK_LABEL =
  SOLANA_NETWORK === "mainnet-beta" ? "Mainnet Beta" : SOLANA_NETWORK === "devnet" ? "Devnet" : "Testnet";

export const SOLANA_EXPLORER_CLUSTER =
  SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;

export const SOLANA_WALLET_ADAPTER_NETWORK =
  SOLANA_NETWORK === "mainnet-beta"
    ? WalletAdapterNetwork.Mainnet
    : SOLANA_NETWORK === "devnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Testnet;

export function getSolanaRpcEndpoint() {
  // Keep authenticated RPCFast/Aperture credentials out of browser bundles.
  // Browser wallet sends use public cluster RPC; backend telemetry uses RPC_FAST_* host secrets.
  return clusterApiUrl(SOLANA_NETWORK);
}

export function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}${SOLANA_EXPLORER_CLUSTER}`;
}

export function buildSolanaAccountUrl(address: string) {
  return `https://solscan.io/account/${address}${SOLANA_EXPLORER_CLUSTER}`;
}
