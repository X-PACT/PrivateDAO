import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Trust",
  description:
    "PrivateDAO adoption evidence, pilot programs, sample workflows, live demonstrations, testing signals, and verification routes.",
  path: "/trust",
  keywords: ["PrivateDAO trust", "pilot programs", "sample workflows", "live demonstrations", "proof of adoption"],
});

const adoptionSignals = [
  ["Pilot programs", "Focused pilot paths exist for Proof Workflows, Private Governance, and Treasury Coordination."],
  ["Test organizations", "The product supports test organizations and buyer-specific workflow mapping before paid deployment."],
  ["Sample workflows", "Credit decision verification, private-room governance, and treasury approval workflows can be reviewed live."],
  ["Live demonstrations", "Visitors can run the proof workflow demo, view public verification, and submit a pilot request."],
] as const;

const evidence = [
  ["Production deployment", "The commercial site and API are served from the active PrivateDAO production host."],
  ["Verification engine", "Public proof packages can be recomputed and checked for tampering."],
  ["Independent tests", "TypeScript, unit tests, build, and internal-link verification are part of the release process."],
  ["Operational metrics", "Runtime health, proof workflow status, and sample APIs are visible for review."],
] as const;

export default function TrustPage() {
  return (
    <OperationsShell
      eyebrow="Trust"
      title="Proof of adoption starts with visible pilot paths and repeatable demonstrations."
      description="PrivateDAO does not ask buyers to believe a slide deck. Buyers can run a workflow, inspect a public proof, request a pilot, and review the operating evidence behind the product."
      navigationMode="guided"
      badges={[]}
    >
      <section className="grid gap-4 lg:grid-cols-4">
        {adoptionSignals.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-emerald-300/16 bg-emerald-300/[0.055] p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100" />
              <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Live buyer paths</div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Run proof demo", "/proof-workflows/demo"],
            ["View public proof", "/proof-workflows/verify/demo-proof-id"],
            ["Request pilot", "/pilots"],
            ["Review pricing", "/pricing"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "justify-center")}>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {evidence.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
          </article>
        ))}
      </section>
    </OperationsShell>
  );
}
