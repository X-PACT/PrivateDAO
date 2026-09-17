import type { NetworkId } from "./index.js";

export type PaymentRailId = "tempo-testnet-tip20" | "base-sepolia-deposit";
export type PaymentRailStatus = "testnet_verified";

export interface PaymentRailDescriptor {
  id: PaymentRailId;
  label: string;
  purpose: "native-payment" | "optional-funding";
  sourceNetwork: NetworkId;
  destinationNetwork: NetworkId;
  asset: string;
  privacy: "public-onchain";
  supportsBatch: boolean;
  status: PaymentRailStatus;
  evidence: readonly string[];
}

/** Payment-only rails; they do not expand native product capability claims. */
export const PAYMENT_RAIL_CATALOG: readonly PaymentRailDescriptor[] = [
  {
    id: "tempo-testnet-tip20",
    label: "Tempo Testnet atomic payments",
    purpose: "native-payment",
    sourceNetwork: "tempo-testnet",
    destinationNetwork: "tempo-testnet",
    asset: "0x20c0000000000000000000000000000000000001",
    privacy: "public-onchain",
    supportsBatch: true,
    status: "testnet_verified",
    evidence: ["packages/evm-verification/deployments/payment-rail-tempo.json"],
  },
  {
    id: "base-sepolia-deposit",
    label: "Ethereum Sepolia to Base Sepolia deposit",
    purpose: "optional-funding",
    sourceNetwork: "ethereum-sepolia",
    destinationNetwork: "base-sepolia",
    asset: "ETH",
    privacy: "public-onchain",
    supportsBatch: false,
    status: "testnet_verified",
    evidence: ["packages/evm-verification/deployments/payment-rail-base-bridge.json"],
  },
];

export function findPaymentRail(id: PaymentRailId): PaymentRailDescriptor {
  const rail = PAYMENT_RAIL_CATALOG.find((entry) => entry.id === id);
  if (!rail) throw new Error(`Unknown payment rail: ${id}`);
  return rail;
}

