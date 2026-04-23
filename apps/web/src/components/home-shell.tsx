"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, LifeBuoy, MessageSquareHeart, PlayCircle, Shield, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HomeShell() {
  const storyCards = [
    {
      title: "Private Treasury & Payroll",
      description: "Run governed private payouts and stablecoin settlement lanes from one wallet-first operation flow.",
      href: "/execute#private-payroll",
      icon: Compass,
    },
    {
      title: "Market Ops DAO",
      description: "Review risk context, run treasury rebalance routes, and keep execution and verification connected.",
      href: "/execute#treasury-rebalance",
      icon: Shield,
    },
    {
      title: "Gaming & Agentic Rewards",
      description: "Attach contributor and gaming rewards to governed actions, then validate outcomes through proof lanes.",
      href: "/execute#rewards-gaming",
      icon: PlayCircle,
    },
  ];
  const fastActionSteps = [
    {
      title: "1. Connect and orient",
      description: "Start from Learn or Start, connect a Testnet wallet, and confirm the right account before any approval flow begins.",
      href: "/learn",
      cta: "Open learn",
    },
    {
      title: "2. Review the decision",
      description: "Use Intelligence to read policy, privacy mode, route quality, and execution risk before the signer sees a wallet prompt.",
      href: "/intelligence",
      cta: "Open intelligence",
    },
    {
      title: "3. Sign and execute",
      description: "Use Govern and Execute to create the proposal, commit or reveal when needed, then approve the exact wallet action on Testnet.",
      href: "/execute",
      cta: "Open execute",
    },
    {
      title: "4. Verify the receipt",
      description: "Open Proof and Judge to inspect the signature, receipt, runtime logs, and the current blockchain continuity from the same product shell.",
      href: "/proof",
      cta: "Open proof",
    },
  ];
  const techBadges = [
    {
      label: "FHE / REFHE",
      badgeClass: "border-emerald-300/25 bg-emerald-300/[0.14] text-emerald-100",
      detail: "Confidential treasury and settlement posture.",
    },
    {
      label: "ZK",
      badgeClass: "border-violet-300/25 bg-violet-300/[0.14] text-violet-100",
      detail: "Verifiable privacy without exposing raw decision data.",
    },
    {
      label: "MagicBlock",
      badgeClass: "border-cyan-300/25 bg-cyan-300/[0.14] text-cyan-100",
      detail: "Responsive execution corridor for wallet-first actions.",
    },
    {
      label: "Fast RPC",
      badgeClass: "border-amber-300/25 bg-amber-300/[0.14] text-amber-100",
      detail: "Reliable live reads, signatures, and action logs.",
    },
  ];
  const technologyServiceMap = [
    {
      technology: "FHE / REFHE",
      service: "Confidential payout and treasury motion rehearsal",
      outcome: "Used when the product needs to prepare private treasury movement without flattening the whole flow into plain-text operating steps.",
    },
    {
      technology: "ZK",
      service: "Verifiable governance and privacy review",
      outcome: "Used when judges, partners, or operators need proof-linked trust without turning the normal user route into a cryptography lecture.",
    },
    {
      technology: "MagicBlock",
      service: "Responsive action corridor for governance and gaming",
      outcome: "Used where wallet-first actions need a faster execution lane so DAO and game-linked decisions do not feel stuck behind slow runtime behavior.",
    },
    {
      technology: "Fast RPC",
      service: "Live state, logs, and signature confirmation",
      outcome: "Used to keep Testnet reads, proposal status, and action feedback visible after a wallet action instead of leaving the user guessing.",
    },
  ];
  const whatChangedCards = [
    {
      title: "Program architecture is now split for review",
      detail: "The Solana program has been broken into domain modules for DAO, voting, treasury, privacy, errors, traits, and utilities so protocol review can happen against smaller surfaces.",
    },
    {
      title: "Wallet-first Testnet proof is now real",
      detail: "DAO bootstrap, proposal creation, and commit vote have live browser-wallet evidence, and the product flow is being extended through reveal, finalize, and execution closure.",
    },
    {
      title: "Infrastructure and funding surfaces now align",
      detail: "Telemetry, payout evidence, blocker registers, and grant packets now describe the same product reality instead of drifting into separate narratives.",
    },
  ];
  const faqItems = [
    {
      question: "What is already live today?",
      answer:
        "It is already a live Solana Testnet product with wallet-first governance, proof, trust, telemetry, and service rails. The current phase is final security hardening, broader device coverage, and release certification ahead of mainnet publication.",
    },
    {
      question: "What does the cryptography actually do here?",
      answer:
        "ZK, REFHE, MagicBlock, and Fast RPC each map to a concrete product lane: privacy review, confidential payout posture, responsive execution, and reliable live reads. They are presented as service rails, not badge-only theory.",
    },
    {
      question: "What kind of support helps most right now?",
      answer:
        "Runtime testing, wallet feedback, security review, infrastructure support, and aligned funding all help accelerate the path from strong Testnet operation into a hardened production release.",
    },
  ];
  const convictionStrip = [
    "We build privacy, operational clarity, and trust into one production-oriented product path.",
    "We keep the work verifiable, ship tranche by tranche, and raise the quality bar every cycle.",
    "With real community support, PrivateDAO can mature into infrastructure that helps protect the ecosystem.",
  ];
  return (
    <main className="pb-20 sm:pb-24">
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-18">
        <div className="grid items-start gap-8 xl:grid-cols-[1.14fr_0.86fr] xl:gap-10">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge variant="cyan">Governed</Badge>
              <Badge variant="violet">Risk-scored</Badge>
              <Badge variant="success">Private by default</Badge>
            </div>
            <div className="space-y-4 sm:space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">PrivateDAO OS</div>
              <div className="max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem] xl:text-[4.35rem]">
                Confidential treasury and market operations on Solana.
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-lg sm:leading-8">
                PrivateDAO turns treasury and governance intent into one premium operating path: frame the workflow, govern the policy, review intelligence, execute from a connected wallet, then verify receipts and runtime evidence without leaving the product shell.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-white/50">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Connect</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Review</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Sign</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Verify</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={cn(buttonVariants({ size: "lg" }))} href="/execute">
                Launch OS
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/android">
                Android App
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/proof">
                Review Proof
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/judge">
                Open Judge
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }))} href="/learn">
                View Workflow
              </Link>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">Powered by the live stack</div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {techBadges.map((item) => (
                <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <Badge className={cn("border text-[10px] uppercase tracking-[0.22em]", item.badgeClass)}>
                    {item.label}
                  </Badge>
                  <div className="mt-2 text-sm leading-6 text-white/62">{item.detail}</div>
                </div>
              ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {storyCards.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} href={item.href} className="group">
                    <div className="h-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,15,29,0.94),rgba(6,9,20,0.98))] p-5 transition hover:border-cyan-300/22 hover:bg-[linear-gradient(180deg,rgba(15,22,40,0.95),rgba(8,11,24,0.99))]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-base font-medium text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(13,18,34,0.94),rgba(7,10,22,0.98))] xl:mt-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Operator launch path</div>
                  <CardTitle className="mt-2">The fastest path from landing page to a credible on-chain operating flow</CardTitle>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Use case</div>
                <div className="mt-2 text-2xl font-semibold text-white">Solana Testnet</div>
                <div className="mt-2 text-sm leading-7 text-white/56">
                  Use it when a team, treasury council, or on-chain community needs to create a DAO, approve an action, keep the sensitive path controlled, and execute from one surface.
                </div>
              </div>

              <div className="grid gap-3">
                {fastActionSteps.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-medium text-white">{item.title}</div>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/58">{item.description}</p>
                    <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4 w-full justify-between")} href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(61,46,9,0.92),rgba(26,20,5,0.98))] p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Trophy className="h-4 w-4" />
                  <div className="text-[11px] uppercase tracking-[0.28em]">Recognition</div>
                </div>
                <div className="mt-2 text-lg font-semibold text-amber-50">1st Place · Superteam Poland</div>
                <div className="mt-2 text-sm leading-7 text-amber-50/70">
                  Strong proof remains available for judges and investors, but the homepage stays focused on what a connected visitor can actually do first with a real Testnet wallet.
                </div>
                <div className="mt-2 text-xs leading-6 text-amber-100/60">
                  FastRPC is supporting PrivateDAO throughout the hackathon with RPC infrastructure, and we appreciate that support.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[24px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(9,20,36,0.95),rgba(7,12,22,0.98))] p-5 text-sm leading-7 text-white/70">
          PrivateDAO is aligned across web and Android: normal users can run advanced DAO operations from mobile with wallet-first steps, privacy-preserving governance, encrypted operation lanes, and verifiable on-chain receipts.
        </div>
        <div className="mb-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/68">
          The shortest path from landing page to a real Testnet action now stays inside one product shell: connect a wallet, review the policy and risk context, sign the exact action, then verify the resulting receipt and runtime proof.
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
            Wallet-first operations keep signer control clear from governance to settlement.
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
            Private execution keeps sensitive treasury context hidden while preserving verifiable proof lanes.
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-white/62">
            Proof and runtime surfaces remain open for judges, operators, and partners after every action.
          </div>
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="rounded-[28px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(8,22,20,0.96),rgba(8,12,18,0.99))] p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/78">Public good</div>
            <div className="mt-3 text-xl font-semibold text-white">Built to help the ecosystem coordinate more safely</div>
            <p className="mt-3 text-sm leading-7 text-white/62">
              PrivateDAO is being built as reusable governance and treasury infrastructure for Solana. The value is not only one product instance. The value is a cleaner pattern for privacy, proof, treasury discipline, and operator trust that other teams can inspect and build on.
            </p>
          </div>
          <div className="rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(8,18,28,0.96),rgba(8,11,20,0.99))] p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/78">Clear use cases</div>
            <div className="mt-3 text-xl font-semibold text-white">Grant committees, DAOs, councils, and confidential payout operations</div>
            <p className="mt-3 text-sm leading-7 text-white/62">
              The strongest current use cases are easy to explain: private treasury approvals, grant and allocation committees, protocol operating councils, and payout workflows where privacy and execution discipline must stay together.
            </p>
          </div>
          <div className="rounded-[28px] border border-violet-300/14 bg-[linear-gradient(180deg,rgba(20,14,36,0.96),rgba(10,10,20,0.99))] p-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-violet-200/78">Clear milestones</div>
            <div className="mt-3 text-xl font-semibold text-white">From live Testnet product to stronger production release confidence</div>
            <p className="mt-3 text-sm leading-7 text-white/62">
              The roadmap is straightforward: simplify first-use verification, strengthen proof and telemetry continuity, complete final security hardening, and then publish the strongest possible production release candidate.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(10,19,34,0.96),rgba(6,10,22,0.98))] p-6 sm:p-7">
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/74">Execution conviction</div>
          <div className="mt-3 max-w-4xl text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
            We are building PrivateDAO as production-intent governance infrastructure: private by design, verifiable in operation, and easier to trust with every serious execution tranche.
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/62 sm:text-base">
            The ambition is straightforward: earn trust through real product quality, visible proof, and operational discipline, then turn ecosystem support into the technical and financial momentum that carries PrivateDAO from strong Testnet execution into durable mainnet infrastructure.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {convictionStrip.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/62">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-cyan-200/78">Why it works</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Four systems make the product usable, private, and fast</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            PrivateDAO is not just a UI shell. It combines privacy, responsive execution, and reliable reads so a real Testnet governance action can move from wallet click to visible result without forcing the user to learn the architecture first.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">REFHE</div>
            <div className="mt-3 text-lg font-semibold text-white">Confidential settlement posture</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              REFHE supports the encrypted payout and settlement path so sensitive treasury actions do not depend on plain-text operating flow alone.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-violet-200/80">ZK</div>
            <div className="mt-3 text-lg font-semibold text-white">Verifiable privacy proof</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Zero-knowledge proof surfaces give judges, partners, and operators a verifiable trust layer without turning the main product route into a proof maze.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">MagicBlock</div>
            <div className="mt-3 text-lg font-semibold text-white">Responsive execution corridor</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              MagicBlock gives the product a faster action corridor for treasury and governance execution where slow, clumsy wallet UX would otherwise kill momentum.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/80">Fast RPC</div>
            <div className="mt-3 text-lg font-semibold text-white">Reliable live state and logs</div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Fast RPC and hosted reads keep live state, signatures, proposal progress, and execution logs visible so users can tell what really happened after a wallet action.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-emerald-300/80">How the stack maps to services</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">These technologies are tied to real product lanes, not a theory slide</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            PrivateDAO uses each rail for a specific user-facing job. The public story should make that obvious: governance runs the DAO, gaming uses the same responsive decision corridor, confidential payout depends on privacy rails, and Fast RPC keeps the result visible.
          </p>
        </div>
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {technologyServiceMap.map((item) => (
            <div key={item.technology} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={item.technology === "ZK" ? "violet" : item.technology === "Fast RPC" ? "warning" : item.technology === "MagicBlock" ? "cyan" : "success"}>
                  {item.technology}
                </Badge>
                <div className="text-base font-medium text-white">{item.service}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.outcome}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-violet-200/80">Execution strategy</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Recent development raised the product, the protocol, and the review posture together</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            The current work is focused on turning PrivateDAO into infrastructure that can be reviewed, tested, funded, and then deployed with confidence. The strategy is to keep shipping real product proof while steadily converting each operational and protocol target into something stronger, clearer, and easier to trust.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {whatChangedCards.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-lg font-semibold text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(12,18,34,0.94),rgba(7,10,22,0.99))]">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3 text-emerald-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/80">Support the mission</div>
              </div>
              <CardTitle className="text-2xl">We invite the community to help turn PrivateDAO into ecosystem infrastructure through real support, review, and execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/62">
                PrivateDAO is being built as governance and treasury infrastructure that can serve the Solana ecosystem broadly. We are working continuously to make it more capable, safer, and more valuable, and that mission moves faster with practical support: testing, technical review, integrations, operator discipline, and serious ecosystem distribution.
              </p>
              <p className="text-sm leading-7 text-white/62">
                What support accelerates most is not vague enthusiasm. It is the kind of help that turns a strong Testnet product into stronger ecosystem infrastructure: wallet testing, security review, operational introductions, integrations, and funding that maps directly to visible milestones.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">Runtime testing, browser-wallet checks, and real-device validation on Testnet</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">Security review, protocol scrutiny, and custody-hardening support</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">Infrastructure guidance for API, RPC, telemetry, monitoring, and recovery</div>
                <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">Introductions, amplification, and ecosystem trust that help this become shared infrastructure</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ size: "lg" }))} href="/community">
                  Join the community
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className={cn(buttonVariants({ size: "lg", variant: "secondary" }))} href="/documents/technical-verification-status-2026">
                  Read technical verification
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3 text-cyan-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">FAQ</div>
              </div>
              <CardTitle className="text-2xl">Short answers for normal users, reviewers, and funders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold text-white">{item.question}</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-18 w-full max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-emerald-300/80">Need more?</div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Go deeper only when you need it</h2>
          <p className="text-base leading-8 text-white/60 sm:text-lg">
            The homepage stays focused on using the product. Story, live state, and trust stay available when you intentionally want more depth.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Watch the product story</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Open the hosted product story when you want the fast visual explanation.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/story">Open story</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open live state</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use the dedicated live state route for proposals, treasury, and execution logs.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/live">Open live state</Link>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,15,30,0.92),rgba(6,9,20,0.98))]">
            <CardHeader><CardTitle className="text-xl">Open trust surfaces</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-white/58">Use proof and trust routes for judges, operators, and technical review when needed.</p>
              <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/proof">Open proof</Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
