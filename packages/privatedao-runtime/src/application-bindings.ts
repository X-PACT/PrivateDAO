import type { CapabilityId, NetworkId, ProductId } from "./index.js";
import { PRODUCT_CATALOG } from "./catalog.js";

export type ApplicationBindingMode = "kernel-gateway" | "legacy-provider" | "unbound";
export type ApplicationHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApplicationCapabilityBinding {
  product: ProductId;
  capability: CapabilityId;
  network: NetworkId;
  mode: ApplicationBindingMode;
  entrypoint?: string;
  method?: ApplicationHttpMethod;
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
    mode: "kernel-gateway",
    entrypoint: "kernel://verification.blind.prove",
    note: "Kernel adapter delegates to the HTTPS proof service and accepts only an observed successful public proof package.",
  },
  {
    product: "record-verification",
    capability: "verification.record.create",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://verification.record.create",
    note: "Kernel-native digest and selective disclosure artifact; no public URL or on-chain anchor is created.",
  },
  {
    product: "record-verification",
    capability: "verification.record.verify",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://verification.record.verify",
    note: "Kernel-native digest verification; no source payload is returned and no on-chain anchor is claimed.",
  },
  {
    product: "payroll",
    capability: "payroll.calculate",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://payroll.calculate",
    note: "Kernel-native deterministic calculation; no wallet signature or settlement is performed.",
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
    method: "POST",
    note: "Existing private-payout provider route; it is not evidence of an end-to-end payroll settlement.",
  },
  {
    product: "treasury",
    capability: "treasury.policy.check",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://treasury.policy.check",
    note: "Kernel-native deterministic policy evaluation; no wallet signature or treasury movement is performed.",
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
    mode: "kernel-gateway",
    entrypoint: "kernel://auction.bid.commit",
    note: "Kernel adapter delegates to the HTTPS sealed-bid commitment service; it returns observed public commitments and does not claim a wallet signature or token movement.",
  },
  {
    product: "auction",
    capability: "auction.settle",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://auction.settle",
    note: "Kernel adapter delegates to the HTTPS outcome-proof service; it proves an already-bound result and does not claim token movement or an on-chain signature.",
  },
  {
    product: "agent",
    capability: "agent.discover",
    network: "solana-devnet",
    mode: "kernel-gateway",
    entrypoint: "kernel://agent.discover",
    note: "Kernel-native read-only Agent Card fetch; no agent activity or external adoption is inferred.",
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
    if (binding.mode === "unbound" && binding.method) errors.push(`${key}: unbound binding cannot have an HTTP method`);
    if (binding.mode === "kernel-gateway" && binding.entrypoint && !binding.entrypoint.startsWith("kernel://")) errors.push(`${key}: Kernel gateway entrypoint must use kernel://`);
    if (binding.mode === "legacy-provider" && binding.entrypoint && !binding.entrypoint.startsWith("/api/")) errors.push(`${key}: legacy provider entrypoint must be an application API path`);
    if (binding.mode === "kernel-gateway" && binding.method) errors.push(`${key}: Kernel gateway binding cannot declare an HTTP method`);
    if (binding.mode === "legacy-provider" && !binding.method) errors.push(`${key}: legacy provider binding requires an HTTP method`);
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
