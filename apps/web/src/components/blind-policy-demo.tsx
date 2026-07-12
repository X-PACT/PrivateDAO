"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, EyeOff, Play, ShieldCheck, XCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { BlindPolicyProofPackage } from "@/lib/blind-policy-proof";
import { cn } from "@/lib/utils";

const BLIND_POLICY_API = "/api/v1/proof-workflows/blind-policy/prove";
const BLIND_POLICY_FALLBACK_API = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/prove";
const BLIND_POLICY_ONCHAIN_API = "/api/v1/proof-workflows/blind-policy/onchain-receipt";
const BLIND_POLICY_ONCHAIN_FALLBACK_API = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/onchain-receipt";
const LOCAL_ENGINE_BASE_URL = (process.env.NEXT_PUBLIC_PRIVATE_ENGINE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const localExecutionMode = process.env.NEXT_PUBLIC_PROOF_EXECUTION_MODE === "local";
const storedBlindPolicyProofKey = "privatedao-blind-policy-proof";

type BlindPolicyResult = {
  ok: boolean;
  status?: string;
  source?: string;
  workflowId: string;
  publicOutcome: string;
  decision?: string;
  proofHash?: string;
  publicProofPackage?: BlindPolicyProofPackage;
  verification?: {
    ok: boolean;
    status: string;
    match: boolean;
    originalHash: string | null;
    recomputedHash: string | null;
    message: string;
  };
  validationErrors?: string[];
  error?: string;
};

type BlindPolicyOnchainReceiptResult = {
  ok: boolean;
  status: string;
  source?: string;
  error?: string;
  onchainReceipt?: {
    storageMode: "anchor-pda" | "solana-memo-receipt";
    cluster: string;
    programId: string;
    authority: string;
    receiptAccount: string;
    receiptAccountExplorerUrl: string;
    proofId: string;
    proofIdHash: string;
    proofHash: string;
    policyCommitmentHash: string;
    inputCommitmentHash: string;
    verificationKeyHash: string;
    circuitVersionHash: string;
    policyVersionHash: string;
    signature: string | null;
    transactionExplorerUrl: string | null;
  };
};

function persistBlindPolicyProofPackage(proofPackage: BlindPolicyProofPackage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storedBlindPolicyProofKey, JSON.stringify(proofPackage));
}

async function readBlindPolicyResponse(response: Response): Promise<BlindPolicyResult> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: "proof-endpoint-unavailable",
      workflowId: "blind-policy-endpoint-unavailable",
      publicOutcome: "proof-not-issued",
      error: "The proof endpoint did not return a verification response. Please retry or use the public API endpoint.",
    };
  }
  return (await response.json()) as BlindPolicyResult;
}

export function readPersistedBlindPolicyProofPackage(): BlindPolicyProofPackage | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storedBlindPolicyProofKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BlindPolicyProofPackage;
  } catch {
    return null;
  }
}

