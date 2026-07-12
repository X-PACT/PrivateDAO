import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { PilotRequestForm } from "@/components/pilot-request-form";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Enterprise",
  description:
    "Enterprise PrivateDAO deployment options for proof workflows, private governance, treasury coordination, auditability, data control, and integration support.",
  path: "/enterprise",
  keywords: ["PrivateDAO enterprise", "private deployment", "audit-ready workflows", "proof workflows enterprise"],
});

const readiness = [
  ["Private deployment", "Run PrivateDAO as a dedicated deployment with customer-specific configuration and support boundaries."],
  ["Auditability", "Generate public verification records for process completion without exposing private values."],
  ["Data control", "Define which fields stay private, which proof fields become public, and which systems are connected."],
  ["Integration options", "Connect redacted JSON, sample APIs, treasury systems, governance rooms, and workflow evidence."],
  ["Support", "Pilot mapping, deployment planning, operating runbooks, and dedicated support for enterprise workflows."],
] as const;

export default function EnterprisePage() {
  return (
    <OperationsShell
      eyebrow="Enterprise"
      title="PrivateDAO for organizations that need private workflows and public verification."
      description="Deploy Proof Workflows, Private Governance, and Treasury Coordination with audit-ready records, private data boundaries, and customer-controlled rollout options."
      navigationMode="guided"
      badges={[
        { label: "Private deployment", variant: "cyan" },
        { label: "Audit-ready", variant: "success" },
        { label: "Integration support", variant: "violet" },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {readiness.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-100" />
              <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Commercial licensing</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Cloud SaaS or private deployment.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
          PrivateDAO supports monthly cloud subscriptions and private deployment licensing. Commercial packages can use
          organization-bound activation, signed license records, feature gating, and support terms appropriate to the
          customer deployment.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/pricing" className={cn(buttonVariants({ size: "sm" }))}>
            View Pricing
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/proof-workflows" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
            Proof Workflows
          </Link>
        </div>
      </section>

      <PilotRequestForm defaultProduct="Proof Workflows" />
    </OperationsShell>
  );
}
