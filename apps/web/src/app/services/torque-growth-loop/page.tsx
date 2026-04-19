import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { TorqueGrowthLoopSurface } from "@/components/torque-growth-loop-surface";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Torque Growth Loop",
  description:
    "Growth loop surface for emitting PrivateDAO custom_events into Torque-style incentives tied to real Solana product activity.",
  path: "/services/torque-growth-loop",
  keywords: ["torque mcp", "growth loop", "custom events", "private dao retention"],
});

export default function TorqueGrowthLoopPage() {
  return (
    <OperationsShell
      eyebrow="Growth infrastructure"
      title="Use incentives only where the product creates measurable on-chain activity"
      description="This route turns PrivateDAO usage into Torque-style custom_events: DAO creation, proposal creation, billing signatures, and education completion. The growth loop stays attached to real product behavior."
      badges={[
        { label: "Torque MCP path", variant: "success" },
        { label: "Custom events", variant: "cyan" },
        { label: "Retention loop", variant: "warning" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-6 text-sm leading-7 text-white/68">
        The correct Torque integration is not a separate bounty mechanic. It is the product growth layer: reward the
        actions that prove a user is learning, governing, paying, or returning.
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/documents/torque-growth-loop" className={cn(buttonVariants({ size: "sm" }))}>
            Open growth packet
          </Link>
          <Link href="/learn" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open learn
          </Link>
          <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open billing
          </Link>
        </div>
      </div>
      <TorqueGrowthLoopSurface />
    </OperationsShell>
  );
}

