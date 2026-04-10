import type { Metadata } from "next";
import { Suspense } from "react";

import { MetricsStrip } from "@/components/metrics-strip";
import { ProofEntryBanner } from "@/components/proof-entry-banner";
import { ProofFlowRail } from "@/components/proof-flow-rail";
import { ProofCenter } from "@/components/proof-center";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Center",
  description:
    "Baseline live proof, dedicated V3 hardening proof, integration packets, and launch truth boundaries exposed in one reviewer-friendly surface.",
  path: "/proof",
  keywords: ["proof center", "V3 hardening", "reviewer packets", "live proof"],
});

export default function ProofPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Proof Center</Badge>
        <Badge variant="violet">Reviewer-ready</Badge>
        <Badge variant="success">Baseline + V3</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Proof"
          title="Runtime evidence, reviewer packets, and additive hardening in one surface"
          description="The Next.js app should expose the same proof story as the current site: baseline live proof, dedicated V3 hardening proof, integration packets, and clear launch boundaries."
        />
        <Suspense fallback={null}>
          <ProofEntryBanner />
        </Suspense>
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <ProofFlowRail />
      </div>
      <div className="mt-10">
        <ProofCenter />
      </div>
    </main>
  );
}
