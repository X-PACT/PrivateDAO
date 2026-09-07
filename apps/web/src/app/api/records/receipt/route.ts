import { NextRequest } from "next/server";
import { forwardRecordRequest } from "@/lib/record-api";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const receiptId = request.nextUrl.searchParams.get("receiptId");
  if (!receiptId) return Response.json({ ok: false, error: "receiptId is required." }, { status: 400 });
  return forwardRecordRequest(`/receipts/${encodeURIComponent(receiptId)}`);
}

export async function POST(request: NextRequest) {
  const receiptId = request.nextUrl.searchParams.get("receiptId");
  if (!receiptId) return Response.json({ ok: false, error: "receiptId is required." }, { status: 400 });
  return forwardRecordRequest(`/receipts/${encodeURIComponent(receiptId)}/reverify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: await request.text() });
}
