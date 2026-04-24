import type { Metadata } from "next";
import Link from "next/link";

import { LocalizedRouteBrief } from "@/components/localized-route-brief";
import { LocalizedRouteSummary } from "@/components/localized-route-summary";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperationsShell } from "@/components/operations-shell";
import { WalletTemplateSandbox } from "@/components/wallet-template-sandbox";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Consumer Governance UX",
  description:
    "Consumer-grade governance route where users connect wallet, review policy, sign, and verify across web and Android entry points.",
  path: "/services/consumer-governance-ux",
  keywords: ["consumer ux", "wallet-first governance", "android", "web", "solana"],
});

export default function ConsumerGovernanceUxPage() {
  return (
    <OperationsShell
      eyebrow="Consumer UX"
      title="Make complex DAO operations feel simple for normal users"
      description="This lane is the public-facing UX closure: wallet connection, guided operation path, clear signing context, and proof verification from web and Android entry points."
      badges={[
        { label: "Consumer-ready", variant: "success" },
        { label: "Wallet-first", variant: "cyan" },
        { label: "Web + Android", variant: "violet" },
      ]}
    >
      <LocalizedRouteSummary routeKey="services" />
      <LocalizedRouteBrief routeKey="servicesCore" />
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/68">
        The goal is predictable UX: connect wallet, review operation, sign once for the right action, then verify the receipt in the same interface.
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Open start
          </Link>
          <Link href="/android" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open android app
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Open proof
          </Link>
        </div>
      </div>
      <WalletTemplateSandbox />
      <NormalUserOperationPath />
    </OperationsShell>
  );
}

