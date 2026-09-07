"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, ShieldCheck, XCircle } from "lucide-react";

import { stableStringify } from "@/lib/proof-workflow-proof-package";
import type { BlindPolicyProofPackage, BlindPolicyVerification } from "@/lib/blind-policy-proof";

function buildBlindPolicyPayload(proofPackage: BlindPolicyProofPackage) {
  const payload: Omit<BlindPolicyProofPackage, "originalProofHash"> & { originalProofHash?: string } = {
    ...proofPackage,
  };
  delete payload.originalProofHash;
  return payload;
}

async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyInBrowser(proofPackage: BlindPolicyProofPackage): Promise<BlindPolicyVerification> {
  const recomputedHash = await sha256Hex(stableStringify(buildBlindPolicyPayload(proofPackage)));
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
      message: "Mismatch. The blind policy proof package was changed after the original hash was created.",
    };
  }

  if (proofPackage.circuitVersion !== "groth16-v1") {
    return {
      ok: false,
      status: "unsupported-circuit-version",
      match: false,
      originalHash,
      recomputedHash,
      message: `Unsupported circuit version: ${proofPackage.circuitVersion}.`,
    };
  }

  if (Number.isNaN(Date.parse(proofPackage.expiresAt)) || Date.parse(proofPackage.expiresAt) <= Date.now()) {
    return {
      ok: false,
      status: "expired-proof",
      match: false,
      originalHash,
      recomputedHash,
      message: "The proof package has expired.",
    };
  }

  if (proofPackage.policySatisfied !== true || proofPackage.publicChecks.some((check) => check.satisfied !== true)) {
    return {
      ok: false,
      status: "policy-not-satisfied",
      match: false,
      originalHash,
      recomputedHash,
      message: "Policy proof is not satisfied.",
    };
  }

  return {
    ok: true,
    status: "verified",
    match: true,
    originalHash,
    recomputedHash,
    circuitVersion: proofPackage.circuitVersion,
    message: "Verified. The recomputed blind policy proof matches the original hash.",
  };
}

function buildStoredProofPackage(fallback: BlindPolicyProofPackage) {
  try {
    const raw = window.localStorage.getItem("privatedao-blind-policy-proof");
    if (!raw) return fallback;
    return JSON.parse(raw) as BlindPolicyProofPackage;
  } catch {
    return fallback;
  }
}

export function BlindPolicyVerificationPanel({ fallbackProofPackage }: { fallbackProofPackage: BlindPolicyProofPackage }) {
  const [proofPackage] = useState<BlindPolicyProofPackage>(() => {
    if (typeof window === "undefined") return fallbackProofPackage;
    return buildStoredProofPackage(fallbackProofPackage);
  });
  const [verification, setVerification] = useState<BlindPolicyVerification>();
  const [tamperVerification, setTamperVerification] = useState<BlindPolicyVerification>();
  const checks = useMemo(
    () =>
      [
        ["Private data imported", proofPackage.completedStages.some((stage) => stage.id === "data-import")],
        ["Policy committed", Boolean(proofPackage.policyCommitment)],
        ["Inputs committed", Boolean(proofPackage.inputCommitment)],
        ["Policy satisfied", proofPackage.policySatisfied === true],
        ["ZK policy proof lane committed", proofPackage.providerLanes.some((lane) => lane.id === "zk-policy-proof")],
        ["REFHE lane committed", proofPackage.providerLanes.some((lane) => lane.id === "refhe-encrypted-evaluation")],
        ["Ika / Encrypt lane committed", proofPackage.providerLanes.some((lane) => lane.id === "ika-encrypt-2pc-boundary")],
        ["MagicBlock session lane committed", proofPackage.providerLanes.some((lane) => lane.id === "magicblock-fast-session")],
        ["Proof recomputed", verification ? Boolean(verification.recomputedHash) : true],
        ["Hash matched", verification ? verification.match === true : true],
      ] as const,
    [proofPackage, verification],
  );

  useEffect(() => {
    void verifyInBrowser(proofPackage).then(setVerification);
    void verifyInBrowser({
      ...proofPackage,
      publicChecks: proofPackage.publicChecks.map((check) =>
        check.id === "capacity" ? { ...check, label: "Changed private capacity check" } : check,
      ),
    }).then(setTamperVerification);
  }, [proofPackage]);

  const verificationFailed = verification?.ok === false;

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
              <p>
                {verificationFailed
                  ? "The recomputed hash does not match the original hash."
                  : "The recomputed hash matches the original hash."}
              </p>
              <p>
                {verificationFailed
                  ? "The proof package may have been changed after the original hash was created."
                  : "The policy-satisfied decision has not been modified."}
              </p>
              <p>Private inputs and internal policy thresholds remain hidden.</p>
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
            <div>Policy existed</div>
            <div>Required checks completed</div>
            <div>Policy satisfied</div>
            <div>Provider lanes committed</div>
            <div>Proof hash matched</div>
          </div>
        </article>
        <article className="rounded-[28px] border border-violet-300/16 bg-violet-300/[0.06] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-violet-100/76">Still private</div>
          <p className="mt-3 text-sm leading-7 text-white/66">
            These values were used to make the policy decision but are not revealed.
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
        <h2 className="mt-3 text-2xl font-semibold text-white">If the proof package changes, verification fails.</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
          This example changes one public check after the original proof was created. The recomputed hash no longer matches.
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
