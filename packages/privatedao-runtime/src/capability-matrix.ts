import type { CapabilityId, NetworkId, ProductId, ProviderRegistry } from "./index.js";
import { PRODUCT_CATALOG } from "./catalog.js";
import { NETWORK_MATRIX } from "./networks.js";

export type CapabilityRuntimeStatus = "verified" | "contract-only" | "planned";

export interface CapabilityMatrixEntry {
  product: ProductId;
  capability: CapabilityId;
  network: NetworkId;
  networkStage: "available" | "planned";
  declared: boolean;
  providerAvailable: boolean;
  status: CapabilityRuntimeStatus;
}

/**
 * Builds the only support view that may be used for runtime selection.
 * A catalog entry is not execution evidence: it becomes `verified` only when
 * the supplied registry can resolve a provider for the exact capability and
 * network. Planned or undeclared combinations never become executable.
 */
export function buildCapabilityMatrix(
  providers: ProviderRegistry,
  catalog = PRODUCT_CATALOG,
): readonly CapabilityMatrixEntry[] {
  return catalog.flatMap((product) =>
    product.capabilities.flatMap((capability) =>
      NETWORK_MATRIX.map((network) => {
        const declared = product.networks.includes(network.id) && capability.networks.includes(network.id);
        const providerAvailable = declared && network.stage === "available" && canResolve(providers, network.id, capability.id);
        return {
          product: product.id,
          capability: capability.id,
          network: network.id,
          networkStage: network.stage,
          declared,
          providerAvailable,
          status: !declared || network.stage !== "available" ? "planned" : providerAvailable ? "verified" : "contract-only",
        } satisfies CapabilityMatrixEntry;
      }),
    ),
  );
}

function canResolve(providers: ProviderRegistry, network: NetworkId, capability: CapabilityId): boolean {
  try {
    providers.resolve(network, capability);
    return true;
  } catch {
    return false;
  }
}
