"use client";

import { useEffect, useState } from "react";

import {
  fetchOperationReceiptTimeline,
  type OperationReceiptTimelineRow,
} from "@/lib/supabase/operation-receipts";

function formatTime(value: string) {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return timestamp.toLocaleString("en-GB", { hour12: false });
}

export function SupabaseOperationTimeline() {
  const [rows, setRows] = useState<OperationReceiptTimelineRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [message, setMessage] = useState<string>("Loading Supabase operation receipts...");
  const [operationFilter, setOperationFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [railFilter, setRailFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadTimeline() {
      setStatus("loading");
      const result = await fetchOperationReceiptTimeline(24);
      if (!active) return;

      if (result.error) {
        setRows(result.rows);
        setStatus("ready");
        setMessage(`Timeline note: ${result.error}`);
        return;
      }

      setRows(result.rows);
      setStatus("ready");
      setMessage(
        result.rows.length > 0
          ? `${result.rows.length} receipt entries loaded from Supabase.`
          : "Timeline will populate automatically after the first signed operation.",
      );
    }

    void loadTimeline();
    return () => {
      active = false;
    };
  }, []);

  const operationOptions = Array.from(new Set(rows.map((row) => row.operation_type))).sort();
  const assetOptions = Array.from(new Set(rows.map((row) => row.stablecoin_symbol))).sort();
  const railOptions = Array.from(new Set(rows.map((row) => row.private_settlement_rail))).sort();

  const filteredRows = rows.filter((row) => {
    const operationMatch = operationFilter === "all" || row.operation_type === operationFilter;
    const assetMatch = assetFilter === "all" || row.stablecoin_symbol === assetFilter;
    const railMatch = railFilter === "all" || row.private_settlement_rail === railFilter;
    return operationMatch && assetMatch && railMatch;
  });

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Supabase timeline</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Live operation receipts from storage</h2>
      <p className="mt-3 text-sm leading-7 text-white/64">{message}</p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none"
          value={operationFilter}
          onChange={(event) => setOperationFilter(event.target.value)}
        >
          <option value="all">All operations</option>
          {operationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none"
          value={assetFilter}
          onChange={(event) => setAssetFilter(event.target.value)}
        >
          <option value="all">All assets</option>
          {assetOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none"
          value={railFilter}
          onChange={(event) => setRailFilter(event.target.value)}
        >
          <option value="all">All rails</option>
          {railOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 text-xs text-white/58">
        Showing {filteredRows.length} of {rows.length} timeline receipts.
      </div>

      <div className="mt-4 grid gap-3">
        {status === "loading" ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
            Loading timeline...
          </div>
        ) : null}
        {status === "ready" && rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
            Timeline is ready and will populate after your first signed operation.
          </div>
        ) : null}
        {status === "ready" && rows.length > 0 && filteredRows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
            No receipts match current filters.
          </div>
        ) : null}
        {filteredRows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-white">{row.operation_type}</div>
              <div className="text-xs text-white/50">{formatTime(row.created_at)}</div>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-white/62 md:grid-cols-3">
              <div>Proposal: {row.proposal_id}</div>
              <div>Approval: {row.approval_state}</div>
              <div>Rail: {row.private_settlement_rail}</div>
              <div>Asset: {row.stablecoin_symbol}</div>
              <div>Audit: {row.audit_mode}</div>
              <div className="break-all">Ref: {row.execution_reference}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
