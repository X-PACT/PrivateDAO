// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * utils.ts — shared helpers for PrivateDAO CLI scripts
 */
import * as path from "path";
import * as fs from "fs";

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
