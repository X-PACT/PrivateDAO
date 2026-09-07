import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 60;

const LIVE_URL = "https://api.privatedao.org/api/v1/txline/status";
const OUTPUT_MODE = (process.env.PRIVATE_DAO_NEXT_OUTPUT_MODE ?? "export").trim().toLowerCase();

export async function GET() {
  if (OUTPUT_MODE === "export") {
    return NextResponse.json({
      ok: false,
      source: "privatedao-txline-status-static-export",
      status: "use-control-plane-api-directly",
      message: "Static site export cannot proxy live status. Use https://api.privatedao.org/api/v1/txline/status.",
    });
  }
  try {
    const upstream = await fetch(LIVE_URL, { headers: { Accept: "application/json" } });
    const payload = await upstream.json();
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "privatedao-txline-status-proxy",
        status: "txline-status-unavailable",
        error: error instanceof Error ? error.message : "Unable to reach TxLINE settlement status runtime.",
      },
      { status: 502 },
    );
  }
}
