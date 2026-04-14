"use client";

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const PRIVATE_DAO_PROGRAM_ID = new PublicKey("5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx");
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
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
  treasuryAction?: TreasuryActionInput | null;
  votingDurationSeconds?: number;
};

type CreateProposalResult = {
  dao: PublicKey;
  governanceMint: PublicKey;
  proposal: PublicKey;
  proposerTokenAccount: PublicKey;
  transaction: Transaction;
};

type ProposalAccountDetails = {
  dao: string;
  executionUnlocksAt: number;
  hasTreasuryAction: boolean;
  isExecuted: boolean;
  proposalId: bigint;
  revealEnd: number;
  status: "Voting" | "Passed" | "Failed" | "Cancelled" | "Vetoed" | "Unknown";
  treasuryAction: TreasuryActionDetails | null;
  title: string;
  votingEnd: number;
};

type TreasuryActionInput =
  | {
      actionType: "SendSol";
      amountLamports: bigint;
      recipient: PublicKey;
    }
  | {
      actionType: "SendToken";
      amountLamports: bigint;
      recipient: PublicKey;
      tokenMint: PublicKey;
    }
  | {
      actionType: "CustomCPI";
      amountLamports: bigint;
      recipient: PublicKey;
    };

type TreasuryActionDetails = {
  actionType: "SendSol" | "SendToken" | "CustomCPI" | "Unknown";
  amountLamports: bigint;
  amountSol: number;
  recipient: string;
  tokenMint: string | null;
};

type CommitVoteInput = {
  commitment: Uint8Array;
  connection: Connection;
  daoAddress: PublicKey;
  proposalAddress: PublicKey;
  voter: PublicKey;
  voterRevealAuthority?: PublicKey | null;
};

type RevealVoteInput = {
  connection: Connection;
  proposalAddress: PublicKey;
  salt: Uint8Array;
  vote: boolean;
  voter: PublicKey;
};

type FinalizeProposalInput = {
  connection: Connection;
  daoAddress: PublicKey;
  finalizer: PublicKey;
  proposalAddress: PublicKey;
};

type ExecuteProposalInput = {
  connection: Connection;
  daoAddress: PublicKey;
  executor: PublicKey;
  proposalAddress: PublicKey;
  treasuryRecipient?: PublicKey;
  treasuryTokenMint?: PublicKey | null;
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

function encodeU64LE(value: number | bigint) {
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

function encodeTreasuryAction(action: TreasuryActionInput | null | undefined) {
  if (!action) {
    return new Uint8Array([0]);
  }

  const actionType =
    action.actionType === "SendSol"
      ? new Uint8Array([0])
      : action.actionType === "SendToken"
        ? new Uint8Array([1])
        : new Uint8Array([2]);

  return concatBytes(
    new Uint8Array([1]),
    actionType,
    encodeU64LE(action.amountLamports),
    action.recipient.toBytes(),
    action.actionType === "SendToken"
      ? concatBytes(new Uint8Array([1]), action.tokenMint.toBytes())
      : new Uint8Array([0]),
  );
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

function deriveAssociatedTokenAddress(
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram: PublicKey = TOKEN_PROGRAM_ID,
) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), tokenProgram.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
}

async function resolveTokenProgramForMint(connection: Connection, mint: PublicKey) {
  const info = await connection.getAccountInfo(mint, "confirmed");
  if (!info) {
    throw new Error(`Mint account not found: ${mint.toBase58()}`);
  }
  if (!info.owner.equals(TOKEN_PROGRAM_ID) && !info.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    throw new Error(`Unsupported token program for mint ${mint.toBase58()}: ${info.owner.toBase58()}`);
  }
  return info.owner;
}

function buildCreateAssociatedTokenAccountInstruction(
  payer: PublicKey,
  ata: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tokenProgram: PublicKey,
) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0),
  });
}

function buildMintToInstruction(
  mintPubkey: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
  amount: bigint,
) {
  return new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: mintPubkey, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: false },
    ],
    data: Buffer.from(concatBytes(new Uint8Array([7]), encodeU64LE(amount))),
  });
}

function deriveVoteRecordAddress(proposal: PublicKey, voter: PublicKey) {
  const [voteRecord] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposal.toBuffer(), voter.toBuffer()],
    PRIVATE_DAO_PROGRAM_ID,
  );
  return voteRecord;
}

function deriveDelegationMarkerAddress(proposal: PublicKey, voter: PublicKey) {
  const [delegationMarker] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegation"), proposal.toBuffer(), voter.toBuffer()],
    PRIVATE_DAO_PROGRAM_ID,
  );
  return delegationMarker;
}

function deriveTreasuryAddress(dao: PublicKey) {
  const [treasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), dao.toBuffer()],
    PRIVATE_DAO_PROGRAM_ID,
  );
  return treasury;
}

