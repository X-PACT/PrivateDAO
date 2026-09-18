import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

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

const buyerGroups = [
  ["Growing teams", "Keep payroll, approvals, and sensitive records controlled as the organization moves beyond a handful of operators."],
  ["Organizations and markets", "Coordinate treasury decisions, bids, and governance without exposing sensitive intent too early."],
  ["Public institutions", "Preserve private working information while making the final outcome easier to review and trust."],
] as const;

const outcomes = [
  ["Private by default", "Sensitive inputs stay with the people and policies that need them."],
  ["Clear responsibility", "Approvals and decisions follow an understandable operating path."],
  ["Trusted outcomes", "The organization can share the result without handing over every private detail."],
] as const;

export default function ThesisPage() {
  return (
    <OperationsShell
      eyebrow="The Coordination Thesis"
      title="Organizations should not have to expose their working data to prove that work was done properly."
      description="PrivateDAO gives companies, institutions, governments, and financial teams a simple way to run sensitive workflows with privacy and accountability in the same process."
      navigationMode="guided"
      badges={[
        { label: "Enterprise privacy", variant: "cyan" },
        { label: "Operational control", variant: "success" },
        { label: "Verifiable outcomes", variant: "violet" },
      ]}
    >
      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#175cd3]" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#175cd3]">Why this matters</div>
            <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.03em] text-[#10233f] sm:text-4xl">Privacy is not the opposite of accountability.</h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-[#5d6d82]">It is the operating condition that lets people make honest decisions, protect commercial information, and still give the right audience confidence in the result.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {buyerGroups.map(([title, body]) => (
          <article key={title} className="enterprise-card rounded-[20px] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-[#10233f]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#5d6d82]">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[24px] bg-[#10233f] p-6 text-white sm:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9fc7ff]">What changes</div>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.03em] sm:text-4xl">The customer sees a workflow. The complexity stays behind it.</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {outcomes.map(([title, body]) => <div key={title} className="rounded-[16px] border border-white/15 bg-white/10 p-4"><div className="font-semibold">{title}</div><p className="mt-2 text-sm leading-6 text-[#d5e2f3]">{body}</p></div>)}
        </div>
      </section>

      <section className="enterprise-card rounded-[24px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#175cd3]">Start with one workflow</div><h2 className="mt-3 text-2xl font-semibold text-[#10233f]">See where privacy creates the most value for your organization.</h2></div>
          <Link href="/contact" className={cn(buttonVariants({ size: "sm" }))}>Talk to PrivateDAO <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </OperationsShell>
  );
}
