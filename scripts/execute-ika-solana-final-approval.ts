import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const DEFAULT_IKA_PROGRAM_ID = "87W54kGYFQ1rgWqMeu4XTPHWXWmXSQCcjm8vCTfiq1oY";
const DEFAULT_KEYPAIR_PATH = ".secrets/wallets/privatedao-ika-prealpha-solana-devnet.json";

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadKeypair(path: string) {
  const raw = JSON.parse(await readFile(resolve(path), "utf8")) as number[];
  if (!Array.isArray(raw) || raw.length !== 64) {
    throw new Error(`Invalid Solana keypair file: ${path}`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const rpc =
    process.env.IKA_PREALPHA_SOLANA_RPC ||
    process.env.RPCFAST_DEVNET_RPC_URL ||
    process.env.SOLANA_RPC_URL ||
    "https://api.devnet.solana.com";
  const programId = new PublicKey(process.env.IKA_PREALPHA_PROGRAM_ID || DEFAULT_IKA_PROGRAM_ID);
  const keypairPath = process.env.IKA_SOLANA_KEYPAIR_PATH || DEFAULT_KEYPAIR_PATH;
  const operator = await loadKeypair(keypairPath);
  const connection = new Connection(rpc, "confirmed");
  const programAccount = await connection.getAccountInfo(programId, "confirmed");
  if (!programAccount?.executable) {
    throw new Error(`Ika Solana pre-alpha program is not executable: ${programId.toBase58()}`);
  }

  const message = process.env.IKA_APPROVAL_MESSAGE || "PrivateDAO Ika Solana final approval for 2PC-MPC custody route";
  const routeDigest = sha256Hex(
    JSON.stringify({
      programId: programId.toBase58(),
      operator: operator.publicKey.toBase58(),
      message,
      protocol: "IKA_SOLANA_FINAL_APPROVAL_V1",
    }),
  );
  const memo = ["IKA_SOLANA_FINAL_APPROVAL_V1", programId.toBase58(), operator.publicKey.toBase58(), routeDigest.slice(0, 40)].join(":");
  const ix = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [{ pubkey: operator.publicKey, isSigner: true, isWritable: false }],
    data: Buffer.from(memo, "utf8"),
  });

  const signature = await connection.sendTransaction(new Transaction().add(ix), [operator], {
    preflightCommitment: "confirmed",
    maxRetries: 5,
  });
  const confirmation = await connection.confirmTransaction(signature, "confirmed");
  if (confirmation.value.err) {
    throw new Error(`Ika Solana final approval transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  const evidence = {
    ok: true,
    source: "privatedao-ika-solana-final-approval",
    generatedAt: new Date().toISOString(),
    network: "devnet",
    clusterLabel: "ika-solana-prealpha",
    protocol: "IKA_SOLANA_FINAL_APPROVAL_V1",
    programId: programId.toBase58(),
    memoProgram: MEMO_PROGRAM_ID.toBase58(),
    operator: operator.publicKey.toBase58(),
    routeDigest,
    memo,
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    boundary:
      "This is a real Solana operator-signed final approval attestation for the Ika pre-alpha custody route. It does not claim a Sui dWallet DKG transaction unless a separate Ika dWallet receipt is recorded.",
  };
  await writeFile("docs/ika-solana-final-approval-2026-05-27.json", `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
