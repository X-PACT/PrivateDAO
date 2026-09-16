"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, FileLock2, Link2, ShieldCheck } from "lucide-react";
import { createUmbraDevnetWalletSession } from "@/lib/umbra-devnet-wallet";
import { provePayrollGroth16 } from "@/lib/payroll-groth16-proof";

type Row = { recipientAddress: string; amount: string; grossAmount?: string; taxAmount?: string; deductionsAmount?: string; memo?: string; employeeRef?: string };
type SimpleRow = { recipientAddress: string; grossAmount: string };
type Intent = Record<string, unknown>;
type PrivacyMode = "confidential" | "anonymous" | "policy";
const PAYROLL_API_BASE = (process.env.NEXT_PUBLIC_PAYROLL_API_BASE || "https://api.privatedao.org/api/v1").replace(/\/+$/, "");
type FeatureCard = { icon: typeof FileLock2; title: string; body: string };

const featureCards: FeatureCard[] = [
  { icon: FileLock2, title: "Private payroll", body: "Prepare employee payments without exposing the payroll file." },
  { icon: ShieldCheck, title: "Tax and policy checks", body: "Apply a consistent tax and deduction policy before approval." },
  { icon: Eye, title: "Blind Verification", body: "Prove the payroll was calculated and settled correctly without revealing salaries." },
  { icon: Link2, title: "One proof link", body: "Share a simple result with finance, auditors, or your board." },
];

const sample = JSON.stringify(
  [
    { recipientAddress: "B3STL1akxLGLvPpKd6Grz19jjVySkWrGgHFwGNK8yEZ", grossAmount: "1.00", memo: "devnet payroll test" },
    { recipientAddress: "4Q8GX1jzxuJTxxiPvoc9H1y7WTQcSsqdMQV79pDV53d", grossAmount: "1.00", memo: "devnet payroll test" },
    { recipientAddress: "FjTWJeYtmZALuyq96y8L9Pzqgkfkb7XWbszkpamkYW8q", grossAmount: "1.00", memo: "devnet payroll test" },
  ],
  null,
  2,
);

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (entry) => entry.toString(16).padStart(2, "0")).join("");
}

function cents(amount: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error("Devnet demo amounts must use at most two decimal places.");
  const [whole, fraction = ""] = amount.split(".");
  const value = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Each Devnet demo amount must be at least 0.01 WSOL.");
  return value;
}

function payrollValues(row: Row) {
  const grossCents = cents(row.grossAmount || row.amount);
  const taxCents = Math.round(grossCents * 0.1);
  const deductionsCents = Math.round(grossCents * 0.02);
  return { grossCents, taxCents, deductionsCents, netCents: grossCents - taxCents - deductionsCents };
}

function normalizeRows(rows: Row[]) {
  return rows.map((row) => {
    const values = payrollValues(row);
    return { ...row, amount: (values.netCents / 100).toFixed(2), grossAmount: (values.grossCents / 100).toFixed(2), taxAmount: (values.taxCents / 100).toFixed(2), deductionsAmount: (values.deductionsCents / 100).toFixed(2) };
  });
}

async function encryptLocally(plaintext: string, passphrase: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
  const ciphertextHash = await sha256(Array.from(new Uint8Array(ciphertext)).join(","));
  return { ciphertextHash, salt: Array.from(salt), iv: Array.from(iv) };
}

function validateRows(rows: Row[]) {
  if (!rows.length || rows.length > 500) return "Use between 1 and 500 recipients.";
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.recipientAddress.length < 32) return "Every recipient must be a valid Solana address.";
    try { payrollValues(row); } catch (error) { return error instanceof Error ? error.message : "Every amount must be valid."; }
    if (seen.has(row.recipientAddress)) return "Duplicate recipients are not allowed in one batch.";
    seen.add(row.recipientAddress);
  }
  return null;
}

