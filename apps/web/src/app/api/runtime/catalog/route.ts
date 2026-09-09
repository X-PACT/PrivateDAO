import { runtimeCatalog } from "@/lib/runtime-catalog.generated";

export const dynamic = "force-static";

/**
 * Machine-readable projection of the canonical Kernel catalog. This endpoint
 * describes contracts and declared availability; it does not claim that a
 * transaction was executed or that a provider exists at runtime.
 */
export function GET() {
  return Response.json({
    schemaVersion: "privatedao.runtime-catalog.v1",
    generatedFrom: runtimeCatalog.generatedFrom,
    products: runtimeCatalog.products,
    networks: runtimeCatalog.networks,
  });
}
