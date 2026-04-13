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
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

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

type DaoAccountDetails = {
  authority: string;
  daoName: string;
  executionDelaySeconds: number;
  governanceToken: string;
  proposalCount: bigint;
  quorumPercentage: number;
  revealWindowSeconds: number;
  votingConfig: VotingMode;
};

type CreateProposalInput = {
  connection: Connection;
  daoAddress: PublicKey;
  description?: string;
  proposer: PublicKey;
  title: string;
  treasuryAction?: null;
  votingDurationSeconds?: number;
};

type CreateProposalResult = {
  dao: PublicKey;
  governanceMint: PublicKey;
  proposal: PublicKey;
  proposerTokenAccount: PublicKey;
  transaction: Transaction;
};

const SYSVAR_RENT_PUBKEY = new PublicKey("SysvarRent111111111111111111111111111111111");
const MINT_ACCOUNT_SPACE = 82;

function encodeU32LE(value: number) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, true);
  return out;
}

function parseU32LE(data: Uint8Array, offset: number) {
  return new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, true);
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

function parseU64LE(data: Uint8Array, offset: number) {
  return new DataView(data.buffer, data.byteOffset + offset, 8).getBigUint64(0, true);
}

function parseI64LE(data: Uint8Array, offset: number) {
  return Number(new DataView(data.buffer, data.byteOffset + offset, 8).getBigInt64(0, true));
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

function parseString(data: Uint8Array, offsetRef: { value: number }) {
  const length = parseU32LE(data, offsetRef.value);
  offsetRef.value += 4;
  const bytes = data.slice(offsetRef.value, offsetRef.value + length);
  offsetRef.value += length;
  return new TextDecoder().decode(bytes);
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

function deriveAssociatedTokenAddress(owner: PublicKey, mint: PublicKey) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
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

function decodeDaoAccount(data: Uint8Array): DaoAccountDetails {
  const offset = { value: 8 };
  const authority = new PublicKey(data.slice(offset.value, offset.value + 32)).toBase58();
  offset.value += 32;
  const daoName = parseString(data, offset);
  const governanceToken = new PublicKey(data.slice(offset.value, offset.value + 32)).toBase58();
  offset.value += 32;
  const quorumPercentage = data[offset.value];
  offset.value += 1;
  offset.value += 8; // governance_token_required
  const revealWindowSeconds = parseI64LE(data, offset.value);
  offset.value += 8;
  const executionDelaySeconds = parseI64LE(data, offset.value);
  offset.value += 8;
  const votingVariant = data[offset.value];
  offset.value += 1;
  let votingConfig: VotingMode = "token";
  if (votingVariant === 1) {
    votingConfig = "quadratic";
  } else if (votingVariant === 2) {
    votingConfig = "dual";
    offset.value += 2;
  }
  const proposalCount = parseU64LE(data, offset.value);

  return {
    authority,
    daoName,
    executionDelaySeconds,
    governanceToken,
    proposalCount,
    quorumPercentage,
    revealWindowSeconds,
    votingConfig,
  };
}

export async function fetchDaoAccountDetails(connection: Connection, daoAddress: PublicKey) {
  const info = await connection.getAccountInfo(daoAddress, "confirmed");
  if (!info) {
    throw new Error("DAO account was not found on devnet.");
  }

  return decodeDaoAccount(info.data);
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

export async function buildCreateProposalTransaction({
  connection,
  daoAddress,
  description,
  proposer,
  title,
  treasuryAction = null,
  votingDurationSeconds = 3600,
}: CreateProposalInput): Promise<CreateProposalResult> {
  if (!title.trim()) {
    throw new Error("Proposal title is required.");
  }
  if (!Number.isFinite(votingDurationSeconds) || votingDurationSeconds <= 0) {
    throw new Error("Proposal duration must be a positive number of seconds.");
  }

  const dao = await fetchDaoAccountDetails(connection, daoAddress);
  const governanceMint = new PublicKey(dao.governanceToken);
  const proposerTokenAccount = deriveAssociatedTokenAddress(proposer, governanceMint);
  const proposerTokenAccountInfo = await connection.getAccountInfo(proposerTokenAccount, "confirmed");
  if (!proposerTokenAccountInfo) {
    throw new Error("Governance token account was not found for the connected wallet.");
  }

  const [proposal] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), daoAddress.toBuffer(), Buffer.from(encodeU64LE(Number(dao.proposalCount)))],
    PRIVATE_DAO_PROGRAM_ID,
  );

  const data = concatBytes(
    await anchorMethodDiscriminator("create_proposal"),
    encodeAnchorString(title.trim()),
    encodeAnchorString((description ?? title).trim()),
    encodeI64LE(votingDurationSeconds),
    treasuryAction ? new Uint8Array([1]) : new Uint8Array([0]),
  );

  const instruction = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: daoAddress, isSigner: false, isWritable: true },
      { pubkey: proposal, isSigner: false, isWritable: true },
      { pubkey: proposerTokenAccount, isSigner: false, isWritable: false },
      { pubkey: proposer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = proposer;
  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;

  return {
    dao: daoAddress,
    governanceMint,
    proposal,
    proposerTokenAccount,
    transaction,
  };
}
