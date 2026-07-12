"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileJson, ShieldCheck, Upload, XCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { BlindPolicyProofPackage } from "@/lib/blind-policy-proof";
import { cn } from "@/lib/utils";

const VERIFY_API = "/api/v1/proof-workflows/blind-policy/verify";
const VERIFY_FALLBACK_API = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/verify";
const LOCAL_VERIFY_API = `${(process.env.NEXT_PUBLIC_PRIVATE_ENGINE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "")}/v1/verify`;
const localExecutionMode = process.env.NEXT_PUBLIC_PROOF_EXECUTION_MODE === "local";
const ONCHAIN_API = "/api/v1/proof-workflows/blind-policy/onchain-receipt";
const ONCHAIN_FALLBACK_API = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/onchain-receipt";
const storedBlindPolicyProofKey = "privatedao-blind-policy-proof";

type VerificationResponse = {
  ok: boolean;
  status: string;
  match?: boolean;
  originalHash?: string | null;
  recomputedHash?: string | null;
  message?: string;
  verification?: {
    ok: boolean;
    status: string;
    match: boolean;
    originalHash: string | null;
    recomputedHash: string | null;
    circuitVersion?: string;
    message: string;
  };
};

type OnchainReceiptResponse = {
  ok: boolean;
  status: string;
  source?: string;
  error?: string;
  verification?: VerificationResponse["verification"];
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

function extractProofPackage(value: unknown): BlindPolicyProofPackage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  const nested = object.publicProofPackage ?? object.proofPackage ?? object.package;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested as BlindPolicyProofPackage;
  if (typeof object.proofId === "string" && object.groth16Proof) return object as BlindPolicyProofPackage;
  return null;
}

function extractOnchainReceipt(value: unknown): OnchainReceiptResponse["onchainReceipt"] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  const receipt = object.onchainReceipt ?? object.receipt;
  if (receipt && typeof receipt === "object" && !Array.isArray(receipt)) return receipt as OnchainReceiptResponse["onchainReceipt"];
  return null;
}

function extractVerification(value: unknown): VerificationResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  if (typeof object.ok === "boolean" && typeof object.status === "string") return object as VerificationResponse;
  if (object.verification && typeof object.verification === "object") {
    const nested = object.verification as Record<string, unknown>;
    if (typeof nested.ok === "boolean" && typeof nested.status === "string") return nested as VerificationResponse;
  }
  return null;
}

