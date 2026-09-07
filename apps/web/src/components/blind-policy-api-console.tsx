"use client";

import { useState } from "react";
import { CheckCircle2, Play, ShieldCheck, XCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApiResult = {
  label: string;
  ok: boolean;
  status?: string;
  payload: unknown;
};

const sampleInput = {
  workflowId: "blind_policy_api_console_case",
  privateInputs: {
    organizationId: "northstar-credit",
    subjectId: "customer-redacted-4381",
    membershipVerified: true,
    records: [{ amountUsd: 8800 }, { amountUsd: 9400 }, { amountUsd: 9200 }],
    riskScore: 84,
    liabilitiesUsd: 2400,
  },
};

export function BlindPolicyApiConsole() {
  const [running, setRunning] = useState<string>();
  const [result, setResult] = useState<ApiResult>();

  async function run(label: string, path: string, init?: RequestInit) {
    setRunning(label);
    try {
      const response = await fetch(path, init);
      const payload = (await response.json()) as { ok?: boolean; status?: string };
      setResult({ label, ok: response.ok && payload.ok !== false, status: payload.status, payload });
    } catch (error) {
      setResult({
        label,
        ok: false,
        status: "request-failed",
        payload: { error: error instanceof Error ? error.message : "Request failed." },
      });
    } finally {
      setRunning(undefined);
    }
  }

  async function proveAndVerify() {
    setRunning("Prove + verify");
    try {
      const proveResponse = await fetch("/api/v1/proof-workflows/blind-policy/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleInput),
      });
      const provePayload = (await proveResponse.json()) as {
        ok?: boolean;
        status?: string;
        publicProofPackage?: unknown;
      };
      if (!proveResponse.ok || !provePayload.ok || !provePayload.publicProofPackage) {
        setResult({ label: "Prove + verify", ok: false, status: provePayload.status, payload: provePayload });
        return;
      }
      const verifyResponse = await fetch("/api/v1/proof-workflows/blind-policy/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicProofPackage: provePayload.publicProofPackage }),
      });
      const verifyPayload = await verifyResponse.json();
      setResult({
        label: "Prove + verify",
        ok: verifyResponse.ok,
        status: typeof verifyPayload === "object" && verifyPayload && "status" in verifyPayload ? String(verifyPayload.status) : undefined,
        payload: { prove: provePayload, verify: verifyPayload },
      });
    } catch (error) {
      setResult({
        label: "Prove + verify",
        ok: false,
        status: "request-failed",
        payload: { error: error instanceof Error ? error.message : "Request failed." },
      });
    } finally {
      setRunning(undefined);
    }
  }

  return (
    <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.055] p-5 sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Interactive API console</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Try the verification API from the browser.</h2>
      <p className="mt-3 text-sm leading-7 text-white/62">
        This console calls the same Blind Policy endpoints used by the product page. Private inputs are accepted only by
        the proof endpoint; the public verification endpoint checks the proof package.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => run("Status", "/api/v1/proof-workflows/blind-policy/status")}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          disabled={Boolean(running)}
        >
          <ShieldCheck className="h-4 w-4" />
          Status
        </button>
        <button
          type="button"
          onClick={() => run("Sample", "/api/v1/proof-workflows/blind-policy/sample")}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          disabled={Boolean(running)}
        >
          Sample
        </button>
        <button
          type="button"
          onClick={proveAndVerify}
          className={cn(buttonVariants({ size: "sm" }))}
          disabled={Boolean(running)}
        >
          <Play className="h-4 w-4" />
          {running === "Prove + verify" ? "Running..." : "Prove + verify"}
        </button>
      </div>
      {result ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            {result.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-100" /> : <XCircle className="h-4 w-4 text-red-100" />}
            {result.label}: {result.status ?? (result.ok ? "ok" : "failed")}
          </div>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/58">
            {JSON.stringify(result.payload, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
