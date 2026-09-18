"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, FileCheck2, Upload, XCircle } from "lucide-react";
import { publicRecordApiUrl } from "@/lib/record-api";
import { canonicalizeRecord } from "@/lib/record-verification";
import { proveRecordPrivately } from "@/lib/record-private-proof";

const example = JSON.stringify({ schema_version: "1", record_type: "financial.daily-record.v1", record_id: "financial-demo-001", issuer: "demo.privatedao.org", issued_at: "2026-08-07T12:00:00.000Z", payload: { company: "Example Co", result: "approved", amount: 1250, currency: "USD", internal_score: 0.91 } }, null, 2);
const schema = { type: "object", additionalProperties: false, required: ["company", "result", "amount", "currency", "internal_score"], properties: { company: { type: "string" }, result: { type: "string", enum: ["approved", "rejected"] }, amount: { type: "number", minimum: 0 }, currency: { type: "string", const: "USD" }, internal_score: { type: "number", minimum: 0, maximum: 1 } } };
type RecordReceipt = { receipt_id: string; record_type: string; record_id: string; canonical_record_digest: string; anchor_network: string; anchor_reference: string | null; anchor_status?: string; anchor_error?: string; anchor_signature?: string | null; anchor_cluster?: string | null; anchor_slot?: number | null; public_fields: Record<string, unknown>; verification_status: string };
type SimpleRecord = { company: string; result: "approved" | "rejected"; amount: string; currency: "USD"; internalScore: string };

