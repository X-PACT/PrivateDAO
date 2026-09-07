import { NextResponse } from "next/server";
import path from "node:path";

import {
  AUCTION_OUTCOME_CIRCUIT,
  assertReceiptBinding,
  buildAuctionOutcomeProofInput,
  type AuctionOutcomeMetadata,
  type AuctionOutcomeBid,
} from "@/lib/auction-outcome-proof";

export const runtime = "nodejs";

function artifactRoot() {
  return process.env.PDAO_AUCTION_ZK_ARTIFACT_DIR ?? path.join(process.cwd(), "zk");
}

function artifacts() {
  const root = artifactRoot();
  return {
    wasm: path.join(root, "build", `${AUCTION_OUTCOME_CIRCUIT}_js`, `${AUCTION_OUTCOME_CIRCUIT}.wasm`),
    zkey: path.join(root, "setup", `${AUCTION_OUTCOME_CIRCUIT}_final.zkey`),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { metadata?: AuctionOutcomeMetadata; bids?: AuctionOutcomeBid[] };
    if (!body.metadata || !Array.isArray(body.bids)) throw new Error("metadata and private bid witness are required.");
    assertReceiptBinding(body.metadata);
    const input = buildAuctionOutcomeProofInput(body.metadata, body.bids);
    const files = artifacts();
    const fs = await import("node:fs/promises");
    await Promise.all([fs.access(files.wasm), fs.access(files.zkey)]);
    const { groth16 } = await import("snarkjs");
    const result = await groth16.fullProve(input, files.wasm, files.zkey);
    return NextResponse.json({
      ok: true,
      proofType: "groth16-auction-outcome-v1",
      circuit: AUCTION_OUTCOME_CIRCUIT,
      publicSignals: result.publicSignals,
      proof: result.proof,
      privateDataExcluded: true,
      binding: "finalized SettlementReceipt result_commitment and public outcome fields",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      proofType: "groth16-auction-outcome-v1",
      error: error instanceof Error ? error.message : "Auction outcome proof was not generated.",
    }, { status: 422 });
  }
}
