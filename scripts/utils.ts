// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * utils.ts — shared helpers for PrivateDAO CLI scripts
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { PublicKey } from "@solana/web3.js";

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
      result[camelKey] = typeof val === "string" && !isNaN(Number(val)) ? Number(val) : val;
      if (val !== true) i++;
    }
  }

  return result;
}

export function workspaceProgram(): Program<any> & { account: any; methods: any } {
  return anchor.workspace.PrivateDao as Program<any> & { account: any; methods: any };
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
