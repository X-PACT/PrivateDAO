import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { PrivateSettlementRailWorkbench } from "@/components/private-settlement-rail-workbench";
import { PrivacyPolicySelector } from "@/components/privacy-policy-selector";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Cloak Private Settlement",
  description:
    "Run private treasury settlement intents through the Cloak lane and keep the result attached to judge and proof continuity.",
  path: "/services/cloak-private-settlement",
  keywords: ["cloak", "private settlement", "private payroll", "treasury", "proof continuity"],
});

export default function CloakPrivateSettlementPage() {
  return (
    <OperationsShell
      eyebrow="Cloak track"
      title="Private treasury settlement lane with proof-linked continuity"
      description="This route is the direct reviewer and operator surface for Cloak-aligned private settlement. It prepares private treasury and payroll intents, forwards them through the settlement proxy, and keeps execution references visible for judge and proof flows."
      badges={[
        { label: "Cloak lane", variant: "violet" },
        { label: "Wallet-first", variant: "success" },
        { label: "Judge + proof linked", variant: "cyan" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />

      <div className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.08] p-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/76">Execution model</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Prepare → forward private intent → verify receipt</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
          Operators can run confidential settlement intents for payroll, vendor payouts, and treasury motion from one
          route. The same intent and reference path can be inspected from Judge and Proof without moving to terminal
          workflows.
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

      <PrivacyPolicySelector compact />
      <PrivateSettlementRailWorkbench />
    </OperationsShell>
  );
}

