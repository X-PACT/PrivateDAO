import type { Metadata } from "next";
import { Suspense } from "react";

import { MetricsStrip } from "@/components/metrics-strip";
import { JudgeRuntimeLogsPanel } from "@/components/judge-runtime-logs-panel";
import { JudgeExecutionContinuityPanel } from "@/components/judge-execution-continuity-panel";
import { LocalizedProofPrimer } from "@/components/localized-proof-primer";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { GuidedOperationRail } from "@/components/guided-operation-rail";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperatingJourneyStrip } from "@/components/operating-journey-strip";
import { OperationReceiptLedger } from "@/components/operation-receipt-ledger";
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
import { SupabaseOperationTimeline } from "@/components/supabase-operation-timeline";
import { PrivacyProofExplainer } from "@/components/privacy-proof-explainer";
import { TestnetProofMatrix } from "@/components/testnet-proof-matrix";
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
      title="Operation receipts, runtime evidence, and trust packets in one premium verification surface"
      description="This surface is the receipt layer for executed operations: baseline live proof, dedicated V3 hardening proof, integration packets, and the exact routes used after running real Testnet flow through the public product."
      badges={[
        { label: "Proof Center", variant: "cyan" },
        { label: "Verification-ready", variant: "violet" },
        { label: "Baseline + V3", variant: "success" },
      ]}
    >
      <GuidedOperationRail
        current="verify"
        reviewHref="/govern"
        verifyHref="/proof"
        compact
        pendingNote="Where proof expansion is still not fully captured on every device lane, the status is treated as جاري الانهاء rather than hidden."
      />
      <LocalizedRouteSummary routeKey="proof" />
      <LocalizedProofPrimer />
      <OperatingJourneyStrip
        snapshot={runtimeSnapshot}
        title="Proof-side operating journey"
        description="Before opening detailed packets, read the current Testnet operating journey here: what is verified, what is partially evidenced, and what still remains under جاري الانهاء."
      />
      <div>
        <Suspense fallback={null}>
          <ProofEntryBanner />
        </Suspense>
      </div>
      <div>
        <PrivacyProofExplainer compact />
      </div>
      <NormalUserOperationPath />
      <TestnetProofMatrix />
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
      <OperationReceiptLedger snapshot={runtimeSnapshot} />
      <SupabaseOperationTimeline />
      <DevnetExecutionScreenshotsStrip />
    </OperationsShell>
  );
}
