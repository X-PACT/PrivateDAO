import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { PrivateSettlementRailWorkbench } from "@/components/private-settlement-rail-workbench";
import { UmbraClaimLinkWorkbench } from "@/components/umbra-claim-link-workbench";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Umbra Confidential Payout",
  description:
    "Umbra payout lane for private recipient flows, claim-link style distribution, and proof-linked settlement continuity.",
  path: "/services/umbra-confidential-payout",
  keywords: ["umbra", "confidential payout", "payment links", "private settlement", "solana"],
});

export default function UmbraConfidentialPayoutPage() {
  return (
    <OperationsShell
      eyebrow="Umbra track"
      title="Confidential payout lane for claim-style recipient flows"
      description="This route packages Umbra-style recipient privacy flow as real product behavior: claim-link preparation, private settlement intents, and proof continuity for judges and operators."
      badges={[
        { label: "Umbra lane", variant: "success" },
        { label: "Claim-style payouts", variant: "cyan" },
        { label: "Proof continuity", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />

      <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/78">Execution model</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Prepare claim link, execute private payout, verify receipt</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
          The payout lane is structured for recipient privacy and operator clarity. The same route exposes settlement
          preparation, claim-oriented flow, and direct reviewer paths into judge and proof.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/execute#vendor-payment" className={cn(buttonVariants({ size: "sm" }))}>
            Open execute lane
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open judge lane
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof lane
          </Link>
        </div>
      </div>

      <UmbraClaimLinkWorkbench />
      <PrivateSettlementRailWorkbench initialRail="umbra" lockRail />
    </OperationsShell>
  );
}

