import fs from "fs";
import path from "path";

type RuntimeAttestation = {
  project: string;
  programId: string;
  verificationWallet: string;
  diagnosticsPage: string;
  runtimeDocs: string[];
  supportedWallets: Array<{ id: string; label: string }>;
};

type WalletMatrix = {
  programId: string;
  diagnosticsPage: string;
  entries: Array<{
    id: string;
    label: string;
    status: string;
    diagnosticsVisible: boolean;
    selectorVisible: boolean;
    note: string;
  }>;
};

type DevnetCanary = {
  network: string;
  programId: string;
  summary: {
    primaryHealthy: boolean;
    fallbackHealthy: boolean;
    anchorAccountsPresent: boolean;
    unexpectedFailures: number;
  };
  primaryRpc: { label: string; slot: number; blockhash: string };
  fallbackRpc: { label: string; slot: number; blockhash: string };
};

type DevnetResilience = {
  network: string;
  programId: string;
  failover: { recovered: boolean; fallbackRpcUrl: string };
  staleBlockhashRecovery: { rejectedAsExpected: boolean; recoveredTx: string };
  summary: {
    failoverRecovered: boolean;
    staleBlockhashRejected: boolean;
    staleBlockhashRecovered: boolean;
    unexpectedFailures: number;
  };
};

function main() {
  const runtime = readJson<RuntimeAttestation>("docs/runtime-attestation.generated.json");
  const walletMatrix = readJson<WalletMatrix>("docs/wallet-compatibility-matrix.generated.json");
  const canary = readJson<DevnetCanary>("docs/devnet-canary.generated.json");
  const resilience = readJson<DevnetResilience>("docs/devnet-resilience-report.json");

  const runtimeEvidence = {
    project: runtime.project,
    generatedAt: new Date().toISOString(),
    programId: runtime.programId,
    verificationWallet: runtime.verificationWallet,
    diagnosticsPage: runtime.diagnosticsPage,
    walletCount: runtime.supportedWallets.length,
    walletLabels: runtime.supportedWallets.map((entry) => entry.label),
    matrixStatuses: walletMatrix.entries.map((entry) => ({
      id: entry.id,
      label: entry.label,
      status: entry.status,
      diagnosticsVisible: entry.diagnosticsVisible,
      selectorVisible: entry.selectorVisible,
    })),
    devnetCanary: {
      network: canary.network,
      primaryHealthy: canary.summary.primaryHealthy,
      fallbackHealthy: canary.summary.fallbackHealthy,
      anchorAccountsPresent: canary.summary.anchorAccountsPresent,
      unexpectedFailures: canary.summary.unexpectedFailures ?? 0,
    },
    resilience: {
      fallbackRecovered: resilience.failover.recovered && resilience.summary.failoverRecovered,
      staleBlockhashRecovered: Boolean(resilience.staleBlockhashRecovery.recoveredTx) && resilience.summary.staleBlockhashRecovered,
      staleBlockhashRejected: resilience.staleBlockhashRecovery.rejectedAsExpected && resilience.summary.staleBlockhashRejected,
      unexpectedFailures: resilience.summary.unexpectedFailures ?? 0,
    },
    docs: [
      "docs/wallet-runtime.md",
      "docs/runtime-attestation.generated.json",
      "docs/wallet-compatibility-matrix.generated.md",
      "docs/devnet-canary.generated.md",
      "docs/devnet-resilience-report.md",
      "docs/fair-voting.md",
    ],
    commands: [
      "npm run build:wallet-matrix",
      "npm run verify:wallet-matrix",
      "npm run build:devnet-canary",
      "npm run verify:devnet-canary",
      "npm run test:devnet:resilience",
      "npm run verify:devnet:resilience-report",
      "npm run verify:runtime-surface",
      "npm run verify:all",
    ],
    notes: [
      "This runtime evidence package is Devnet-focused and reviewer-visible.",
      "It does not replace real device QA across every wallet release and browser combination.",
      "It binds browser/runtime behavior to diagnostics, wallet matrix, canary, and resilience evidence in one summary.",
    ],
  };

  const jsonPath = path.resolve("docs/runtime-evidence.generated.json");
  const mdPath = path.resolve("docs/runtime-evidence.generated.md");
  fs.writeFileSync(jsonPath, JSON.stringify(runtimeEvidence, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(runtimeEvidence));
  console.log("Wrote runtime evidence package");
}

function buildMarkdown(evidence: {
  generatedAt: string;
  programId: string;
  verificationWallet: string;
  diagnosticsPage: string;
  walletCount: number;
  walletLabels: string[];
  matrixStatuses: Array<{ id: string; label: string; status: string; diagnosticsVisible: boolean; selectorVisible: boolean }>;
  devnetCanary: { network: string; primaryHealthy: boolean; fallbackHealthy: boolean; anchorAccountsPresent: boolean; unexpectedFailures: number };
  resilience: { fallbackRecovered: boolean; staleBlockhashRecovered: boolean; staleBlockhashRejected: boolean; unexpectedFailures: number };
  docs: string[];
  commands: string[];
  notes: string[];
}) {
  return `# Runtime Evidence Package

## Overview

- Generated at: \`${evidence.generatedAt}\`
- Program id: \`${evidence.programId}\`
- Verification wallet: \`${evidence.verificationWallet}\`
- Diagnostics page: \`${evidence.diagnosticsPage}\`
- Supported wallet classes: \`${evidence.walletCount}\`

## Wallet Matrix

${evidence.matrixStatuses
  .map(
    (entry) =>
      `- ${entry.label} (\`${entry.id}\`) | status: \`${entry.status}\` | diagnostics: \`${entry.diagnosticsVisible}\` | selector: \`${entry.selectorVisible}\``,
  )
  .join("\n")}

## Devnet Canary Summary

- Network: \`${evidence.devnetCanary.network}\`
- Primary healthy: \`${evidence.devnetCanary.primaryHealthy}\`
- Fallback healthy: \`${evidence.devnetCanary.fallbackHealthy}\`
- Anchor accounts present: \`${evidence.devnetCanary.anchorAccountsPresent}\`
- Unexpected failures: \`${evidence.devnetCanary.unexpectedFailures}\`

## Resilience Summary

- RPC fallback recovered: \`${evidence.resilience.fallbackRecovered}\`
- Stale blockhash rejected: \`${evidence.resilience.staleBlockhashRejected}\`
- Stale blockhash recovered: \`${evidence.resilience.staleBlockhashRecovered}\`
- Unexpected failures: \`${evidence.resilience.unexpectedFailures}\`

## Runtime Documents

${evidence.docs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${evidence.commands.map((command) => `- \`${command}\``).join("\n")}

## Notes

${evidence.notes.map((note) => `- ${note}`).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
