#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import nacl from "tweetnacl";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const args = new Set(process.argv.slice(2));
const getArg = (name, fallback = "") => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
};

const send = args.has("--send");
const printSecrets = args.has("--print-secrets");
const writeSecretFile = getArg("--write-secret-file", "");
const activateTxSig = getArg("--activate-tx-sig", "");

const rpcUrl =
  process.env.TXLINE_SETTLEMENT_RPC_URL ||
  process.env.SOLANA_MAINNET_RPC_URL ||
  process.env.SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";
const walletPath = path.resolve(
  getArg(
    "--wallet",
    process.env.TXLINE_WALLET_KEYPAIR_PATH ||
      "/home/x-pact/Desktop/PrivateDAO-Testnet-Wallets-LOCAL-DO-NOT-COMMIT/squads-member-founder-operator-4mm__4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD.json",
  ).replace(/^~/, os.homedir()),
);
const serviceLevelId = Number(getArg("--service-level", process.env.TXLINE_SERVICE_LEVEL_ID || "1"));
const weeks = Number(getArg("--weeks", process.env.TXLINE_SUBSCRIPTION_WEEKS || "4"));
const selectedLeagues = getArg("--leagues", process.env.TXLINE_SELECTED_LEAGUES || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const txlineApiBase = (process.env.TXLINE_API_BASE || "https://txline.txodds.com").replace(/\/+$/, "");
const programId = new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA");
const txlMint = new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL");

const subscribeDiscriminator = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);

function loadKeypair(file) {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, "utf8"))));
}

