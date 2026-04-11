import type { Metadata } from "next";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { CommandCenter } from "@/components/command-center";
import { CustodyReadinessStrip } from "@/components/custody-readiness-strip";
import { CustodyWorkspace } from "@/components/custody-workspace";
import { GovernanceActionWorkbench } from "@/components/governance-action-workbench";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperatingBoundaryPanel } from "@/components/operating-boundary-panel";
import { OperationsShell } from "@/components/operations-shell";
import { OperationalValidationPanels } from "@/components/operational-validation-panels";
import { ProductActionMap } from "@/components/product-action-map";
import { ProposalWorkspace } from "@/components/proposal-workspace";
import { TreasuryProfileQuickActions } from "@/components/treasury-profile-quick-actions";
import { WalletRuntimePanel } from "@/components/wallet-runtime-panel";
import { getExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Command Center",
  description:
    "Guided PrivateDAO workspace for product-pack selection, proposal actions, wallet runtime, private voting, proof links, and treasury execution rails.",
  path: "/command-center",
  keywords: ["command center", "wallet runtime", "private vote", "treasury execution"],
});

export default function CommandCenterPage() {
  const executionSnapshot = getExecutionSurfaceSnapshot();

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
        <CustodyReadinessStrip context="command-center" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MetricsStrip />
        <OperatingBoundaryPanel
          title="UI full, CLI disciplined"
          summary="Command Center is where real users operate. Engineering-heavy recovery, migration, stress, and batch controls stay in the repo and CLI so the product surface remains clean."
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GovernanceActionWorkbench />
        <div className="space-y-6">
          <ProductActionMap
            title="Exact product operations"
            description="This route family keeps the full normal-user governance flow inside the UI: connect, create, vote, reveal, execute, log review, and diagnostics. Everything deeper stays in the repo."
          />
          <TreasuryProfileQuickActions title="Commercial treasury actions" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CommandCenter />
        <div className="space-y-6">
          <BuyerJourneyRail />
          <OperationalValidationPanels title="Command-center operating health" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProposalWorkspace executionSnapshot={executionSnapshot} />
        <WalletRuntimePanel executionSnapshot={executionSnapshot} />
      </div>
      <div>
        <CustodyWorkspace />
      </div>
    </OperationsShell>
  );
}
