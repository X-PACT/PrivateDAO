// SPDX-License-Identifier: Apache-2.0
import { PublicKey } from "@solana/web3.js";
import { createHash, randomBytes } from "crypto";

export type VoteChoice = "yes" | "no";

export function generateSalt32(): Buffer {
  return randomBytes(32);
}

export function computeVoteCommitment(vote: boolean, salt32: Buffer, voter: PublicKey): Buffer {
  if (salt32.length !== 32) {
    throw new Error("salt must be 32 bytes");
  }

  const voteByte = Buffer.from([vote ? 1 : 0]);
  return createHash("sha256")
    .update(Buffer.concat([voteByte, salt32, voter.toBuffer()]))
    .digest();
}

export function voteChoiceToBool(choice: VoteChoice): boolean {
  return choice === "yes";
}

export function voteBoolToChoice(vote: boolean): VoteChoice {
  return vote ? "yes" : "no";
}

export function hexEncode(bytes: Buffer): string {
  return bytes.toString("hex");
}

export function hexDecode32(hex: string): Buffer {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = Buffer.from(normalized, "hex");
  if (bytes.length !== 32) {
    throw new Error("expected 32 bytes");
  }
  return bytes;
}

export function createVoteEnvelope(choice: VoteChoice, voter: PublicKey) {
  const salt32 = generateSalt32();
  const commitment = computeVoteCommitment(voteChoiceToBool(choice), salt32, voter);
  return {
    choice,
    voter: voter.toBase58(),
    salt32,
    saltHex: hexEncode(salt32),
    commitment,
    commitmentHex: hexEncode(commitment),
  };
}
