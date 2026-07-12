import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

const LIVE_PROVE_URL = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/prove";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upstream = await fetch(LIVE_PROVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await upstream.json();
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "privatedao-blind-policy-proxy",
        status: "proof-not-issued",
        error: error instanceof Error ? error.message : "Unable to reach Blind Policy proof runtime.",
      },
      { status: 502 },
    );
  }
}
