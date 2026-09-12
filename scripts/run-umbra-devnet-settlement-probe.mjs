#!/usr/bin/env node

import fs from "node:fs";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const ROOT = new URL("..", import.meta.url).pathname;
const WEB_PACKAGE = new URL("../apps/web/package.json", import.meta.url);
const requireWeb = createRequire(WEB_PACKAGE);
const sdk = requireWeb("@umbra-privacy/sdk");
const depositOps = requireWeb("@umbra-privacy/sdk/deposit");

const NETWORK = "devnet";
const RPC_URL = process.env.PRIVATE_DAO_PAYROLL_DEVNET_RPC_URL || "https://api.devnet.solana.com";
const WS_URL = process.env.PRIVATE_DAO_PAYROLL_DEVNET_WS_URL || RPC_URL.replace(/^http/, "ws");
const WALLET_PATH = process.env.PAYROLL_DEVNET_WALLET || "/home/x-pact/.config/solana/id.json";
const AMOUNT_BASE_UNITS = 100_000n;
const RECIPIENT_COUNT = 3;
const RECIPIENT_FUNDING_LAMPORTS = 3_000_000;
const MINT = "So11111111111111111111111111111111111111112";
const UMBRA_PROGRAM = new PublicKey("DSuKkyqGVGgo4QtPABfxKJKygUDACbUhirnuv63mEpAJ");

const explicitDevnetRpc = Boolean(process.env.PRIVATE_DAO_PAYROLL_DEVNET_RPC_URL || process.env.RPC_FAST_DEVNET_RPC);
if (!/^https:\/\//i.test(RPC_URL) || /mainnet|testnet/i.test(RPC_URL) || (!explicitDevnetRpc && !/devnet/i.test(RPC_URL))) {
  throw new Error("This probe only permits an HTTPS Solana Devnet RPC endpoint.");
}

function loadKeypair(path) {
  const bytes = JSON.parse(fs.readFileSync(path, "utf8"));
  if (!Array.isArray(bytes) || bytes.length !== 64) throw new Error("Devnet wallet keypair must be a 64-byte JSON array.");
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

function publicResult(value) {
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (/secret|seed|private|viewing|cipher|proof/i.test(key)) continue;
    if (/signature|tx|hash|address|slot|status|state|lifecycle|network|program/i.test(key)) result[key] = String(item);
  }
  return result;
}

async function ensureWsol(connection, payer, amount) {
  const ata = getAssociatedTokenAddressSync(NATIVE_MINT, payer.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  let current = 0n;
  let exists = true;
  try {
    current = BigInt((await getAccount(connection, ata, "finalized", TOKEN_PROGRAM_ID)).amount.toString());
  } catch {
    exists = false;
  }
  if (current >= amount) return ata;
  const rent = await connection.getMinimumBalanceForRentExemption(165, "finalized");
  const transaction = new Transaction();
  if (!exists) transaction.add(createAssociatedTokenAccountInstruction(payer.publicKey, ata, payer.publicKey, NATIVE_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID));
  transaction.add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: ata, lamports: rent + Number(amount - current) }),
    createSyncNativeInstruction(ata, TOKEN_PROGRAM_ID),
  );
  transaction.feePayer = payer.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
  transaction.sign(payer);
  const signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: false, maxRetries: 3 });
  await connection.confirmTransaction(signature, "finalized");
  return ata;
}

async function fundRecipient(connection, payer, recipient) {
  const transaction = new Transaction().add(SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: RECIPIENT_FUNDING_LAMPORTS,
  }));
  transaction.feePayer = payer.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
  transaction.sign(payer);
  const signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: false, maxRetries: 3 });
  await connection.confirmTransaction(signature, "finalized");
  return signature;
}

async function assertFinalized(connection, signature) {
  let lastStatus = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    lastStatus = (await connection.getSignatureStatuses([signature])).value[0];
    if (lastStatus?.err) throw new Error(`Transaction ${signature} failed on Solana Devnet.`);
    const parsed = await connection.getParsedTransaction(signature, { commitment: "finalized", maxSupportedTransactionVersion: 0 });
    if (parsed?.meta?.err) throw new Error(`Transaction ${signature} failed during finalized read.`);
    if (parsed && (lastStatus?.confirmationStatus === "finalized" || !lastStatus)) {
      const invokedPrograms = parsed.transaction.message.instructions
        .filter((instruction) => "programId" in instruction)
        .map((instruction) => instruction.programId.toBase58());
      return { signature, slot: parsed.slot, commitment: "finalized", invokedPrograms };
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`Transaction ${signature} was not readable as finalized after retrying (${lastStatus?.confirmationStatus || "unavailable"}).`);
}

