import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function POST(request: Request) {
  void request;
  return NextResponse.json({ ok: false, status: "moved", error: "Use /api/v1/commercial/orders/verify. Payment hashes are not accepted for license issuance." }, { status: 410 });
}