function deriveConfidentialPayoutPlanAddress(proposal: PublicKey) {
  const [plan] = PublicKey.findProgramAddressSync(
    [Buffer.from("payout-plan"), proposal.toBuffer()],
    PRIVATE_DAO_PROGRAM_ID,
  );
  return plan;
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

function decodeProposalAccount(data: Uint8Array): ProposalAccountDetails {
  const offset = { value: 8 };
  const dao = new PublicKey(data.slice(offset.value, offset.value + 32)).toBase58();
  offset.value += 32;
  offset.value += 32; // proposer
  const proposalId = parseU64LE(data, offset.value);
  offset.value += 8;
  const title = parseString(data, offset);
  offset.value += parseU32LE(data, offset.value) + 4; // description
  const statusByte = data[offset.value];
  offset.value += 1;
  const votingEnd = parseI64LE(data, offset.value);
  offset.value += 8;
  const revealEnd = parseI64LE(data, offset.value);
  offset.value += 8;
  offset.value += 8 * 6; // yes/no tallies + commit/reveal counts
  const hasTreasuryAction = data[offset.value] === 1;
  let treasuryAction: TreasuryActionDetails | null = null;
  offset.value += 1;
  if (hasTreasuryAction) {
    const actionTypeByte = data[offset.value];
    offset.value += 1;
    const amountLamports = parseU64LE(data, offset.value);
    offset.value += 8;
    const recipient = new PublicKey(data.slice(offset.value, offset.value + 32)).toBase58();
    offset.value += 32;
    const hasTokenMint = data[offset.value] === 1;
    offset.value += 1;
    let tokenMint: string | null = null;
    if (hasTokenMint) {
      tokenMint = new PublicKey(data.slice(offset.value, offset.value + 32)).toBase58();
    }
    offset.value += 32;

    treasuryAction = {
      actionType:
        actionTypeByte === 0
          ? "SendSol"
          : actionTypeByte === 1
            ? "SendToken"
            : actionTypeByte === 2
              ? "CustomCPI"
              : "Unknown",
      amountLamports,
      amountSol: Number(amountLamports) / LAMPORTS_PER_SOL,
      recipient,
      tokenMint,
    };
  } else {
    offset.value += 74;
  }
  const executionUnlocksAt = parseI64LE(data, offset.value);
  offset.value += 8;
  const isExecuted = data[offset.value] === 1;

  const status =
    statusByte === 0
      ? "Voting"
      : statusByte === 1
        ? "Passed"
        : statusByte === 2
          ? "Failed"
          : statusByte === 3
            ? "Cancelled"
            : statusByte === 4
              ? "Vetoed"
              : "Unknown";

  return {
    dao,
    executionUnlocksAt,
    hasTreasuryAction,
    isExecuted,
    proposalId,
    revealEnd,
    status,
    treasuryAction,
    title,
    votingEnd,
  };
}

export async function fetchDaoAccountDetails(connection: Connection, daoAddress: PublicKey) {
  const info = await connection.getAccountInfo(daoAddress, "confirmed");
  if (!info) {
    throw new Error("DAO account was not found on devnet.");
  }

  return decodeDaoAccount(info.data);
}

export async function fetchProposalAccountDetails(connection: Connection, proposalAddress: PublicKey) {
  const info = await connection.getAccountInfo(proposalAddress, "confirmed");
  if (!info) {
    throw new Error("Proposal account was not found on devnet.");
  }

  return decodeProposalAccount(info.data);
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
  const authorityTokenAccount = deriveAssociatedTokenAddress(authority, mintSigner.publicKey, TOKEN_PROGRAM_ID);
  const authorityTokenAccountInfo = await connection.getAccountInfo(authorityTokenAccount, "confirmed");

  const createMintIx = SystemProgram.createAccount({
    fromPubkey: authority,
    newAccountPubkey: mintSigner.publicKey,
    lamports: mintRent,
    space: MINT_ACCOUNT_SPACE,
    programId: TOKEN_PROGRAM_ID,
  });

  const initMintIx = buildInitializeMintInstruction(mintSigner.publicKey, authority, 6);
  const createAuthorityTokenAccountIx = authorityTokenAccountInfo
    ? null
    : buildCreateAssociatedTokenAccountInstruction(
        authority,
        authorityTokenAccount,
        authority,
        mintSigner.publicKey,
        TOKEN_PROGRAM_ID,
      );
  const mintInitialGovernanceSupplyIx = buildMintToInstruction(
    mintSigner.publicKey,
    authorityTokenAccount,
    authority,
    1_000_000_000n,
  );

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

  const transaction = new Transaction().add(createMintIx, initMintIx);
  if (createAuthorityTokenAccountIx) {
    transaction.add(createAuthorityTokenAccountIx);
  }
  transaction.add(mintInitialGovernanceSupplyIx, createDaoIx);
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
    encodeTreasuryAction(treasuryAction),
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

export async function computeProposalCommitment(
  vote: boolean,
  salt: Uint8Array,
  proposal: PublicKey,
  voter: PublicKey,
) {
  const preimage = concatBytes(
    new Uint8Array([vote ? 1 : 0]),
    salt,
    proposal.toBytes(),
    voter.toBytes(),
  );
  const digest = await crypto.subtle.digest("SHA-256", preimage);
  return new Uint8Array(digest);
}

export async function buildCommitVoteTransaction({
  commitment,
  connection,
  daoAddress,
  proposalAddress,
  voter,
  voterRevealAuthority = null,
}: CommitVoteInput) {
  const dao = await fetchDaoAccountDetails(connection, daoAddress);
  const governanceMint = new PublicKey(dao.governanceToken);
  const voterTokenAccount = deriveAssociatedTokenAddress(voter, governanceMint);
  const voterTokenAccountInfo = await connection.getAccountInfo(voterTokenAccount, "confirmed");
  if (!voterTokenAccountInfo) {
    throw new Error("Governance token account was not found for the connected wallet.");
  }

  const delegationMarker = deriveDelegationMarkerAddress(proposalAddress, voter);
  const voterRecord = deriveVoteRecordAddress(proposalAddress, voter);
  const data = concatBytes(
    await anchorMethodDiscriminator("commit_vote"),
    commitment,
    voterRevealAuthority
      ? concatBytes(new Uint8Array([1]), voterRevealAuthority.toBytes())
      : new Uint8Array([0]),
  );

  const instruction = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: daoAddress, isSigner: false, isWritable: false },
      { pubkey: proposalAddress, isSigner: false, isWritable: true },
      { pubkey: voterRecord, isSigner: false, isWritable: true },
      { pubkey: delegationMarker, isSigner: false, isWritable: false },
      { pubkey: voterTokenAccount, isSigner: false, isWritable: false },
      { pubkey: voter, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = voter;
  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;

  return {
    governanceMint,
    transaction,
    voterRecord,
    voterTokenAccount,
  };
}

export async function buildRevealVoteTransaction({
  connection,
  proposalAddress,
  salt,
  vote,
  voter,
}: RevealVoteInput) {
  if (salt.length !== 32) {
    throw new Error("Reveal salt must be exactly 32 bytes.");
  }

  const voterRecord = deriveVoteRecordAddress(proposalAddress, voter);
  const data = concatBytes(
    await anchorMethodDiscriminator("reveal_vote"),
    new Uint8Array([vote ? 1 : 0]),
    salt,
  );

  const instruction = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: proposalAddress, isSigner: false, isWritable: true },
      { pubkey: voterRecord, isSigner: false, isWritable: true },
      { pubkey: voter, isSigner: true, isWritable: true },
    ],
    data: Buffer.from(data),
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = voter;
  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;

  return {
    transaction,
    voterRecord,
  };
}

