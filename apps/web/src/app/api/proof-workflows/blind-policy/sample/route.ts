import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

const LIVE_SAMPLE_URL = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/sample";

export async function GET() {
  try {
    const upstream = await fetch(LIVE_SAMPLE_URL, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    const payload = await upstream.json();
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "privatedao-blind-policy-sample-proxy",
        status: "sample-unavailable",
        error: error instanceof Error ? error.message : "Unable to reach Blind Policy sample runtime.",
      },
      { status: 502 },
    );
  }
}
