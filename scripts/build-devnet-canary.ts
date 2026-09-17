import fs from "fs";
import path from "path";
import { Connection, PublicKey } from "@solana/web3.js";

type ProofRegistry = {
  programId: string;
  verificationWallet: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
  pdaoToken?: {
    network?: string;
    tokenAccount: string;
    mint: string;
  };
};

type AnchorCheck = {
  label: string;
  address: string;
  exists: boolean;
  lamports?: number;
  owner?: string;
  executable?: boolean;
  dataLength?: number;
};

const DEFAULT_PRIMARY_RPC =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.SOLANA_RPC_URL ||
  process.env.SOLANA_URL ||
  "https://api.devnet.solana.com";
const DEFAULT_FALLBACK_RPC =
  process.env.DEVNET_FALLBACK_RPC ||
  process.env.RPC_FAST_DEVNET_RPC ||
  process.env.EXTRA_DEVNET_RPCS?.split(",").map((item) => item.trim()).find(Boolean) ||
  "https://api.devnet.solana.com";

async function main() {
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  const candidates = uniqueRpcUrls([DEFAULT_PRIMARY_RPC, DEFAULT_FALLBACK_RPC, "https://api.devnet.solana.com"]);
  const pdaoTokenNetwork = (proof.pdaoToken?.network ?? "Devnet").toLowerCase();
  const includePdaoTokenAccount = Boolean(proof.pdaoToken?.tokenAccount && pdaoTokenNetwork === "devnet");
  const anchorSpecs: Array<readonly [string, string]> = [
    ["program", proof.programId],
    ["verification-wallet", proof.verificationWallet],
    ["dao", proof.dao],
    ["treasury", proof.treasury],
    ["proposal", proof.proposal],
    ["governance-mint", proof.governanceMint],
  ];
  if (includePdaoTokenAccount) anchorSpecs.push(["pdao-token-account", proof.pdaoToken!.tokenAccount]);
  const primaryResult = await firstCanaryRpc("primary", candidates, anchorSpecs);
  if (!primaryResult) throw new Error("No configured Solana Devnet RPC responded successfully.");
  const fallbackResult = await firstHealthyRpc(
    "fallback",
    candidates.filter((url) => url !== primaryResult.url),
  );
  const primary = primaryResult.connection;
  const primaryHealth = primaryResult.health;
  const fallbackHealth = fallbackResult?.health ?? null;
  const anchorChecks = primaryResult.anchorChecks;
  const tokenSupply = primaryResult.tokenSupply;

  const report = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    network: "devnet",
    programId: proof.programId,
    primaryRpc: primaryHealth,
    fallbackRpc: fallbackHealth,
    anchors: anchorChecks,
    tokenSupply: {
      mint: proof.governanceMint,
      amount: tokenSupply?.value.amount ?? null,
      decimals: tokenSupply?.value.decimals ?? null,
      uiAmountString: tokenSupply?.value.uiAmountString ?? null,
      status: tokenSupply ? "captured" : "unavailable-from-primary-rpc",
    },
    summary: {
      primaryHealthy: true,
      fallbackHealthy: Boolean(fallbackHealth),
      anchorAccountsPresent: anchorChecks.every((entry) => entry.exists),
      unexpectedFailures: tokenSupply ? 0 : 1,
    },
  };

  const md = `# Devnet Canary Report

- network: devnet
- program id: \`${report.programId}\`
- primary rpc: \`${primaryHealth.url}\`
- fallback rpc: \`${fallbackHealth?.url ?? "unavailable"}\`
- primary healthy: yes
- fallback healthy: yes
- anchor accounts present: ${report.summary.anchorAccountsPresent ? "yes" : "no"}
- unexpected failures: ${report.summary.unexpectedFailures}

## RPC Health

- primary slot: ${primaryHealth.slot}
- primary blockhash: \`${primaryHealth.blockhash}\`
- primary version latency: ${primaryHealth.versionLatencyMs} ms
- primary blockhash latency: ${primaryHealth.blockhashLatencyMs} ms
- fallback slot: ${fallbackHealth?.slot ?? "unavailable"}
- fallback blockhash: \`${fallbackHealth?.blockhash ?? "unavailable"}\`
- fallback version latency: ${fallbackHealth?.versionLatencyMs ?? "unavailable"} ms
- fallback blockhash latency: ${fallbackHealth?.blockhashLatencyMs ?? "unavailable"} ms

## Anchor Checks

${anchorChecks
  .map(
    (entry) =>
      `- ${entry.label}: \`${entry.address}\` | exists: ${entry.exists ? "yes" : "no"} | owner: \`${entry.owner || "n/a"}\` | lamports: ${entry.lamports ?? 0} | data length: ${entry.dataLength ?? 0}`,
  )
  .join("\n")}