export async function buildFinalizeProposalTransaction({
  connection,
  daoAddress,
  finalizer,
  proposalAddress,
}: FinalizeProposalInput) {
  const data = await anchorMethodDiscriminator("finalize_proposal");

  const instruction = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: daoAddress, isSigner: false, isWritable: false },
      { pubkey: proposalAddress, isSigner: false, isWritable: true },
      { pubkey: finalizer, isSigner: true, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = finalizer;
  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;

  return { transaction };
}

export async function buildExecuteProposalTransaction({
  connection,
  daoAddress,
  executor,
  proposalAddress,
  treasuryRecipient = executor,
  treasuryTokenMint = null,
}: ExecuteProposalInput) {
  const treasury = deriveTreasuryAddress(daoAddress);
  const confidentialPayoutPlan = deriveConfidentialPayoutPlanAddress(proposalAddress);
  const data = await anchorMethodDiscriminator("execute_proposal");
  let tokenProgram = TOKEN_PROGRAM_ID;
  let treasuryTokenAccount = treasury;
  let recipientTokenAccount = treasury;
  const preInstructions: TransactionInstruction[] = [];

  if (treasuryTokenMint) {
    tokenProgram = await resolveTokenProgramForMint(connection, treasuryTokenMint);
    treasuryTokenAccount = deriveAssociatedTokenAddress(treasury, treasuryTokenMint, tokenProgram);
    recipientTokenAccount = deriveAssociatedTokenAddress(treasuryRecipient, treasuryTokenMint, tokenProgram);

    const recipientTokenInfo = await connection.getAccountInfo(recipientTokenAccount, "confirmed");
    if (!recipientTokenInfo) {
      preInstructions.push(
        buildCreateAssociatedTokenAccountInstruction(
          executor,
          recipientTokenAccount,
          treasuryRecipient,
          treasuryTokenMint,
          tokenProgram,
        ),
      );
    }
  }

  const instruction = new TransactionInstruction({
    programId: PRIVATE_DAO_PROGRAM_ID,
    keys: [
      { pubkey: daoAddress, isSigner: false, isWritable: false },
      { pubkey: proposalAddress, isSigner: false, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: true },
      { pubkey: executor, isSigner: true, isWritable: false },
      { pubkey: treasuryRecipient, isSigner: false, isWritable: true },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true },
      { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
      { pubkey: confidentialPayoutPlan, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(data),
  });

  const transaction = new Transaction();
  for (const preInstruction of preInstructions) {
    transaction.add(preInstruction);
  }
  transaction.add(instruction);
  transaction.feePayer = executor;
  const latest = await resolveLatestBlockhash(connection);
  transaction.recentBlockhash = latest.blockhash;

  return {
    confidentialPayoutPlan,
    transaction,
    treasury,
  };
}