async function createClient(owner) {
  const signer = await sdk.createSignerFromPrivateKeyBytes(owner.secretKey);
  const client = await sdk.getUmbraClient({
    signer,
    network: NETWORK,
    rpcUrl: RPC_URL,
    rpcSubscriptionsUrl: WS_URL,
    deferMasterSeedSignature: true,
  });
  return { signer, client };
}

async function registerWithRetry(registration, client, label) {
  const register = registration.getUserRegistrationFunction({ client });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await register({ confidential: true, anonymous: false });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw new Error(`${label} registration failed after 3 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function main() {
  const keypair = loadKeypair(WALLET_PATH);
  const connection = new Connection(RPC_URL, "finalized");
  const balance = await connection.getBalance(keypair.publicKey, "finalized");
  if (balance < 5_000_000) throw new Error("Devnet wallet balance is below the probe safety floor.");

  const payer = await createClient(keypair);

  const registration = await import(new URL("../apps/web/node_modules/@umbra-privacy/sdk/dist/operations/registration/index.js", import.meta.url));
  const payerRegistrationResult = await registerWithRetry(registration, payer.client, "Payer");

  const recipients = [];
  for (let index = 0; index < RECIPIENT_COUNT; index += 1) {
    console.error(`recipient ${index + 1}/${RECIPIENT_COUNT}: funding and registration`);
    const owner = Keypair.generate();
    const fundingSignature = await fundRecipient(connection, keypair, owner);
    const recipient = await createClient(owner);
    const registrationResult = await registerWithRetry(registration, recipient.client, `Recipient ${index + 1}`);
    recipients.push({ owner, fundingSignature, recipient, registrationResult });
  }

  await ensureWsol(connection, keypair, AMOUNT_BASE_UNITS * BigInt(RECIPIENT_COUNT));
  const settlement = [];
  for (const [index, recipient] of recipients.entries()) {
    console.error(`recipient ${index + 1}/${RECIPIENT_COUNT}: Umbra settlement`);
    const optionalDataHash = crypto.createHash("sha256").update(`privatedao-payroll-devnet:${Date.now()}:${index}`).digest("hex");
    const deposit = depositOps.getATAIntoETADirectDepositorFunction({ client: payer.client });
    const rawResult = await deposit(recipient.recipient.signer.address, MINT, AMOUNT_BASE_UNITS, { optionalData: Uint8Array.from(Buffer.from(optionalDataHash, "hex")) });
    const signatures = [rawResult?.queueSignature, ...(rawResult?.signatures || [])].filter(Boolean).map(String);
    if (!signatures.length) throw new Error(`Umbra SDK returned no transaction signature for recipient ${index + 1}.`);
    const finalized = [];
    for (const signature of [...new Set(signatures)]) finalized.push(await assertFinalized(connection, signature));
    if (!finalized.some((entry) => entry.invokedPrograms.includes(UMBRA_PROGRAM.toBase58()))) {
      throw new Error(`Recipient ${index + 1} finalized without a callback invoking the Umbra Devnet program.`);
    }
    settlement.push({
      recipient: recipient.owner.publicKey.toBase58(),
      fundingSignature: recipient.fundingSignature,
      optionalDataHash,
      registration: Array.isArray(recipient.registrationResult) ? recipient.registrationResult.map(String) : publicResult(recipient.registrationResult),
      settlement: finalized,
      sdkOutcome: publicResult(rawResult),
    });
  }

  console.log(JSON.stringify({
    ok: true,
    network: NETWORK,
    wallet: keypair.publicKey.toBase58(),
    recipientCount: RECIPIENT_COUNT,
    amountBaseUnitsPerRecipient: AMOUNT_BASE_UNITS.toString(),
    mint: MINT,
    payerRegistration: Array.isArray(payerRegistrationResult) ? payerRegistrationResult.map(String) : publicResult(payerRegistrationResult),
    recipients: settlement,
    secretsPrinted: false,
  }, null, 2));
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