async function postJson<T>(path: string, fallbackPath: string, body: unknown): Promise<T> {
  const requestBody = JSON.stringify(body);
  let response = await fetch(path, {
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
    response = await fetch(fallbackPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
  }
  return (await response.json()) as T;
}

function hashPreview(value?: string | null) {
  if (!value) return "Not available";
  return value.length > 24 ? `${value.slice(0, 12)}...${value.slice(-10)}` : value;
}

export function BlindPolicyPublicVerifier() {
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [anchoring, setAnchoring] = useState(false);
  const [proofPackage, setProofPackage] = useState<BlindPolicyProofPackage | null>(null);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [onchainReceipt, setOnchainReceipt] = useState<OnchainReceiptResponse["onchainReceipt"] | null>(null);

  const verified = verification?.ok === true || verification?.verification?.ok === true;
  const normalizedVerification = verification?.verification ?? verification;
  const normalizedCircuitVersion =
    normalizedVerification && "circuitVersion" in normalizedVerification ? normalizedVerification.circuitVersion : undefined;
  const circuitVersion = proofPackage?.circuitVersion ?? normalizedCircuitVersion ?? "Not available";
  const policyCommitment = proofPackage?.policyCommitment ?? "Not available";
  const receiptHash = proofPackage?.originalProofHash ?? normalizedVerification?.originalHash ?? onchainReceipt?.proofHash ?? "Not available";

  const samplePayload = useMemo(() => {
    if (!proofPackage) return "";
    return JSON.stringify({ publicProofPackage: proofPackage, onchainReceipt }, null, 2);
  }, [proofPackage, onchainReceipt]);

  function parseInput() {
    setError(undefined);
    if (!rawJson.trim()) throw new Error("Paste a proof package or receipt JSON first.");
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error("The pasted content is not valid JSON.");
    }
    const extractedProofPackage = extractProofPackage(parsed);
    const extractedReceipt = extractOnchainReceipt(parsed);
    const extractedVerification = extractVerification(parsed);
    if (!extractedProofPackage && !extractedReceipt && !extractedVerification) {
      throw new Error("JSON must include a publicProofPackage, proofPackage, onchainReceipt, or verification result.");
    }
    return { parsed, extractedProofPackage, extractedReceipt, extractedVerification };
  }

  async function verifyPackage() {
    setVerifying(true);
    setError(undefined);
    try {
      const { extractedProofPackage, extractedReceipt, extractedVerification } = parseInput();
      setOnchainReceipt(extractedReceipt ?? null);
      if (!extractedProofPackage) {
        setProofPackage(null);
        setVerification(extractedVerification);
        if (!extractedVerification?.ok) {
          setError("Receipt loaded. Paste the proof package too if you want cryptographic re-verification.");
        }
        return;
      }
      setProofPackage(extractedProofPackage);
      const response = await postJson<VerificationResponse>(localExecutionMode ? LOCAL_VERIFY_API : VERIFY_API, localExecutionMode ? LOCAL_VERIFY_API : VERIFY_FALLBACK_API, {
        publicProofPackage: extractedProofPackage,
      });
      setVerification(response);
    } catch (verificationError) {
      setProofPackage(null);
      setVerification(null);
      setOnchainReceipt(null);
      setError(verificationError instanceof Error ? verificationError.message : "Unable to verify this package.");
    } finally {
      setVerifying(false);
    }
  }

  async function storeReceiptOnSolana() {
    if (!proofPackage) {
      setError("Verify a proof package first, then store its receipt on Solana.");
      return;
    }
    setAnchoring(true);
    setError(undefined);
    try {
      const response = await postJson<OnchainReceiptResponse>(ONCHAIN_API, ONCHAIN_FALLBACK_API, {
        publicProofPackage: proofPackage,
      });
      if (!response.ok) {
        setError(response.error ?? "Solana receipt was not stored.");
      }
      setOnchainReceipt(response.onchainReceipt ?? null);
      if (response.verification) setVerification({ ok: response.verification.ok, status: response.verification.status, verification: response.verification });
    } catch (receiptError) {
      setError(receiptError instanceof Error ? receiptError.message : "Unable to store receipt on Solana.");
    } finally {
      setAnchoring(false);
    }
  }

  function loadLastProof() {
    try {
      const stored = window.localStorage.getItem(storedBlindPolicyProofKey);
      if (!stored) {
        setError("No recent Blind Policy proof found in this browser. Run the workflow first or paste a package.");
        return;
      }
      setRawJson(JSON.stringify({ publicProofPackage: JSON.parse(stored) }, null, 2));
      setError(undefined);
    } catch {
      setError("Stored proof package could not be read.");
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setRawJson(await file.text());
    setError(undefined);
  }

  return (
    <section className="rounded-[32px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cyan-100/78">
            <ShieldCheck className="h-4 w-4" />
            Blind proof verifier
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Paste a proof package or receipt. Verify it without CLI.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
            The verifier checks the public proof package, shows the circuit version, policy commitment, receipt hash,
            and links to the Solana receipt when available. Private inputs remain hidden.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={loadLastProof} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Load last proof
          </button>
          <label className={cn(buttonVariants({ size: "sm", variant: "outline" }), "cursor-pointer")}>
            <Upload className="h-4 w-4" />
            Upload JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <textarea
            value={rawJson}
            onChange={(event) => setRawJson(event.target.value)}
            spellCheck={false}
            placeholder='Paste {"publicProofPackage": {...}} or {"onchainReceipt": {...}} here'
            className="min-h-[320px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-6 text-white outline-none focus:border-cyan-200/50"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={verifyPackage} disabled={verifying} className={cn(buttonVariants({ size: "sm" }))}>
              <FileJson className="h-4 w-4" />
              {verifying ? "Verifying..." : "Verify package"}
            </button>
            <button
              type="button"
              onClick={storeReceiptOnSolana}
              disabled={anchoring || !proofPackage || !verified}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              {anchoring ? "Storing..." : "Store receipt on Solana"}
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <article className={`rounded-2xl border p-5 ${verified ? "border-emerald-300/24 bg-emerald-300/[0.08]" : "border-white/10 bg-black/22"}`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {verified ? <CheckCircle2 className="h-5 w-5 text-emerald-100" /> : <XCircle className="h-5 w-5 text-white/46" />}
              {verified ? "Verified" : verification ? "Not verified" : "Waiting for proof"}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {normalizedVerification?.message ?? "Paste a package or upload JSON, then press Verify."}
            </p>
          </article>

          {[
            ["Circuit Version", circuitVersion],
            ["Policy Commitment", policyCommitment],
            ["Receipt Hash", receiptHash],
            ["Proof ID", proofPackage?.proofId ?? onchainReceipt?.proofId ?? "Not available"],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">{label}</div>
              <div className="mt-2 break-all font-mono text-sm text-white/74">{hashPreview(value)}</div>
            </article>
          ))}

          <article className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">On-chain Receipt</div>
            {onchainReceipt ? (
              <div className="mt-3 grid gap-2 text-sm text-white/66">
                <div>Mode: <span className="text-white">{onchainReceipt.storageMode}</span></div>
                <div>Cluster: <span className="text-white">{onchainReceipt.cluster}</span></div>
                <div className="break-all">Transaction: {onchainReceipt.signature ?? "Existing receipt account"}</div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {onchainReceipt.transactionExplorerUrl ? (
                    <a href={onchainReceipt.transactionExplorerUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm" }))}>
                      Open Explorer
                    </a>
                  ) : null}
                  {onchainReceipt.storageMode === "anchor-pda" ? (
                    <a href={onchainReceipt.receiptAccountExplorerUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                      Open receipt account
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-white/58">No on-chain receipt loaded yet.</p>
            )}
          </article>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-300/18 bg-red-400/[0.08] p-4 text-sm leading-6 text-red-50/82">
          {error}
        </div>
      ) : null}

      {samplePayload ? (
        <details className="mt-4 rounded-2xl border border-white/10 bg-black/18 p-4">
          <summary className="cursor-pointer text-xs uppercase tracking-[0.22em] text-white/52">Show loaded package</summary>
          <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/28 p-4 text-xs leading-6 text-white/58">
            {samplePayload}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
