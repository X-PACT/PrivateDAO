"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Play, XCircle } from "lucide-react";

import { demoProofId } from "@/lib/proof-workflow-demo-data";
import { persistCreditLimitProofPackage } from "@/components/proof-workflow-verification-panel";
import type { CreditLimitPublicProofPackage } from "@/lib/proof-workflow-proof-package";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CREDIT_LIMIT_API = "https://api.privatedao.org/api/v1/proof-workflows/credit-limit/run";

type CreditLimitProofResult = {
  ok: boolean;
  status?: string;
  workflowId: string;
  publicOutcome: string;
  issuedCreditLimitUsd: number;
  currency: string;
  proofHash?: string;
  publicProofPackage?: CreditLimitPublicProofPackage;
  decisionSummary?: {
    title: string;
    message: string;
    customerBenefit: string;
  };
  resultBasis?: {
    proMembershipVerified: boolean;
    importedRecordCount: number;
    riskBand: string;
  };
  validationErrors?: string[];
  error?: string;
};

const sampleCustomerData = {
  customerId: "customer-live-demo-001",
  proMembership: true,
  currency: "USD",
  riskScore: 84,
  monthlyEarnings: 9200,
  payouts: [{ amountUsd: 8800 }, { amountUsd: 9400 }],
};

const simpleFlow = [
  ["Input", "Connect earnings data"],
  ["Processing", "Private credit policy runs"],
  ["Output", "Credit limit issued"],
  ["Verification", "Proof generated"],
] as const;

export function ProofWorkflowDemo() {
  const [running, setRunning] = useState(false);
  const [companyName, setCompanyName] = useState("Example Finance");
  const [customerId, setCustomerId] = useState(sampleCustomerData.customerId);
  const [monthlyEarnings, setMonthlyEarnings] = useState(String(sampleCustomerData.monthlyEarnings));
  const [payoutOne, setPayoutOne] = useState("8800");
  const [payoutTwo, setPayoutTwo] = useState("9400");
  const [policy, setPolicy] = useState("Conservative credit policy");
  const [showJson, setShowJson] = useState(false);
  const customerJson = JSON.stringify(
    {
      customerId,
      proMembership: true,
      currency: "USD",
      riskScore: policy === "Conservative credit policy" ? 84 : 78,
      monthlyEarnings: Number(monthlyEarnings),
      payouts: [{ amountUsd: Number(payoutOne) }, { amountUsd: Number(payoutTwo) }],
    },
    null,
    2,
  );
  const [result, setResult] = useState<CreditLimitProofResult>();
  const [failedResult, setFailedResult] = useState<CreditLimitProofResult>();

  async function runWorkflow() {
    setRunning(true);
    setResult(undefined);
    setFailedResult(undefined);

    try {
      const customerData = JSON.parse(customerJson) as typeof sampleCustomerData;
      const response = await fetch(CREDIT_LIMIT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "customer"}_credit_${Date.now()}`,
          customerData,
        }),
      });
      const payload = (await response.json()) as CreditLimitProofResult;
      if (!response.ok || !payload.ok) {
        setFailedResult(payload);
        return;
      }
      if (payload.publicProofPackage) persistCreditLimitProofPackage(payload.publicProofPackage);
      setResult(payload);
    } catch (error) {
      setFailedResult({
        ok: false,
        status: "request-failed",
        workflowId: "sample-credit-request-failed",
        publicOutcome: "proof-not-issued",
        issuedCreditLimitUsd: 0,
        currency: "USD",
        error: error instanceof Error ? error.message : "Unable to run workflow.",
      });
    } finally {
      setRunning(false);
    }
  }

  const issuedAmount = result ? `$${result.issuedCreditLimitUsd.toLocaleString("en-US")}` : "$2250";
  const importedRecords = result?.resultBasis?.importedRecordCount ?? 3;

  return (
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/76">Proof Workflow</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">Run a credit decision workflow.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">
              Enter a company, customer, earnings values, and policy. PrivateDAO checks the input, applies the policy,
              issues a decision, and generates a proof that can be verified publicly.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-white/70">
                Company
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Customer ID
                <input value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Monthly earnings
                <input value={monthlyEarnings} onChange={(event) => setMonthlyEarnings(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Policy
                <select value={policy} onChange={(event) => setPolicy(event.target.value)} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60">
                  <option>Conservative credit policy</option>
                  <option>Growth credit policy</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Earnings record 1
                <input value={payoutOne} onChange={(event) => setPayoutOne(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              </label>
              <label className="grid gap-2 text-sm text-white/70">
                Earnings record 2
                <input value={payoutTwo} onChange={(event) => setPayoutTwo(event.target.value)} inputMode="decimal" className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-cyan-200/60" />
              </label>
            </div>
            <button type="button" onClick={runWorkflow} disabled={running} className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
              <Play className="h-4 w-4" />
              {running ? "Running..." : "Run Workflow"}
            </button>
            <button type="button" onClick={() => setShowJson((value) => !value)} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-5 ml-3")}>
              {showJson ? "Hide input JSON" : "Show input JSON"}
            </button>
            {showJson ? (
              <pre className="mt-4 max-h-64 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/58">
                {customerJson}
              </pre>
            ) : null}
          </div>

          <div className="grid gap-2">
            {simpleFlow.map(([label, body], index) => (
              <div key={label} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/10 bg-black/22 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/22 bg-cyan-300/[0.1] text-sm text-cyan-50">
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
          <h2 className="mt-3 text-2xl font-semibold text-white">The workflow failed validation.</h2>
          <div className="mt-4 grid gap-2">
            {(failedResult.validationErrors ?? [failedResult.error ?? "The input data did not pass the required checks."]).map((item) => (
              <div key={item} className="rounded-2xl border border-red-300/18 bg-black/22 p-3 text-sm text-red-50/82">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="rounded-[28px] border border-emerald-300/22 bg-emerald-300/[0.08] p-5 sm:p-6">
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100/76">Decision complete</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Credit limit approved.</h2>
          <div className="mt-4 grid gap-3">
            {[
              "Customer is a verified Pro member.",
              `${importedRecords} earnings record${importedRecords === 1 ? " was" : "s were"} imported.`,
              "The private credit policy was applied.",
              `Based on the imported earnings and policy rules, a credit limit of ${issuedAmount} was approved.`,
              "A public proof was generated so third parties can verify that the process was followed without exposing earnings, thresholds, or internal policy details.",
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
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/proof-workflows/verify/${demoProofId}`} className={cn(buttonVariants({ size: "sm" }))}>
              View Public Proof
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <details className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-4 text-sm text-white/58">
            <summary className="cursor-pointer text-white/76">Technical details for auditors</summary>
            <div className="mt-3 grid gap-2">
              <div>Outcome: {result.publicOutcome}</div>
              <div>Workflow ID: {result.workflowId}</div>
              <div>Proof hash: {result.proofHash}</div>
              <div>Records imported: {result.resultBasis?.importedRecordCount ?? "verified"}</div>
              <div>Risk band: {result.resultBasis?.riskBand ?? "verified"}</div>
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}
