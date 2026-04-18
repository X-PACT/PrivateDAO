import type { Metadata } from "next";

import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { OperationsShell } from "@/components/operations-shell";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { ProductOfferCards } from "@/components/product-offer-cards";
import { PrivacySdkApiStarter } from "@/components/privacy-sdk-api-starter";
import { SolanaInfrastructureStack } from "@/components/solana-infrastructure-stack";
import { TrustSurface } from "@/components/trust-surface";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Products",
  description:
    "PrivateDAO product corridors, buyer-facing packages, and clear use-case surfaces for confidential governance and treasury operations.",
  path: "/products",
  keywords: ["products", "use cases", "private governance", "confidential treasury", "dao infrastructure"],
});

export default function ProductsPage() {
  return (
    <OperationsShell
      eyebrow="Products"
      title="PrivateDAO product corridors, service packs, and buyer-facing offerings"
      description="This route collects the startup-facing product layer: service packages, buyer corridors, and the clearest explanation of what PrivateDAO sells and ships."
      badges={[
        { label: "Commercial-ready", variant: "cyan" },
        { label: "Buyer-first", variant: "success" },
        { label: "Review-ready", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="products" />
      <ProductOfferCards />
      <PrivacyPolicySelector />
      <PrivacySdkApiStarter compact />
      <SolanaInfrastructureStack />
      <SolutionCorridors />
      <CommercialCompareSurface />
      <ServicesSurface />
      <TrustSurface />
    </OperationsShell>
  );
}
