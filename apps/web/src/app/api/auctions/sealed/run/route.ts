import { NextResponse } from "next/server";

import { buildSealedAuctionProofPackage } from "@/lib/sealed-auction-proof";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const proofPackage = buildSealedAuctionProofPackage({
      config: body.config as Parameters<typeof buildSealedAuctionProofPackage>[0]["config"],
      privateBids: body.privateBids as Parameters<typeof buildSealedAuctionProofPackage>[0]["privateBids"],
      proofId: typeof body.proofId === "string" ? body.proofId : undefined,
    });

    return NextResponse.json({
      ok: true,
      source: "privatedao-sealed-auction",
      status: "proof-issued",
      publicOutcome: proofPackage.publicOutcome,
      proofHash: proofPackage.originalProofHash,
      publicProofPackage: proofPackage,
      privateDataExcluded: proofPackage.valuesHiddenDuringAuction,
      explanation:
        "Bid amounts, bidder labels, salts, and auction momentum are not returned. The public package verifies the final reveal and proof hash.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "privatedao-sealed-auction",
        status: "proof-not-issued",
        publicOutcome: "proof-not-issued",
        error: error instanceof Error ? error.message : "Sealed auction proof was not issued.",
      },
      { status: 422 },
    );
  }
}
