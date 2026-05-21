
"use client";

import { useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepState = "idle" | "running" | "done" | "blocked";

type Step = {
  id: string;
  label: string;
  state: StepState;
  detail: string;
};

const API_BASE = process.env.NEXT_PUBLIC_PRIVATE_DAO_API_BASE || "https://api.privatedao.org";

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function stateClass(state: StepState) {
  if (state === "done") return "border-emerald-300/24 bg-emerald-300/[0.08] text-emerald-50";
  if (state === "running") return "border-cyan-300/24 bg-cyan-300/[0.08] text-cyan-50";
  if (state === "blocked") return "border-amber-300/24 bg-amber-300/[0.08] text-amber-50";
  return "border-white/10 bg-black/22 text-white/70";
}

export function EncryptIkaDesktopProofWorkbench() {
  const [steps, setSteps] = useState<Step[]>([
    { id: "browser-encryption", label: "Browser encryption", state: "idle", detail: "Desktop WebCrypto payload encryption runs locally before proof." },
    { id: "refhe-receipt", label: "REFHE receipt", state: "idle", detail: "Build encrypted payroll receipt and commitment continuity." },
    { id: "ika-sui", label: "Ika Sui readiness", state: "idle", detail: "Read Ika network encryption key and packages through @ika.xyz/sdk." },
    { id: "ika-solana", label: "Ika Solana pre-alpha", state: "idle", detail: "Read executable program and funded operator wallet on devnet." },
    { id: "ika-approval", label: "Ika approval intent", state: "idle", detail: "Prepare approval plan. Full dWallet DKG/sign remains the next execution boundary." },
  ]);
  const [preview, setPreview] = useState("Run a desktop proof action to see live output.");
  const [running, setRunning] = useState(false);

  function updateStep(id: string, state: StepState, detail?: string) {
    setSteps((current) => current.map((step) => (step.id === id ? { ...step, state, detail: detail ?? step.detail } : step)));
  }

  async function runDesktopProof() {
    setRunning(true);
    setPreview("Running desktop-only Encrypt / Ika / REFHE proof checks...");
    try {
      updateStep("browser-encryption", "running");
      const encoder = new TextEncoder();
      const payroll = JSON.stringify([
        { recipient: "desktop-reviewer-01.sol", amount: 1250, asset: "USDC" },
        { recipient: "desktop-reviewer-02.sol", amount: 950, asset: "USDC" },
      ]);
      const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(payroll));
      const ciphertextHex = Array.from(new Uint8Array(ciphertext), (byte) => byte.toString(16).padStart(2, "0")).join("");
      updateStep("browser-encryption", "done", "Desktop browser encrypted payroll payload with AES-GCM-256.");

      updateStep("refhe-receipt", "running");
      const refhe = await fetch(`${API_BASE}/api/v1/refhe/payroll/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext: ciphertextHex,
          inputCommitment: "desktop-input-commitment",
          computationCommitment: "desktop-sum-2200-usdc",
          policyHash: "desktop-policy-confidential-payroll",
          totalAmountCommitment: "desktop-total-2200",
          recipientCount: 2,
        }),
      }).then((response) => response.json());
      updateStep("refhe-receipt", refhe?.ok ? "done" : "blocked", refhe?.ok ? `Receipt ${refhe.receiptHash}` : "REFHE receipt route did not return ok.");

      updateStep("ika-sui", "running");
      const ikaSui = await fetch(`${API_BASE}/api/v1/ika/sui/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ network: "testnet" }),
      }).then((response) => response.json());
      updateStep("ika-sui", ikaSui?.ok ? "done" : "blocked", ikaSui?.ok ? "Ika SDK initialized and network key read." : "Ika Sui readiness failed.");

      updateStep("ika-solana", "running");
      const ikaSolana = await fetch(`${API_BASE}/api/v1/ika/solana-prealpha/readiness`).then((response) => response.json());
      const solanaReady = Boolean(ikaSolana?.solanaPreAlpha?.operator?.funded && ikaSolana?.solanaPreAlpha?.program?.executable);
      updateStep("ika-solana", solanaReady ? "done" : "blocked", solanaReady ? "Solana pre-alpha program executable and operator funded." : "Solana pre-alpha readiness boundary not met.");

      updateStep("ika-approval", "running");
      const approval = await fetch(`${API_BASE}/api/v1/ika/solana-prealpha/approval/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "PrivateDAO desktop confidential payroll approval",
          operationType: "confidential-payroll",
          curve: "ED25519",
          signatureScheme: "EddsaSha512",
        }),
      }).then((response) => response.json());
      updateStep("ika-approval", approval?.ok ? "done" : "blocked", approval?.ok ? "Approval intent prepared. DKG/sign execution is next." : "Approval intent failed.");

      setPreview(pretty({ browser: { encrypted: true, ciphertextBytes: ciphertext.byteLength }, refhe, ikaSui, ikaSolana, approval }));
    } catch (error) {
      setPreview(error instanceof Error ? error.message : "Desktop proof run failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.07] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/78">Desktop-only proof runner</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Encrypt / Ika / 2PC-MPC / REFHE execution truth board</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/66">
        This desktop route separates browser encryption, REFHE receipt generation, Ika SDK readiness, Solana pre-alpha readiness,
        and approval intent. It deliberately keeps dWallet DKG/signature execution marked as the next boundary until the full Ika
        pre-alpha signing transaction is wired.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => void runDesktopProof()} disabled={running} className={cn(buttonVariants({ size: "sm" }))}>
          {running ? "Running..." : "Run desktop proof"}
        </button>
        <Link href="/services/encrypt-ika-operations" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open Encrypt / Ika
        </Link>
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open Proof Center
        </Link>
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {steps.map((step) => (
          <div key={step.id} className={cn("rounded-[20px] border p-4", stateClass(step.state))}>
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">{step.state}</div>
            <div className="mt-2 text-sm font-semibold text-white">{step.label}</div>
            <div className="mt-2 text-xs leading-5 text-white/62">{step.detail}</div>
          </div>
        ))}
      </div>
      <pre className="mt-5 max-h-[620px] overflow-auto rounded-[24px] border border-white/10 bg-black/30 p-4 text-xs leading-6 text-cyan-100/82">
        {preview}
      </pre>
    </section>
  );
}
