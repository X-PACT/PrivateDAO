import Link from "next/link";

import { OperationReceiptExportClient } from "@/components/operation-receipt-export-client";
import { buttonVariants } from "@/components/ui/button";
import type { JudgeRuntimeLogsSnapshot } from "@/lib/judge-runtime-logs";
import { cn } from "@/lib/utils";

type OperationReceiptLedgerProps = {
  snapshot: JudgeRuntimeLogsSnapshot;
};

export function OperationReceiptLedger({ snapshot }: OperationReceiptLedgerProps) {
  const governanceExecute = snapshot.governance.entries.find((item) => item.label === "execute");
  const confidentialExecute = snapshot.confidential.entries.find((item) => item.label === "magicblock-execute");
  const latestExecution = governanceExecute ?? confidentialExecute ?? snapshot.governance.entries.at(-1) ?? null;

  const receiptRows = [
    { label: "Operation type", value: governanceExecute ? "Governance execute proposal" : "Confidential settlement execute" },
    { label: "DAO / Proposal ID", value: snapshot.governance.proposal },
    { label: "Approval state", value: snapshot.governance.verificationStatus },
    { label: "Execution reference", value: latestExecution?.signature ?? "not captured yet" },
    { label: "Private settlement rail", value: confidentialExecute ? "MagicBlock lane captured" : "standard lane captured" },
    { label: "Audit mode", value: "selective disclosure + proof-linked logs" },
    { label: "Recipient visibility", value: "private-by-default, public verification preserved" },
    { label: "Proof freshness", value: snapshot.freshness },
  ];
  const exportPayload = {
    operationType: receiptRows[0]?.value ?? "unknown",
    proposalId: snapshot.governance.proposal,
    approvalState: snapshot.governance.verificationStatus,
    executionReference: latestExecution?.signature ?? "not-captured",
    privateSettlementRail: confidentialExecute ? "MagicBlock captured" : "Standard captured",
    auditMode: "selective-disclosure",
    recipientVisibility: "private-by-default",
    proofFreshness: snapshot.freshness,
    generatedAt: new Date().toISOString(),
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">Operation Receipt Layer</div>
      <h2 className="mt-3 text-2xl font-semibold text-white">Structured execution receipt for judges and operators</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
        Every executed operation should resolve into one readable receipt surface: what was approved, what was executed,
        what stayed private, and what can be validated publicly.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {receiptRows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{row.label}</div>
            <div className="mt-2 text-sm text-white/76 break-all">{row.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link className={cn(buttonVariants({ size: "sm" }))} href="/judge">
          Open judge mode
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "secondary" }))} href="/documents/audit-packet">
          Open audit packet
        </Link>
        <Link className={cn(buttonVariants({ size: "sm", variant: "outline" }))} href="/documents/live-proof-v3">
          Open live proof v3
        </Link>
      </div>
      <OperationReceiptExportClient payload={exportPayload} />
    </section>
  );
}
