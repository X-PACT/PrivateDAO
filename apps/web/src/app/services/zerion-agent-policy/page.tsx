import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { ZerionAgentPolicySurface } from "@/components/zerion-agent-policy-surface";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Zerion Agent Policy",
  description:
    "Policy-bound autonomous execution surface for connecting PrivateDAO governance decisions to a Zerion CLI fork without creating an unsafe god-mode agent.",
  path: "/services/zerion-agent-policy",
  keywords: ["zerion cli", "autonomous agent", "solana policy", "private dao agent"],
});

export default function ZerionAgentPolicyPage() {
  return (
    <OperationsShell
      eyebrow="Agent execution"
      title="Make autonomous execution safe enough for DAO treasury operations"
      description="This route packages the Zerion-facing strategy into a concrete policy surface: Solana chain lock, spend caps, expiry windows, blocked actions, proof requirements, and operator approval before wallet execution."
      badges={[
        { label: "Zerion CLI fork path", variant: "cyan" },
        { label: "Policy-bound", variant: "success" },
        { label: "No god-mode agent", variant: "warning" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/68">
        The strongest Zerion angle for PrivateDAO is not an unrestricted bot. It is a governed agent that can prepare
        rebalances, payroll, and reward execution only inside scoped treasury policies.
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/documents/zerion-autonomous-agent-policy" className={cn(buttonVariants({ size: "sm" }))}>
            Open agent packet
          </Link>
          <Link href="/services" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open services
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open judge
          </Link>
        </div>
      </div>
      <ZerionAgentPolicySurface />
    </OperationsShell>
  );
}

