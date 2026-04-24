"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { PrivatePayrollEncryptionWorkbench } from "@/components/private-payroll-encryption-workbench";
import { PrivateSettlementRailWorkbench } from "@/components/private-settlement-rail-workbench";
import { buttonVariants } from "@/components/ui/button";
import { persistOperationReceipt } from "@/lib/supabase/operation-receipts";
import { cn } from "@/lib/utils";

type ParsedPayrollRow = {
  recipient: string;
  amount: number;
  memo: string;
};

const SUPPORTED_ASSETS = ["USDC", "PUSD", "AUDD"] as const;

export default function PayrollPage() {
  const [rows, setRows] = useState<ParsedPayrollRow[]>([]);
  const [asset, setAsset] = useState<(typeof SUPPORTED_ASSETS)[number]>("USDC");
  const [status, setStatus] = useState("Upload CSV, preview rows, then run private payroll flow.");
  const [busy, setBusy] = useState(false);

  const totalAmount = useMemo(() => rows.reduce((sum, row) => sum + row.amount, 0), [rows]);

  function parseCsv(input: string) {
    const lines = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length <= 1) return [];
    const dataLines = lines.slice(1);
    return dataLines
      .map((line) => line.split(","))
      .map((parts) => ({
        recipient: (parts[0] ?? "").trim(),
        amount: Number((parts[1] ?? "0").trim()),
        memo: (parts[2] ?? "").trim(),
      }))
      .filter((row) => row.recipient.length > 0 && Number.isFinite(row.amount) && row.amount > 0);
  }

  async function handleCsvUpload(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    setStatus(parsed.length > 0 ? `Loaded ${parsed.length} payroll rows.` : "No valid rows found.");
  }

  async function handlePayAll() {
    if (rows.length === 0) {
      setStatus("Upload a CSV with valid rows first.");
      return;
    }

    setBusy(true);
    setStatus("Preparing private batch payroll...");
    try {
      const executionRef = `payroll-${Date.now()}-${rows.length}`;
      await persistOperationReceipt({
        operationType: "private_payroll_batch",
        proposalId: "payroll:batch",
        approvalState: "prepared",
        executionReference: executionRef,
        privateSettlementRail: "umbra-cloak",
        stablecoinSymbol: asset,
        auditMode: "scoped_viewing_keys",
        recipientVisibility: "private_by_default",
        metadata: {
          rows: rows.length,
          totalAmount,
          sampleRecipient: rows[0]?.recipient ?? "",
        },
      });
      setStatus(`Private payroll batch prepared (${rows.length} recipients, ${totalAmount.toFixed(2)} ${asset}).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payroll preparation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OperationsShell
      eyebrow="Payroll"
      title="Private payroll with preview, encryption, and proof continuity"
      description="Upload payroll CSV, preview rows before execution, and run private settlement with auditable receipt continuity."
      badges={[
        { label: "Private payroll", variant: "success" },
        { label: "Auditable", variant: "cyan" },
        { label: "Wallet-first", variant: "violet" },
      ]}
    >
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/44">Payroll batch</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white/70">
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full text-xs"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleCsvUpload(file);
                }
              }}
            />
          </label>
          <select
            value={asset}
            onChange={(event) => setAsset(event.target.value as (typeof SUPPORTED_ASSETS)[number])}
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          >
            {SUPPORTED_ASSETS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handlePayAll()}
            disabled={busy}
            className={cn(buttonVariants({ size: "sm" }))}
            title="Send all rows through private payroll lane"
          >
            {busy ? "Processing..." : "Pay All"}
          </button>
        </div>
        <div className="mt-3 text-sm text-white/70">{status}</div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/44">Preview</div>
        <div className="mt-2 text-sm text-white/72">
          Rows: {rows.length} · Total: {totalAmount.toFixed(2)} {asset}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="py-2">Recipient</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Memo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.recipient}-${index}`} className="border-t border-white/10">
                  <td className="py-2 text-white/85">{row.recipient}</td>
                  <td className="py-2 text-white/85">{row.amount}</td>
                  <td className="py-2 text-white/70">{row.memo || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <details className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
        <summary className="cursor-pointer text-sm font-medium text-cyan-100">BehindTheMagic</summary>
        <div className="mt-3 text-sm leading-7 text-white/72">
          يتم تجهيز الدفعات كحزمة خاصة. كل مستلم يحصل على مسار استلام خاص، والمدقق يحصل على صلاحية مشاهدة محددة النطاق
          بدل كشف تاريخ الخزينة بالكامل.
        </div>
      </details>

      <PrivatePayrollEncryptionWorkbench />
      <PrivateSettlementRailWorkbench />

      <div className="flex flex-wrap gap-3">
        <Link href="/proof" className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}>
          Open proof
        </Link>
        <Link href="/compliance" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Open compliance
        </Link>
      </div>
    </OperationsShell>
  );
}

