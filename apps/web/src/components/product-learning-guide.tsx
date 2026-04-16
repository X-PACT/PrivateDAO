"use client";

import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Bot,
  Cable,
  Coins,
  Gamepad2,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Wallet,
  Waypoints,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { cn } from "@/lib/utils";

type ProductLearningGuideProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
  runtimeSnapshot: JudgeRuntimeLogsSnapshot;
};

const productCorridors = [
  {
    title: "Private governance",
    problem:
      "Normal DAO voting often exposes intent too early or forces users into interfaces that feel like protocol debugging.",
    solution:
      "PrivateDAO keeps the user flow simple while the product handles commit, reveal, execution proof, and runtime visibility behind the scenes.",
    href: "/govern",
    label: "Try the governance flow",
    icon: ShieldCheck,
  },
  {
    title: "Payments and treasury operations",
    problem:
      "Treasury payouts, grants, and vendor payments usually break down into opaque spreadsheets, manual signer coordination, or ad hoc transfer habits.",
    solution:
      "PrivateDAO turns treasury actions into governed product routes with payout, settlement, and reviewer visibility already connected.",
    href: "/services",
    label: "Open service rails",
    icon: Coins,
  },
  {
    title: "Gaming and live economies",
    problem:
      "Gaming communities need fast approvals, fair reward flows, and operational intelligence without sacrificing transparency or player trust.",
    solution:
      "PrivateDAO treats gaming as a real operating corridor: proposals, rewards, session decisions, and AI-assisted review can live in one workflow.",
    href: "/intelligence",
    label: "Open intelligence layer",
    icon: Gamepad2,
  },
  {
    title: "API and RPC visibility",
    problem:
      "Users and reviewers lose trust when blockchain products hide the data path, rely on one RPC, or make evidence impossible to inspect.",
    solution:
      "PrivateDAO exposes proof, analytics, runtime logs, and read-node context so the same product can be used and audited from the browser.",
    href: "/analytics",
    label: "Inspect analytics",
    icon: Radio,
  },
] as const;

const technologyCards = [
  {
    title: "ZK voting",
    body:
      "Zero-knowledge rails let PrivateDAO preserve vote privacy while still leaving a verifiable trail that reviewers can inspect after the action lands.",
    href: "/proof",
    label: "Open proof center",
    icon: LockKeyhole,
  },
  {
    title: "MagicBlock and REFHE settlement",
    body:
      "Confidential settlement corridors are used to show how private treasury movement can remain productized, inspectable, and fast on Devnet.",
    href: "/security",
    label: "Open security route",
    icon: Zap,
  },
  {
    title: "Wallet-first execution",
    body:
      "Solflare, Phantom, Backpack, and other Solana wallets are part of the actual user flow. The visitor can connect, sign, and verify from the same shell.",
    href: "/start",
    label: "Connect on Devnet",
    icon: Wallet,
  },
  {
    title: "Jupiter treasury routing",
    body:
      "Jupiter is used to shape governed treasury routing, payout funding, and rebalance planning so swaps become part of a reviewable treasury workflow.",
    href: "/services/#jupiter-treasury-route",
    label: "Open Jupiter route",
    icon: Waypoints,
  },
  {
    title: "Kamino capital coordination",
    body:
      "Kamino helps frame how treasury policy can extend into capital deployment and disciplined yield-aware governance rather than static idle balances.",
    href: "/services",
    label: "See treasury corridors",
    icon: Blocks,
  },
  {
    title: "Read node, API, and RPC clarity",
    body:
      "The data corridor keeps proposal state, runtime logs, proof freshness, telemetry, and service signals visible so users do not have to trust a black box.",
    href: "/documents/reviewer-telemetry-packet",
    label: "Open telemetry packet",
    icon: Cable,
  },
  {
    title: "AI-assisted product intelligence",
    body:
      "Proposal review, treasury review, voting compression, RPC interpretation, and gaming assistance live as product tools, not detached demos.",
    href: "/intelligence",
    label: "Open intelligence route",
    icon: Bot,
  },
] as const;

