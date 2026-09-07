"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  fetchOperationReceiptTimeline,
  type OperationReceiptTimelineResult,
} from "@/lib/supabase/operation-receipts";
import { buildSolanaTxUrl } from "@/lib/solana-network";
import { cn } from "@/lib/utils";

function formatTime(value: string) {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return timestamp.toLocaleString("en-GB", { hour12: false });
}

export function ExecuteLatestReceiptsPanel() {
  const [result, setResult] = useState<OperationReceiptTimelineResult>({
    rows: [],
    error: null,
    source: "local",
  });
  const [loading, setLoading] = useState(true);
  const [operationFilter, setOperationFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [railFilter, setRailFilter] = useState("all");

  const hydrateTimeline = useCallback(async () => {
    const next = await fetchOperationReceiptTimeline(5);
    setResult(next);
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await hydrateTimeline();
  }, [hydrateTimeline]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void hydrateTimeline();
    }, 0);
    const timer = window.setInterval(() => {
      void load();
    }, 20_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [hydrateTimeline, load]);

  const operationOptions = Array.from(new Set(result.rows.map((row) => row.operation_type))).sort();
  const assetOptions = Array.from(new Set(result.rows.map((row) => row.stablecoin_symbol))).sort();
  const railOptions = Array.from(new Set(result.rows.map((row) => row.private_settlement_rail))).sort();

  const filteredRows = result.rows.filter((row) => {
    const operationMatch = operationFilter === "all" || row.operation_type === operationFilter;
    const assetMatch = assetFilter === "all" || row.stablecoin_symbol === assetFilter;
    const railMatch = railFilter === "all" || row.private_settlement_rail === railFilter;
    return operationMatch && assetMatch && railMatch;
  });

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">Latest receipts</div>
          <h3 className="mt-2 text-lg font-semibold text-white">Recent execute activity</h3>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          Refresh
        </button>
      </div>

      <p className="mt-3 text-sm text-white/62">
        Source: <span className="text-white/78">{result.source === "supabase" ? "Supabase cloud timeline" : "Local browser timeline"}</span>
      </p>
      {result.error ? (
        <p className="mt-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs text-white/74">
          {result.error}
        </p>
      ) : null}

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
        Showing {filteredRows.length} of {result.rows.length} recent receipts.
      </div>

      <div className="mt-4 grid gap-3">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/62">Loading...</div>
        ) : null}
        {!loading && result.rows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/62">
            Timeline is ready. Run a signed operation to populate recent receipts.
          </div>
        ) : null}
        {!loading && result.rows.length > 0 && filteredRows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/62">
            No receipts match current filters.
          </div>
        ) : null}
        {filteredRows.map((row) => {
          const hasSignature = /^[1-9A-HJ-NP-Za-km-z]{30,}$/.test(row.execution_reference);
          return (
            <div key={row.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium text-white">{row.operation_type}</div>
                <div className="text-xs text-white/50">{formatTime(row.created_at)}</div>
              </div>
              <div className="mt-2 text-xs text-white/62">
                {row.stablecoin_symbol} · {row.private_settlement_rail} · {row.approval_state}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/proof">
                  Proof
                </Link>
                {hasSignature ? (
                  <a
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    href={buildSolanaTxUrl(row.execution_reference)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Explorer
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
