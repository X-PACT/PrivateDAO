// Discovery metadata is deliberately separate from execution configuration.
// A network is only marked live when this service can execute and verify it.
export const NETWORK_CAPABILITIES = Object.freeze([
  {
    id: "solana:mainnet-beta",
    label: "Solana Mainnet",
    status: "live",
    capabilities: ["service-discovery", "payments", "job-execution", "receipts"],
  },
  {
    id: "ethereum:mainnet",
    label: "Ethereum Mainnet",
    status: "mainnet-read-only",
    capabilities: ["service-discovery", "read-only-intelligence", "transaction-simulation"],
  },
  {
    id: "base:mainnet",
    label: "Base Mainnet",
    status: "mainnet-read-only",
    capabilities: ["service-discovery", "read-only-intelligence", "transaction-simulation"],
  },
  {
    id: "arbitrum:mainnet",
    label: "Arbitrum One",
    status: "mainnet-read-only",
    capabilities: ["service-discovery", "read-only-intelligence", "transaction-simulation"],
  },
  {
    id: "hyperliquid:hyperevm-mainnet",
    label: "HyperEVM Mainnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "tempo:mainnet",
    label: "Tempo Mainnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "ethereum:sepolia",
    label: "Ethereum Sepolia",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "arbitrum:sepolia",
    label: "Arbitrum Sepolia",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "base:sepolia",
    label: "Base Sepolia",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "bnb:testnet",
    label: "BNB Testnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "robinhood:testnet",
    label: "Robinhood Testnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "hyperliquid:testnet",
    label: "Hyperliquid Testnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "tempo:testnet",
    label: "Tempo Testnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
  {
    id: "zcash:testnet",
    label: "Zcash Testnet",
    status: "discovery-only",
    capabilities: ["service-discovery", "registry", "marketplace-metadata"],
  },
]);

export const LIVE_NETWORKS = Object.freeze(
  NETWORK_CAPABILITIES.filter((network) => network.status === "live").map((network) => network.id),
);

export function networkCapability(id) {
  return NETWORK_CAPABILITIES.find((network) => network.id === id) || null;
}
