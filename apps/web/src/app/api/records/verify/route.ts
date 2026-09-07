import { forwardRecordRequest } from "@/lib/record-api";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  return forwardRecordRequest("/records/verify", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": request.headers.get("Idempotency-Key") || "" }, body: await request.text() });
}
