import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bot,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SolanaInfrastructureStackProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

const pillars = [
  {
    title: "Fast runtime reads and diagnostics",
    byline: "by Fast RPC + hosted reads",
    summary:
      "Solana-grade UX means fresh state, low-latency reads, clear retry posture, and diagnostics that explain what the wallet action actually produced instead of leaving the user with a toast only.",
    runHref: "/services",
    runLabel: "Run runtime API flow",
    verifyHref: "/diagnostics",
    verifyLabel: "Verify diagnostics",
    icon: Radio,
  },
  {
    title: "Private voting with verifiable execution",
    byline: "by ZK + commit-reveal",
    summary:
      "Vote intent stays protected during the sensitive phase, then execution becomes public and reviewable on-chain. That keeps governance fair without forcing the user into opaque off-chain trust.",
    runHref: "/govern",
    runLabel: "Run governance flow",
    verifyHref: "/judge",
    verifyLabel: "Verify execution route",
    icon: ShieldCheck,
  },
  {
    title: "Confidential settlement corridors",
    byline: "by REFHE + MagicBlock",
    summary:
      "Sensitive payroll, grant, and treasury actions stay protected long enough to preserve privacy, then surface the right evidence and settlement trail for operators, reviewers, and institutions.",
    runHref: "/security",
    runLabel: "Run confidential payment flow",
    verifyHref: "/proof",
    verifyLabel: "Verify proof trail",
    icon: LockKeyhole,
  },
  {
    title: "Readable identity for normal users",
    byline: "by SNS + wallet-first UX",
    summary:
      "Identity should feel readable and human without weakening the wallet boundary. The point is to make advanced DAO operations usable for normal people, not just terminal-native developers.",
    runHref: "/start",
    runLabel: "Run onboarding flow",
    verifyHref: "/learn/lecture-1-web2-to-solana-ui",
    verifyLabel: "Verify in Lecture 1",
    icon: Tags,
  },
  {
    title: "Policy-bound automation",
    byline: "by agentic treasury rail",
    summary:
      "Automation is only useful when it is governed. PrivateDAO ties recurring treasury actions to approved policy, then publishes the resulting settlement trail so automation stays auditable.",
    runHref: "/documents/agentic-treasury-micropayment-rail",
    runLabel: "Run the treasury rail",
    verifyHref: "/judge",
    verifyLabel: "Verify rail evidence",
    icon: Bot,
  },
  {
    title: "Open-source proof and operator confidence",
    byline: "by logs + explorer links + trust packets",
    summary:
      "Judges, operators, and serious users should be able to reproduce the story from the UI, then open hashes, logs, and packets without reverse-engineering the product from source code first.",
    runHref: "/learn",
    runLabel: "Start the bootcamp",
    verifyHref: "/documents/reviewer-fast-path",
    verifyLabel: "Open fast path",
    icon: Activity,
  },
] as const;

export function SolanaInfrastructureStack({
  eyebrow = "Solana-grade infrastructure",
  title = "The execution stack is built to match what strong Solana teams care about",
  description = "PrivateDAO is not a single feature. It is a coordinated stack that keeps wallets, privacy, runtime speed, diagnostics, identity, and proof aligned so a normal user can complete serious blockchain operations from the browser.",
}: SolanaInfrastructureStackProps) {
  return (
    <section className="grid gap-5">
      <div className="max-w-4xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{eyebrow}</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/62">{description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <Card key={pillar.title} className="border-white/10 bg-[linear-gradient(180deg,rgba(11,16,31,0.92),rgba(7,10,22,0.98))]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/72">{pillar.byline}</div>
                </div>
                <CardTitle className="text-xl text-white">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-7 text-white/58">{pillar.summary}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={pillar.runHref} className={cn(buttonVariants({ size: "sm" }))}>
                    {pillar.runLabel}
                  </Link>
                  <Link href={pillar.verifyHref} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    {pillar.verifyLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
