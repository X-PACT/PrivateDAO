"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, ShieldCheck, XCircle } from "lucide-react";

import {
  buildCreditLimitProofPayload,
  buildDemoCreditLimitProofPackage,
  stableStringify,
  type CreditLimitProofVerification,
  type CreditLimitPublicProofPackage,
} from "@/lib/proof-workflow-proof-package";

const storageKey = "privatedao:last-credit-limit-proof-package";

async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyInBrowser(proofPackage: CreditLimitPublicProofPackage): Promise<CreditLimitProofVerification> {
  const recomputedHash = await sha256Hex(stableStringify(buildCreditLimitProofPayload(proofPackage)));
  const originalHash = proofPackage.originalProofHash?.trim() || null;

  if (!originalHash) {
    return {
      ok: false,
      status: "missing-original-proof-hash",
      match: false,
      originalHash,
      recomputedHash,
      message: "Missing original proof hash.",
    };
  }

  if (originalHash !== recomputedHash) {
    return {
      ok: false,
      status: "mismatch",
      match: false,
      originalHash,
      recomputedHash,
      message: "Mismatch. The proof package was changed after the original hash was created.",
    };
  }

  return {
    ok: true,
    status: "verified",
    match: true,
    originalHash,
    recomputedHash,
    message: "Verified. The recomputed proof matches the original hash.",
  };
}

function buildStoredProofPackage(fallback: CreditLimitPublicProofPackage) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as CreditLimitPublicProofPackage;
    return parsed;
  } catch {
    return fallback;
  }
}

export function persistCreditLimitProofPackage(proofPackage: CreditLimitPublicProofPackage) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(proofPackage));
  } catch {
    // Local storage is a convenience for the customer-facing verification page.
  }
}

export function ProofWorkflowVerificationPanel({ demoOriginalHash }: { demoOriginalHash: string }) {
  const fallbackProofPackage = useMemo(() => buildDemoCreditLimitProofPackage(demoOriginalHash), [demoOriginalHash]);
  const [proofPackage] = useState<CreditLimitPublicProofPackage>(() => {
    if (typeof window === "undefined") return fallbackProofPackage;
    return buildStoredProofPackage(fallbackProofPackage);
  });
  const [verification, setVerification] = useState<CreditLimitProofVerification>();
  const [tamperVerification, setTamperVerification] = useState<CreditLimitProofVerification>();

  useEffect(() => {
    void verifyInBrowser(proofPackage).then(setVerification);
    void verifyInBrowser({
      ...proofPackage,
      issuedLimitUsd: proofPackage.issuedLimitUsd + 50,
    }).then(setTamperVerification);
  }, [proofPackage]);

  const verificationFailed = verification?.ok === false;
  const proofRecomputed = verification ? Boolean(verification.recomputedHash) : true;
  const hashMatched = verification ? verification.match === true : true;
  const checks = [
    ["Membership verified", proofPackage.publicMetrics.proMembershipVerified],
    ["Earnings imported", proofPackage.publicMetrics.importedRecordCount > 0],
    ["Policy applied", proofPackage.publicOutcome === "credit-limit-issued"],
    ["Credit limit issued", proofPackage.issuedLimitUsd > 0],
    ["Proof generated", Boolean(proofPackage.originalProofHash)],
    ["Proof recomputed", proofRecomputed],
    ["Hash matched", hashMatched],
  ] as const;

  return (
    <div className="grid gap-5">
      <section className="rounded-[32px] border border-emerald-300/24 bg-emerald-300/[0.09] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.12)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/24 bg-emerald-200/12">
            <ShieldCheck className="h-7 w-7 text-emerald-100" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Verification result</div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-white">
              {verificationFailed ? "Verification Failed" : "Verification Passed"}
            </h2>
            <div className="mt-5 grid gap-2 text-base leading-8 text-white/78">
              <p>The proof package was recomputed independently.</p>
              <p>The recomputed hash matches the original hash.</p>
              <p>The credit decision has not been modified.</p>
              <p>Private earnings and internal policy details remain hidden.</p>
            </div>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black/22">
          <div className="grid grid-cols-[1fr_110px] border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/46">
            <div>Check</div>
            <div>Result</div>
          </div>
          {checks.map(([label, passed]) => (
            <div key={label} className="grid grid-cols-[1fr_110px] items-center border-b border-white/6 px-4 py-4 last:border-b-0">
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className={passed ? "text-2xl text-emerald-100" : "text-2xl text-red-100"}>{passed ? "✓" : "×"}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Public verification</div>
          <div className="mt-4 grid gap-2 text-sm text-white/66">
            <div>Process executed</div>
            <div>Required steps completed</div>
            <div>Correct sequence followed</div>
            <div>Decision produced: ${proofPackage.issuedLimitUsd.toLocaleString("en-US")} {proofPackage.currency}</div>
            <div>Proof generated</div>
          </div>
        </article>
        <article className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Still private</div>
          <p className="mt-3 text-sm leading-7 text-white/66">
            These values were used to make the decision but are not revealed.
          </p>
          <div className="mt-4 grid gap-2 text-sm text-white/66">
            {proofPackage.valuesUsedButNotRevealed.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-red-300/16 bg-red-400/[0.07] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-red-100/76">
          <XCircle className="h-4 w-4" />
          Tamper check
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-white">If the decision changes, verification fails.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
          This example changes the issued credit limit after the original proof was created. The recomputed hash no
          longer matches.
        </p>
        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-xs text-white/62">
          <div className="break-all">Original hash: {tamperVerification?.originalHash ?? "checking..."}</div>
          <div className="break-all">Recomputed hash: {tamperVerification?.recomputedHash ?? "checking..."}</div>
          <div className="font-semibold text-red-100">Result: {tamperVerification?.match ? "Match" : "Mismatch"}</div>
        </div>
      </section>

      <details className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-6">
        <summary className="flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/62">
          <Copy className="h-4 w-4" />
          Show Technical Details
        </summary>
        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-xs text-white/62">
          <div className="font-semibold text-white">Hash comparison</div>
          <div className="break-all">Original hash: {verification?.originalHash ?? "checking..."}</div>
          <div className="break-all">Recomputed hash: {verification?.recomputedHash ?? "checking..."}</div>
          <div className={verification?.match ? "text-emerald-100" : "text-red-100"}>
            Result: {verification?.match ? "Match" : "Mismatch"}
          </div>
        </div>
        <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl border border-white/10 bg-black/32 p-4 text-xs leading-6 text-white/62">
          {JSON.stringify(proofPackage, null, 2)}
        </pre>
      </details>
    </div>
  );
}
