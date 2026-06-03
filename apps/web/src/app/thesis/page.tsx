import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, GitBranch, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "The Coordination Thesis",
  description:
    "The PrivateDAO coordination thesis: the least decentralized part of every DAO is everything before and after the vote.",
  path: "/thesis",
  keywords: ["PrivateDAO thesis", "coordination thesis", "DAO coordination", "confidential coordination infrastructure"],
});

const thesisSections = [
  ["Before governance", "Proposal context, reviewer notes, security concerns, contributor negotiations, and treasury options often move through informal private channels."],
  ["During governance", "Visible vote counts, whale behavior, and public momentum can influence independent decision making before the voting window ends."],
  ["After governance", "Execution, payroll, grants, vendor settlement, audit packets, and organizational memory are usually scattered across trusted operators and private spreadsheets."],
] as const;

const operatingLayers = [
  ["Governance", "Vote privately while it matters, reveal transparently when it counts."],
  ["Treasury", "Coordinate sensitive budget requests and execution receipts without leaking strategy before approval."],
  ["Payroll", "Route contributor compensation and reward workflows without turning salary coordination into public pressure."],
  ["Grants", "Assign reviewers, keep scoring independent, approve awards, and publish audit proof after completion."],
  ["Security", "Coordinate incident response before disclosure while preserving a verifiable final record."],
  ["Agents", "Let AI-assisted workflows propose, prepare, and summarize decisions without owning authority."],
] as const;

export default function ThesisPage() {
  return (
    <OperationsShell
      eyebrow="The Coordination Thesis"
      title="The least decentralized part of every DAO is everything before and after the vote."
      description="PrivateDAO exists because organizations need secure coordination, not only voting. The real infrastructure layer is the confidential path from context to approval to execution to audit."
      navigationMode="guided"
      badges={[
        { label: "Coordination thesis", variant: "cyan" },
        { label: "Before and after governance", variant: "success" },
        { label: "Solana organizations", variant: "violet" },
      ]}
    >
      <section className="rounded-[30px] border border-emerald-300/18 bg-[radial-gradient(circle_at_top_left,rgba(20,241,149,0.16),transparent_34%),linear-gradient(135deg,rgba(7,13,26,0.98),rgba(4,7,18,0.98))] p-5 sm:p-7">
        <div className="flex items-center gap-3 text-emerald-100">
          <GitBranch className="h-5 w-5" />
          <span className="text-[11px] uppercase tracking-[0.28em]">Core thesis</span>
        </div>
        <h1 className="mt-4 max-w-5xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
          Voting is visible. Coordination is where organizations actually break.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-white/68">
          Public governance is useful, but the work around it is messy: private context, political pressure, treasury
          routing, reviewer bias, payroll friction, incident response, and memory loss. PrivateDAO turns that hidden
          operating layer into a confidential, auditable workflow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/try" className={cn(buttonVariants({ size: "sm" }))}>
            Try the workflow
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/deck" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Open pitch deck
          </Link>
          <Link href="/investors" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Investor page
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {thesisSections.map(([title, body]) => (
          <article key={title} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/64">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-cyan-100" />
          <div>
            <h2 className="text-2xl font-semibold text-white">Public accountability. Private coordination.</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
              PrivateDAO does not argue that organizations should hide final outcomes. It argues that people should be
              able to coordinate, review, and vote independently before the outcome is ready to be revealed.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {operatingLayers.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-black/24 p-5">
            <div className="text-lg font-semibold text-white">{title}</div>
            <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Infrastructure claim</div>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          PrivateDAO is the coordination layer for organizations that need privacy before execution and proof after execution.
        </p>
      </section>
    </OperationsShell>
  );
}
