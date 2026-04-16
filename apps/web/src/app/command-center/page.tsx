import type { Metadata } from "next";
import { Suspense } from "react";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { CommandCenter } from "@/components/command-center";
import { CommandCenterLiveShell } from "@/components/command-center-live-shell";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { CustodyTruthQuickActions } from "@/components/custody-truth-quick-actions";
import { CustodyWorkspace } from "@/components/custody-workspace";
import { ExecutionOperationsStrip } from "@/components/execution-operations-strip";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperatingBoundaryPanel } from "@/components/operating-boundary-panel";
import { OperationsShell } from "@/components/operations-shell";
import { OperationalValidationPanels } from "@/components/operational-validation-panels";
import { PaymentsTruthStrip } from "@/components/payments-truth-strip";
import { PdaoTokenStrategyStrip } from "@/components/pdao-token-strategy-strip";
import { ProductActionMap } from "@/components/product-action-map";
import { ReadNodeActivationStrip } from "@/components/read-node-activation-strip";
import { ReadNodeHostReadinessStrip } from "@/components/read-node-host-readiness-strip";
import { ServiceHandoffStrip } from "@/components/service-handoff-strip";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { WalletFirstServiceActionsStrip } from "@/components/wallet-first-service-actions-strip";
import { AuthoritativeExecutionTrail } from "@/components/authoritative-execution-trail";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { getJudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Command Center",
  description:
    "Guided PrivateDAO workspace for product-pack selection, proposal actions, wallet runtime, private voting, proof links, and treasury execution rails.",
  path: "/command-center",
  keywords: ["command center", "wallet runtime", "private vote", "treasury execution"],
  index: false,
});

export default function CommandCenterPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();
  const runtimeSnapshot = getJudgeRuntimeLogsSnapshot();

  return (
    <OperationsShell
      eyebrow="Command Center"
      title="A guided governance product surface for normal users, reviewers, and operators"
      description="This is the part of the migration that closes the loop: product-pack selection, proposal submission, private voting, wallet state, proof visibility, and treasury execution in one operational shell."
      badges={[
        { label: "Command Center", variant: "cyan" },
        { label: "Create → Vote → Execute", variant: "success" },
        { label: "Commercial + reviewer aware", variant: "violet" },
      ]}
    >
      <div>
        <PaymentsTruthStrip context="command-center" />
      </div>
      <div>
        <Suspense fallback={null}>
          <ServiceHandoffStrip context="command-center" />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <AuthoritativeExecutionTrail context="command-center" runtimeSnapshot={runtimeSnapshot} />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={null}>
          <ExecutionOperationsStrip context="command-center" />
        </Suspense>
      </div>
      <div>
        <WalletFirstServiceActionsStrip context="command-center" />
      </div>
      <div>
        <PdaoTokenStrategyStrip context="command-center" />
      </div>
      <div>
        <CustodyTruthQuickActions
          title="Custody truth quick actions"
          description="Open reviewer truth, canonical proof, intake schema, and the strict apply route without leaving the command shell first."
        />
      </div>
      <div>
        <CustodyReadinessStrip context="command-center" />
      </div>
      <div>
        <ReadNodeActivationStrip context="command-center" />
      </div>
      <div>
        <ReadNodeHostReadinessStrip context="command-center" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MetricsStrip />
        <OperatingBoundaryPanel
          title="UI full, CLI disciplined"
          summary="Command Center is where real users operate. Engineering-heavy recovery, migration, stress, and batch controls stay in the repo and CLI so the product surface remains clean."
        />
      </div>
      <CommandCenterLiveShell executionSnapshot={executionSnapshot} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ProductActionMap
            title="Exact product operations"
            description="This route family keeps the full normal-user governance flow inside the UI: connect, create, vote, reveal, execute, log review, and diagnostics. Everything deeper stays in the repo."
          />
          <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading treasury routes…</div>}>
            <TreasuryProfileQuickActions title="Commercial treasury actions" />
          </Suspense>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Suspense fallback={<div className="rounded-3xl border border-white/8 bg-white/4 p-6 text-sm text-white/60">Loading live indexed proposal…</div>}>
          <CommandCenter />
        </Suspense>
        <div className="space-y-6">
          <BuyerJourneyRail />
          <OperationalValidationPanels title="Command-center operating health" />
        </div>
      </div>
      <div>
        <CustodyWorkspace />
      </div>
    </OperationsShell>
  );
}
