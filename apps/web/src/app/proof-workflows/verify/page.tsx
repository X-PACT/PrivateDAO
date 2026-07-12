import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import { BlindPolicyPublicVerifier } from "@/components/blind-policy-public-verifier";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Proof Workflow Verification Portal",
  description: "Verify that a workflow process existed, completed, followed approvals, and respected sequence without revealing private data.",
  path: "/proof-workflows/verify",
  keywords: ["proof workflow verification", "verification portal", "audit trail", "private process proof"],
  index: false,
});

const verificationClaims = [
  "Process existed",
  "Process completed",
  "Required approvals happened",
  "Required sequence was respected",
] as const;

const hiddenData = ["documents", "thresholds", "calculations", "reviewer notes", "internal methodology"] as const;

export default function ProofWorkflowVerifyPage() {
  return (
    <OperationsShell
      eyebrow="Verification portal"
      title="Verify the process without seeing the private process data."
      description="The verifier confirms the existence, completion, approvals, sequence, timestamps, and proof hashes. Private documents, thresholds, calculations, reviewer notes, and methodology stay hidden."
      navigationMode="guided"
      badges={[
        { label: "Public verification", variant: "success" },
        { label: "Selective disclosure", variant: "cyan" },
      ]}
    >
      <BlindPolicyPublicVerifier />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-emerald-300/16 bg-emerald-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Verifier can confirm</div>
          <div className="mt-5 grid gap-3">
            {verificationClaims.map((claim) => (
              <div key={claim} className="flex gap-3 rounded-2xl border border-white/10 bg-black/22 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100" />
                <span className="text-sm leading-6 text-white/68">{claim}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-violet-100/76">
            <LockKeyhole className="h-4 w-4" />
            Not revealed
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {hiddenData.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-black/22 px-3 py-1 text-sm text-white/66">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-white/62">
            Proof Workflows uses hashes, commitments, timestamps, and sequence checks to prove process integrity without
            publishing the operating logic behind the process.
          </p>
        </article>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/46">API verification</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Verification endpoint</h2>
        <p className="mt-3 text-sm leading-7 text-white/64">
          Use <span className="font-mono text-cyan-100">POST /api/proof-workflows/verify</span> with a workflow id,
          template id, and redacted proof events. The response returns process existence, completion, approval, sequence,
          and verification hash fields.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/proof-workflows" className={cn(buttonVariants({ size: "sm" }))}>
            Open Proof Workflows
          </Link>
          <Link
            href="https://api.privatedao.org/api/v1/proof-workflows/status"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            View API status
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
