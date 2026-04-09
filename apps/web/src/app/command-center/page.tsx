import type { Metadata } from "next";

import { BuyerJourneyRail } from "@/components/buyer-journey-rail";
import { CommandCenter } from "@/components/command-center";
import { MetricsStrip } from "@/components/metrics-strip";
import { ProposalWorkspace } from "@/components/proposal-workspace";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="cyan">Command Center</Badge>
        <Badge variant="success">Create → Vote → Execute</Badge>
        <Badge variant="violet">Commercial + reviewer aware</Badge>
      </div>
      <div className="mt-6">
        <SectionHeader
          eyebrow="Command Center"
          title="A guided governance product surface for normal users, reviewers, and operators"
          description="This is the part of the migration that closes the loop: product pack selection, proposal submission, private voting, proof visibility, and treasury execution all remain understandable without hiding the protocol."
        />
      </div>
      <div className="mt-10">
        <MetricsStrip />
      </div>
      <div className="mt-10">
        <BuyerJourneyRail />
      </div>
      <div className="mt-10">
        <CommandCenter />
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProposalWorkspace />
        <WalletRuntimePanel />
      </div>
    </main>
  );
}
