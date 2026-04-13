"use client";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const PRIVATE_DAO_PROGRAM_ID = new PublicKey("5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx");
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

type VotingMode = "token" | "quadratic" | "dual";

type CreateDaoBootstrapInput = {
  authority: PublicKey;
  connection: Connection;
  delaySeconds?: number;
  name: string;
  quorum: number;
  revealWindowSeconds?: number;
  votingMode?: VotingMode;
};

type CreateDaoBootstrapResult = {
  dao: PublicKey;
  governanceMint: PublicKey;
  mintSigner: Keypair;
  transaction: Transaction;
};

const SYSVAR_RENT_PUBKEY = new PublicKey("SysvarRent111111111111111111111111111111111");
const MINT_ACCOUNT_SPACE = 82;

function encodeU32LE(value: number) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, true);
  return out;
}

function encodeU64LE(value: number) {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, BigInt(value), true);
  return out;
}

function encodeI64LE(value: number) {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigInt64(0, BigInt(value), true);
  return out;
}

function encodeAnchorString(value: string) {
  const text = new TextEncoder().encode(value);
  const out = new Uint8Array(4 + text.length);
  out.set(encodeU32LE(text.length), 0);
  out.set(text, 4);
  return out;
}

function concatBytes(...parts: Uint8Array[]) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

async function anchorMethodDiscriminator(methodName: string) {
  const input = new TextEncoder().encode(`global:${methodName}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return new Uint8Array(digest).slice(0, 8);
}

function encodeVotingConfig(mode: VotingMode) {
  if (mode === "quadratic") return new Uint8Array([1]);
  if (mode === "dual") return new Uint8Array([2, 50, 50]);
  return new Uint8Array([0]);
}

function buildInitializeMintInstruction(mintPubkey: PublicKey, mintAuthority: PublicKey, decimals = 6) {
  const data = concatBytes(
    new Uint8Array([0]),
    new Uint8Array([decimals]),
    mintAuthority.toBytes(),
    new Uint8Array([0]),
  );

  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: mintPubkey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });
}

async function resolveLatestBlockhash(connection: Connection) {
  let latestError: unknown;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await connection.getLatestBlockhash("confirmed");
    } catch (latestBlockhashError) {
      latestError = latestBlockhashError;
      try {
        const recent = await connection.getRecentBlockhash("confirmed");
        return { blockhash: recent.blockhash, lastValidBlockHeight: 0 };
      } catch (recentBlockhashError) {
        latestError = recentBlockhashError;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }

  throw latestError instanceof Error
    ? latestError
    : new Error("Unable to resolve a devnet blockhash for DAO bootstrap.");
}

export async function buildCreateDaoBootstrapTransaction({
  authority,
  connection,
  delaySeconds = 5,
  name,
  quorum,
  revealWindowSeconds = 5,
  votingMode = "token",
}: CreateDaoBootstrapInput): Promise<CreateDaoBootstrapResult> {
  if (!name.trim()) {
    throw new Error("DAO name is required.");
  }
  if (!Number.isFinite(quorum) || quorum < 1 || quorum > 100) {
    throw new Error("Quorum must stay between 1 and 100.");
  }

  const mintSigner = Keypair.generate();
  const [dao] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), authority.toBuffer(), Buffer.from(name)],
    PRIVATE_DAO_PROGRAM_ID,
  );

  const mintRent = await connection.getMinimumBalanceForRentExemption(
    MINT_ACCOUNT_SPACE,
    "confirmed",
  );

  const createMintIx = SystemProgram.createAccount({
    fromPubkey: authority,
    newAccountPubkey: mintSigner.publicKey,
    lamports: mintRent,
    space: MINT_ACCOUNT_SPACE,
    programId: TOKEN_PROGRAM_ID,
  });

  const initMintIx = buildInitializeMintInstruction(mintSigner.publicKey, authority, 6);

  const daoData = concatBytes(
    await anchorMethodDiscriminator("initialize_dao"),
    encodeAnchorString(name),
    new Uint8Array([quorum]),
    encodeU64LE(0),
    encodeI64LE(revealWindowSeconds),
    encodeI64LE(delaySeconds),
    encodeVotingConfig(votingMode),
  );

  const createDaoIx = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: dao, isSigner: false, isWritable: true },
      { pubkey: mintSigner.publicKey, isSigner: false, isWritable: false },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(daoData),
  });

  const transaction = new Transaction().add(createMintIx, initMintIx, createDaoIx);
  transaction.feePayer = authority;

  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;
  transaction.partialSign(mintSigner);

  return {
    dao,
    governanceMint: mintSigner.publicKey,
    mintSigner,
    transaction,
  };
}
