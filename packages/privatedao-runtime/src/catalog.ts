import type { CapabilityId, NetworkId, ProductId, ProtocolCapability } from "./index.js";

export type ProductAvailability = "available" | "planned";

export interface ProductDescriptor {
  id: ProductId;
  name: string;
  availability: ProductAvailability;
  networks: readonly NetworkId[];
  capabilities: readonly ProtocolCapability[];
}

const solanaDevnet = "solana-devnet" as NetworkId;

function capability(
  id: CapabilityId,
  product: ProductId,
  requiresSignature: boolean,
  supportsAsync = true,
): ProtocolCapability {
  return {
    id,
    version: "1.0",
    product,
    networks: [solanaDevnet],
    requiresSignature,
    supportsAsync,
    receiptSchema: "privatedao.execution-receipt.v1",
  };
}

export const PRODUCT_CATALOG: readonly ProductDescriptor[] = [
  {
    id: "verification",
    name: "Verification",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [
      capability("verification.record.create", "verification", false),
      capability("verification.record.verify", "verification", false),
      capability("verification.blind.prove", "verification", false),
    ],
  },
  {
    id: "payroll",
    name: "Confidential Payroll",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [
      capability("payroll.calculate", "payroll", false),
      capability("payroll.approve", "payroll", true),
      capability("payroll.settle", "payroll", true),
    ],
  },
  {
    id: "treasury",
    name: "Private Treasury",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [capability("treasury.policy.check", "treasury", false)],
  },
  {
    id: "governance",
    name: "Private Governance",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [capability("governance.proposal.execute", "governance", true)],
  },
  {
    id: "auction",
    name: "Private Auctions",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [
      capability("auction.bid.commit", "auction", true),
      capability("auction.settle", "auction", true),
    ],
  },
  {
    id: "agent",
    name: "Agent Marketplace",
    availability: "available",
    networks: [solanaDevnet],
    capabilities: [capability("agent.discover", "agent", false), capability("agent.invoke", "agent", true)],
  },
];

export function listProducts(): readonly ProductDescriptor[] {
  return PRODUCT_CATALOG;
}

export function findProduct(productId: ProductId): ProductDescriptor {
  const product = PRODUCT_CATALOG.find((entry) => entry.id === productId);
  if (!product) throw new Error(`Unknown PrivateDAO product: ${productId}`);
  return product;
}

export function supportsProductCapability(productId: ProductId, network: NetworkId, capabilityId: CapabilityId): boolean {
  const product = findProduct(productId);
  return product.networks.includes(network) && product.capabilities.some((entry) => entry.id === capabilityId);
}
