// SPDX-License-Identifier: Apache-2.0
import { PublicKey } from "@solana/web3.js";
import { createHash, randomBytes } from "crypto";

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