export function BlindPolicyDemo() {
  const [running, setRunning] = useState(false);
  const [organizationId, setOrganizationId] = useState("Northstar Credit");
  const [subjectId, setSubjectId] = useState("customer-redacted-4381");
  const [recordOne, setRecordOne] = useState("8800");
  const [recordTwo, setRecordTwo] = useState("9400");
  const [recordThree, setRecordThree] = useState("9200");
  const [riskScore, setRiskScore] = useState("84");
  const [liabilitiesUsd, setLiabilitiesUsd] = useState("2400");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [result, setResult] = useState<BlindPolicyResult>();
  const [failedResult, setFailedResult] = useState<BlindPolicyResult>();
  const [anchoring, setAnchoring] = useState(false);
  const [onchainReceipt, setOnchainReceipt] = useState<BlindPolicyOnchainReceiptResult>();

  async function runBlindPolicy() {
    setRunning(true);
    setResult(undefined);
    setFailedResult(undefined);
    setOnchainReceipt(undefined);

    try {
      const requestBody = JSON.stringify({
        workflowId: `${organizationId.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "organization"}_blind_policy_${Date.now()}`,
        privateInputs: {
          organizationId,
          subjectId,
          membershipVerified: true,
          records: [
            { amountUsd: Number(recordOne) },
            { amountUsd: Number(recordTwo) },
            { amountUsd: Number(recordThree) },
          ],
          riskScore: Number(riskScore),
          liabilitiesUsd: Number(liabilitiesUsd),
        },
      });
      const workflowId = `${organizationId.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "organization"}_blind_policy_${Date.now()}`;
      let response: Response;
      if (localExecutionMode) {
        const workflowResponse = await fetch(`${LOCAL_ENGINE_BASE_URL}/v1/workflows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: `${organizationId} Blind Policy`, template: "blind-policy", createdBy: "web-user" }),
        });
        const workflowPayload = (await workflowResponse.json()) as { ok?: boolean; workflow?: { workflowId: string }; error?: string };
        if (!workflowResponse.ok || !workflowPayload.ok || !workflowPayload.workflow?.workflowId) {
          throw new Error(workflowPayload.error || "Unable to create the local workflow.");
        }
        response = await fetch(`${LOCAL_ENGINE_BASE_URL}/v1/workflows/${encodeURIComponent(workflowPayload.workflow.workflowId)}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ createdBy: "web-user", privateInputs: { organizationId, subjectId, membershipVerified: true, records: [{ amountUsd: Number(recordOne) }, { amountUsd: Number(recordTwo) }, { amountUsd: Number(recordThree) }], riskScore: Number(riskScore), liabilitiesUsd: Number(liabilitiesUsd) } }),
        });
      } else {
        response = await fetch(BLIND_POLICY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
        });
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!localExecutionMode && (
        response.status === 404 ||
        response.status === 405 ||
        response.status === 502 ||
        !contentType.toLowerCase().includes("application/json")
      )) {
        response = await fetch(BLIND_POLICY_FALLBACK_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      }
      const payload = await readBlindPolicyResponse(response);
      if (!response.ok || !payload.ok) {
        setFailedResult(payload);
        return;
      }
      if (payload.publicProofPackage) persistBlindPolicyProofPackage(payload.publicProofPackage);
      setResult(payload);
    } catch (error) {
      setFailedResult({
        ok: false,
        status: "request-failed",
        workflowId: "blind-policy-request-failed",
        publicOutcome: "proof-not-issued",
        error: error instanceof Error ? error.message : "Unable to run blind policy verification.",
      });
    } finally {
      setRunning(false);
    }
  }

  async function storeReceiptOnSolana() {
    if (!result?.publicProofPackage) return;
    setAnchoring(true);
    setOnchainReceipt(undefined);
    const requestBody = JSON.stringify({ publicProofPackage: result.publicProofPackage });
    try {
      let response = await fetch(BLIND_POLICY_ONCHAIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (
        response.status === 404 ||
        response.status === 405 ||
        response.status === 502 ||
        !contentType.toLowerCase().includes("application/json")
      ) {
        response = await fetch(BLIND_POLICY_ONCHAIN_FALLBACK_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
      }
      setOnchainReceipt((await response.json()) as BlindPolicyOnchainReceiptResult);
    } catch (error) {
      setOnchainReceipt({
        ok: false,
        status: "onchain-receipt-failed",
        error: error instanceof Error ? error.message : "Unable to store the receipt on Solana.",
      });
    } finally {
      setAnchoring(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-violet-300/18 bg-violet-300/[0.06] p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Run a real workflow</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Enter private inputs. Get a decision and proof receipt.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">
              The values below represent sensitive customer or case data. PrivateDAO uses them to decide whether the
              private policy is satisfied, then returns a public receipt that hides the values.
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.07] px-4 py-3 text-sm leading-6 text-cyan-50/82">
              {localExecutionMode
                ? "Local execution active: private inputs, witness generation, and Groth16 proving stay inside this deployment."
                : "Hosted demo mode: connect this workflow to a customer Private Engine for production private-data processing."}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-white/70">
                Organization
                <input value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Subject ID
                <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Private record 1
                <input value={recordOne} onChange={(event) => setRecordOne(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Private record 2
                <input value={recordTwo} onChange={(event) => setRecordTwo(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Private record 3
                <input value={recordThree} onChange={(event) => setRecordThree(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Risk score
                <input value={riskScore} onChange={(event) => setRiskScore(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Private liabilities
                <input value={liabilitiesUsd} onChange={(event) => setLiabilitiesUsd(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-violet-200/60" />
              </label>
            </div>
            <button type="button" onClick={runBlindPolicy} disabled={running} className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
              <Play className="h-4 w-4" />
              {running ? "Running..." : "Run Blind Policy"}
            </button>
          </div>

          <div className="grid gap-3">
            {[
              ["1. Create Policy", "The private policy is selected without exposing thresholds."],
              ["2. Execute Workflow", "Sensitive values are entered and evaluated."],
              ["3. Generate Blind Proof", "Groth16 produces a public proof package."],
              ["4. Verify", "The verifier recomputes the package and checks the proof."],
              ["5. Store Receipt", "The proof hash and commitments are written to Solana."],
              ["6. Open Explorer", "The receipt transaction can be opened by any third party."],
            ].map(([label, body], index) => (
              <div key={label} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/10 bg-black/22 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200/22 bg-violet-300/[0.1] text-sm text-violet-50">
                  {index + 1}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/42">{label}</div>
                  <div className="mt-1 text-base font-semibold text-white">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failedResult ? (
        <section className="rounded-[28px] border border-red-300/22 bg-red-400/[0.08] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-100/76">
            <XCircle className="h-4 w-4" />
            Proof not issued
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">The private policy was not satisfied.</h2>
          <div className="mt-4 grid gap-2">
            {(failedResult.validationErrors ?? [failedResult.error ?? "The input data did not pass the required private policy."]).map((item) => (
              <div key={item} className="rounded-2xl border border-red-300/18 bg-black/22 p-3 text-sm text-red-50/82">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {result?.publicProofPackage ? (
        <section className="rounded-[28px] border border-emerald-300/22 bg-emerald-300/[0.08] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">
            <ShieldCheck className="h-4 w-4" />
            Policy satisfied
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Blind policy proof issued.</h2>
          <div className="mt-4 grid gap-3">
            {[
              "Customer or case data was accepted by the workflow.",
              "The private policy was applied.",
              "The policy was satisfied.",
              "A public proof receipt was generated.",
              "The receipt can be checked for tampering without exposing private values.",
            ].map((item, index) => (
              <div key={item} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-base leading-7 text-white">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-100" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Step {index + 1}</div>
                  <div className="mt-1 font-semibold">{item}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/68 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <EyeOff className="mt-0.5 h-4 w-4 text-violet-100" />
              <div>
                <div className="font-semibold text-white">Private</div>
                <div>Raw records, subject identity, risk score, liabilities, and policy thresholds.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-100" />
              <div>
                <div className="font-semibold text-white">Verifiable</div>
                <div>Policy satisfied, checks completed, proof hash matched, provider lanes committed.</div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/proof-workflows/verify/blind-policy-demo" className={cn(buttonVariants({ size: "sm" }))}>
              View Public Proof
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/proof-workflows/verify" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              Verify this proof
            </Link>
            <button type="button" onClick={() => setShowTechnicalDetails((value) => !value)} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              {showTechnicalDetails ? "Hide technical details" : "Show technical details"}
            </button>
            <button type="button" onClick={storeReceiptOnSolana} disabled={anchoring} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              {anchoring ? "Storing receipt..." : "Store receipt on Solana"}
            </button>
          </div>
          {onchainReceipt ? (
            <div className={`mt-5 rounded-2xl border p-4 text-sm ${onchainReceipt.ok ? "border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-50/82" : "border-red-300/18 bg-red-400/[0.08] text-red-50/82"}`}>
              <div className="font-semibold text-white">
                {onchainReceipt.ok ? "Solana receipt ready." : "Solana receipt was not stored."}
              </div>
              {onchainReceipt.ok && onchainReceipt.onchainReceipt ? (
                <div className="mt-3 grid gap-2">
                  <div>Storage mode: <span className="font-semibold text-white">{onchainReceipt.onchainReceipt.storageMode === "anchor-pda" ? "Anchor PDA receipt" : "Solana Memo receipt"}</span></div>
                  <div>Proof ID hash: <span className="break-all font-mono text-white/76">{onchainReceipt.onchainReceipt.proofIdHash}</span></div>
                  <div>Policy commitment hash: <span className="break-all font-mono text-white/76">{onchainReceipt.onchainReceipt.policyCommitmentHash}</span></div>
                  <div>Input commitment hash: <span className="break-all font-mono text-white/76">{onchainReceipt.onchainReceipt.inputCommitmentHash}</span></div>
                  <div>Proof hash: <span className="break-all font-mono text-white/76">{onchainReceipt.onchainReceipt.proofHash}</span></div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {onchainReceipt.onchainReceipt.storageMode === "anchor-pda" ? (
                      <a className={cn(buttonVariants({ size: "sm" }))} href={onchainReceipt.onchainReceipt.receiptAccountExplorerUrl} target="_blank" rel="noreferrer">
                        Open receipt account
                      </a>
                    ) : null}
                    {onchainReceipt.onchainReceipt.transactionExplorerUrl ? (
                      <a className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href={onchainReceipt.onchainReceipt.transactionExplorerUrl} target="_blank" rel="noreferrer">
                        Open transaction
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-2">{onchainReceipt.error ?? "The proof must verify before the on-chain receipt can be stored."}</p>
              )}
            </div>
          ) : null}
          {showTechnicalDetails ? (
            <pre className="mt-5 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/58">
              {JSON.stringify(result.publicProofPackage, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
