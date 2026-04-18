import type { Metadata } from "next";
import { Suspense } from "react";

import { MetricsStrip } from "@/components/metrics-strip";
import { JudgeRuntimeLogsPanel } from "@/components/judge-runtime-logs-panel";
import { JudgeExecutionContinuityPanel } from "@/components/judge-execution-continuity-panel";
import { LocalizedProofPrimer } from "@/components/localized-proof-primer";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { ProofEntryBanner } from "@/components/proof-entry-banner";
import { ProofFlowRail } from "@/components/proof-flow-rail";
import { ProofCenter } from "@/components/proof-center";
import { ReadNodeActivationStrip } from "@/components/read-node-activation-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
import { RuntimeEvidenceContinuityPanel } from "@/components/runtime-evidence-continuity-panel";
import { AuthoritativeExecutionTrail } from "@/components/authoritative-execution-trail";
import { ExecutionOperationsStrip } from "@/components/execution-operations-strip";
import { DevnetExecutionScreenshotsStrip } from "@/components/devnet-execution-screenshots-strip";
import { PrivacyProofExplainer } from "@/components/privacy-proof-explainer";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Center",
  description:
    "Baseline live proof, dedicated V3 hardening proof, integration packets, and launch truth boundaries exposed in one clear product verification surface.",
  path: "/proof",
  keywords: ["proof center", "V3 hardening", "verification packets", "live proof"],
});

export default function ProofPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Proof"
      title="Runtime evidence, trust packets, and additive hardening in one surface"
      description="The Next.js app exposes the same proof story as the current site, but inside a cleaner operational shell: baseline live proof, dedicated V3 hardening proof, integration packets, and the exact surfaces you use after running the real Devnet flow yourself."
      badges={[
        { label: "Proof Center", variant: "cyan" },
        { label: "Verification-ready", variant: "violet" },
        { label: "Baseline + V3", variant: "success" },
      ]}
    >
      <LocalizedRouteSummary routeKey="proof" />
      <LocalizedProofPrimer />
      <div>
        <Suspense fallback={null}>
          <ProofEntryBanner />
        </Suspense>
      </div>
      <div>
        <PrivacyProofExplainer compact />
      </div>
      <div>
        <PrivacyPolicySelector compact />
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
      <DevnetExecutionScreenshotsStrip />
    </OperationsShell>
  );
}
