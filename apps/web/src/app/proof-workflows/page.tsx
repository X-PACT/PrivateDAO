import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Workflows",
  description: "Prove a decision was made correctly without exposing the underlying data.",
  path: "/proof-workflows",
  keywords: ["proof workflows", "decision proof", "workflow verification", "private audit trail", "underwriting proof"],
});

const flow = [
  ["Input", "Connect earnings data"],
  ["Processing", "Private credit policy runs"],
  ["Output", "Credit limit issued"],
  ["Verification", "Proof generated"],
] as const;

const afterClick = [
  "Membership verified",
  "Earnings imported",
  "Policy applied",
  "Credit limit issued: $2250",
  "Proof generated",
] as const;

export default function ProofWorkflowsPage() {
  return (
    <OperationsShell
      eyebrow="Proof Workflows"
      title="For organizations that need to prove a process happened correctly without exposing private data."
      description="Use Proof Workflows for lending, underwriting, compliance reviews, grant reviews, vendor approvals, internal approvals, and audit workflows."
      navigationMode="guided"
      badges={[]}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-red-300/16 bg-red-400/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-red-100/76">Problem</div>
          <p className="mt-3 text-sm leading-7 text-white/68">
            Organizations often need to prove decisions were made correctly, but exposing raw data creates privacy,
            compliance, and operational risks.
          </p>
        </article>
        <article className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Solution</div>
          <p className="mt-3 text-sm leading-7 text-white/68">
            PrivateDAO generates a public proof package that can be verified without revealing the underlying private
            data or rules.
          </p>
        </article>
      </section>

      <section className="rounded-[30px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <div>
            <div className="grid gap-3">
              {flow.map(([label, body], index) => (
                <div key={label} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/10 bg-black/22 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/24 bg-cyan-300/[0.1] text-sm font-semibold text-cyan-50">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/42">{label}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Link href="/pilots" className={cn(buttonVariants({ size: "lg" }))}>
                Request Pilot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <article className="rounded-[26px] border border-emerald-300/18 bg-emerald-300/[0.07] p-5 sm:p-6">
            <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">After one click</div>
            <div className="mt-5 grid gap-3">
              {afterClick.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 p-4 text-base font-semibold text-white">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-100" />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-white/62">
              The customer sees the decision first. The public proof comes next. Technical hashes and digests stay available
              for auditors after the value is clear.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href="/pilots/credit-decision-verification" className="text-cyan-100 hover:text-white">
                Run the 60-second demo
              </Link>
              <Link href="/proof-workflows/blind-policy" className="text-violet-100 hover:text-white">
                Run blind policy verification
              </Link>
              <Link href="/proof-workflows/verify/demo-proof-id" className="text-cyan-100 hover:text-white">
                View public verification
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["For lenders", "Issue credit limits from private earnings data and prove the process was followed."],
          ["For review teams", "Prove reviews happened without exposing documents, notes, or scoring logic."],
          ["For compliance", "Show that required checks completed without publishing sensitive records."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
          </article>
        ))}
      </section>
    </OperationsShell>
  );
}
