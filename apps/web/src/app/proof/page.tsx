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
import { RuntimeEvidenceContinuityPanel } from "@/components/runtime-evidence-continuity-panel";
import { AuthoritativeExecutionTrail } from "@/components/authoritative-execution-trail";
import { ExecutionOperationsStrip } from "@/components/execution-operations-strip";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Center",
  description:
    "Baseline live proof, dedicated V3 hardening proof, integration packets, and launch truth boundaries exposed in one reviewer-friendly surface.",
  path: "/proof",
  keywords: ["proof center", "V3 hardening", "reviewer packets", "live proof"],
});

export default function ProofPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Proof"
      title="Runtime evidence, reviewer packets, and additive hardening in one surface"
      description="The Next.js app exposes the same proof story as the current site, but inside a cleaner operational shell: baseline live proof, dedicated V3 hardening proof, integration packets, and the exact surfaces you use after running the real Devnet flow yourself."
      badges={[
        { label: "Proof Center", variant: "cyan" },
        { label: "Reviewer-ready", variant: "violet" },
        { label: "Baseline + V3", variant: "success" },
      ]}
    >
      <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/[0.08] p-5 text-sm leading-7 text-white/72">
        Connect a Devnet wallet, run the DAO lifecycle from <strong className="text-white">Govern</strong>, then use this proof surface to inspect transaction signatures, captured logs, runtime freshness, and the privacy evidence that stays attached to each real action.
      </div>
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
          <JudgeExecutionContinuityPanel
            executionSnapshot={executionSnapshot}
            runtimeSnapshot={runtimeSnapshot}
          />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <AuthoritativeExecutionTrail context="proof" runtimeSnapshot={runtimeSnapshot} />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <ExecutionOperationsStrip context="proof" />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <RuntimeEvidenceContinuityPanel
            context="proof"
            executionSnapshot={executionSnapshot}
            runtimeSnapshot={runtimeSnapshot}
          />
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
