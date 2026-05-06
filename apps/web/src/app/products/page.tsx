import type { Metadata } from "next";

import { CommercialCompareSurface } from "@/components/commercial-compare-surface";
import { GuidedOperationRail } from "@/components/guided-operation-rail";
import { LocalizedProductsPrimer } from "@/components/localized-products-primer";
import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperatingJourneyStrip } from "@/components/operating-journey-strip";
import { ServicesSurface } from "@/components/services-surface";
import { SolutionCorridors } from "@/components/solution-corridors";
import { OperationsShell } from "@/components/operations-shell";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { ProductOfferCards } from "@/components/product-offer-cards";
import { PlatformCapabilityStack } from "@/components/platform-capability-stack";
import { PrivacySdkApiStarter } from "@/components/privacy-sdk-api-starter";
import { SolanaInfrastructureStack } from "@/components/solana-infrastructure-stack";
import { TrustSurface } from "@/components/trust-surface";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Products",
  description:
    "PrivateDAO product corridors, buyer-facing packages, and clear use-case surfaces for confidential governance and treasury operations.",
  path: "/products",
  keywords: ["products", "use cases", "private governance", "confidential treasury", "dao infrastructure"],
});

export default function ProductsPage() {
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Products"
      title="PrivateDAO product corridors, service packs, and buyer-facing offerings"
      description="This route collects the startup-facing product layer: service packages, buyer corridors, and the clearest explanation of what PrivateDAO sells and ships."
      navigationMode="guided"
      badges={[
        { label: "Commercial-ready", variant: "cyan" },
        { label: "Buyer-first", variant: "success" },
        { label: "Review-ready", variant: "violet" },
      ]}
    >
      <GuidedOperationRail current="review" reviewHref="/intelligence" verifyHref="/proof" />
      <OperatingJourneyStrip
        snapshot={runtimeSnapshot}
        title="Product corridors are only credible when they resolve into the same operating journey"
        description="Use this route to understand what PrivateDAO sells, then move into the same wallet-first cycle that governs review, signing, and proof on Testnet."
      />
      <LocalizedRouteSummary routeKey="products" />
      <LocalizedRouteBrief routeKey="products" />
      <LocalizedProductsPrimer />
      <ProductOfferCards />
      <PlatformCapabilityStack
        title="Every product corridor is backed by a real execution and proof lane"
        description="The product layer is only credible when each corridor points into a real runtime path, a verification surface, and a reusable service model."
      />
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