const verificationSteps = [
  {
    title: "Connect a real Devnet wallet",
    detail:
      "Use Solflare, Phantom, or Backpack. The goal is to run the product with a real signer, not browse screenshots only.",
    href: "/start",
  },
  {
    title: "Create or join a DAO flow",
    detail:
      "Open govern, create a DAO, create a proposal, commit a vote, reveal it, and move toward execution through the live browser flow.",
    href: "/govern",
  },
  {
    title: "Check hashes, logs, and runtime evidence",
    detail:
      "Use proof, analytics, and diagnostics to inspect transaction signatures, freshness, runtime state, and captured evidence after each action.",
    href: "/proof",
  },
  {
    title: "Inspect the reviewer packets",
    detail:
      "If you are technical, the document center exposes fast paths for telemetry, trust, custody, and release confidence without leaving the product shell.",
    href: "/documents/reviewer-fast-path",
  },
] as const;

export function ProductLearningGuide({
  executionSnapshot,
  runtimeSnapshot,
}: ProductLearningGuideProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(20,241,149,0.08),rgba(0,194,255,0.08),rgba(153,69,255,0.1))]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <Badge variant="success">Plain-language product guide</Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              PrivateDAO is a privacy-first governance and treasury product built for real use, not for protocol theater.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/66 sm:text-lg">
              The simple version is this: PrivateDAO helps communities, protocols, treasuries, games,
              and operators make decisions privately, execute them visibly, and prove what happened on
              Solana Devnet through hashes, logs, runtime packets, and wallet-signed actions.
            </p>
            <p className="max-w-3xl text-sm leading-7 text-white/58">
              The interface is meant for a non-expert first. The cryptography, settlement paths, RPC
              discipline, and service rails exist to make that simple experience trustworthy.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} href="/start">
                Connect on Devnet
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "secondary" })} href="/story">
                Watch the product story
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/proof">
                Inspect proof and runtime
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/76">What a visitor can verify now</div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/62">
                <div>
                  Governance flow: <span className="text-white">{executionSnapshot.proposalFlow.value}</span>
                </div>
                <div>
                  Wallet coverage: <span className="text-white">{executionSnapshot.walletReadiness.value}</span>
                </div>
                <div>
                  Proof freshness: <span className="text-white">{executionSnapshot.proofFreshness.value}</span>
                </div>
                <div>
                  Runtime freshness: <span className="text-white">{runtimeSnapshot.freshness}</span>
                </div>
              </div>
            </div>
            <div className="rounded-[26px] border border-emerald-300/16 bg-emerald-300/[0.08] p-5 text-sm leading-7 text-white/70">
              The important threshold is not whether a visitor understands every internal primitive on the first click.
              It is whether the visitor can connect a wallet, run the flow, inspect the result, and feel that the system is
              coherent, private, fast, and real.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why this product exists</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {productCorridors.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-white">{item.title}</div>
                </div>
                <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/42">Why teams struggle</div>
                <p className="mt-2 text-sm leading-7 text-white/56">{item.problem}</p>
                <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-emerald-300/76">How PrivateDAO responds</div>
                <p className="mt-2 text-sm leading-7 text-white/64">{item.solution}</p>
                <Link className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-cyan-100" href={item.href}>
                  {item.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How the technology stack becomes a usable product</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {technologyCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[26px] border border-white/8 bg-white/[0.04] p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-fuchsia-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-base font-medium text-white">{item.title}</div>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">{item.body}</p>
                <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-cyan-200/78">{item.label}</div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to verify the product yourself on Devnet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {verificationSteps.map((step, index) => (
              <Link
                key={step.title}
                href={step.href}
                className="group rounded-[26px] border border-white/8 bg-white/[0.04] p-5 transition hover:border-emerald-300/24 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-emerald-200">
                    0{index + 1}
                  </div>
                  <div className="text-base font-medium text-white">{step.title}</div>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/58">{step.detail}</p>
              </Link>
            ))}
          </div>

          <div className="rounded-[26px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5 text-sm leading-7 text-white/68">
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">What you should expect to see</div>
            <ul className="mt-4 space-y-3">
              <li>Wallet-signed Devnet actions instead of static screenshots.</li>
              <li>Proposal and settlement signatures that can be followed into proof and runtime views.</li>
              <li>Telemetry, analytics, and runtime packets that explain what changed after each action.</li>
              <li>Privacy and cryptography described in human language first, with technical depth one click away.</li>
              <li>A product shell that feels close to production, even while the environment stays safely on Devnet.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/analytics" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open analytics
              </Link>
              <Link href="/diagnostics" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                Open diagnostics
              </Link>
              <Link href="/documents/reviewer-telemetry-packet" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Open telemetry packet
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
