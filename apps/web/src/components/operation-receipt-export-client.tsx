"use client";

import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OperationReceiptPayload = {
  operationType: string;
  proposalId: string;
  approvalState: string;
  executionReference: string;
  privateSettlementRail: string;
  auditMode: string;
  recipientVisibility: string;
  proofFreshness: string;
  generatedAt: string;
};

type OperationReceiptExportClientProps = {
  payload: OperationReceiptPayload;
};

export function OperationReceiptExportClient({ payload }: OperationReceiptExportClientProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const serialized = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const href = useMemo(
    () => `data:application/json;charset=utf-8,${encodeURIComponent(serialized)}`,
    [serialized],
  );
  const filename = useMemo(() => {
    const safeId = payload.proposalId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 42);
    return `privatedao-operation-receipt-${safeId || "unknown"}.json`;
  }, [payload.proposalId]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(serialized);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <a className={cn(buttonVariants({ size: "sm" }))} download={filename} href={href}>
        Download receipt JSON
      </a>
      <button
        className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
        onClick={() => void handleCopy()}
        type="button"
      >
        {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy receipt JSON"}
      </button>
    </div>
  );
}
