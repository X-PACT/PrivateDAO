import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Compliance",
  description:
    "Compliance-oriented PrivateDAO workflows for redacted proof, audit trails, private decision records, and verification without exposing sensitive data.",
  path: "/compliance",
  keywords: ["PrivateDAO compliance", "audit workflow", "redacted proof", "private verification", "compliance review"],
});

const points = [
  ["Redacted proof", "Public proof pages show what was verified without exposing earnings, documents, thresholds, notes, or internal policy details."],
  ["Audit trail", "Workflow stages, status, timestamps, and proof hashes create a reviewable record for internal and external stakeholders."],
  ["Controlled disclosure", "Organizations can separate private workflow inputs from public outcomes and verification results."],
  ["Pilot-first adoption", "Teams can map one real workflow before committing to a broader deployment."],
] as const;

export default function CompliancePage() {
  return (
    <OperationsShell
      eyebrow="Compliance"
      title="Compliance teams need evidence without unnecessary data exposure."
      description="PrivateDAO helps organizations prove that reviews, approvals, and decisions followed a defined process while keeping sensitive inputs out of public proof records."
      navigationMode="guided"
      badges={[]}
    >
      <section className="grid gap-4 md:grid-cols-2">
        {points.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-violet-300/16 bg-violet-300/[0.055] p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-100" />
              <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-white">Start with one workflow.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
          A compliance pilot can connect a redacted JSON sample or safe data connector, run the workflow, and produce a
          public proof package that auditors can verify without seeing private values.
        </p>
        <Link href="/pilots" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
          Request Compliance Pilot
        </Link>
      </section>
    </OperationsShell>
  );
}
