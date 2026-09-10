import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";

import { BlindPolicyApiConsole } from "@/components/blind-policy-api-console";
import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { buildRouteMetadata } from "@/lib/route-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildRouteMetadata({
  title: "Blind Policy API",
  description:
    "Interactive API console and integration reference for PrivateDAO Blind Policy Verification.",
  path: "/developers/blind-policy-api",
  keywords: ["blind policy api", "proof workflow api", "groth16 verification api"],
});

const endpoints = [
  ["GET", "/api/v1/proof-workflows/blind-policy/status", "Provider status, circuit name, proof rules, and live endpoint map."],
  ["GET", "/api/v1/proof-workflows/blind-policy/sample", "Safe sample payload and public proof package for integration testing."],
  ["POST", "/api/v1/proof-workflows/blind-policy/prove", "Runs a private policy over submitted inputs and issues a proof only when the policy is satisfied."],
  ["POST", "/api/v1/proof-workflows/blind-policy/verify", "Verifies Groth16, recomputes the public proof package hash, checks expiry, and returns match or mismatch."],
  ["POST", "/api/v1/proof-workflows/blind-policy/onchain-receipt", "Verifies the proof package, stores receipt hashes through the Solana receipt path, and returns Explorer links."],
] as const;

const verificationKeyHash = "05aeb7e27479d7f1551b0c2e18134c58f760de43f2ff085a8ea2e82f212209eb";

const proofPackageFields = [
  "proofId",
  "nonce",
  "issuedAt",
  "expiresAt",
  "circuitId",
  "circuitVersion",
  "policyVersion",
  "policyCommitment",
  "inputCommitment",
  "verificationKeyHash",
  "originalProofHash",
  "groth16Proof",
] as const;

const technicalVerificationNotes = [
  ["Current circuit", "`private_dao_blind_policy_overlay.circom` with public signals: policyId, policyCommitment, inputCommitment, satisfiedClaim."],
  [
    "Constraints proved",
    "Membership must be true; three records must be positive; capacity, liability, and risk gates must pass; Poseidon binds policy and input commitments.",
  ],
  [
    "Witness generation",
    "The server writes temporary private witness input, runs the compiled WASM witness generator, then calls `snarkjs groth16 prove`.",
  ],
  ["Proving key", "`private_dao_blind_policy_overlay_final.zkey` stays server-side and is not returned in API responses."],
  ["Verification key", `The current Groth16 verification key is fixed for groth16-v1. verificationKeyHash: ${verificationKeyHash}.`],
  [
    "Replay protection",
    "`proofId`, `nonce`, `issuedAt`, `expiresAt`, `circuitVersion`, `policyVersion`, `policyCommitment`, and `inputCommitment` are included in the hashed public package.",
  ],
  ["Policy immutability", "Changing policyVersion creates a new policy salt and a different policyCommitment. Old receipts do not silently upgrade."],
  ["Versioning", "Supported now: circuitId `private_dao_blind_policy_overlay`, circuitVersion `groth16-v1`."],
  [
    "Solana receipt registry",
    "After `/verify` passes, `/onchain-receipt` attempts an Anchor PDA receipt. If the Anchor program is unavailable, the same hashes are written into a Solana Memo receipt transaction. The response labels the storage mode.",
  ],
  [
    "Future work",
    "Full Groth16 pairing verification on Solana, PLONK, STARK, and recursive proofs are not claimed by this endpoint.",
  ],
] as const;

export default function BlindPolicyApiPage() {
  return (
    <OperationsShell
      eyebrow="Developers"
      title="Blind Policy API"
      description="A browser-testable API surface for teams integrating Blind Verification into lending, compliance, grants, or internal approval systems."
      navigationMode="focused"
      badges={[
        { label: "Interactive console", variant: "cyan" },
        { label: "Groth16 proof route", variant: "violet" },
        { label: "Hash recompute verifier", variant: "success" },
      ]}
    >
      <BlindPolicyApiConsole />

      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/42">
          <Code2 className="h-4 w-4" />
          Endpoint map
        </div>
        <div className="mt-5 grid gap-3">
          {endpoints.map(([method, path, copy]) => (
            <article key={path} className="grid gap-3 rounded-2xl border border-white/10 bg-black/22 p-4 md:grid-cols-[0.12fr_0.32fr_0.56fr]">
              <div className="font-mono text-sm font-semibold text-cyan-100">{method}</div>
              <div className="break-all font-mono text-sm text-white">{path}</div>
              <p className="text-sm leading-6 text-white/60">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Technical Verification Notes</div>
        <h2 className="mt-3 text-2xl font-semibold text-white">What `/prove` returns and what `/verify` checks.</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {technicalVerificationNotes.map(([title, copy]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/22 p-4">
          <div className="text-sm font-semibold text-white">Required proof package fields</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {proofPackageFields.map((field) => (
              <span key={field} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-mono text-white/68">
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Example</div>
        <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/62">
{`const response = await fetch("/api/v1/proof-workflows/blind-policy/prove", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    workflowId: "customer-credit-case-001",
    privateInputs: {
      organizationId: "northstar-credit",
      subjectId: "customer-redacted-4381",
      membershipVerified: true,
      records: [{ amountUsd: 8800 }, { amountUsd: 9400 }, { amountUsd: 9200 }],
      riskScore: 84,
      liabilitiesUsd: 2400
    }
  })
});`}
        </pre>
        <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/62">
{`const onchain = await fetch("/api/v1/proof-workflows/blind-policy/onchain-receipt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ publicProofPackage })
});

// Returns:
// onchainReceipt.signature
// onchainReceipt.transactionExplorerUrl
// onchainReceipt.receiptAccountExplorerUrl`}
        </pre>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/developers/blind-policy-sdk" className={cn(buttonVariants({ size: "sm" }))}>
            View SDK surface
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="/blind-policy-openapi.json" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Download OpenAPI JSON
          </a>
          <Link href="/documents/blind-policy-enterprise-readiness" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Enterprise readiness
          </Link>
          <Link href="/proof-workflows/blind-policy" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Back to product
          </Link>
        </div>
      </section>
    </OperationsShell>
  );
}
