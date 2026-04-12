import type { Metadata } from "next";
import { Suspense } from "react";

import { MetricsStrip } from "@/components/metrics-strip";
import { JudgeRuntimeLogsPanel } from "@/components/judge-runtime-logs-panel";
import { JudgeExecutionContinuityPanel } from "@/components/judge-execution-continuity-panel";
import { OperationsShell } from "@/components/operations-shell";
import { ProofEntryBanner } from "@/components/proof-entry-banner";
import { ProofFlowRail } from "@/components/proof-flow-rail";
import { ProofCenter } from "@/components/proof-center";
import { ReadNodeActivationStrip } from "@/components/read-node-activation-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
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
    <OperationsShell
      eyebrow="Proof"
      title="Runtime evidence, reviewer packets, and additive hardening in one surface"
      description="The Next.js app exposes the same proof story as the current site, but inside a cleaner operational shell: baseline live proof, dedicated V3 hardening proof, integration packets, and explicit launch boundaries."
      badges={[
        { label: "Proof Center", variant: "cyan" },
        { label: "Reviewer-ready", variant: "violet" },
        { label: "Baseline + V3", variant: "success" },
      ]}
    >
      <div>
        <Suspense fallback={null}>
          <ProofEntryBanner />
        </Suspense>
      </div>
      <div>
        <JudgeRuntimeLogsPanel />
      </div>
      <div>
        <Suspense fallback={null}>
          <JudgeExecutionContinuityPanel />
        </Suspense>
      </div>
      <div>
        <ReadNodeActivationStrip context="proof" />
      </div>
      <div>
        <ReadNodeHostReadinessStrip context="proof" />
      </div>
      <div>
        <MetricsStrip />
      </div>
      <div>
        <ProofFlowRail />
      </div>
      <div>
        <ProofCenter />
      </div>
    </OperationsShell>
  );
}