export function RecordVerificationWorkbench() {
  const [raw, setRaw] = useState(example);
  const [mode, setMode] = useState<"integrity" | "private">("integrity");
  const [status, setStatus] = useState("ready");
  const [receipt, setReceipt] = useState<RecordReceipt | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState("");
  const [privateOrganization, setPrivateOrganization] = useState("Northstar Credit");
  const [privateSubject, setPrivateSubject] = useState("customer-redacted-4381");
  const [privateRecords, setPrivateRecords] = useState<[string, string, string]>(["8800", "9400", "9200"]);
  const [privateRisk, setPrivateRisk] = useState("84");
  const [privateLiabilities, setPrivateLiabilities] = useState("2400");
  const [simpleRecord, setSimpleRecord] = useState<SimpleRecord>({ company: "Example Co", result: "approved", amount: "1250", currency: "USD", internalScore: "0.91" });
  const parsed = useMemo(() => { try { return JSON.parse(raw); } catch { return null; } }, [raw]);

  function updateSimpleRecord(next: Partial<SimpleRecord>) {
    const values = { ...simpleRecord, ...next };
    setSimpleRecord(values);
    let base: Record<string, unknown> = {};
    try { base = JSON.parse(raw) as Record<string, unknown>; } catch { base = JSON.parse(example) as Record<string, unknown>; }
    setRaw(JSON.stringify({ ...base, payload: { ...(base.payload as Record<string, unknown> || {}), company: values.company, result: values.result, amount: Number(values.amount) || 0, currency: values.currency, internal_score: Number(values.internalScore) || 0 } }, null, 2));
  }

  async function verify() {
    setError(""); setReceipt(null); setProgress(""); setStatus("verifying");
    if (!parsed) { setStatus("error"); setError("Enter valid JSON before verifying."); return; }
    try {
      let record = parsed;
      let selectedSchema: Record<string, unknown> = schema;
      let publicProofPackage: unknown;
      if (mode === "private") {
        record = { ...parsed, payload: { company: parsed.payload?.company, result: parsed.payload?.result, currency: parsed.payload?.currency } };
        selectedSchema = { type: "object", additionalProperties: false, required: ["company", "result", "currency"], properties: { company: { type: "string" }, result: { type: "string", enum: ["approved", "rejected"] }, currency: { type: "string", const: "USD" } } };
        const canonical = await canonicalizeRecord(record);
        publicProofPackage = await proveRecordPrivately(canonical.canonical_digest, { organizationId: privateOrganization, subjectId: privateSubject, records: privateRecords.map(Number) as [number, number, number], riskScore: Number(privateRisk), liabilitiesUsd: Number(privateLiabilities) }, setProgress);
      }
      const response = await fetch(publicRecordApiUrl("/records/verify"), { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": `web_${crypto.randomUUID()}` }, body: JSON.stringify({ record, schema: selectedSchema, public_fields: ["company", "result", "currency"], mode, publicProofPackage }) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Record verification failed.");
      setReceipt(body.receipt);
      setStatus(body.receipt.anchor_status === "failed"
        ? "Record verified locally, but the Solana anchor failed. No on-chain certificate was issued."
        : "verified");
    } catch (cause) { setStatus("error"); setError(cause instanceof Error ? cause.message : "Verification failed."); }
  }

  async function loadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setRaw(await file.text());
  }

  async function copyReceipt() {
    if (!receipt) return;
    await navigator.clipboard.writeText(`${window.location.origin}/verify/record?receiptId=${encodeURIComponent(receipt.receipt_id)}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] uppercase tracking-[0.25em] text-cyan-100/70">New verification</div><h2 className="mt-2 text-xl font-semibold text-white">Submit a critical record</h2></div><FileCheck2 className="h-6 w-6 text-cyan-200" /></div>
      <div className="mt-5 grid grid-cols-2 gap-2" role="group" aria-label="Verification mode"><button type="button" onClick={() => setMode("integrity")} aria-pressed={mode === "integrity"} className={`rounded-xl border px-3 py-3 text-left text-sm ${mode === "integrity" ? "border-emerald-300/50 bg-emerald-300/10 text-white" : "border-white/10 text-white/58"}`}>Integrity<br /><span className="text-xs text-white/50">Prove the record was unchanged</span></button><button type="button" onClick={() => setMode("private")} aria-pressed={mode === "private"} className={`rounded-xl border px-3 py-3 text-left text-sm ${mode === "private" ? "border-violet-300/50 bg-violet-300/10 text-white" : "border-white/10 text-white/58"}`}>Private verification<br /><span className="text-xs text-white/50">Use a private proof package</span></button></div>
      {mode === "private" && <div className="mt-5 rounded-2xl border border-violet-300/20 bg-violet-300/[0.07] p-4"><div className="text-sm font-medium text-white">Private policy inputs</div><p className="mt-1 text-xs leading-5 text-white/55">These values stay in this browser. Only the verified Groth16 proof and public commitments are sent.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><input aria-label="Private organization" value={privateOrganization} onChange={(event) => setPrivateOrganization(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Organization" /><input aria-label="Private subject" value={privateSubject} onChange={(event) => setPrivateSubject(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Subject" /><input aria-label="Private record one" value={privateRecords[0]} onChange={(event) => setPrivateRecords([event.target.value, privateRecords[1], privateRecords[2]])} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Record 1" /><input aria-label="Private record two" value={privateRecords[1]} onChange={(event) => setPrivateRecords([privateRecords[0], event.target.value, privateRecords[2]])} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Record 2" /><input aria-label="Private record three" value={privateRecords[2]} onChange={(event) => setPrivateRecords([privateRecords[0], privateRecords[1], event.target.value])} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Record 3" /><input aria-label="Private risk score" value={privateRisk} onChange={(event) => setPrivateRisk(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Risk score" /><input aria-label="Private liabilities" value={privateLiabilities} onChange={(event) => setPrivateLiabilities(event.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Liabilities" /></div></div>}
      <div className="mt-5 text-sm font-medium text-white">Record details</div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-white/60">Organization<input aria-label="Organization" value={simpleRecord.company} onChange={(event) => updateSimpleRecord({ company: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
        <label className="text-xs text-white/60">Outcome<select aria-label="Outcome" value={simpleRecord.result} onChange={(event) => updateSimpleRecord({ result: event.target.value as SimpleRecord["result"] })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
        <label className="text-xs text-white/60">Amount<input aria-label="Amount" inputMode="decimal" value={simpleRecord.amount} onChange={(event) => updateSimpleRecord({ amount: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" /></label>
        <label className="text-xs text-white/60">Currency<input aria-label="Currency" value={simpleRecord.currency} readOnly className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60" /></label>
      </div>
      <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-xs font-medium text-white/70">Advanced import: Record JSON</summary><textarea id="record-json" aria-label="Advanced record JSON" value={raw} onChange={(event) => setRaw(event.target.value)} rows={12} spellCheck={false} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs leading-6 text-white outline-none focus:border-cyan-200/50" /></details>
      <div className="mt-3 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/72 hover:bg-white/5"><Upload className="h-4 w-4" />Upload JSON<input type="file" accept="application/json,.json" onChange={loadFile} className="sr-only" /></label><button type="button" onClick={verify} disabled={status === "verifying"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{status === "verifying" ? (progress || "Verifying...") : mode === "private" ? "Generate private proof" : "Verify record"}</button></div>
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100"><XCircle className="mr-2 inline h-4 w-4" />{error}</div>}
    </section>
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-7" aria-live="polite">
      <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">Verification result</div>
      {!receipt && <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-sm leading-7 text-white/52">Run a verification to receive a public, walletless receipt. Private fields are never included in the receipt.</div>}
      {receipt && <><div className={`mt-5 flex items-center gap-3 ${receipt.anchor_status === "failed" ? "text-amber-100" : "text-emerald-100"}`}><CheckCircle2 className="h-7 w-7" /><span className="text-2xl font-semibold">{receipt.anchor_status === "failed" ? "VERIFIED LOCALLY" : "VERIFIED"}</span></div><dl className="mt-6 grid gap-4 text-sm"><div><dt className="text-white/45">Record</dt><dd className="mt-1 text-white">{receipt.record_type} / {receipt.record_id}</dd></div><div><dt className="text-white/45">Canonical digest</dt><dd className="mt-1 break-all font-mono text-xs text-cyan-100">{receipt.canonical_record_digest}</dd></div><div><dt className="text-white/45">Solana anchor</dt><dd className="mt-1 text-white">{receipt.anchor_status === "confirmed" ? `${receipt.anchor_cluster || "Solana"} confirmed` : receipt.anchor_status || "Pending anchor configuration"}</dd>{receipt.anchor_status === "failed" && <dd className="mt-1 text-xs text-amber-100">{receipt.anchor_error || "The on-chain anchor did not complete."}</dd>}{receipt.anchor_signature && <dd className="mt-1 break-all font-mono text-xs text-cyan-100">{receipt.anchor_signature}</dd>}</div></dl><div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-sm font-medium text-white">Public fields</div><pre className="mt-3 overflow-auto text-xs leading-6 text-white/68">{JSON.stringify(receipt.public_fields, null, 2)}</pre></div><button type="button" onClick={copyReceipt} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy public receipt link"}</button></>}
    </section>
  </div>;
}
