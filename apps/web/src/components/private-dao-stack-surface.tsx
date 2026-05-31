"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Coins,
  Gavel,
  KeyRound,
  Landmark,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApiAction = "settlement" | "jupiter" | "torque";

type StackLayer = {
  id: string;
  icon: typeof Gavel;
  title: string;
  role: string;
  execution: string;
  technologies: string[];
  tryHref: string;
  proofHref: string;
  apiAction?: ApiAction;
};

const stackLayers: StackLayer[] = [
  {
    id: "governance",
    icon: Gavel,
    title: "1. Private Governance",
    role: "Confidential decisions for Solana-native organizations.",
    execution:
      "Create or review DAO state, prepare proposals, commit/reveal private votes, inspect PDAO context, then verify the Testnet action.",
    technologies: ["Solana", "Anchor", "commit-reveal", "ZK proof anchors", "reviewer proofs"],
    tryHref: "/govern",
    proofHref: "/proof",
  },
  {
    id: "treasury",
    icon: Landmark,
    title: "2. Encrypted Treasury Coordination",
    role: "Private budget and execution coordination before funds move.",
    execution:
      "Review treasury risk, preview Jupiter routing, keep encrypted payment metadata bounded, and route approved actions to proof.",
    technologies: ["Jupiter", "stablecoins", "Squads-style authority", "encrypted metadata", "read-node telemetry"],
    tryHref: "/treasury",
    proofHref: "/services/jupiter-treasury-route",
    apiAction: "jupiter",
  },
  {
    id: "payments",
    icon: KeyRound,
    title: "3. Private Payments",
    role: "Confidential payouts from organizations to contributors, operators, and task executors.",
    execution:
      "Generate a private settlement intent, preserve a receipt reference, and route the visitor to the matching proof lane.",
    technologies: ["Cloak", "Umbra", "Ika", "encrypted receipts", "Solana memo/hash anchoring"],
    tryHref: "/services/confidential-payments",
    proofHref: "/services/cloak-private-settlement",
    apiAction: "settlement",
  },
  {
    id: "payroll",
    icon: Coins,
    title: "4. Confidential Payroll",
    role: "Payroll integrity without exposing every contributor detail.",
    execution:
      "Use REFHE payroll proof, encrypted manifests, stablecoin payout context, and proof continuity for auditor-safe payroll review.",
    technologies: ["REFHE", "encrypted metadata", "stablecoin payouts", "proof receipts", "selective disclosure"],
    tryHref: "/services/refhe-payroll-proof",
    proofHref: "/documents/privacy-execution-matrix-2026-05-26",
  },
  {
    id: "intelligence",
    icon: BrainCircuit,
    title: "5. Intelligence Layer",
    role: "Decision support before governance or treasury authorization.",
    execution:
      "Summarize proposals, score risk, inspect wallet and treasury context, and detect abnormal governance or payment posture before signing.",
    technologies: ["QVAC", "GoldRush", "Covalent", "Zerion", "QuickNode", "Supabase receipts"],
    tryHref: "/intelligence",
    proofHref: "/api-status",
  },
  {
    id: "agents",
    icon: Bot,
    title: "6. Agent / MCP Layer",
    role: "Execution lineage for intent -> approval -> execution -> outcome.",
    execution:
      "Forward an approved operational event to the agent/growth rail while keeping the approval and outcome tied to verifiable receipts.",
    technologies: ["Torque MCP", "MagicBlock skills", "custom MCP tools", "execution lineage", "read-node APIs"],
    tryHref: "/services/torque-growth-loop",
    proofHref: "/documents/torque-growth-loop",
    apiAction: "torque",
  },
];

