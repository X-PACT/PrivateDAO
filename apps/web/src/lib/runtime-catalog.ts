import { runtimeCatalog } from "./runtime-catalog.generated";

export type RuntimeProductId = (typeof runtimeCatalog.products)[number]["id"];
export type RuntimeNetworkId = (typeof runtimeCatalog.networks)[number]["id"];
export type RuntimeCapabilityId = (typeof runtimeCatalog.products)[number]["capabilities"][number]["id"];
export type RuntimeBindingMode = "kernel-gateway" | "legacy-provider" | "unbound";

export function getRuntimeProduct(productId: RuntimeProductId) {
  const product = runtimeCatalog.products.find((entry) => entry.id === productId);
  if (!product) throw new Error(`Unknown PrivateDAO runtime product: ${productId}`);
  return product;
}

export function getRuntimeCapability(productId: RuntimeProductId, capabilityId: RuntimeCapabilityId) {
  const capability = getRuntimeProduct(productId).capabilities.find((entry) => entry.id === capabilityId);
  if (!capability) throw new Error(`Unknown PrivateDAO runtime capability: ${capabilityId}`);
  return capability;
}

export function isRuntimeCapabilityExecutable(
  productId: RuntimeProductId,
  capabilityId: RuntimeCapabilityId,
  network: RuntimeNetworkId,
): boolean {
  return getRuntimeCapability(productId, capabilityId).applicationBindings.some(
    (binding) => binding.network === network && binding.mode !== "unbound",
  );
}

export function isRuntimeProductAvailable(productId: RuntimeProductId): boolean {
  return getRuntimeProduct(productId).availability === "available";
}

export function getRuntimeProductIds(): readonly RuntimeProductId[] {
  return runtimeCatalog.products.map((product) => product.id);
}
