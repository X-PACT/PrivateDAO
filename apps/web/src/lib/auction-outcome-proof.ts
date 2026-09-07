import { createHash } from "crypto";

export const AUCTION_OUTCOME_CIRCUIT = "private_dao_auction_outcome";
export const AUCTION_OUTCOME_MAX_BIDS = 8;

// BN254 scalar field used by Groth16. Digest inputs are reduced only for the
// circuit encoding; the verifier still compares the original 32-byte digest
// to the on-chain receipt before accepting the proof.
export const BN254_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

export type AuctionOutcomeMetadata = {
  auctionId: Uint8Array | number[];
  rulesDigest: Uint8Array | number[];
  policyDigest: Uint8Array | number[];
  winnerCommitment: Uint8Array | number[];
  winningAmount: number | bigint;
  bidCount: number;
  deadline: number | bigint;
  resultCommitment: Uint8Array | number[];
};

export type AuctionOutcomeBid = {
  bidderCommitment: Uint8Array | number[];
  amount: number | bigint;
};

export type AuctionOutcomeProofInput = AuctionOutcomeMetadata & {
  bidderCommitments: string[];
  amounts: string[];
  active: string[];
  winner: string[];
};

export type AuctionOutcomePublicSignals = {
  auctionId: string;
  rulesDigest: string;
  policyDigest: string;
  winnerCommitment: string;
  winningAmount: string;
  bidCount: string;
  deadline: string;
  resultCommitment: string;
};

function asBytes(value: Uint8Array | number[], label: string): Uint8Array {
  const bytes = value instanceof Uint8Array ? value : Uint8Array.from(value);
  if (bytes.length !== 32) throw new Error(`${label} must be exactly 32 bytes.`);
  return bytes;
}

export function bytesToField(value: Uint8Array | number[], label = "digest"): string {
  const bytes = asBytes(value, label);
  let number = 0n;
  for (let index = bytes.length - 1; index >= 0; index -= 1) number = (number << 8n) + BigInt(bytes[index]);
  return (number % BN254_SCALAR_FIELD).toString(10);
}

function integer(value: number | bigint, label: string): string {
  const result = BigInt(value);
  if (result < 0n) throw new Error(`${label} must not be negative.`);
  return result.toString(10);
}

function sha256Parts(parts: Array<Uint8Array | string | number | bigint>): Uint8Array {
  const hash = createHash("sha256");
  for (const part of parts) {
    if (part instanceof Uint8Array) hash.update(part);
    else if (typeof part === "string") hash.update(part);
    else if (typeof part === "bigint") hash.update(Buffer.from(part.toString(10)));
    else hash.update(Buffer.from(String(part)));
  }
  return Uint8Array.from(hash.digest());
}

export function computeAuctionResultCommitment(metadata: Omit<AuctionOutcomeMetadata, "resultCommitment">): Uint8Array {
  return sha256Parts([
    "privatedao-auction-result-v1",
    asBytes(metadata.auctionId, "auctionId"),
    asBytes(metadata.rulesDigest, "rulesDigest"),
    asBytes(metadata.policyDigest, "policyDigest"),
    asBytes(metadata.winnerCommitment, "winnerCommitment"),
    Buffer.from(new BN64(metadata.winningAmount).toBytesLE()),
    Buffer.from(new BN32(metadata.bidCount).toBytesLE()),
    Buffer.from(new BN64(metadata.deadline).toBytesLE()),
  ]);
}

// Small fixed-width integer encoders avoid pulling a wallet/chain SDK into
// the receipt verifier.
class BN64 {
  readonly value: bigint;
  constructor(value: number | bigint) { this.value = BigInt(value); }
  toBytesLE(): Uint8Array {
    const bytes = new Uint8Array(8);
    let value = this.value;
    for (let index = 0; index < bytes.length; index += 1) { bytes[index] = Number(value & 255n); value >>= 8n; }
    if (value !== 0n) throw new Error("Integer does not fit u64.");
    return bytes;
  }
}

class BN32 {
  readonly value: number;
  constructor(value: number) { this.value = value; }
  toBytesLE(): Uint8Array {
    if (!Number.isInteger(this.value) || this.value < 0 || this.value > 0xffffffff) throw new Error("Integer does not fit u32.");
    return Uint8Array.from([this.value & 255, (this.value >>> 8) & 255, (this.value >>> 16) & 255, (this.value >>> 24) & 255]);
  }
}

