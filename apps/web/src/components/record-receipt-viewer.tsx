"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { OperationsShell } from "@/components/operations-shell";
import { publicRecordApiUrl } from "@/lib/record-api";

type RecordReceipt = { record_type: string; record_id: string; issuer: string; verification_status: string; canonical_record_digest: string; anchor_reference: string | null; anchor_status?: string; anchor_signature?: string | null; anchor_slot?: number | null; anchor_cluster?: string | null; anchor_program_id?: string | null; public_fields: Record<string, unknown> };

export function RecordReceiptViewer({ receiptId }: { receiptId: string }) {
  const [state, setState] = useState<{ loading: boolean; receipt?: RecordReceipt; error?: string }>({ loading: true });
  useEffect(() => {
    if (!receiptId) return;
    let active = true;
    fetch(`${publicRecordApiUrl("/receipts")}/${encodeURIComponent(receiptId)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Receipt not found.");
        if (active) setState({ loading: false, receipt: body.receipt });
      })
      .catch((error) => { if (active) setState({ loading: false, error: error.message }); });
    return () => { active = false; };
  }, [receiptId]);
  const error = state.error || (!receiptId ? "Receipt ID is required." : "");
  return <OperationsShell eyebrow="Public receipt" title="Record verification result" description="A walletless, public view of the fields and evidence approved for sharing." navigationMode="guided" badges={[]}><section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-black/20 p-6 sm:p-8">{receiptId && state.loading && <p className="text-white/60">Loading receipt...</p>}{error && <div className="text-red-100"><XCircle className="mr-2 inline" />{error}</div>}{state.receipt && <><div className="flex items-center gap-3 text-emerald-100"><CheckCircle2 className="h-7 w-7" /><span className="text-2xl font-semibold">{state.receipt.verification_status}</span></div><div className="mt-6 grid gap-4 text-sm"><div><div className="text-white/45">Record</div><div className="mt-1 text-white">{state.receipt.record_type} / {state.receipt.record_id}</div></div><div><div className="text-white/45">Issuer</div><div className="mt-1 text-white">{state.receipt.issuer}</div></div><div><div className="text-white/45">Canonical digest</div><div className="mt-1 break-all font-mono text-xs text-cyan-100">{state.receipt.canonical_record_digest}</div></div><div><div className="text-white/45">Solana anchor</div><div className="mt-1 text-white">{state.receipt.anchor_status === "confirmed" ? `${state.receipt.anchor_cluster || "Solana"} confirmed` : state.receipt.anchor_status || "Pending"}</div>{state.receipt.anchor_signature && <div className="mt-1 break-all font-mono text-xs text-cyan-100">{state.receipt.anchor_signature}</div>}{state.receipt.anchor_slot !== null && state.receipt.anchor_slot !== undefined && <div className="mt-1 text-white/55">Slot {state.receipt.anchor_slot}</div>}</div></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="text-sm font-medium text-white">Public fields</div><pre className="mt-3 overflow-auto text-xs leading-6 text-white/68">{JSON.stringify(state.receipt.public_fields, null, 2)}</pre></div></>}</section></OperationsShell>;
}
