import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

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
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { cn } from "@/lib/utils";

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
  const integrationEvidenceLanes = [
    {
      title: "Cloak private settlement",
      summary: "Confidential treasury and payroll settlement lane with proxy execution references and receipt exports.",
      featureHref: "/services/cloak-private-settlement",
      proofHref: "/proof",
    },
    {
      title: "Umbra confidential payout",
      summary: "Claim-link payout and recipient-private settlement lane with proof-linked continuity.",
      featureHref: "/services/umbra-confidential-payout",
      proofHref: "/documents/privacy-and-encryption-proof-guide",
    },
    {
      title: "Intelligence evidence",
      summary: "GoldRush and Dune Sim reviewer-facing intelligence lane for wallet history, stablecoin review, and counterparty screening.",
      featureHref: "/intelligence",
      proofHref: "/proof",
    },
    {
      title: "AUDD treasury mode",
      summary: "AUD-denominated treasury and merchant settlement lane with stablecoin proof path.",
      featureHref: "/services/audd-stablecoin",
      proofHref: "/documents/audd-stablecoin-treasury-layer",
    },
    {
      title: "PUSD treasury mode",
      summary: "Stable reserve, payroll, and reward-pool lane with treasury packet continuity.",
      featureHref: "/services/pusd-stablecoin",
      proofHref: "/documents/pusd-stablecoin-treasury-layer",
    },
    {
      title: "Jupiter treasury route",
      summary: "Route preview and rebalance lane tied to governed treasury motion.",
      featureHref: "/services/jupiter-treasury-route",
      proofHref: "/documents/jupiter-treasury-route",
    },
    {
      title: "Zerion policy lane",
      summary: "Bounded agent policy lane for wallet-safe execution and reviewer scrutiny.",
      featureHref: "/services/zerion-agent-policy",
      proofHref: "/documents/zerion-autonomous-agent-policy",
    },
    {
      title: "Torque growth loop",
      summary: "Growth and retention evidence lane linked to reward and participation mechanics.",
      featureHref: "/services/torque-growth-loop",
      proofHref: "/documents/torque-growth-loop",
    },
    {
      title: "Eitherway live dApp",
      summary: "Wallet-first product lane with connect, profile signing, and continuation into governed execution.",
      featureHref: "/services/eitherway-live-dapp",
      proofHref: "/proof",
    },
    {
      title: "Runtime infrastructure",
      summary: "Fast RPC, host readiness, and telemetry lane with operational evidence continuity.",
      featureHref: "/services/runtime-infrastructure",
      proofHref: "/analytics",
    },
    {
      title: "Encrypt / IKA operations",
      summary: "Encrypted payload preparation and commitment-safe planning lane tied to proof continuity.",
      featureHref: "/services/encrypt-ika-operations",
      proofHref: "/documents/encrypted-operations-lane",
    },
    {
      title: "SolRouter encrypted AI",
      summary: "Deterministic proposal intelligence with encrypted brief export and receipt continuity.",
      featureHref: "/services/solrouter-encrypted-ai",
      proofHref: "/proof",
    },
  ] as const;

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
        pendingNote="Proof continuity stays explicit across governance, intelligence, execution, and receipt export lanes."
      />
      <LocalizedRouteSummary routeKey="proof" />
      <LocalizedProofPrimer />
      <OperatingJourneyStrip
        snapshot={runtimeSnapshot}
        title="Proof-side operating journey"
        description="Before opening detailed packets, read the current Testnet operating journey here: what is verified, what is captured from runtime evidence, and what is attached to receipt exports."
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
      <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Integration proof lanes</div>
        <div className="mt-2 max-w-4xl text-sm leading-7 text-white/68">
          Each lane below gives a reviewer the shortest path from feature surface to proof packet without needing to reconstruct the product by hand.
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {integrationEvidenceLanes.map((lane) => (
            <div key={lane.title} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="text-base font-medium text-white">{lane.title}</div>
              <div className="mt-2 text-sm leading-6 text-white/62">{lane.summary}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={lane.featureHref} className={cn(buttonVariants({ size: "sm" }))}>
                  Open feature
                </Link>
                <Link href={lane.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open proof
                </Link>
              </div>
            </div>
          ))}
        </div>
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
