"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PolicyPack = {
  key: string;
  title: string;
  summary: string;
  operationType: "payroll" | "vendor" | "treasury-rebalance" | "market-execution" | "rewards";
  assetScope: "PUSD" | "AUDD" | "USDC_USDT" | "SOL";
  executionRail: "cloak" | "umbra" | "jupiter_dflow" | "magicblock" | "hybrid";
  requiresPrivateSettlement: boolean;
  requiresIntelligenceGate: boolean;
  proofScope: "standard" | "enhanced";
  auditScope: "admin" | "auditor" | "scoped_regulatory";
  incentiveScope: "none" | "voter_rewards" | "operator_retention";
};

const policyPacks: PolicyPack[] = [
  {
    key: "payroll-pack",
    title: "Payroll Pack",
    summary: "Confidential contributor payroll with policy-bound execution and selective audit access.",
    operationType: "payroll",
    assetScope: "PUSD",
    executionRail: "cloak",
    requiresPrivateSettlement: true,
    requiresIntelligenceGate: true,
    proofScope: "enhanced",
    auditScope: "auditor",
    incentiveScope: "operator_retention",
  },
  {
    key: "vendor-pack",
    title: "Vendor Pack",
    summary: "Invoice-linked vendor settlement with privacy-preserving payout and verifiable receipt continuity.",
    operationType: "vendor",
    assetScope: "AUDD",
    executionRail: "umbra",
    requiresPrivateSettlement: true,
    requiresIntelligenceGate: true,
    proofScope: "enhanced",
    auditScope: "scoped_regulatory",
    incentiveScope: "none",
  },
  {
    key: "treasury-rebalance-pack",
    title: "Treasury Rebalance Pack",
    summary: "Treasury posture shift with route-quality review and strict execution-policy boundaries.",
    operationType: "treasury-rebalance",
    assetScope: "USDC_USDT",
    executionRail: "jupiter_dflow",
    requiresPrivateSettlement: false,
    requiresIntelligenceGate: true,
    proofScope: "enhanced",
    auditScope: "admin",
    incentiveScope: "none",
  },
  {
    key: "market-execution-pack",
    title: "Market Execution Pack",
    summary: "Policy-constrained market operation flow with explicit execution and proof scopes.",
    operationType: "market-execution",
    assetScope: "USDC_USDT",
    executionRail: "jupiter_dflow",
    requiresPrivateSettlement: false,
    requiresIntelligenceGate: true,
    proofScope: "standard",
    auditScope: "admin",
    incentiveScope: "none",
  },
  {
    key: "rewards-pack",
    title: "Rewards Pack",
    summary: "Governed contributor and gaming rewards with retention-aware follow-up.",
    operationType: "rewards",
    assetScope: "SOL",
    executionRail: "magicblock",
    requiresPrivateSettlement: true,
    requiresIntelligenceGate: true,
    proofScope: "standard",
    auditScope: "admin",
    incentiveScope: "voter_rewards",
  },
];

export function GovernPolicyControlRoom() {
  const [selectedPackKey, setSelectedPackKey] = useState(policyPacks[0]?.key ?? "payroll-pack");
  const selectedPack = useMemo(
    () => policyPacks.find((pack) => pack.key === selectedPackKey) ?? policyPacks[0]!,
    [selectedPackKey],
  );
  const machineReadablePolicy = useMemo(
    () =>
      JSON.stringify(
        {
          pack: selectedPack.key,
          operationType: selectedPack.operationType,
          spendingScope: "proposal-bound",
          assetScope: selectedPack.assetScope,
          executionRail: selectedPack.executionRail,
          proofScope: selectedPack.proofScope,
          auditScope: selectedPack.auditScope,
          incentiveScope: selectedPack.incentiveScope,
          requiresPrivateSettlement: selectedPack.requiresPrivateSettlement,
          requiresIntelligenceGate: selectedPack.requiresIntelligenceGate,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    [selectedPack],
  );

  return (
    <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Policy Control Room</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Proposal packs produce machine-readable operating policy</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
        Select a pack, inspect the policy contract, then run create proposal from the same govern shell. This keeps
        approval logic, execution rail, audit scope, and proof requirement aligned before any signing step.
      </p>

      <div className="mt-5 grid gap-3 xl:grid-cols-5">
        {policyPacks.map((pack) => (
          <button
            key={pack.key}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition",
              selectedPack.key === pack.key
                ? "border-cyan-300/28 bg-cyan-300/[0.14] text-white"
                : "border-white/10 bg-black/20 text-white/74 hover:border-cyan-300/18",
            )}
            onClick={() => setSelectedPackKey(pack.key)}
            type="button"
          >
            <div className="text-sm font-medium">{pack.title}</div>
            <div className="mt-2 text-xs leading-6 text-white/62">{pack.summary}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Machine-readable policy</div>
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-4 text-xs leading-6 text-cyan-100/86">
            {machineReadablePolicy}
          </pre>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">Apply pack now</div>
          <div className="mt-3 space-y-3 text-sm leading-7 text-white/64">
            <div>1. Keep `DAO` and `proposal` in the same signer lane.</div>
            <div>2. Route through `Intelligence` before execution if required.</div>
            <div>3. Execute from `Execute` with selected asset and rail.</div>
            <div>4. Validate receipts from `Proof` and `Judge` mode.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className={cn(buttonVariants({ size: "sm" }))} href={`/govern?pack=${encodeURIComponent(selectedPack.key)}#proposal-review-action`}>
              Open proposal form
            </Link>
            <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/intelligence">
              Open intelligence gate
            </Link>
            <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={`/execute?pack=${encodeURIComponent(selectedPack.key)}`}>
              Open execute center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
