import type { Metadata } from "next";
import Link from "next/link";

import { ExecutionSpineSurface } from "@/components/execution-spine-surface";
import { GovernPolicyControlRoom } from "@/components/govern-policy-control-room";
import { GovernWorkbenchClient } from "@/components/govern/govern-workbench-client";
import { GuidedOperationRail } from "@/components/guided-operation-rail";
import { LocalizedGovernIntroSurface } from "@/components/localized-govern-intro-surface";
import { NormalUserOperationPath } from "@/components/normal-user-operation-path";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Govern",
  description:
    "Simple wallet-first governance flow for creating a DAO, creating proposals, voting, and executing on Testnet.",
  path: "/govern",
  keywords: ["govern", "create dao", "create proposal", "vote", "execute", "testnet governance"],
});

export default function GovernPage() {
  return (
    <OperationsShell
      eyebrow="Govern"
      title="Create a DAO, submit a proposal, vote, and execute from one simple flow"
      description="This route is the user-first governance path. Connect a Testnet wallet, run the full DAO lifecycle yourself, and use logs, proof, and diagnostics when you want to inspect how the product keeps vote privacy, cryptographic boundaries, execution fairness, and RPC speed visible in practice."
      navigationMode="guided"
      badges={[
        { label: "Wallet-first", variant: "cyan" },
        { label: "Testnet", variant: "success" },
        { label: "User-first flow", variant: "violet" },
      ]}
    >
      <GuidedOperationRail current="review" reviewHref="/intelligence" verifyHref="/proof" />
      <LocalizedGovernIntroSurface />
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
      <GovernPolicyControlRoom />
      <NormalUserOperationPath />
      <ExecutionSpineSurface context="govern" compact />
      <GovernWorkbenchClient />
    </OperationsShell>
  );
}
