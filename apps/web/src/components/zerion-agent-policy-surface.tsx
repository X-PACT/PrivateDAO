"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const policyTemplates = [
  {
    id: "stablecoin-payroll-agent",
    title: "Stablecoin payroll agent",
    action: "Prepare PUSD or USDC payroll settlement after DAO approval.",
    spendLimit: "25 PUSD per execution",
    expiry: "48h",
    allowed: ["Solana only", "SPL stablecoin transfer", "memo-coded payroll proof"],
    blocked: ["unbounded swaps", "unknown recipients", "execution without governance approval"],
  },
  {
    id: "treasury-rebalance-agent",
    title: "Treasury rebalance agent",
    action: "Prepare a governed rebalance instruction when treasury policy requests it.",
    spendLimit: "5% of route allocation",
    expiry: "24h",
    allowed: ["Solana only", "quote-aware rebalance", "operator review before signing"],
    blocked: ["cross-chain bridge without policy", "slippage above policy", "recurring execution without renewal"],
  },
  {
    id: "gaming-reward-agent",
    title: "Gaming reward agent",
    action: "Prepare reward distribution after tournament or guild proposal finalization.",
    spendLimit: "100 PUSD reward pool",
    expiry: "72h",
    allowed: ["reward pool transfer", "ranked recipient list", "memo-coded reward proof"],
    blocked: ["anonymous recipient expansion", "post-expiry payout", "wallet-draining batch"],
  },
];

function buildPolicyPayload(template: (typeof policyTemplates)[number]) {
  return {
    project: "PrivateDAO",
    integration: "zerion-cli-agent-policy",
    agentId: template.id,
    chainLock: "solana",
    executionMode: "approve-before-execute",
    action: template.action,
    spendLimit: template.spendLimit,
    expiryWindow: template.expiry,
    requiredProof: ["dao-proposal", "wallet-signature", "memo-label", "explorer-signature"],
    allowedActions: template.allowed,
    blockedActions: template.blocked,
    productRoutes: {
      govern: "https://privatedao.org/govern/",
      billing: "https://privatedao.org/services/testnet-billing-rehearsal/",
      judge: "https://privatedao.org/judge/",
      proof: "https://privatedao.org/proof/?judge=1",
    },
  };
}

export function ZerionAgentPolicySurface() {
  const [activeId, setActiveId] = useState(policyTemplates[0].id);
  const activePolicy = policyTemplates.find((policy) => policy.id === activeId) ?? policyTemplates[0];
  const payload = useMemo(() => buildPolicyPayload(activePolicy), [activePolicy]);
  const payloadText = JSON.stringify(payload, null, 2);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#06111f]/88 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.34em] text-cyan-200/78">Zerion CLI track surface</div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Policy-bound autonomous execution, with no god-mode agent
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
            PrivateDAO treats the agent as an execution assistant, not an unchecked trader. The policy object locks the
            agent to Solana, caps spend, expires authority, blocks unsafe actions, and requires a DAO-approved route
            before any wallet execution layer is allowed to move value.
          </p>
        </div>
        <Badge variant="cyan">Scoped policies</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {policyTemplates.map((policy) => (
          <button
            key={policy.id}
            type="button"
            onClick={() => setActiveId(policy.id)}
            className={cn(
              "rounded-3xl border p-5 text-left transition",
              activeId === policy.id
                ? "border-cyan-300/45 bg-cyan-300/[0.10]"
                : "border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]",
            )}
          >
            <div className="text-base font-semibold text-white">{policy.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{policy.action}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/54">
              <span className="rounded-full border border-white/10 px-3 py-1">{policy.spendLimit}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">{policy.expiry}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-emerald-300/14 bg-emerald-300/[0.06] p-5">
          <div className="text-sm font-semibold text-emerald-100">Execution guardrails</div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/44">Allowed</div>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-white/64">
                {activePolicy.allowed.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/44">Blocked</div>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-white/64">
                {activePolicy.blocked.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/govern" className={cn(buttonVariants({ size: "sm" }))}>
              Open govern
            </Link>
            <Link href="/services/testnet-billing-rehearsal" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
              Run billing route
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Policy payload for Zerion CLI fork</div>
              <div className="mt-1 text-xs text-white/46">Use this as the agent policy object before wallet execution.</div>
            </div>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(payloadText)}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Copy JSON
            </button>
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/8 bg-black/40 p-4 text-xs leading-6 text-cyan-100/82">
            {payloadText}
          </pre>
        </div>
      </div>
    </section>
  );
}

