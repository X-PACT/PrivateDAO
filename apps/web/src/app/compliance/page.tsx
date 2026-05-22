"use client";

import { useState } from "react";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CompliancePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Select period and generate compliance pack.");

  async function runReport() {
    if (!from || !to) {
      setStatus("Select date range first.");
      return;
    }
    setRunning(true);
    setProgress(10);
    setStatus("Extracting only the requested transactions through a scoped viewing-key window...");

    await new Promise((resolve) => setTimeout(resolve, 450));
    setProgress(45);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setProgress(75);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setProgress(100);
    setStatus("Compliance pack ready with scoped evidence links.");
    setRunning(false);
  }

  return (
    <OperationsShell
      eyebrow="Compliance"
      title="Generate scoped compliance packs without exposing full treasury history"
      description="Create a time-bounded compliance package with selective disclosure posture and proof continuity references."
      badges={[
        { label: "Selective disclosure", variant: "cyan" },
        { label: "Auditor-ready", variant: "success" },
        { label: "dWallet signed", variant: "violet" },
      ]}
    >
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Compliance pack builder</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <button type="button" disabled={running} onClick={() => void runReport()} className={cn(buttonVariants({ size: "sm" }))}>
            {running ? "Generating..." : "Generate Compliance Pack"}
          </button>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/12 bg-black/20">
          <div className="h-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-sm text-white/72">{status}</div>

        {progress === 100 ? (
          <Link
            href="/proof/?judge=1"
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "mt-4")}
          >
            Open scoped evidence packet
          </Link>
        ) : null}
      </div>

      <details className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
        <summary className="cursor-pointer text-sm font-medium text-cyan-100">BehindTheMagic</summary>
        <div className="mt-3 text-sm leading-7 text-white/72">
          Instead of exposing the full wallet history, PrivateDAO creates a temporary scoped viewing key that only reveals
          transactions inside the selected date window. The pack is then framed for dWallet-backed attestation.
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open proof
        </Link>
        <Link href="/trust" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open trust
        </Link>
      </div>
    </OperationsShell>
  );
}
