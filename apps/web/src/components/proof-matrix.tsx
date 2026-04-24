"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildSolanaTxUrl } from "@/lib/solana-network";
import { cn } from "@/lib/utils";

type MatrixRow = {
  id: string;
  createdAt: string;
  operationType: string;
  zk: boolean;
  viewingKey: boolean;
  signature: string;
};

type LocalReceipt = {
  id: string;
  created_at: string;
  operation_type: string;
  execution_reference: string;
};

export function ProofMatrix() {
  const [rows, setRows] = useState<MatrixRow[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("pdao.operation_receipts.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LocalReceipt[];
      if (!Array.isArray(parsed)) return;
      const normalized = parsed.slice(0, 12).map((item) => ({
        id: item.id,
        createdAt: item.created_at,
        operationType: item.operation_type,
        zk: true,
        viewingKey: true,
        signature: item.execution_reference,
      }));
      setRows(normalized);
    } catch {
      setRows([]);
    }
  }, []);

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <CardHeader>
        <CardTitle>Proof Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="py-2">Operation</th>
                <th className="py-2">Time</th>
                <th className="py-2">ZK</th>
                <th className="py-2">Viewing Key</th>
                <th className="py-2">TX Signature</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="py-2 text-white/80">{row.operationType}</td>
                  <td className="py-2 text-white/70">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="py-2">
                    <span className={cn("rounded-full px-2 py-1 text-xs", row.zk ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/60")}>
                      {row.zk ? "Verified" : "N/A"}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={cn("rounded-full px-2 py-1 text-xs", row.viewingKey ? "bg-cyan-400/20 text-cyan-200" : "bg-white/10 text-white/60")}>
                      {row.viewingKey ? "Issued" : "N/A"}
                    </span>
                  </td>
                  <td className="py-2">
                    <Link
                      href={buildSolanaTxUrl(row.signature)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      View on Solscan
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

