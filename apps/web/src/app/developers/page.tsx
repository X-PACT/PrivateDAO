import type { Metadata } from "next";

import { DeveloperPlatformSurface } from "@/components/developer-platform-surface";
import { EcosystemFocusAlignmentStrip } from "@/components/ecosystem-focus-alignment-strip";
import { OperationsShell } from "@/components/operations-shell";
import { ProofCenter } from "@/components/proof-center";
import { SiteSearchPanel } from "@/components/site-search-panel";
import { PlatformServiceArchitecture } from "@/components/platform-service-architecture";
import { TrustSurface } from "@/components/trust-surface";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Developers",
  description:
    "Developer-facing proof, docs, and service architecture for PrivateDAO operators and integrators.",
  path: "/developers",
  keywords: ["developers", "docs", "proof", "service architecture", "integrators"],
  index: false,
});

export default function DevelopersPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Documentation, proof packets, viewers, and engineering surfaces"
      description="Developer-facing access should start with curated docs and continue into the broader repository viewer and proof surfaces."
      badges={[
        { label: "Docs and viewers", variant: "cyan" },
        { label: "Reviewer-ready", variant: "violet" },
        { label: "Track-aware", variant: "success" },
      ]}
    >
      <EcosystemFocusAlignmentStrip
        title="Developer tooling fit should be obvious on the developer route"
        description="Keep the tooling, telemetry, censorship-resistance, and infrastructure fit legible before the reviewer dives into proof packets and repo artifacts."
      />
      <DeveloperPlatformSurface />
      <PlatformServiceArchitecture />
      <SiteSearchPanel />
      <ProofCenter />
      <TrustSurface />
    </OperationsShell>
  );
}
