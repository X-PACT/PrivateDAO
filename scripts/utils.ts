// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * utils.ts — shared helpers for PrivateDAO CLI scripts
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as crypto from "crypto";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Load .env from project root if it exists
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/\${([^}]+)}/g, (_, k) => process.env[k] ?? "");
    if (!process.env[key]) process.env[key] = val;
  }
}

export function parseArgs(): Record<string, any> {
  const args   = process.argv.slice(2);
  const result: Record<string, any> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key     = args[i].slice(2);
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val     = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
      const parsedNumber = typeof val === "string" ? Number(val) : NaN;
      result[camelKey] =
        typeof val === "string" && Number.isFinite(parsedNumber) && String(parsedNumber) === val.trim()
          ? parsedNumber
          : val;
      if (val !== true) i++;
    }
  }

  return result;
}

export function workspaceProgram(): Program<any> & { account: any; methods: any } {
  return anchor.workspace.PrivateDao as Program<any> & { account: any; methods: any };
}

export function computeProposalCommitment(
  vote: boolean,
  salt: Buffer,
  voter: PublicKey,
  proposal: PublicKey,
): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, proposal.toBuffer(), voter.toBuffer()]))
    .digest();
}

export function shortKey(key: { toBase58(): string }): string {
  const s = key.toBase58();
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

export function formatSol(lamports: number | bigint): string {
  return `${(Number(lamports) / 1e9).toFixed(4)} SOL`;
}

export function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(" ");
}

export function proposalStatusLabel(status: any): string {
  const raw = JSON.stringify(status);
  if (raw.includes("Passed") || raw.includes("passed")) return "Passed";
  if (raw.includes("Failed") || raw.includes("failed")) return "Failed";
  if (raw.includes("Cancelled") || raw.includes("cancelled")) return "Cancelled";
  if (raw.includes("Vetoed") || raw.includes("vetoed")) return "Vetoed";
  if (raw.includes("Voting") || raw.includes("voting")) return "Voting";
  return raw;
}

export function proposalPhaseLabel(proposal: any, now: number): string {
  const status = proposalStatusLabel(proposal.status);
  if (proposal.isExecuted) return "Executed";
  if (status !== "Voting") {
    if (status === "Passed" && now < proposal.executionUnlocksAt.toNumber()) return "Timelocked";
    if (status === "Passed" && now >= proposal.executionUnlocksAt.toNumber()) return "Executable";
    return status;
  }
  if (now < proposal.votingEnd.toNumber()) return "Commit";
  if (now < proposal.revealEnd.toNumber()) return "Reveal";
  return "ReadyToFinalize";
}

export function solscanAccountUrl(address: string): string {
  return `https://solscan.io/account/${address}?cluster=devnet`;
}

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export function deriveConfidentialPayoutPlanPda(
  proposal: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("payout-plan"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveRefheEnvelopePda(
  proposal: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("refhe-envelope"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveMagicBlockPrivatePaymentCorridorPda(
  proposal: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("magicblock-corridor"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveDaoSecurityPolicyPda(dao: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("dao-security-policy"), dao.toBuffer()],
    programId,
  )[0];
}

export function deriveDaoGovernancePolicyV3Pda(dao: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("dao-governance-policy-v3"), dao.toBuffer()],
    programId,
  )[0];
}

export function deriveDaoSettlementPolicyV3Pda(dao: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("dao-settlement-policy-v3"), dao.toBuffer()],
    programId,
  )[0];
}

export function deriveProposalExecutionPolicySnapshotPda(proposal: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal-policy-snapshot"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveProposalGovernancePolicySnapshotV3Pda(
  proposal: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal-governance-snapshot-v3"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveProposalSettlementPolicySnapshotV3Pda(
  proposal: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal-settlement-policy-v3"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveRevealRebateVaultV3Pda(dao: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("reveal-rebate-vault-v3"), dao.toBuffer()],
    programId,
  )[0];
}

