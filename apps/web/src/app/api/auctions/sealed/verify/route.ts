import { NextResponse } from "next/server";

import { verifySealedAuctionProofPackage } from "@/lib/sealed-auction-proof";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const proofPackage =
    body && typeof body === "object" && !Array.isArray(body) && "proofPackage" in body ? body.proofPackage : body;
  const verification = verifySealedAuctionProofPackage(proofPackage);

  return NextResponse.json(
    {
      ok: verification.ok,
      source: "privatedao-sealed-auction-verifier",
      verification,
      explanation:
        "We recompute the sealed auction proof package and compare it with the original hash. If the winner, bid commitments, stages, or final amount change, verification fails.",
    },
    { status: verification.ok ? 200 : 422 },
  );
}