function u16le(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function ensureFreeTierInputs() {
  if (![1, 12].includes(serviceLevelId)) {
    throw new Error("Refusing non-free TxLINE service level. Use 1 or 12 for World Cup free tiers.");
  }
  if (!Number.isInteger(weeks) || weeks < 4 || weeks % 4 !== 0) {
    throw new Error("TxLINE subscription duration must be a multiple of 4 weeks.");
  }
}

async function startGuestSession() {
  const response = await fetch(`${txlineApiBase}/auth/guest/start`, { method: "POST" });
  const body = await response.text();
  if (!response.ok) throw new Error(`TxLINE guest/start failed: HTTP ${response.status} ${body.slice(0, 200)}`);
  const parsed = JSON.parse(body);
  if (!parsed.token) throw new Error("TxLINE guest/start did not return token.");
  return parsed.token;
}

async function activateToken({ txSig, jwt, wallet }) {
  const messageString = `${txSig}:${selectedLeagues.join(",")}:${jwt}`;
  const signatureBytes = nacl.sign.detached(new TextEncoder().encode(messageString), wallet.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");
  const response = await fetch(`${txlineApiBase}/api/token/activate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      txSig,
      walletSignature,
      leagues: selectedLeagues,
    }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`TxLINE token activation failed: HTTP ${response.status} ${body.slice(0, 500)}`);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = body.trim();
  }
  const apiToken = parsed.token || parsed.apiToken || parsed;
  if (typeof apiToken !== "string") throw new Error("TxLINE activation did not return a token string.");
  return apiToken;
}

async function main() {
  ensureFreeTierInputs();
  const wallet = loadKeypair(walletPath);
  const connection = new Connection(rpcUrl, "confirmed");
  const balanceLamports = await connection.getBalance(wallet.publicKey, "confirmed");

  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], programId);
  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], programId);
  const userTokenAccount = getAssociatedTokenAddressSync(txlMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(txlMint, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID);

  const data = Buffer.concat([subscribeDiscriminator, u16le(serviceLevelId), Buffer.from([weeks])]);
  const createUserTxlAtaIx = createAssociatedTokenAccountIdempotentInstruction(
    wallet.publicKey,
    userTokenAccount,
    wallet.publicKey,
    txlMint,
    TOKEN_2022_PROGRAM_ID,
  );
  const subscribeIx = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },
      { pubkey: txlMint, isSigner: false, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(createUserTxlAtaIx, subscribeIx);
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  transaction.sign(wallet);

  const summary = {
    mode: activateTxSig ? "activate-only" : send ? "send" : "dry-run",
    rpcUrl,
    wallet: wallet.publicKey.toBase58(),
    balanceSol: balanceLamports / 1_000_000_000,
    txline: {
      apiBase: txlineApiBase,
      programId: programId.toBase58(),
      txlMint: txlMint.toBase58(),
      serviceLevelId,
      weeks,
      selectedLeagues,
      freeTier: [1, 12].includes(serviceLevelId),
    },
    derivedAccounts: {
      pricingMatrixPda: pricingMatrixPda.toBase58(),
      tokenTreasuryPda: tokenTreasuryPda.toBase58(),
      userTokenAccount: userTokenAccount.toBase58(),
      tokenTreasuryVault: tokenTreasuryVault.toBase58(),
    },
  };

  if (activateTxSig) {
    const jwt = await startGuestSession();
    const apiToken = await activateToken({ txSig: activateTxSig, jwt, wallet });
    const secretPayload = {
      ...summary,
      txSig: activateTxSig,
      txlineSessionJwt: jwt,
      txlineApiToken: apiToken,
      env: {
        TXLINE_SESSION_JWT: jwt,
        TXLINE_API_TOKEN: apiToken,
        TXLINE_SERVICE_LEVEL_ID: String(serviceLevelId),
        TXLINE_WALLET_PUBLIC_KEY: wallet.publicKey.toBase58(),
      },
    };
    if (writeSecretFile) {
      const target = path.resolve(writeSecretFile.replace(/^~/, os.homedir()));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, `${JSON.stringify(secretPayload, null, 2)}\n`, { mode: 0o600 });
    }
    console.log(
      JSON.stringify(
        {
          ...summary,
          txSig: activateTxSig,
          txlineSessionJwt: printSecrets ? jwt : "<set>",
          txlineApiToken: printSecrets ? apiToken : "<set>",
          wroteSecretFile: writeSecretFile ? path.resolve(writeSecretFile.replace(/^~/, os.homedir())) : null,
          next: "Set TXLINE_SESSION_JWT and TXLINE_API_TOKEN in the live backend, then restart read-node.",
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!send) {
    console.log(JSON.stringify({ ...summary, next: "Re-run with --send after the wallet has mainnet SOL for rent/fees." }, null, 2));
    return;
  }

  if (balanceLamports < 15_000_000) {
    throw new Error("Wallet has less than 0.015 SOL. Refusing to send because ATA rent/fees may fail.");
  }

  const jwt = await startGuestSession();
  const txSig = await sendAndConfirmTransaction(connection, transaction, [wallet], {
    commitment: "confirmed",
    skipPreflight: false,
  });
  const apiToken = await activateToken({ txSig, jwt, wallet });

  const secretPayload = {
    ...summary,
    txSig,
    txlineSessionJwt: jwt,
    txlineApiToken: apiToken,
    env: {
      TXLINE_SESSION_JWT: jwt,
      TXLINE_API_TOKEN: apiToken,
      TXLINE_SERVICE_LEVEL_ID: String(serviceLevelId),
      TXLINE_WALLET_PUBLIC_KEY: wallet.publicKey.toBase58(),
    },
  };

  if (writeSecretFile) {
    const target = path.resolve(writeSecretFile.replace(/^~/, os.homedir()));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(secretPayload, null, 2)}\n`, { mode: 0o600 });
  }

  console.log(
    JSON.stringify(
      {
        ...summary,
        txSig,
        txlineSessionJwt: printSecrets ? jwt : "<set>",
        txlineApiToken: printSecrets ? apiToken : "<set>",
        wroteSecretFile: writeSecretFile ? path.resolve(writeSecretFile.replace(/^~/, os.homedir())) : null,
        next: "Set TXLINE_SESSION_JWT and TXLINE_API_TOKEN in the live backend, then restart read-node.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