function apiPayload(action: ApiAction) {
  if (action === "settlement") {
    return {
      rail: "cloak",
      operationType: "private-contributor-payment",
      asset: "USDC",
      amount: "1",
      recipient: "11111111111111111111111111111111",
      memo: "PrivateDAO Stack private payment proof",
      auditMode: "selective-disclosure",
      recipientVisibility: "private-by-default",
    };
  }

  if (action === "jupiter") {
    return {
      amount: "20000000",
      slippageBps: 50,
    };
  }

  return {
    eventName: "private_dao_stack_execution_lineage",
    data: {
      intent: "confidential_governance_to_treasury_execution",
      approval: "wallet-first Testnet approval",
      outcome: "proof-linked operational event",
    },
  };
}

function apiPath(action: ApiAction) {
  if (action === "settlement") return "/api/private-settlement/intent";
  if (action === "jupiter") return "/api/jupiter/order";
  return "/api/torque/custom-event";
}

export function PrivateDaoStackSurface({ compact = false }: { compact?: boolean }) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);

  async function runAction(layer: StackLayer) {
    if (!layer.apiAction) return;
    setPending(layer.id);
    setResults((current) => ({ ...current, [layer.id]: "Running..." }));

    try {
      const response = await fetch(apiPath(layer.apiAction), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload(layer.apiAction)),
      });
      const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      const status = response.ok ? "ok" : "needs config";
      const reference =
        (typeof json?.executionReference === "string" && json.executionReference) ||
        (typeof json?.summary === "object" && json?.summary !== null ? "route preview returned" : null) ||
        (typeof json?.error === "string" && json.error) ||
        `HTTP ${response.status}`;
      setResults((current) => ({ ...current, [layer.id]: `${status}: ${reference}` }));
    } catch (error) {
      setResults((current) => ({
        ...current,
        [layer.id]: error instanceof Error ? error.message : "Request failed.",
      }));
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[24px] border border-cyan-300/18 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.17),transparent_34%),linear-gradient(135deg,rgba(8,13,28,0.96),rgba(3,7,18,0.98))] p-4 sm:rounded-[30px] sm:p-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/76 sm:tracking-[0.3em]">PrivateDAO Stack</div>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            Most DAOs expose everything. Votes. Payroll. Treasury activity. Internal operations.
          </h2>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-white/64 [overflow-wrap:anywhere]">
            We think that is broken. PrivateDAO enables organizations to operate privately while remaining cryptographically
            verifiable on Solana. Each layer below has a live route, a proof route, and when available a one-click API exercise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/start" className={cn(buttonVariants({ size: "sm" }))}>
            Start flow
          </Link>
          <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Proof hub
          </Link>
          <a
            href="https://api.privatedao.org/api/v1/privacy-execution-matrix"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Matrix JSON
          </a>
        </div>
      </div>

      <div className={cn("mt-5 grid min-w-0 gap-3", compact ? "lg:grid-cols-[repeat(2,minmax(0,1fr))]" : "lg:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]")}>
        {stackLayers.map((layer) => {
          const Icon = layer.icon;
          const result = results[layer.id];
          const isPending = pending === layer.id;

          return (
            <article key={layer.id} className="min-w-0 rounded-[22px] border border-white/10 bg-black/24 p-4 sm:rounded-[24px]">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.09] p-2.5 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <Badge variant={layer.apiAction ? "success" : "violet"}>
                  {layer.apiAction ? "one-click API" : "route proof"}
                </Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-white [overflow-wrap:anywhere]">{layer.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cyan-50/68 [overflow-wrap:anywhere]">{layer.role}</p>
              <p className="mt-2 text-sm leading-6 text-white/56 [overflow-wrap:anywhere]">{layer.execution}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {layer.technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/58">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={layer.tryHref} className={cn(buttonVariants({ size: "sm" }))}>
                  Try
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link href={layer.proofHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Verify
                  <ReceiptText className="h-3.5 w-3.5" />
                </Link>
                {layer.apiAction ? (
                  <button
                    type="button"
                    onClick={() => runAction(layer)}
                    disabled={isPending}
                    className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                  >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    API test
                  </button>
                ) : null}
              </div>
              {result ? (
                <div className="mt-3 break-words rounded-2xl border border-white/10 bg-white/[0.04] p-3 font-mono text-[11px] leading-5 text-white/58">
                  {result}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
