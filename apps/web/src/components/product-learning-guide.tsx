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
  Sparkles,
  Wallet,
  Waypoints,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import type { ExecutionSurfaceSnapshot } from "@/lib/devnet-service-metrics";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { cn } from "@/lib/utils";

type ProductLearningGuideProps = {
  executionSnapshot: ExecutionSurfaceSnapshot;
  runtimeSnapshot: JudgeRuntimeLogsSnapshot;
};

function buildSolanaTxUrl(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

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
    title: "Identity and operator access",
    problem:
      "Organizations need human-readable identity, signer accountability, and a path that helps normal users act safely without memorizing raw blockchain primitives.",
    solution:
      "PrivateDAO treats identity as part of the product with wallet-first execution, readable context, and guided operator rails that stay understandable before and after the signature.",
    href: "/start",
    label: "Open wallet and identity path",
    icon: Wallet,
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
    title: "Voice-assisted governance",
    body:
      "Voice input now works as a real browser command layer. A user can speak or type one command, fill the DAO or vote workbench instantly, and still keep the wallet as the final signing boundary.",
    href: "/govern",
    label: "Open voice governance",
    icon: Sparkles,
  },
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
      "These technologies shape the confidential settlement direction and explain how private treasury movement can remain usable, inspectable, and fast as the product matures.",
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
      "Jupiter shapes the treasury routing design and next execution path so swaps and payout funding can become part of a reviewable treasury workflow.",
    href: "/services/#jupiter-treasury-route",
    label: "Open Jupiter route",
    icon: Waypoints,
  },
  {
    title: "Kamino capital coordination",
    body:
      "Kamino helps frame the next capital-coordination layer so treasury policy can extend into disciplined deployment instead of static idle balances.",
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
      "Proposal review, treasury review, voting compression, RPC interpretation, and gaming assistance live as product tools, not detached prototypes.",
    href: "/intelligence",
    label: "Open intelligence route",
    icon: Bot,
  },
  {
    title: "SNS identity and readable governance",
    body:
      "Readable identity lowers the barrier for real teams. Identity-aware governance helps contributors, reviewers, and operators understand who is acting without forcing every user to start from raw addresses only.",
    href: "/start",
    label: "Open identity-aware start path",
    icon: Wallet,
  },
  {
    title: "Torque MCP and autonomous operations",
    body:
      "PrivateDAO is being shaped to expose governed operations through MCP-friendly rails so operator tools and AI assistants can inspect delivery state, proof, and execution context without bypassing the product boundary.",
    href: "/services",
    label: "Open service automation rails",
    icon: Cable,
  },
  {
    title: "Agentic treasury execution",
    body:
      "The micropayment rail is the first governed onchain agent lane inside PrivateDAO. It turns approved policy into repeated small settlement actions that stay reviewer-visible after execution.",
    href: "/documents/agentic-treasury-micropayment-rail",
    label: "Open agentic micropayment rail",
    icon: Sparkles,
  },
] as const;

const problemToProductCards = [
  {
    title: "Voting used to be exposed too early",
    problem:
      "When voting intent is visible before the cycle completes, large holders and fast operators can pressure the outcome or front-run the social process.",
    response:
      "PrivateDAO keeps the decision private first, then attaches proof and runtime evidence after the action lands so trust comes from evidence instead of early exposure.",
  },
  {
    title: "Treasury and payroll flows used to be disorderly",
    problem:
      "Vendor payouts, contributor rewards, grants, and payroll often degrade into spreadsheets, loose signer coordination, and weak auditability.",
    response:
      "PrivateDAO turns treasury operations into governed product rails with clear approval, execution, and post-transaction proof attached to the same flow.",
  },
  {
    title: "Gaming and community DAOs used to be easy to distort",
    problem:
      "Gaming reward systems and community treasuries suffer when whales, opaque payouts, or inconsistent execution weaken fairness.",
    response:
      "PrivateDAO ties proposals, rewards, and treasury operations to visible policy, privacy rails, and on-chain evidence so outcomes remain easier to inspect and defend.",
  },
  {
    title: "Normal users used to need developer-grade skills",
    problem:
      "Too many blockchain tools assume the user can read low-level logs, run scripts, or think like a protocol engineer before doing anything safely.",
    response:
      "PrivateDAO is built so a normal visitor can start in the browser, connect a Devnet wallet, follow guided steps, and verify the result without terminal work.",
  },
] as const;

