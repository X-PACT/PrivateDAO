import assert from "node:assert/strict";
import test from "node:test";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from "../scripts/browser/spl-token-entry.mjs";

const key = (value) => new PublicKey(value);
const payer = key("11111111111111111111111111111111");
const mint = key("So11111111111111111111111111111111111111112");
const source = key("SysvarRent111111111111111111111111111111111");
const destination = key("SysvarC1ock11111111111111111111111111111111");

test("local SPL transfer-checked instruction matches Token Program layout", () => {
  const instruction = createTransferCheckedInstruction(source, mint, destination, payer, 30000n, 6);
  assert.equal(instruction.programId.toBase58(), TOKEN_PROGRAM_ID.toBase58());
  assert.deepEqual(instruction.keys.map((item) => [item.pubkey.toBase58(), item.isSigner, item.isWritable]), [
    [source.toBase58(), false, true],
    [mint.toBase58(), false, false],
    [destination.toBase58(), false, true],
    [payer.toBase58(), true, false],
  ]);
  assert.deepEqual([...instruction.data], [12, 0x30, 0x75, 0, 0, 0, 0, 0, 0, 6]);
});

test("local ATA idempotent instruction has canonical accounts and discriminator", () => {
  const instruction = createAssociatedTokenAccountIdempotentInstruction(payer, destination, payer, mint);
  assert.equal(instruction.programId.toBase58(), ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
  assert.deepEqual(instruction.keys.map((item) => item.pubkey.toBase58()), [
    payer.toBase58(), destination.toBase58(), payer.toBase58(), mint.toBase58(),
    SystemProgram.programId.toBase58(), TOKEN_PROGRAM_ID.toBase58(),
  ]);
  assert.deepEqual([...instruction.data], [1]);
});
