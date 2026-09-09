import type { CapabilityId, NetworkId, ProductId } from "./index.js";
import { PRODUCT_CATALOG } from "./catalog.js";

export type ApplicationBindingMode = "kernel-gateway" | "legacy-provider" | "unbound";

export interface ApplicationCapabilityBinding {
  product: ProductId;
  capability: CapabilityId;
  network: NetworkId;
  mode: ApplicationBindingMode;
  entrypoint?: string;
  note: string;
}

/**
 * The application boundary is intentionally explicit while product routes are
 * being migrated. A legacy provider is an observed route, not Kernel evidence;
 * an unbound capability cannot be selected for execution.
 */
export const APPLICATION_CAPABILITY_BINDINGS: readonly ApplicationCapabilityBinding[] = [
  {
    product: "blind-verification",
    capability: "verification.blind.prove",
    network: "solana-devnet",
    mode: "legacy-provider",
    entrypoint: "/api/proof-workflows/blind-policy/prove",
    note: "Existing proof-workflow provider route; not yet routed through ProductExecutionGateway.",
  },
  {
    product: "record-verification",
    capability: "verification.record.create",
    network: "solana-devnet",
    mode: "unbound",
    note: "No exact record-creation application binding is exposed by the web app.",
  },
  {
    product: "record-verification",
    capability: "verification.record.verify",
    network: "solana-devnet",
    mode: "legacy-provider",
    entrypoint: "/api/records/verify",
    note: "Existing record verification proxy; not yet routed through ProductExecutionGateway.",
  },
  {
    product: "payroll",
    capability: "payroll.calculate",
    network: "solana-devnet",
    mode: "unbound",
    note: "Payroll calculation is not yet exposed as a Kernel-backed application action.",
  },
  {
    product: "payroll",
    capability: "payroll.approve",
    network: "solana-devnet",
    mode: "unbound",
    note: "Payroll approval state machine is not yet exposed as a Kernel-backed application action.",
  },
  {
    product: "payroll",
    capability: "payroll.settle",
    network: "solana-devnet",
    mode: "legacy-provider",
    entrypoint: "/api/private-payout/prepare",
    note: "Existing private-payout provider route; it is not evidence of an end-to-end payroll settlement.",
  },
  {
    product: "treasury",
    capability: "treasury.policy.check",
    network: "solana-devnet",
    mode: "unbound",
    note: "No exact Kernel-backed treasury policy action is exposed by the web app.",
  },
  {
    product: "governance",
    capability: "governance.proposal.execute",
    network: "solana-devnet",
    mode: "unbound",
    note: "No exact Kernel-backed governance execution action is exposed by the web app.",
  },
  {
    product: "auction",
    capability: "auction.bid.commit",
    network: "solana-devnet",
    mode: "legacy-provider",
    entrypoint: "/api/auctions/sealed/run",
    note: "Existing sealed-auction route; not yet routed through ProductExecutionGateway.",
  },
  {
    product: "auction",
    capability: "auction.settle",
    network: "solana-devnet",
    mode: "legacy-provider",
    entrypoint: "/api/auctions/sealed/outcome-proof",
    note: "Existing sealed-auction proof route; settlement evidence remains provider-specific.",
  },
  {
    product: "agent",
    capability: "agent.discover",
    network: "solana-devnet",
    mode: "unbound",
    note: "Agent discovery is hosted outside this web application boundary.",
  },
  {
    product: "agent",
    capability: "agent.invoke",
    network: "solana-devnet",
    mode: "unbound",
    note: "No Kernel-backed Agent Marketplace invocation action is exposed by the web app.",
  },
];

export function listApplicationBindings(): readonly ApplicationCapabilityBinding[] {
  return APPLICATION_CAPABILITY_BINDINGS;
}

export function findApplicationBinding(
  product: ProductId,
  capability: CapabilityId,
  network: NetworkId,
): ApplicationCapabilityBinding {
  const binding = APPLICATION_CAPABILITY_BINDINGS.find(
    (entry) => entry.product === product && entry.capability === capability && entry.network === network,
  );
  if (!binding) throw new Error(`Missing application binding for ${product}/${capability}/${network}`);
  return binding;
}

export function validateApplicationBindings(
  catalog = PRODUCT_CATALOG,
  bindings = APPLICATION_CAPABILITY_BINDINGS,
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const binding of bindings) {
    const key = `${binding.product}/${binding.capability}/${binding.network}`;
    if (seen.has(key)) errors.push(`duplicate application binding ${key}`);
    seen.add(key);
    const product = catalog.find((entry) => entry.id === binding.product);
    const capability = product?.capabilities.find((entry) => entry.id === binding.capability);
    if (!product || !capability) errors.push(`binding references unknown capability ${key}`);
    if (product && !product.networks.includes(binding.network)) errors.push(`${key}: network is not declared by product`);
    if (capability && !capability.networks.includes(binding.network)) errors.push(`${key}: network is not declared by capability`);
    if (binding.mode === "unbound" && binding.entrypoint) errors.push(`${key}: unbound binding cannot have an entrypoint`);
    if (binding.mode !== "unbound" && !binding.entrypoint) errors.push(`${key}: executable binding requires an entrypoint`);
    if (binding.entrypoint && !binding.entrypoint.startsWith("/api/")) errors.push(`${key}: entrypoint must be an application API path`);
  }
  for (const product of catalog) {
    for (const capability of product.capabilities) {
      for (const network of capability.networks) {
        const key = `${product.id}/${capability.id}/${network}`;
        if (!seen.has(key)) errors.push(`missing application binding ${key}`);
      }
    }
  }
  return errors;
}

export function assertApplicationBindingsValid(): void {
  const errors = validateApplicationBindings();
  if (errors.length > 0) throw new Error(`Invalid PrivateDAO application bindings:\n${errors.join("\n")}`);
}

assertApplicationBindingsValid();
