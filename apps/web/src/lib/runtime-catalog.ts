import { runtimeCatalog } from "./runtime-catalog.generated";

export type RuntimeProductId = (typeof runtimeCatalog.products)[number]["id"];
export type RuntimeNetworkId = (typeof runtimeCatalog.networks)[number]["id"];

export function getRuntimeProduct(productId: RuntimeProductId) {
  const product = runtimeCatalog.products.find((entry) => entry.id === productId);
  if (!product) throw new Error(`Unknown PrivateDAO runtime product: ${productId}`);
  return product;
}

export function isRuntimeProductAvailable(productId: RuntimeProductId): boolean {
  return getRuntimeProduct(productId).availability === "available";
}

export function getRuntimeProductIds(): readonly RuntimeProductId[] {
  return runtimeCatalog.products.map((product) => product.id);
}
