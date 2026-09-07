import Link from "next/link";
import { ArrowRight, BadgeCheck, RadioTower, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRIVATE_DAO_GOVERNANCE_MINT,
  PRIVATE_DAO_PROGRAM_ID,
} from "@/lib/onchain-parity.generated";
import { getRpcFastInfrastructureSnapshot } from "@/lib/rpcfast-infrastructure";
import { buildSolanaAccountUrl } from "@/lib/solana-network";

type ExecutionSpineSurfaceProps = {
  compact?: boolean;
  context?: "start" | "govern" | "services" | "network" | "execute";
};

const contextCopy: Record<NonNullable<ExecutionSpineSurfaceProps["context"]>, {
  eyebrow: string;
  title: string;
  description: string;
}> = {
  start: {
    eyebrow: "Execution spine",
    title: "The simple path is backed by the full Testnet stack",
    description:
      "A normal user starts with a wallet button, then moves through review, signer approval, explorer-visible hashes, and reviewer proof without leaving the product shell.",
  },
  govern: {
    eyebrow: "Governance runtime",
    title: "Every governance action stays attached to the chain evidence",
    description:
      "Create DAO, proposal, commit, reveal, finalize, and execute all sit on the same Testnet execution spine so the UI, review gate, signer, program, and proof packet remain aligned.",
  },
  services: {
    eyebrow: "Commercial execution spine",
    title: "Product services resolve into wallet-signed Testnet operations",
    description:
      "Billing rehearsal, treasury intake, encrypted operations, and hosted read services share one operational spine instead of becoming disconnected product cards.",
  },
  execute: {
    eyebrow: "Execution center spine",
    title: "Every execution mode still lands on one on-chain operational spine",
    description:
      "Payroll, vendor settlement, treasury rebalances, and reward corridors use one signer flow: connect, review, sign, verify, and keep proof continuity visible for operators and reviewers.",
  },
  network: {
    eyebrow: "Network spine",
    title: "Infrastructure is visible because it supports real product execution",
    description:
      "RPC, streaming, diagnostics, and proof surfaces are ordered around the user action path: review, sign, observe, verify, and escalate toward release readiness.",
  },
};

function shorten(value: string) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function ExecutionSpineSurface({ compact = false, context = "start" }: ExecutionSpineSurfaceProps) {
  const copy = contextCopy[context];
  const rpcFast = getRpcFastInfrastructureSnapshot();
  const testnetRpc = rpcFast.endpoints.find((endpoint) => endpoint.label === "Testnet RPC");

  const steps = [
    {
      title: "Connect wallet",
      detail: "Solflare, Phantom, Glow, Backpack, and Wallet Standard-compatible wallets enter through the same provider.",
      icon: WalletCards,
      href: "/wallet-template",
      cta: "Open wallet sandbox",
    },
    {
      title: "Review the route",
      detail: "Use Intelligence, network health, and policy context to understand risk, privacy posture, and execution quality before any wallet approval appears.",
      icon: RadioTower,
      href: "/intelligence",
      cta: "Open review route",
    },
    {
      title: "Sign the action",
      detail: `The signer still lands on program ${shorten(PRIVATE_DAO_PROGRAM_ID)} and governance mint ${shorten(PRIVATE_DAO_GOVERNANCE_MINT)} while the product keeps the approval flow readable.`,
      icon: BadgeCheck,
      href: buildSolanaAccountUrl(PRIVATE_DAO_PROGRAM_ID),
      cta: "Inspect program",
    },
    {
      title: "Verify proof",
      detail: "Explorer hashes, runtime logs, custody status, and reviewer packets remain one click away after each action.",
      icon: ShieldCheck,
      href: "/proof/?judge=1",
      cta: "Open proof",
    },
  ];

  return (
    <Card className="overflow-hidden border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(20,241,149,0.16),transparent_34%),linear-gradient(180deg,rgba(8,16,30,0.96),rgba(5,8,18,0.98))]">
      <CardHeader className={compact ? "p-5" : "p-6 md:p-8"}>
        <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80">{copy.eyebrow}</div>
        <CardTitle className={compact ? "text-2xl" : "max-w-4xl text-3xl md:text-4xl"}>
          {copy.title}
        </CardTitle>
        <p className="max-w-4xl text-sm leading-7 text-white/62">{copy.description}</p>
      </CardHeader>
      <CardContent className={compact ? "px-5 pb-5" : "px-6 pb-6 md:px-8 md:pb-8"}>
        <div className="grid gap-3 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isExternal = step.href.startsWith("https://");

            return (
              <Link
                key={step.title}
                href={step.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="group rounded-3xl border border-white/8 bg-black/24 p-4 transition hover:border-cyan-300/28 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/44">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-4 text-base font-medium text-white">{step.title}</div>
                <p className="mt-2 min-h-20 text-sm leading-6 text-white/56">{step.detail}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 rounded-3xl border border-orange-300/14 bg-orange-300/[0.07] p-4 text-sm leading-7 text-white/64">
          RPCFast lane: {testnetRpc?.configured ? "configured in this environment" : "ready for host-secret configuration"}.
          Browser keys are never exposed; streaming endpoints remain backend-only and surface as health, logs, and reviewer telemetry.
        </div>
      </CardContent>
    </Card>
  );
}
