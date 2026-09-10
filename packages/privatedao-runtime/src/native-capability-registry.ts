import { PRODUCT_CATALOG } from "./catalog.js";
import { NETWORK_MATRIX, type NetworkDescriptor } from "./networks.js";
import type { CapabilityId, NetworkId, ProductId } from "./index.js";

export type NativeCapabilityStatus =
  | "planned"
  | "researching"
  | "implementation"
  | "blocked_external"
  | "testnet_ready"
  | "testnet"
  | "testnet_verified"
  | "devnet_verified"
  | "mainnet_pending_review"
  | "mainnet_live"
  | "disabled";

export interface NativeCapabilityEntry {
  product: ProductId;
  capability: CapabilityId;
  network: NetworkId;
  networkFamily: NetworkDescriptor["family"];
  declared: boolean;
  environment: NetworkDescriptor["environment"];
  chainId: string | null;
  nativeAsset: string | null;
  supportedAssets: readonly string[];
  contracts: readonly string[];
  verifier: string | null;
  provider: string | null;
  walletModel: "none" | "external-wallet" | "provider-wallet";
  supportsExecution: boolean;
  supportsPrivateExecution: boolean;
  supportsPrivateSettlement: boolean;
  supportsProof: boolean;
  supportsReceipt: boolean;
  supportsReconciliation: boolean;
  supportsMainnet: boolean;
  status: NativeCapabilityStatus;
  lastVerifiedCommit: string | null;
  lastVerifiedTimestamp: string | null;
  evidence: "none" | "runtime-only" | "testnet-e2e";
}

const ETHEREUM_SEPOLIA_EVIDENCE = {
  verifier: "0x26E3515D02bb3D8122Fad109D159f43e81e8bEeb",
  contracts: [
    "0xdd01dA1b53BA46BF1Ce8c71Bc1C5E86E8784694B",
    "0x6f813E1221cB5f760BbC5b467983c014bbE4B3B5c",
  ],
  provider: "evm-ethereum-sepolia",
  commit: "f7b6dc0",
  timestamp: "2026-09-10T09:48:50.225Z",
} as const;

function nativeAsset(network: NetworkDescriptor): string | null {
  if (network.family === "solana") return "SOL";
  if (network.id.startsWith("ethereum") || network.family === "evm") return network.id === "bnb-testnet" || network.id === "bnb-mainnet" ? "BNB" : "ETH";
  if (network.family === "utxo") return "ZEC";
  if (network.family === "exchange") return "USDC";
  return null;
}

function defaultStatus(declared: boolean, network: NetworkDescriptor): NativeCapabilityStatus {
  if (!declared || network.stage === "planned") return "planned";
  return "implementation";
}

function applyEthereumSepoliaEvidence(entry: NativeCapabilityEntry): NativeCapabilityEntry {
  const isBlind = entry.product === "blind-verification" && entry.capability === "verification.blind.prove";
  const isRecord = entry.product === "record-verification" && ["verification.record.create", "verification.record.verify"].includes(entry.capability);
  if (entry.network !== "ethereum-sepolia" || (!isBlind && !isRecord)) return entry;
  return {
    ...entry,
    provider: ETHEREUM_SEPOLIA_EVIDENCE.provider,
    contracts: ETHEREUM_SEPOLIA_EVIDENCE.contracts,
    verifier: ETHEREUM_SEPOLIA_EVIDENCE.verifier,
    walletModel: "provider-wallet",
    supportsExecution: true,
    supportsProof: isBlind,
    supportsReceipt: true,
    supportsReconciliation: false,
    status: "testnet_verified",
    lastVerifiedCommit: ETHEREUM_SEPOLIA_EVIDENCE.commit,
    lastVerifiedTimestamp: ETHEREUM_SEPOLIA_EVIDENCE.timestamp,
    evidence: "testnet-e2e",
  };
}

/**
 * Conservative native capability registry. Planned entries are emitted so
 * discovery can explain the roadmap, but only evidence-backed entries are
 * executable or presented as verified support.
 */
export function buildNativeCapabilityRegistry(): readonly NativeCapabilityEntry[] {
  return PRODUCT_CATALOG.flatMap((product) =>
    product.capabilities.flatMap((capability) =>
      NETWORK_MATRIX.map((network) => applyEthereumSepoliaEvidence({
        product: product.id,
        capability: capability.id,
        network: network.id,
        networkFamily: network.family,
        declared: product.networks.includes(network.id) && capability.networks.includes(network.id),
        environment: network.environment,
        chainId: network.chainId ?? null,
        nativeAsset: nativeAsset(network),
        supportedAssets: nativeAsset(network) ? [nativeAsset(network) as string] : [],
        contracts: [],
        verifier: null,
        provider: network.adapterId ?? null,
        walletModel: network.family === "solana" || network.family === "evm" ? "external-wallet" : "none",
        supportsExecution: false,
        supportsPrivateExecution: false,
        supportsPrivateSettlement: false,
        supportsProof: false,
        supportsReceipt: false,
        supportsReconciliation: false,
        supportsMainnet: false,
        status: defaultStatus(product.networks.includes(network.id) && capability.networks.includes(network.id), network),
        lastVerifiedCommit: null,
        lastVerifiedTimestamp: null,
        evidence: "none",
      })),
    ),
  );
}