function equalBytes(left: Uint8Array | number[], right: Uint8Array | number[]): boolean {
  const a = asBytes(left, "left");
  const b = asBytes(right, "right");
  return a.every((value, index) => value === b[index]);
}

export function buildAuctionOutcomeProofInput(metadata: AuctionOutcomeMetadata, bids: AuctionOutcomeBid[]): AuctionOutcomeProofInput {
  if (!Number.isInteger(metadata.bidCount) || metadata.bidCount < 1 || metadata.bidCount > AUCTION_OUTCOME_MAX_BIDS) {
    throw new Error(`Auction outcome proof supports 1-${AUCTION_OUTCOME_MAX_BIDS} bids.`);
  }
  if (bids.length !== metadata.bidCount) throw new Error("bidCount does not match the private bid witness.");
  const winnerIndex = bids.findIndex((bid) => equalBytes(bid.bidderCommitment, metadata.winnerCommitment));
  if (winnerIndex < 0) throw new Error("Winner commitment is not present in the private bid witness.");
  const winningAmount = BigInt(metadata.winningAmount);
  if (BigInt(bids[winnerIndex].amount) !== winningAmount) throw new Error("Winning amount is not consistent with the winner witness.");
  for (const bid of bids) if (BigInt(bid.amount) >= winningAmount && bids.indexOf(bid) !== winnerIndex) throw new Error("v1 requires a unique maximum bid; tie-break proofs are not enabled.");

  const bidderCommitments = bids.map((bid) => bytesToField(bid.bidderCommitment, "bidderCommitment"));
  const amounts = bids.map((bid) => integer(bid.amount, "bid amount"));
  while (bidderCommitments.length < AUCTION_OUTCOME_MAX_BIDS) bidderCommitments.push("0");
  while (amounts.length < AUCTION_OUTCOME_MAX_BIDS) amounts.push("0");
  return {
    ...metadata,
    auctionId: bytesToField(metadata.auctionId, "auctionId"),
    rulesDigest: bytesToField(metadata.rulesDigest, "rulesDigest"),
    policyDigest: bytesToField(metadata.policyDigest, "policyDigest"),
    winnerCommitment: bytesToField(metadata.winnerCommitment, "winnerCommitment"),
    winningAmount: integer(metadata.winningAmount, "winningAmount"),
    bidCount: integer(metadata.bidCount, "bidCount"),
    deadline: integer(metadata.deadline, "deadline"),
    resultCommitment: bytesToField(metadata.resultCommitment, "resultCommitment"),
    bidderCommitments,
    amounts,
    active: Array.from({ length: AUCTION_OUTCOME_MAX_BIDS }, (_, index) => index < metadata.bidCount ? "1" : "0"),
    winner: Array.from({ length: AUCTION_OUTCOME_MAX_BIDS }, (_, index) => index === winnerIndex ? "1" : "0"),
  };
}

export function expectedAuctionPublicSignals(metadata: AuctionOutcomeMetadata): AuctionOutcomePublicSignals {
  return {
    auctionId: bytesToField(metadata.auctionId, "auctionId"),
    rulesDigest: bytesToField(metadata.rulesDigest, "rulesDigest"),
    policyDigest: bytesToField(metadata.policyDigest, "policyDigest"),
    winnerCommitment: bytesToField(metadata.winnerCommitment, "winnerCommitment"),
    winningAmount: integer(metadata.winningAmount, "winningAmount"),
    bidCount: integer(metadata.bidCount, "bidCount"),
    deadline: integer(metadata.deadline, "deadline"),
    resultCommitment: bytesToField(metadata.resultCommitment, "resultCommitment"),
  };
}

export function assertReceiptBinding(metadata: AuctionOutcomeMetadata): void {
  const expected = computeAuctionResultCommitment(metadata);
  if (!equalBytes(expected, metadata.resultCommitment)) throw new Error("Outcome proof is not bound to the existing auction result commitment.");
}

export function publicSignalsMatchReceipt(publicSignals: string[], metadata: AuctionOutcomeMetadata): boolean {
  if (publicSignals.length !== 8) return false;
  assertReceiptBinding(metadata);
  const expected = Object.values(expectedAuctionPublicSignals(metadata));
  return expected.every((value, index) => publicSignals[index] === value);
}
