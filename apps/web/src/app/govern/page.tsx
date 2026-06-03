import type { Metadata } from "next";
import Link from "next/link";

import { GovernWorkbenchClient } from "@/components/govern/govern-workbench-client";
import { GuidedOperationRail } from "@/components/guided-operation-rail";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Govern",
  description:
    "Simple wallet-first private governance flow for DAO creation, proposals, commit/reveal voting, treasury execution, PDAO context, and Testnet proof.",
  path: "/govern",
  keywords: ["govern", "create dao", "create proposal", "commit reveal", "pdao", "treasury", "testnet governance"],
});

export default function GovernPage() {
  return (
    <OperationsShell
      eyebrow="Govern"
      title="Run private on-chain governance from the browser"
      description="This is the core product path. Connect a Solana Testnet wallet, create or review a DAO, prepare a proposal, commit, reveal, execute treasury intent, inspect PDAO governance-token context, and verify the result without terminal work or developer-only steps."
      navigationMode="focused"
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Testnet", variant: "success" },
        { label: "User-first flow", variant: "violet" },
      ]}
    >
      <GovernWorkbenchClient />
      <GuidedOperationRail current="review" reviewHref="/intelligence" verifyHref="/proof" />
      <div className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.08] p-5">
        <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-100/78">Need test funds?</div>
        <div className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
          Use the official Solana faucet to fund your connected Testnet wallet before creating a DAO, voting, or executing a proposal.
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className={cn(buttonVariants({ size: "sm" }))} href="https://faucet.solana.com/" rel="noreferrer" target="_blank">
            Get Testnet SOL
          </a>
          <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/learn">
            Learn the flow
          </Link>
        </div>
      </div>
    </OperationsShell>
  );
}