const plainLanguageTechnologyCards = [
  {
    title: "ZK voting",
    summary:
      "Zero-knowledge proofs let the system prove that a vote is valid without exposing the user's choice too early.",
  },
  {
    title: "MagicBlock",
    summary:
      "MagicBlock helps sensitive execution paths stay fast enough to feel usable while keeping runtime discipline visible to the operator and reviewer.",
  },
  {
    title: "REFHE",
    summary:
      "REFHE is part of the confidential settlement story. It helps explain how sensitive treasury logic can remain usable without becoming a black box.",
  },
  {
    title: "Fast RPC",
    summary:
      "RPC is the connection between the product and the blockchain. Fast RPC matters because proposal, vote, and payout state should update quickly and reliably.",
  },
  {
    title: "API services",
    summary:
      "APIs let organizations, games, dashboards, and operators connect PrivateDAO into real systems without rebuilding governance or treasury logic from scratch.",
  },
  {
    title: "SNS identity",
    summary:
      "Readable identity lowers the learning barrier. People trust governance more when names, roles, and signer context are easier to understand than raw addresses alone.",
  },
  {
    title: "Voice governance",
    summary:
      "Voice governance does not remove wallet security. It removes friction by turning plain language into structured product actions before the wallet signs.",
  },
  {
    title: "Torque MCP and agent tools",
    summary:
      "MCP-style rails let operator assistants and automation tools interact with the product through governed interfaces instead of ad hoc scripts or one-off dashboards.",
  },
  {
    title: "Jupiter and Kamino",
    summary:
      "Jupiter shapes treasury routing and swaps. Kamino frames disciplined capital coordination so treasury policy can evolve beyond idle balances or manual movement.",
  },
] as const;

const complexityToProductCards = [
  {
    title: "One browser action replaces a multi-step operator ritual",
    summary:
      "What used to require scripts, raw addresses, manual signer coordination, and explorer tabs is now compressed into guided browser actions that still preserve the same chain-level boundaries.",
  },
  {
    title: "Privacy is preserved before execution, not invented after it",
    summary:
      "The product keeps intent private during the sensitive phase, then reveals proof, logs, and runtime state after the action lands. That protects fairness without sacrificing accountability.",
  },
  {
    title: "Voice commands reduce friction without weakening trust",
    summary:
      "Voice voting and voice treasury commands do not bypass the wallet. They convert plain language into structured actions, then hand final authority back to the signer and the chain.",
  },
  {
    title: "Treasury complexity becomes a normal user workflow",
    summary:
      "PrivateDAO turns grants, payroll, vendor payouts, and micropayment execution into one guided route so a normal user can complete them without terminal work or spreadsheet-driven coordination.",
  },
] as const;

const publicEvidenceCards = [
  {
    title: "What stays private",
    summary:
      "Vote intent, sensitive treasury preparation, and protected execution context stay hidden during the stage where early exposure would distort fairness or leak strategy.",
  },
  {
    title: "What becomes public",
    summary:
      "Transaction hashes, runtime logs, settlement evidence, and execution status become visible on Devnet so anyone can inspect what really happened after the action lands.",
  },
  {
    title: "Why fast RPC matters",
    summary:
      "A fast and reliable RPC layer makes the same user flow feel honest. Proposal state, payout state, and proof freshness should update quickly enough that users trust the product instead of wondering if the chain stalled.",
  },
] as const;

