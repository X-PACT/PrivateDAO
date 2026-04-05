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

type OperationalEvidence = {
  docs: string[];
  transactionSummary: {
    walletCount: number;
    totalTxCount: number;
  };
  zk: {
    proofCount: number;
  };
  adversarial: {
    totalScenarios: number;
    unexpectedSuccesses: number;
  };
  collisions: {
    finalizeSingleWinner: boolean;
    executeSingleWinner: boolean;
  };
  resilience: {
    failoverRecovered: boolean;
    staleBlockhashRecovered: boolean;
  };
};

type RealDeviceRuntimeEvidence = {
  status: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    successfulConnectCount: number;
    successfulSubmissionCount: number;
    diagnosticsCaptureCount: number;
    pendingTargets: string[];
  };
};

function main() {
  const runtime = readJson<RuntimeAttestation>("docs/runtime-attestation.generated.json");
  const walletMatrix = readJson<WalletMatrix>("docs/wallet-compatibility-matrix.generated.json");
  const canary = readJson<DevnetCanary>("docs/devnet-canary.generated.json");
  const resilience = readJson<DevnetResilience>("docs/devnet-resilience-report.json");
  const operational = readJson<OperationalEvidence>("docs/operational-evidence.generated.json");
  const realDevice = readJson<RealDeviceRuntimeEvidence>("docs/real-device-runtime.generated.json");

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
    realDevice: {
      status: realDevice.status,
      targetCount: realDevice.summary.targetCount,
      completedTargetCount: realDevice.summary.completedTargetCount,
      successfulConnectCount: realDevice.summary.successfulConnectCount,
      successfulSubmissionCount: realDevice.summary.successfulSubmissionCount,
      diagnosticsCaptureCount: realDevice.summary.diagnosticsCaptureCount,
      pendingTargets: realDevice.summary.pendingTargets,
    },
    operational: {
      walletCount: operational.transactionSummary.walletCount,
      totalTxCount: operational.transactionSummary.totalTxCount,
      zkProofCount: operational.zk.proofCount,
      adversarialScenarioCount: operational.adversarial.totalScenarios,
      unexpectedAdversarialSuccesses: operational.adversarial.unexpectedSuccesses,
      finalizeSingleWinner: operational.collisions.finalizeSingleWinner,
      executeSingleWinner: operational.collisions.executeSingleWinner,
      failoverRecovered: operational.resilience.failoverRecovered,
      staleBlockhashRecovered: operational.resilience.staleBlockhashRecovered,
    },
    docs: [
      "docs/wallet-runtime.md",
      "docs/real-device-runtime.md",
      "docs/real-device-runtime-captures.json",
      "docs/real-device-runtime.generated.md",
      "docs/real-device-runtime.generated.json",
      "docs/runtime-attestation.generated.json",
      "docs/operational-evidence.generated.md",
      "docs/operational-evidence.generated.json",
      "docs/wallet-compatibility-matrix.generated.md",
      "docs/devnet-canary.generated.md",
      "docs/devnet-resilience-report.md",
      "docs/fair-voting.md",
    ],
    commands: [
      "npm run build:operational-evidence",
      "npm run verify:operational-evidence",
      "npm run build:wallet-matrix",
      "npm run verify:wallet-matrix",
      "npm run build:real-device-runtime",
      "npm run verify:real-device-runtime",
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
      "It binds browser/runtime behavior to diagnostics, wallet matrix, canary, resilience evidence, and real-device capture intake in one summary.",
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
  realDevice: {
    status: string;
    targetCount: number;
    completedTargetCount: number;
    successfulConnectCount: number;
    successfulSubmissionCount: number;
    diagnosticsCaptureCount: number;
    pendingTargets: string[];
  };
  operational: {
    walletCount: number;
    totalTxCount: number;
    zkProofCount: number;
    adversarialScenarioCount: number;
    unexpectedAdversarialSuccesses: number;
    finalizeSingleWinner: boolean;
    executeSingleWinner: boolean;
    failoverRecovered: boolean;
    staleBlockhashRecovered: boolean;
  };
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

## Real-Device Runtime Intake

- Status: \`${evidence.realDevice.status}\`
- Target count: \`${evidence.realDevice.targetCount}\`
- Completed target count: \`${evidence.realDevice.completedTargetCount}\`
- Successful connect count: \`${evidence.realDevice.successfulConnectCount}\`
- Successful submission count: \`${evidence.realDevice.successfulSubmissionCount}\`
- Diagnostics capture count: \`${evidence.realDevice.diagnosticsCaptureCount}\`
- Pending targets: \`${evidence.realDevice.pendingTargets.join(", ") || "none"}\`

## Operational Summary

- Canonical wallet count: \`${evidence.operational.walletCount}\`
- Canonical tx count: \`${evidence.operational.totalTxCount}\`
- ZK proof count: \`${evidence.operational.zkProofCount}\`
- Adversarial scenarios: \`${evidence.operational.adversarialScenarioCount}\`
- Unexpected adversarial successes: \`${evidence.operational.unexpectedAdversarialSuccesses}\`
- Finalize single-winner: \`${evidence.operational.finalizeSingleWinner}\`
- Execute single-winner: \`${evidence.operational.executeSingleWinner}\`
- Failover recovered: \`${evidence.operational.failoverRecovered}\`
- Stale blockhash recovered: \`${evidence.operational.staleBlockhashRecovered}\`

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
