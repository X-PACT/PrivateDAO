import type { Metadata } from "next";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { CommandCenter } from "@/components/command-center";
import { MetricsStrip } from "@/components/metrics-strip";
import { OperationsShell } from "@/components/operations-shell";
import { OperationalValidationPanels } from "@/components/operational-validation-panels";
import { ProposalWorkspace } from "@/components/proposal-workspace";
import { WalletRuntimePanel } from "@/components/wallet-runtime-panel";
import { buildRouteMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildRouteMetadata({
  title: "Command Center",
  description:
    "Guided PrivateDAO workspace for product-pack selection, proposal actions, wallet runtime, private voting, proof links, and treasury execution rails.",
  path: "/command-center",
  keywords: ["command center", "wallet runtime", "private vote", "treasury execution"],
});

export default function CommandCenterPage() {
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
        <MetricsStrip />
      </div>
      <div>
        <BuyerJourneyRail />
      </div>
      <div>
        <CommandCenter />
      </div>
      <div>
        <OperationalValidationPanels title="Command-center operating health" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProposalWorkspace />
        <WalletRuntimePanel />
      </div>
    </OperationsShell>
  );
}
