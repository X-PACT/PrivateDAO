"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { RecordReceiptViewer } from "@/components/record-receipt-viewer";
import { OperationsShell } from "@/components/operations-shell";
import { publicRecordApiUrl } from "@/lib/record-api";

function PayrollVerificationViewer({ token }: { token: string }) {
  const [state, setState] = useState<{ loading: boolean; verification?: Record<string, unknown>; error?: string }>({ loading: true });
  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(`${publicRecordApiUrl("/payroll/verify")}/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Payroll verification not found.");
        if (active) setState({ loading: false, verification: body.verification });
      })
      .catch((error) => { if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Payroll verification failed." }); });
    return () => { active = false; };
  }, [token]);
  return <OperationsShell eyebrow="Public payroll proof" title="Payroll verification" description="A public, privacy-preserving view of the claims bound to a reconciled payroll settlement." navigationMode="guided" badges={[]}><section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-black/20 p-6 sm:p-8">{state.loading && <p className="text-white/60">Checking verification...</p>}{state.error && <div className="text-red-100"><XCircle className="mr-2 inline" />{state.error}</div>}{state.verification && <><div className={state.verification.status === "active" ? "flex items-center gap-3 text-emerald-100" : "flex items-center gap-3 text-amber-100"}><CheckCircle2 className="h-7 w-7" /><span className="text-2xl font-semibold">{state.verification.status === "active" ? "VERIFIED" : String(state.verification.status).toUpperCase()}</span></div><div className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><div className="text-white/45">Network</div><div className="mt-1 text-white">Solana Devnet</div></div><div><div className="text-white/45">Scope</div><div className="mt-1 text-white">{String(state.verification.scope)}</div></div><div><div className="text-white/45">Proof type</div><div className="mt-1 text-white">{String(state.verification.proofType || "Evidence binding")}</div></div><div><div className="text-white/45">Expires</div><div className="mt-1 text-white">{String(state.verification.expires_at)}</div></div></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-xs"><div className="text-white/50">Public commitments</div><div className="mt-3 break-all font-mono text-cyan-100">Proof: {String(state.verification.proof_hash)}</div><div className="mt-2 break-all font-mono text-cyan-100">Settlement root: {String(state.verification.settlement_root)}</div><p className="mt-4 leading-6 text-white/60">No employee names, salaries, recipient addresses, or individual tax data are disclosed.</p></div></>}</section></OperationsShell>;
}

function PayrollReceiptRoute() {
  const params = useSearchParams();
  const receiptId = params.get("receiptId") || "";
  const token = params.get("token") || "";
  return token ? <PayrollVerificationViewer token={token} /> : <RecordReceiptViewer receiptId={receiptId} />;
}

export default function PayrollReceiptPage() {
  return <Suspense fallback={<div className="p-8 text-white/60">Loading payroll certificate...</div>}><PayrollReceiptRoute /></Suspense>;
}
