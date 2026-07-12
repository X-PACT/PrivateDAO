import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Blind Policy SDK",
  description:
    "PrivateDAO Blind Policy SDK surface for proving and verifying private policy decisions from application code.",
  path: "/developers/blind-policy-sdk",
  keywords: ["PrivateDAO SDK", "blind policy SDK", "proof workflow SDK"],
  index: false,
});

const sdkFeatures = [
  ["Typed client", "Use `BlindPolicyClient` instead of hand-written REST calls."],
  ["Prove", "Submit private inputs and receive a public proof receipt only if the policy passes."],
  ["Verify", "Recompute the receipt hash and confirm whether the proof package was modified."],
  ["Tamper test", "Run the example script to change a receipt and see mismatch with original and recomputed hashes."],
  ["Pilot-ready", "Prepared in-repo as `packages/blind-policy-sdk` for private registry or customer pilot distribution."],
] as const;

export default function BlindPolicySdkPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Blind Policy SDK"
      description="A typed integration surface for teams that want Blind Verification inside their own product without building proof verification glue from scratch."
      navigationMode="focused"
      badges={[
        { label: "Typed SDK", variant: "cyan" },
        { label: "Pilot package", variant: "violet" },
        { label: "No raw private data in public receipt", variant: "success" },
      ]}
    >
      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">
          <PackageCheck className="h-4 w-4" />
          SDK surface
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Integrate with a typed client.</h2>
        <p className="mt-3 text-sm leading-7 text-white/62">
          The repo now includes a pilot SDK package at <span className="font-mono text-white">packages/blind-policy-sdk</span>.
          Public npm publishing should be claimed only after the package is published; today it is ready for private
          pilot distribution and enterprise integration review.
        </p>
        <pre className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/62">
{`import { createBlindPolicyClient } from "@privatedao/blind-policy";

const client = createBlindPolicyClient({
  baseUrl: "https://api.privatedao.org/api/v1"
});

const result = await client.prove({
  workflowId: "customer-credit-case-001",
  privateInputs: {
    organizationId: "northstar-credit",
    subjectId: "customer-redacted-4381",
    membershipVerified: true,
    records: [{ amountUsd: 8800 }, { amountUsd: 9400 }, { amountUsd: 9200 }],
    riskScore: 84,
    liabilitiesUsd: 2400
  }
});

if (result.ok) {
  const verification = await client.verify(result.publicProofPackage);
  console.log(verification.message);

  const onchain = await client.submitOnchainReceipt(result.publicProofPackage);
  console.log(onchain.ok ? onchain.onchainReceipt.receiptAccountExplorerUrl : onchain.error);
}`}
        </pre>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {sdkFeatures.map(([title, copy]) => (
          <article key={title} className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
            <div className="font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm leading-6 text-white/58">{copy}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/42">Run locally</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Proof, verify, then tamper.</h2>
        <p className="mt-3 text-sm leading-7 text-white/62">
          The SDK example calls the live API, verifies the returned public package, then changes the receipt so the
          verifier returns mismatch. That is the customer-facing answer to “why does the hash matter?”
        </p>
        <pre className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/62">
{`npm --prefix packages/blind-policy-sdk run build
node packages/blind-policy-sdk/examples/prove-verify-tamper.mjs`}
        </pre>
      </section>

      <section className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Developer path</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Use SDK for product code, API console for quick validation.</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/developers/blind-policy-api" className={cn(buttonVariants({ size: "sm" }))}>
            Open API console
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/proof-workflows/blind-policy" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Back to product
          </Link>
          <Link href="/documents/blind-policy-enterprise-readiness" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Enterprise readiness
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