export function UmbraPayrollControlRoom() {
  const [payload, setPayload] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("policy");
  const [intent, setIntent] = useState<Intent | null>(null);
  const [receipt, setReceipt] = useState<Intent | null>(null);
  const [simpleRows, setSimpleRows] = useState<SimpleRow[]>([{ recipientAddress: "", grossAmount: "" }]);
  const [draftRows, setDraftRows] = useState<Row[]>([]);
  const [walletSession, setWalletSession] = useState<Awaited<ReturnType<typeof createUmbraDevnetWalletSession>> | null>(null);
  const [payrollSession, setPayrollSession] = useState<{ token: string; wallet: string; expiresAt: string } | null>(null);
  const [status, setStatus] = useState("Add a payment batch. Employee details remain protected in this browser.");
  const [busy, setBusy] = useState(false);

  const canPrepare = useMemo(() => payload.trim().length > 0 && passphrase.length >= 8, [payload, passphrase]);

  function updateSimpleRows(nextRows: SimpleRow[]) {
    setSimpleRows(nextRows);
    setPayload(JSON.stringify(nextRows.filter((row) => row.recipientAddress || row.grossAmount), null, 2));
  }

  function loadSample() {
    setPayload(sample);
    setSimpleRows(JSON.parse(sample) as SimpleRow[]);
    setPassphrase("privatedao-devnet");
  }

  async function prepare() {
    setBusy(true);
    setReceipt(null);
    try {
      const rows = normalizeRows(JSON.parse(payload) as Row[]);
      const rowError = validateRows(rows);
      if (rowError) throw new Error(rowError);
      const encrypted = await encryptLocally(payload, passphrase);
      const commitment = await sha256(JSON.stringify({ encrypted, payloadVersion: "payroll-browser-aes-gcm-v1" }));
      const recipientHash = await sha256(rows.map((row) => row.recipientAddress).sort().join("|"));
      setDraftRows(rows);
      const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount), 0).toFixed(2);
      const response = await fetch(`${PAYROLL_API_BASE}/payroll/umbra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prepare",
          asset: "WSOL",
          recipientCount: rows.length,
          totalAmount,
          manifestCommitment: commitment,
          recipientHash,
          privacyTier: privacyMode === "policy" ? "selective-disclosure" : privacyMode,
          requiresAudit: privacyMode === "policy",
          unlinkabilityRequired: privacyMode === "anonymous",
          encryption: { algorithm: "AES-256-GCM", keyDerivation: "PBKDF2-SHA256-120000", ciphertextHash: encrypted.ciphertextHash },
        }),
      });
      const body = (await response.json()) as Intent;
      if (!response.ok || body.ok !== true) throw new Error(String(body.error ?? "Umbra preparation failed."));
      setIntent(body.intent as Intent);
      setStatus("Your private payroll is prepared. Review it, then approve the secure payout.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payroll preparation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function execute() {
    if (!intent) return;
    setBusy(true);
    try {
      const session = walletSession || await createUmbraDevnetWalletSession();
      setWalletSession(session);
      const auth = payrollSession || await session.authorizePayroll(PAYROLL_API_BASE);
      setPayrollSession(auth);
      const itemValues = draftRows.map((row, index) => {
        const values = payrollValues(row);
        return { recipientAddress: row.recipientAddress, recipientCommitment: "", employeeRefCiphertext: `devnet-${index}`, payoutId: `payout-${index + 1}`, ...values };
      });
      for (const item of itemValues) item.recipientCommitment = await sha256(item.recipientAddress);
      const publicItems = itemValues.map((item) => {
        const { recipientAddress, employeeRefCiphertext, ...publicItem } = item;
        void recipientAddress;
        void employeeRefCiphertext;
        return publicItem;
      });
      const batchCommitment = await sha256(JSON.stringify(publicItems));
      const recipientRoot = await sha256(itemValues.map((item) => item.recipientCommitment).sort().join("|"));
      const grossCents = itemValues.reduce((sum, item) => sum + item.grossCents, 0);
      const taxCents = itemValues.reduce((sum, item) => sum + item.taxCents, 0);
      const deductionsCents = itemValues.reduce((sum, item) => sum + item.deductionsCents, 0);
      const netCents = itemValues.reduce((sum, item) => sum + item.netCents, 0);
      const bootstrapResponse = await fetch(`${PAYROLL_API_BASE}/payroll`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ action: "bootstrap-devnet", manifestCommitment: String(intent.manifestCommitment), batchCommitment, recipientRoot, grossCents, taxCents, deductionsCents, netCents, idempotencyKey: `browser-${String(intent.intentId)}`, items: itemValues }) });
      const bootstrapBody = await bootstrapResponse.json() as { ok?: boolean; batch?: { batch?: Record<string, unknown>; items?: Array<Record<string, unknown>> }; error?: string };
      const durableBatch = bootstrapBody.batch;
      if (!bootstrapResponse.ok || !bootstrapBody.ok || !durableBatch?.batch || !durableBatch.items?.length) throw new Error(bootstrapBody.error || "Durable payroll batch creation failed.");
      setStatus("Payroll approved. Confirm the secure payout in your wallet when prompted.");
      await session.ensureWsolBalance(BigInt(netCents) * BigInt(10_000_000));
      await session.registerConfidential();
      const settlements: Array<{ recipient: string; signature: string; signatures: string[] }> = [];
      for (const [index, row] of draftRows.entries()) {
        const settlementBinding = await sha256(JSON.stringify({ version: "payroll-umbra-binding-v1", batchId: durableBatch.batch.batch_id, itemId: durableBatch.items[index].item_id, payoutId: durableBatch.items[index].payout_id, recipientCommitment: itemValues[index].recipientCommitment, netCents: itemValues[index].netCents }));
        const submission = await session.settleRecipient(row.recipientAddress, row.amount, `PDAO-PAYROLL:${String(intent.batchId)}`, settlementBinding);
        settlements.push({ recipient: row.recipientAddress, signature: submission.queueSignature, signatures: submission.signatures });
        const settlementResponse = await fetch(`${PAYROLL_API_BASE}/payroll`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ action: "settlement", batchId: durableBatch.batch.batch_id, itemId: durableBatch.items[index].item_id, idempotencyKey: `umbra-${durableBatch.items[index].item_id}`, state: "CONFIRMED", txSignature: submission.queueSignature, optionalDataHex: settlementBinding }) });
        const settlementBody = await settlementResponse.json() as { ok?: boolean; error?: string };
        if (!settlementResponse.ok || !settlementBody.ok) throw new Error(settlementBody.error || `Settlement record failed for recipient ${index + 1}.`);
      }
      const reconcileResponse = await fetch(`${PAYROLL_API_BASE}/payroll`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ action: "reconcile", batchId: durableBatch.batch.batch_id }) });
      const reconcileBody = await reconcileResponse.json() as { ok?: boolean; reconciliation?: Record<string, unknown>; error?: string };
      if (!reconcileResponse.ok || !reconcileBody.ok || !reconcileBody.reconciliation) throw new Error(reconcileBody.error || "Payroll reconciliation failed.");
      const batchResponse = await fetch(`${PAYROLL_API_BASE}/payroll`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ action: "get", batchId: durableBatch.batch.batch_id }) });
      const batchBody = await batchResponse.json() as { ok?: boolean; batch?: Record<string, unknown>; items?: Array<Record<string, unknown>>; error?: string };
      if (!batchResponse.ok || !batchBody.ok || !batchBody.batch || !batchBody.items) throw new Error(batchBody.error || "Reconciled payroll batch could not be loaded.");
      const settlementItems = batchBody.items.slice().sort((a, b) => String(a.payout_id).localeCompare(String(b.payout_id))).map((item) => ({ payoutId: item.payout_id, netCents: item.net_cents, recipientCommitment: item.recipient_commitment, txSignature: item.tx_signature }));
      const settlementRoot = await sha256(JSON.stringify(settlementItems));
      const proof = await provePayrollGroth16({ manifestCommitment: String(batchBody.batch.manifest_commitment), settlementRoot, policyHash: String(batchBody.batch.policy_hash) });
      const verificationResponse = await fetch(`${PAYROLL_API_BASE}/payroll`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ action: "create-verification", batchId: durableBatch.batch.batch_id, scope: "public", expiresAt: new Date(Date.now() + 86400000).toISOString(), proof: proof.proof, publicSignals: proof.publicSignals }) });
      const verificationBody = await verificationResponse.json() as { ok?: boolean; verification?: Record<string, unknown>; error?: string };
      if (!verificationResponse.ok || !verificationBody.ok || !verificationBody.verification) throw new Error(verificationBody.error || "Payroll verification record creation failed.");
      setReceipt({ provider: "umbra", network: "solana-devnet", batchId: durableBatch.batch.batch_id, status: "verified", settlements, reconciliation: reconcileBody.reconciliation, verification: verificationBody.verification });
      setStatus("Payroll completed and verified. Your shareable proof link is ready.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Umbra execution failed.");
    } finally {
      setBusy(false);
    }
  }

  const verificationUrl = receipt && typeof receipt.verification === "object" && receipt.verification !== null && "verificationUrl" in receipt.verification && typeof receipt.verification.verificationUrl === "string" ? receipt.verification.verificationUrl : null;

  return (
    <section className="rounded-[28px] border border-cyan-300/18 bg-cyan-300/[0.06] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">
        <ShieldCheck className="h-4 w-4" /> Confidential payroll workspace
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Run payroll with confidence</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-white/66">
        Calculate gross pay, taxes, and deductions privately, approve the final net payroll, and share proof that the process was completed correctly.
        Your team can verify the outcome without receiving employee names, salaries, or individual payment details.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map(({ icon: Glyph, title, body }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4"><Glyph className="h-4 w-4 text-cyan-100" /><div className="mt-3 text-sm font-medium text-white">{title}</div><div className="mt-1 text-xs leading-5 text-white/55">{body}</div></div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/12 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div><div className="text-sm font-medium text-white">Employees and payments</div><p className="mt-1 text-xs text-white/50">Enter gross pay. The demo policy applies 10% tax and 2% deductions before private settlement.</p></div>
              <button type="button" className="text-xs font-semibold text-cyan-100 hover:text-white" onClick={() => updateSimpleRows([...simpleRows, { recipientAddress: "", grossAmount: "" }])}>Add employee</button>
            </div>
            <div className="mt-4 space-y-3">
              {simpleRows.map((row, index) => <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                <input aria-label={`Recipient ${index + 1}`} className="min-w-0 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none" value={row.recipientAddress} onChange={(event) => { const next = simpleRows.slice(); next[index] = { ...row, recipientAddress: event.target.value }; updateSimpleRows(next); }} placeholder="Recipient wallet address" />
                <input aria-label={`Gross pay ${index + 1}`} className="rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none" value={row.grossAmount} onChange={(event) => { const next = simpleRows.slice(); next[index] = { ...row, grossAmount: event.target.value }; updateSimpleRows(next); }} placeholder="Gross pay" inputMode="decimal" />
                <button type="button" aria-label={`Remove recipient ${index + 1}`} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white disabled:opacity-30" disabled={simpleRows.length === 1} onClick={() => updateSimpleRows(simpleRows.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>
              </div>)}
            </div>
          </div>
          <details className="rounded-2xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-xs font-medium text-white/65">Advanced import</summary><textarea aria-label="Advanced payroll JSON" className="mt-3 min-h-[130px] w-full rounded-xl border border-white/12 bg-black/30 p-3 font-mono text-xs text-white outline-none" value={payload} onChange={(event) => setPayload(event.target.value)} placeholder="Paste a payroll JSON batch" /></details>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none" type="password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder="Protect payroll data" aria-label="Protect payroll data" />
            <button type="button" className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white hover:bg-white/[0.1]" onClick={loadSample}>Try a sample batch</button>
          </div>
          <div className="rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] p-3 text-xs leading-5 text-white/70">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><ShieldCheck className="h-4 w-4 text-cyan-100" /> Payroll assurance</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div><div className="text-white/45">1. Calculate</div><div className="text-white/75">Gross pay, taxes, deductions</div></div>
              <div><div className="text-white/45">2. Approve</div><div className="text-white/75">Policy checked before payout</div></div>
              <div><div className="text-white/45">3. Verify</div><div className="text-white/75">Share proof, keep details private</div></div>
            </div>
            <p className="mt-3 text-white/55">Demo policy: 10% tax + 2% deductions. The approved calculation, private settlement, and Blind Verification proof stay linked to one batch.</p>
          </div>
          <label className="block text-sm text-white/70">Payroll privacy mode
            <select className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none" value={privacyMode} onChange={(event) => setPrivacyMode(event.target.value as PrivacyMode)}>
              <option value="confidential">Confidential: hide salary amounts, preserve recipient relationship</option>
              <option value="anonymous">Anonymous: request stronger recipient unlinkability</option>
              <option value="policy">Policy-based: route according to audit and payroll policy</option>
            </select>
          </label>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Your payroll journey</div>
          <div className="mt-3 space-y-2 text-sm text-white/72">
            {[["1", "Prepare privately"], ["2", "Review the policy"], ["3", "Approve the payout"], ["4", "Share the proof"]].map(([n, label], index) => <div key={n} className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-full border ${index === 0 && payload ? "border-emerald-300/40 text-emerald-100" : "border-white/15 text-white/55"}`}>{n}</span>{label}</div>)}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/60">{status}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={!canPrepare || busy} onClick={() => void prepare()} className="rounded-xl bg-[linear-gradient(135deg,#14f195,#00c2ff)] px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40">{busy ? "Working..." : "Prepare private batch"}</button>
            <button type="button" disabled={!intent || busy} onClick={() => void execute()} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-40">Approve and pay</button>
          </div>
        </div>
      </div>

      {intent ? <div className="mt-4 rounded-2xl border border-emerald-300/16 bg-emerald-300/[0.06] p-4 text-xs text-white/70"><div className="flex items-center gap-2 text-emerald-100"><CheckCircle2 className="h-4 w-4" /> Payroll prepared for approval</div><p className="mt-2 text-white/60">Taxes and deductions are calculated. Review the policy before approving the private payout.</p></div> : null}
      {receipt ? <div className="mt-4 rounded-2xl border border-cyan-300/16 bg-cyan-300/[0.06] p-4 text-xs text-white/70"><div className="flex items-center gap-2 text-cyan-100"><CheckCircle2 className="h-4 w-4" /> Payroll completed privately</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-white/45">Gross payroll</div><div className="mt-1 text-base font-semibold text-white">{(draftRows.reduce((sum, row) => sum + payrollValues(row).grossCents, 0) / 100).toFixed(2)} WSOL</div></div><div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-white/45">Taxes + deductions</div><div className="mt-1 text-base font-semibold text-white">{((draftRows.reduce((sum, row) => sum + payrollValues(row).taxCents + payrollValues(row).deductionsCents, 0)) / 100).toFixed(2)} WSOL</div></div><div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-white/45">Net settlement</div><div className="mt-1 text-base font-semibold text-white">{(draftRows.reduce((sum, row) => sum + payrollValues(row).netCents, 0) / 100).toFixed(2)} WSOL</div></div><div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-white/45">Policy</div><div className="mt-1 text-base font-semibold text-emerald-100">Passed</div></div></div><div className="mt-4 rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] p-3"><div className="flex items-center gap-2 text-sm font-medium text-white"><ShieldCheck className="h-4 w-4 text-cyan-100" /> Blind Verification proof</div><p className="mt-1 leading-5 text-white/60">The proof confirms the approved tax policy, payroll totals, private settlement, and reconciliation without exposing employee names, salaries, or individual payment details.</p></div><p className="mt-4 text-white/60">The result is ready to share with finance, auditors, or your board.</p>{verificationUrl ? <a className="mt-3 inline-flex rounded-lg border border-cyan-200/30 px-3 py-2 text-cyan-100 hover:bg-cyan-200/10" href={verificationUrl}>Share verified proof</a> : null}</div> : null}
    </section>
  );
}
