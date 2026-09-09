import { InMemoryProviderRegistry, PrivateDaoKernel, type KernelOptions } from "./kernel.js";
import { ProductExecutionGateway } from "./product-gateway.js";
import { registerCatalogCapabilities } from "./product-registry.js";
import { InMemoryProtocolRegistry, type ProtocolRegistry } from "./protocol.js";
import type { ProviderRegistry } from "./index.js";

/**
 * Single composition boundary for PrivateDAO applications.
 *
 * Product code receives the gateway, never a provider or an RPC client. A
 * caller must register a real provider before preparing any execution; this
 * factory deliberately does not create a test-only provider or fallback
 * success path.
 */
export interface PrivateDaoRuntime {
  readonly providers: ProviderRegistry;
  readonly protocols: ProtocolRegistry;
  readonly kernel: PrivateDaoKernel;
  readonly gateway: ProductExecutionGateway;
}

export function createPrivateDaoRuntime(
  providers: ProviderRegistry = new InMemoryProviderRegistry(),
  options: KernelOptions = {},
): PrivateDaoRuntime {
  const protocols = new InMemoryProtocolRegistry();
  registerCatalogCapabilities(protocols);
  const kernel = new PrivateDaoKernel(providers, options);
  return {
    providers,
    protocols,
    kernel,
    gateway: new ProductExecutionGateway(kernel, protocols),
  };
}
