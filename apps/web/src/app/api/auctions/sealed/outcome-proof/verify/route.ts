import { NextResponse } from "next/server";
import path from "node:path";

import {
  AUCTION_OUTCOME_CIRCUIT,
  assertReceiptBinding,
  publicSignalsMatchReceipt,
  type AuctionOutcomeMetadata,
} from "@/lib/auction-outcome-proof";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      metadata?: AuctionOutcomeMetadata;
      publicSignals?: string[];
      proof?: unknown;
    };
    if (!body.metadata || !Array.isArray(body.publicSignals) || !body.proof) throw new Error("metadata, publicSignals and proof are required.");
    assertReceiptBinding(body.metadata);
    if (!publicSignalsMatchReceipt(body.publicSignals, body.metadata)) throw new Error("Public signals do not match the finalized auction receipt.");
    const root = process.env.PDAO_AUCTION_ZK_ARTIFACT_DIR ?? path.join(process.cwd(), "zk");
    const fs = await import("node:fs/promises");
    const verificationKey = JSON.parse(await fs.readFile(path.join(root, "setup", `${AUCTION_OUTCOME_CIRCUIT}_vkey.json`), "utf8"));
    const { groth16 } = await import("snarkjs");
    const valid = await groth16.verify(verificationKey, body.publicSignals, body.proof);
    return NextResponse.json({
      ok: valid,
      proofType: "groth16-auction-outcome-v1",
      status: valid ? "verified" : "invalid",
      receiptBinding: true,
      publicSignalsMatchReceipt: true,
    }, { status: valid ? 200 : 422 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      proofType: "groth16-auction-outcome-v1",
      status: "invalid",
      error: error instanceof Error ? error.message : "Auction outcome proof verification failed.",
    }, { status: 422 });
  }
}
