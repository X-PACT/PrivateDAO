"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, FileCheck2, LockKeyhole } from "lucide-react";
import { calculatePayroll, centsToAmount, type PayrollRow } from "@/lib/payroll-calculator";
import { publicRecordApiUrl } from "@/lib/record-api";

const demoRows: PayrollRow[] = [
  { employeeRef: "employee-redacted-01", grossCents: 850000, taxBps: 1800, deductionsCents: 12000, payoutKey: "payout-01" },
  { employeeRef: "employee-redacted-02", grossCents: 720000, taxBps: 1800, deductionsCents: 8500, payoutKey: "payout-02" },
  { employeeRef: "employee-redacted-03", grossCents: 640000, taxBps: 1800, deductionsCents: 7000, payoutKey: "payout-03" },
];
const policy = { policyId: "privatedao-payroll-demo-v1", budgetCents: 2500000, maxTaxBps: 2500, allowZeroDeductions: true };
type Receipt = { receipt_id: string; canonical_record_digest: string; verification_status: string };

export function ConfidentialPayrollVerification() {
  const [rows] = useState<PayrollRow[]>(demoRows);
  const [calculation, setCalculation] = useState<ReturnType<typeof calculatePayroll> | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [status, setStatus] = useState("Your payroll rows stay in this browser until you create a public proof.");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => { try { return calculatePayroll(rows, policy); } catch { return null; } }, [rows]);

  async function generateProof() {
    setBusy(true); setReceipt(null);
    try {
      const result = calculatePayroll(rows, policy);
      if (!result.budgetSatisfied || !result.policySatisfied || !result.arithmeticSatisfied) throw new Error("The payroll does not satisfy the approved policy.");
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(result.payoutDigestInput));
      const payoutDigest = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const record = { schema_version: "1", record_type: "confidential-payroll.v1", record_id: "payroll-" + crypto.randomUUID(), issuer: "privatedao.org", issued_at: new Date().toISOString(), payload: { payroll_status: "verified", policy_id: policy.policyId, employee_count: result.employeeCount, gross_commitment: "redacted", tax_commitment: "redacted", deductions_commitment: "redacted", net_commitment: "redacted", payout_digest: payoutDigest, budget_satisfied: result.budgetSatisfied, tax_policy_satisfied: result.policySatisfied, arithmetic_satisfied: result.arithmeticSatisfied, duplicate_payouts: result.duplicatePayouts, settlement_status: "not-yet-settled", privacy_notice: "Employee names, salaries, wallet addresses, and individual tax data are not disclosed." } };
      const schema = { type: "object", additionalProperties: false, required: ["payroll_status", "policy_id", "employee_count", "gross_commitment", "tax_commitment", "deductions_commitment", "net_commitment", "payout_digest", "budget_satisfied", "tax_policy_satisfied", "arithmetic_satisfied", "duplicate_payouts", "settlement_status", "privacy_notice"], properties: { payroll_status: { const: "verified" }, policy_id: { type: "string" }, employee_count: { type: "integer", minimum: 1 }, gross_commitment: { const: "redacted" }, tax_commitment: { const: "redacted" }, deductions_commitment: { const: "redacted" }, net_commitment: { const: "redacted" }, payout_digest: { type: "string" }, budget_satisfied: { const: true }, tax_policy_satisfied: { const: true }, arithmetic_satisfied: { const: true }, duplicate_payouts: { const: 0 }, settlement_status: { const: "not-yet-settled" }, privacy_notice: { type: "string" } } };
      const response = await fetch(publicRecordApiUrl("/records/verify"), { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "payroll-" + crypto.randomUUID() }, body: JSON.stringify({ record, schema, public_fields: ["payroll_status", "policy_id", "employee_count", "budget_satisfied", "tax_policy_satisfied", "arithmetic_satisfied", "duplicate_payouts", "settlement_status", "privacy_notice"] }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Blind/Record Verification was unavailable.");
      setCalculation(result); setReceipt(body.receipt); setStatus("The existing PrivateDAO Record Verification engine issued a portable payroll certificate.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Payroll proof failed."); } finally { setBusy(false); }
  }
  async function copyLink() { if (!receipt) return; await navigator.clipboard.writeText(window.location.origin + "/verify/payroll?receiptId=" + encodeURIComponent(receipt.receipt_id)); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  return <section className="rounded-[28px] border border-violet-300/20 bg-violet-300/[0.06] p-5 sm:p-6">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-violet-100/80"><LockKeyhole className="h-4 w-4" /> Payroll proof certificate</div>
    <h2 className="mt-3 text-2xl font-semibold text-white">Calculate privately. Verify publicly.</h2>
    <p className="mt-2 max-w-3xl text-sm leading-7 text-white/66">Run a complete browser demo with gross salary, tax, deductions, net payroll, budget and duplicate-payout checks. Only commitments and approved claims reach the existing Record Verification engine.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Gross", preview ? centsToAmount(preview.grossCents) : "—"], ["Tax + deductions", preview ? centsToAmount(preview.taxCents + preview.deductionsCents) : "—"], ["Net payroll", preview ? centsToAmount(preview.netCents) : "—"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-white/50">{label}</div><div className="mt-2 text-lg font-semibold text-white">{value}</div></div>)}</div>
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70"><div className="flex items-center gap-2 text-emerald-100"><CheckCircle2 className="h-4 w-4" /> {preview?.budgetSatisfied ? "Approved budget satisfied" : "Budget policy needs review"}</div><div className="mt-2">Employee-level values, names, wallets, and individual taxes remain local.</div></div>
    <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void generateProof()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy ? "Issuing certificate..." : "Generate verified payroll link"} <FileCheck2 className="h-4 w-4" /></button>{receipt && <button type="button" onClick={() => void copyLink()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy verification link"}</button>}</div>
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/60">{status}</div>
    {receipt && calculation && <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4 text-sm text-white/75"><div className="text-emerald-100">VERIFIED by PrivateDAO Record Verification</div><div className="mt-2 break-all font-mono text-xs text-cyan-100">{window.location.origin + "/verify/payroll?receiptId=" + receipt.receipt_id}</div><div className="mt-2 text-xs">The certificate proves the policy and arithmetic claims; settlement remains explicitly marked not-yet-settled until the Umbra Devnet lane is executed.</div></div>}
  </section>;
}
