import type { Metadata } from "next";
import Link from "next/link";

import { EitherwayLiveDappSurface } from "@/components/eitherway-live-dapp-surface";
import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Eitherway Wallet-First dApp",
  description:
    "Live wallet-first route for users to connect, sign, and continue into governed execution with proof continuity.",
  path: "/services/eitherway-live-dapp",
  keywords: ["eitherway", "wallet-first", "solflare", "dflow", "kamino", "quicknode"],
});

export default function EitherwayLiveDappPage() {
  return (
    <OperationsShell
      eyebrow="Live dApp"
      title="Deliver a wallet-first product flow that normal users can run without terminal complexity"
      description="This route implements the Eitherway requirement as a real product lane: wallet connect, profile signing, partner selection, action continuation, and proof-linked continuity."
      badges={[
        { label: "Eitherway", variant: "cyan" },
        { label: "Wallet-first", variant: "success" },
        { label: "Testnet flow", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/68">
        PrivateDAO uses this lane to bridge partner tracks into one clear user experience. The same connect/sign flow can feed
        private payroll, treasury rebalance, or governed market execution.
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Open start flow
          </Link>
          <Link href="/judge" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open judge
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </div>
      <EitherwayLiveDappSurface />
    </OperationsShell>
  );
}

