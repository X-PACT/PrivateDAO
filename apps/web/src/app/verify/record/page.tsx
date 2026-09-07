"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RecordReceiptViewer } from "@/components/record-receipt-viewer";

function RecordReceiptRoute() {
  const receiptId = useSearchParams().get("receiptId");
  return <RecordReceiptViewer receiptId={receiptId || ""} />;
}

export default function RecordReceiptPage() {
  return <Suspense fallback={<div className="p-8 text-white/60">Loading receipt...</div>}><RecordReceiptRoute /></Suspense>;
}