## Governance Mint Supply

- mint: \`${report.tokenSupply.mint}\`
- ui amount: \`${report.tokenSupply.uiAmountString ?? "unavailable"}\`
- decimals: \`${report.tokenSupply.decimals ?? "unavailable"}\`
- status: \`${report.tokenSupply.status}\`

## Interpretation

This read-only canary checks live legacy Devnet RPC health and canonical archived PrivateDAO anchors without mutating protocol state. The current PDAO Token-2022 mint is on Testnet, so it is intentionally excluded from this legacy Devnet account-presence gate.
`;

  writeJson("docs/devnet-canary.generated.json", report);
  fs.writeFileSync(path.resolve("docs/devnet-canary.generated.md"), md, "utf8");
  console.log("Wrote devnet canary report");
}

async function measureRpc(label: "primary" | "fallback", url: string, connection: Connection) {
  const versionStarted = Date.now();
  const version = await connection.getVersion();
  const versionLatencyMs = Date.now() - versionStarted;

  const blockhashStarted = Date.now();
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  const blockhashLatencyMs = Date.now() - blockhashStarted;

  const slot = await connection.getSlot("confirmed");

  return {
    label,
    url: redactRpcUrl(url),
    version: version["solana-core"],
    slot,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    versionLatencyMs,
    blockhashLatencyMs,
  };
}

async function firstHealthyRpc(label: "primary" | "fallback", urls: string[]) {
  for (const url of urls) {
    try {
      const connection = new Connection(url, "confirmed");
      const health = await measureRpc(label, url, connection);
      return { url, connection, health };
    } catch {
      // A provider outage is expected to be recoverable through the next candidate.
    }
  }
  return null;
}

async function firstCanaryRpc(
  label: "primary" | "fallback",
  urls: string[],
  anchorSpecs: readonly (readonly [string, string])[],
) {
  let firstHealthy: {
    url: string;
    connection: Connection;
    health: Awaited<ReturnType<typeof measureRpc>>;
    anchorChecks: AnchorCheck[];
    tokenSupply: Awaited<ReturnType<typeof readTokenSupply>>;
  } | null = null;
  for (const url of urls) {
    try {
      const connection = new Connection(url, "confirmed");
      const health = await measureRpc(label, url, connection);
      const anchorChecks = await Promise.all(anchorSpecs.map(([anchorLabel, address]) => inspectAccount(connection, anchorLabel, address)));
      const tokenSupply = await readTokenSupply(connection, anchorSpecs.find(([anchorLabel]) => anchorLabel === "governance-mint")![1]);
      const result = { url, connection, health, anchorChecks, tokenSupply };
      if (!firstHealthy) firstHealthy = result;
      if (anchorChecks.every((entry) => entry.exists) && tokenSupply) return result;
    } catch {
      // Continue to the next candidate; no endpoint is trusted on partial health alone.
    }
  }
  return firstHealthy;
}

function uniqueRpcUrls(urls: string[]): string[] {
  return urls.filter((url, index) => url && urls.indexOf(url) === index);
}

function redactRpcUrl(url: string) {
  return url.replace(/([?&](?:api[_-]?key|token|key)=)[^&]+/gi, "$1REDACTED");
}

async function inspectAccount(connection: Connection, label: string, address: string): Promise<AnchorCheck> {
  const info = await connection.getAccountInfo(new PublicKey(address), "confirmed");
  return {
    label,
    address,
    exists: Boolean(info),
    lamports: info?.lamports,
    owner: info?.owner.toBase58(),
    executable: info?.executable,
    dataLength: info?.data.length,
  };
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function writeJson(relativePath: string, value: unknown) {
  fs.writeFileSync(path.resolve(relativePath), JSON.stringify(value, null, 2) + "\n");
}

async function readTokenSupply(connection: Connection, mint: string) {
  try {
    return await connection.getTokenSupply(new PublicKey(mint));
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error("[devnet-canary] failed");
  console.error(error);
  process.exit(1);
});
