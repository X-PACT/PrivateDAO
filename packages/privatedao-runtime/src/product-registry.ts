import { PRODUCT_CATALOG } from "./catalog.js";
import type { ProductDescriptor } from "./catalog.js";
import type {
  AuthorizationPolicy,
  ProtocolPermission,
  ProtocolRegistration,
  ProtocolRegistry,
  ProtocolRole,
} from "./protocol.js";

const readRoles: readonly ProtocolRole[] = ["maker", "checker", "auditor", "admin", "agent"];
const writeRoles: readonly ProtocolRole[] = ["maker", "checker", "admin", "agent"];
const readPermissions: readonly ProtocolPermission[] = ["execution.prepare", "execution.read", "receipt.read", "proof.create", "proof.verify"];
const writePermissions: readonly ProtocolPermission[] = [
  "execution.prepare",
  "execution.submit",
  "execution.read",
  "receipt.read",
  "proof.create",
  "proof.verify",
];

function policyFor(requiresSignature: boolean): AuthorizationPolicy {
  return {
    roles: requiresSignature ? writeRoles : readRoles,
    permissions: requiresSignature ? writePermissions : readPermissions,
    requireDistinctApprover: requiresSignature,
  };
}

/**
 * Registers every catalog capability in the shared Protocol layer.
 * Product code supplies the provider; this function never performs execution.
 */
export function registerCatalogCapabilities(
  registry: ProtocolRegistry,
  catalog: readonly ProductDescriptor[] = PRODUCT_CATALOG,
): readonly ProtocolRegistration[] {
  const registrations: ProtocolRegistration[] = [];
  for (const product of catalog) {
    for (const capability of product.capabilities) {
      const registration: ProtocolRegistration = {
        capability,
        product: product.id,
        action: capability.id,
        policy: policyFor(capability.requiresSignature),
      };
      registry.register(registration);
      registrations.push(registration);
    }
  }
  return registrations;
}