export function deriveProposalProofVerificationPda(proposal: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("proposal-proof-verification"), proposal.toBuffer()],
    programId,
  )[0];
}

export function deriveSettlementEvidencePda(
  proposal: PublicKey,
  payoutPlan: PublicKey,
  settlementId: Buffer,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("settlement-evidence"), proposal.toBuffer(), payoutPlan.toBuffer(), settlementId],
    programId,
  )[0];
}

export function deriveSettlementConsumptionRecordPda(evidence: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("settlement-consumption"), evidence.toBuffer()],
    programId,
  )[0];
}

export function proofDomainSeparator(dao: PublicKey, proposal: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.from("PrivateDAO::proof-payload:v1"))
    .update(dao.toBuffer())
    .update(proposal.toBuffer())
    .digest();
}

export function canonicalProposalPayloadHash(dao: PublicKey, proposal: PublicKey, version = 2): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.from("PrivateDAO::proof-payload:v1"))
    .update(dao.toBuffer())
    .update(proposal.toBuffer())
    .update(Buffer.from([version]))
    .digest();
}

function enumSeedByte(value: any, mapping: Record<string, number>): number {
  const key = Object.keys(value || {})[0];
  const seed = mapping[key];
  if (!seed) throw new Error(`Unsupported enum variant: ${JSON.stringify(value)}`);
  return seed;
}

export function canonicalPayoutFieldsHash(dao: PublicKey, proposal: PublicKey, payoutPlan: PublicKey, plan: any): Buffer {
  const tokenMint = plan.tokenMint ? new PublicKey(plan.tokenMint).toBuffer() : PublicKey.default.toBuffer();
  const recipientCount = Buffer.alloc(2);
  recipientCount.writeUInt16LE(Number(plan.recipientCount));
  return crypto
    .createHash("sha256")
    .update(Buffer.from("PrivateDAO::payout-payload:v1"))
    .update(dao.toBuffer())
    .update(proposal.toBuffer())
    .update(payoutPlan.toBuffer())
    .update(Buffer.from([enumSeedByte(plan.payoutType, { salary: 1, bonus: 2 })]))
    .update(Buffer.from([enumSeedByte(plan.assetType, { sol: 1, token: 2 })]))
    .update(new PublicKey(plan.settlementRecipient).toBuffer())
    .update(tokenMint)
    .update(recipientCount)
    .update(new anchor.BN(plan.totalAmount).toArrayLike(Buffer, "le", 8))
    .update(Buffer.from(plan.manifestHash))
    .update(Buffer.from(plan.ciphertextHash))
    .digest();
}

export async function resolveTokenProgramForMint(
  connection: Connection,
  mint: PublicKey,
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(mint, "confirmed");
  if (!info) {
    throw new Error(`Mint account not found: ${mint.toBase58()}`);
  }
  if (!info.owner.equals(TOKEN_PROGRAM_ID) && !info.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    throw new Error(`Unsupported token program for mint ${mint.toBase58()}: ${info.owner.toBase58()}`);
  }
  return info.owner;
}

export async function associatedTokenAddressForMint(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
): Promise<{ address: PublicKey; tokenProgram: PublicKey }> {
  const tokenProgram = await resolveTokenProgramForMint(connection, mint);
  return {
    address: getAssociatedTokenAddressSync(mint, owner, allowOwnerOffCurve, tokenProgram),
    tokenProgram,
  };
}

export function legacySaltPath(proposal: string): string {
  return path.join(os.homedir(), ".privatedao", "salts", `${proposal}.json`);
}

export function saltPath(proposal: string, voter: PublicKey | string): string {
  const voterStr = typeof voter === "string" ? voter : voter.toBase58();
  return path.join(os.homedir(), ".privatedao", "salts", `${proposal}-${voterStr}.json`);
}

export function ensureSaltDir(): string {
  const dir = path.join(os.homedir(), ".privatedao", "salts");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