const roadmapMilestones = [
  {
    title: "Browser-first Devnet completion",
    detail:
      "Every core action should be possible from the UI only: connect, propose, vote, reveal, execute, inspect proof, inspect logs, and now drive the flow with voice or typed commands.",
  },
  {
    title: "Production-grade evidence corridor",
    detail:
      "Proof, judge, diagnostics, and reviewer packets should stay synchronized so a user and a judge both see the same truth from different depths.",
  },
  {
    title: "RPC and API service maturity",
    detail:
      "PrivateDAO should look like infrastructure as well as a governance product, with hosted-read, export, low-latency service posture, and identity-aware API rails visible to institutions.",
  },
  {
    title: "Production release under Solana",
    detail:
      "The path to production release stays explicit: stronger monitoring, custody discipline, audit closure, and community review before mainnet-grade launch.",
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
    title: "Use the voice-assisted command lane if you want the fastest start",
    detail:
      "Open govern and speak or type one command at a time. The workbench converts normal language into DAO, proposal, vote, and treasury inputs without asking the visitor to think like a terminal user.",
    href: "/govern",
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
    title: "Inspect the verification packets",
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
              PrivateDAO helps groups make private decisions and controlled treasury actions on Solana without forcing normal users to behave like protocol engineers.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/66 sm:text-lg">
              The simple version is this: communities, games, treasuries, and organizations can use one browser product
              to create proposals, vote privately, execute treasury actions, and verify what happened on Solana Devnet
              through hashes, logs, and wallet-signed actions.
            </p>
            <p className="max-w-3xl text-sm leading-7 text-white/58">
              The interface is meant for a non-expert first. The cryptography, settlement design, RPC layer, and
              service rails exist to make that simple experience trustworthy. The goal is simple: a visitor should not
              need scripts, terminal commands, or protocol-engineer habits in order to use governed privacy and treasury
              flows safely.
            </p>
            <div className="flex flex-wrap gap-3">
              <WalletConnectButton size="lg" variant="default" connectLabel="Connect on Devnet" />
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
          <CardTitle>What the user can see on-chain, and what remains protected</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {publicEvidenceCards.map((item) => (
            <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
              <div className="text-base font-medium text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/58">{item.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What was broken before, and what this product changes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {problemToProductCards.map((item) => (
            <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
              <div className="text-base font-medium text-white">{item.title}</div>
              <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/42">Old failure mode</div>
              <p className="mt-2 text-sm leading-7 text-white/56">{item.problem}</p>
              <div className="mt-4 text-[11px] uppercase tracking-[0.24em] text-emerald-300/76">PrivateDAO response</div>
              <p className="mt-2 text-sm leading-7 text-white/64">{item.response}</p>
            </div>
          ))}
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
          <CardTitle>How complex blockchain behavior becomes simple product behavior</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {complexityToProductCards.map((item) => (
            <div key={item.title} className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(6,10,19,0.98))] p-5">
              <div className="text-base font-medium text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What the core technologies mean in normal language</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plainLanguageTechnologyCards.map((item) => (
            <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
              <div className="text-base font-medium text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/58">{item.summary}</p>
            </div>
          ))}
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
              <li>Public Devnet hashes and logs that show the action really landed without asking the visitor to decode raw blockchain internals alone.</li>
              <li>Telemetry, analytics, and runtime packets that explain what changed after each action.</li>
              <li>Privacy and cryptography described in human language first, with technical depth one click away.</li>
              <li>Fast RPC behavior that makes proposal state, proof freshness, and treasury state update quickly enough to feel trustworthy.</li>
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
              <a
                href="https://discord.gg/PbM8BC2A"
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Need help? Join Discord
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {runtimeSnapshot.agenticMicropayments.available ? (
        <Card className="border-amber-300/16 bg-amber-300/[0.06]">
          <CardHeader>
            <CardTitle>Agentic Treasury Micropayment Rail</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-sm leading-7 text-white/64">
                This rail is the clearest example of what PrivateDAO is becoming: a product where a governed decision
                can drive many small on-chain treasury actions from one coherent operational flow. Instead of a one-off
                payout lane, the product shows how approved policy can coordinate repeated micropayments, keep them
                reviewable, and attach proof and runtime evidence after the fact.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Transfer count</div>
                  <div className="mt-2 text-white">
                    {runtimeSnapshot.agenticMicropayments.successfulTransferCount}/
                    {runtimeSnapshot.agenticMicropayments.transferCount}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Settlement asset</div>
                  <div className="mt-2 text-white">
                    {runtimeSnapshot.agenticMicropayments.settlementAssetSymbol} ·{" "}
                    {runtimeSnapshot.agenticMicropayments.assetMode}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 sm:col-span-2">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Execution wallet</div>
                  <div className="mt-2 break-all text-white">{runtimeSnapshot.agenticMicropayments.executionWallet}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/judge" className={cn(buttonVariants({ size: "sm" }))}>
                  Open verification route
                </Link>
                <Link href="/documents/agentic-treasury-micropayment-rail" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
                  Open rail brief
                </Link>
                <Link href="/viewer/agentic-treasury-micropayment-rail.generated" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Open generated proof
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {runtimeSnapshot.agenticMicropayments.entries.slice(0, 4).map((entry) => (
                <a
                  key={`${entry.label}:${entry.signature}`}
                  href={buildSolanaTxUrl(entry.signature)}
                  rel="noreferrer"
                  target="_blank"
                  className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5 transition hover:border-amber-300/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-medium text-white">{entry.label}</div>
                    <div className="text-xs text-amber-200/80">{entry.status}</div>
                  </div>
                  <div className="mt-3 break-all text-xs leading-6 text-white/55">{entry.signature}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-200/78">
                    Open on Solana Devnet
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Public-good roadmap toward production release</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {roadmapMilestones.map((item, index) => (
            <div key={item.title} className="rounded-[26px] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-semibold text-cyan-100">
                  0{index + 1}
                </div>
                <div className="text-base font-medium text-white">{item.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/58">{item.detail}</p>
            </div>
          ))}
          <div className="rounded-[26px] border border-emerald-300/18 bg-emerald-300/8 p-5 text-sm leading-7 text-white/70 md:col-span-2">
            PrivateDAO is open source, built in public, and intended to serve the Solana ecosystem as governance and
            treasury infrastructure. Community testing, technical review, design criticism, and operator feedback are
            part of the product path, not an inconvenience around it.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
