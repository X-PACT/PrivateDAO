import { NextResponse } from "next/server";
import { normalizeSolanaWallet } from "@/lib/api/wallet-validation";

export const dynamic = "force-static";

const DUNE_SIM_BASE = "https://api.sim.dune.com/beta/svm";

function parseWallet(searchParams: URLSearchParams) {
  return normalizeSolanaWallet(searchParams.get("wallet") ?? undefined);
}

export async function GET(request: Request) {
  const apiKey = process.env.DUNE_SIM_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing DUNE_SIM_API_KEY in server environment." }, { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const wallet = parseWallet(url.searchParams);
    const response = await fetch(`${DUNE_SIM_BASE}/balances/${encodeURIComponent(wallet)}`, {
      headers: {
        Accept: "application/json",
        "X-Sim-Api-Key": apiKey,
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Legacy analytics balances proxy responded ${response.status}.`, details: body },
        { status: response.status },
      );
    }
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Legacy analytics balances proxy failed." },
      { status: 400 },
    );
  }
}
