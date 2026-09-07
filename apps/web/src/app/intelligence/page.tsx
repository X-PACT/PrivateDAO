import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Decision Intelligence",
  description: "Clear context for better private decisions, approvals, and treasury coordination.",
  path: "/intelligence",
  keywords: ["decision support", "private decisions", "treasury review", "governance review"],
});

const decisionBenefits = [
  {
    icon: BrainCircuit,
    title: "Understand the situation",
    description: "Bring the relevant context together before people approve an important action.",
  },
  {
    icon: ShieldCheck,
    title: "Protect what is sensitive",
    description: "Keep confidential information inside the right workflow while sharing only what a reviewer needs.",
  },
  {
    icon: FileCheck2,
    title: "Leave a clear record",
    description: "Turn the final decision into evidence that can be checked and shared later.",
  },
];

export default function IntelligencePage() {
  return (
    <OperationsShell
      eyebrow="Decision Intelligence"
      title="Make important decisions with the right context"
      description="PrivateDAO helps teams review proposals, treasury requests, and sensitive workflows before they approve them. The goal is simple: better decisions, clearer accountability, and less exposure of private information."
      navigationMode="guided"
      badges={[
        { label: "Decision support", variant: "cyan" },
        { label: "Privacy-aware", variant: "success" },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {decisionBenefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
              <Icon className="h-5 w-5 text-cyan-200" />
              <h2 className="mt-4 text-lg font-medium text-white">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/58">{benefit.description}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.07] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/72">A simple review path</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Review first. Approve with confidence. Keep the evidence.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
              Start from the workflow that matters to your organization. PrivateDAO brings together the people, policy, and supporting evidence needed for a clear decision, then sends the approved action to the right next step.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/govern" className={cn(buttonVariants({ size: "sm" }))}>
                Review a decision
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/treasury" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                Coordinate treasury
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Governance", "Review proposals, approvals, and outcomes with the people responsible for the decision.", "/govern"],
          ["Treasury", "Make funding requests easier to review and keep every action accountable.", "/treasury"],
          ["Verification", "Check that a sensitive record or result matches the agreed requirements.", "/products/record-verification"],
        ].map(([title, description, href]) => (
          <Link key={title} href={href} className="rounded-[24px] border border-white/10 bg-black/15 p-5 transition hover:border-cyan-300/24 hover:bg-white/[0.05]">
            <h2 className="text-lg font-medium text-white">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-white/56">{description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-100">Open {title} <ArrowRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </section>
    </OperationsShell>
  );
}
