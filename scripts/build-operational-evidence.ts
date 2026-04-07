import fs from "fs";
import path from "path";

type PerformanceMetrics = {
  generatedAt: string;
  runLabel: string;
  network: string;
  walletCount: number;
  totalTxCount: number;
  totalAttemptCount: number;
  successCount: number;
  failureCount: number;
  retryCount: number;
  totalExecutionTimeMs: number;
  averageTxLatencyMs: number;
  failureRate: number;
  retryRate: number;
};

type TxRegistry = {
  generatedAt: string;
  runLabel: string;
  network: string;
  entries: Array<{
    wallet_pubkey: string;
    role: string;
    phase: string;
    action: string;
    tx_signature: string;
    explorer_url: string;
    timestamp: string;
    latency_ms?: number | null;
    wave?: number | null;
  }>;
};

type AdversarialReport = {
  generatedAt: string;
  runLabel: string;
  network: string;
  total_scenarios: number;
  rejected: number;
  unexpected_successes: number;
};

type ZkProofRegistry = {
  generatedAt: string;
  runLabel: string;
  verification_mode: string;
  onchain_verifier: boolean;
  onchain_proof_anchors?: {
    proposal_public_key: string;
    entries: Array<{
      layer: string;
      anchor_pda: string;
      tx_signature: string;
      explorer_url: string;
    }>;
  };
  entries: Array<{
    layer: string;
    circuit: string;
    verified: boolean;
    verification_tx_signature: string | null;
  }>;
};

type MultiProposalReport = {
  generatedAt: string;
  runLabel: string;
  network: string;
  summary: {
    proposalCount: number;
    executedCount: number;
    crossProposalRejections: number;
    unexpectedSuccesses: number;
  };
};

type RaceReport = {
  generatedAt: string;
  runLabel: string;
  network: string;
  finalizeRace: { successCount: number; rejectedCount: number };
  executeRace: { successCount: number; rejectedCount: number };
  summary: {
    finalizeSingleWinner: boolean;
    executeSingleWinner: boolean;
    unexpectedSuccesses: number;
  };
};

type ResilienceReport = {
  generatedAt: string;
  runLabel: string;
  network: string;
  summary: {
    failoverRecovered: boolean;
    staleBlockhashRejected: boolean;
    staleBlockhashRecovered: boolean;
    unexpectedFailures: number;
  };
};

function main() {
  const metrics = readJson<PerformanceMetrics>("docs/performance-metrics.json");
  const txRegistry = readJson<TxRegistry>("docs/devnet-tx-registry.json");
  const adversarial = readJson<AdversarialReport>("docs/adversarial-report.json");
  const zk = readJson<ZkProofRegistry>("docs/zk-proof-registry.json");
  const multi = readJson<MultiProposalReport>("docs/devnet-multi-proposal-report.json");
  const race = readJson<RaceReport>("docs/devnet-race-report.json");
  const resilience = readJson<ResilienceReport>("docs/devnet-resilience-report.json");

  const phaseCounts = summarizePhases(txRegistry.entries);
  const layerCounts = summarizeZkLayers(zk.entries);
  const verifiedZk = zk.entries.filter((entry) => entry.verified).length;

  const artifact = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    network: metrics.network,
    runLabels: {
      canonical: metrics.runLabel,
      multiProposal: multi.runLabel,
      race: race.runLabel,
      resilience: resilience.runLabel,
    },
    transactionSummary: {
      walletCount: metrics.walletCount,
      totalTxCount: metrics.totalTxCount,
      totalAttemptCount: metrics.totalAttemptCount,
      successCount: metrics.successCount,
      failureCount: metrics.failureCount,
      retryCount: metrics.retryCount,
      averageTxLatencyMs: round(metrics.averageTxLatencyMs),
      totalExecutionTimeMs: metrics.totalExecutionTimeMs,
      failureRate: round(metrics.failureRate),
      retryRate: round(metrics.retryRate),
      phaseCounts,
    },
    voting: {
      fullLifecycleReport: "docs/load-test-report.md",
      bootstrapRegistry: "docs/devnet-bootstrap.json",
      txRegistry: "docs/devnet-tx-registry.json",
      proposalIsolation: {
        proposalCount: multi.summary.proposalCount,
        executedCount: multi.summary.executedCount,
        crossProposalRejections: multi.summary.crossProposalRejections,
        unexpectedSuccesses: multi.summary.unexpectedSuccesses,
        reportMd: "docs/devnet-multi-proposal-report.md",
        reportJson: "docs/devnet-multi-proposal-report.json",
      },
    },
    zk: {
      verificationMode: zk.verification_mode,
      onchainVerifier: zk.onchain_verifier,
      onchainAnchorCount: zk.onchain_proof_anchors?.entries.length ?? 0,
      onchainAnchorProposal: zk.onchain_proof_anchors?.proposal_public_key ?? null,
      proofCount: zk.entries.length,
      verifiedProofCount: verifiedZk,
      layerCounts,
      registry: "docs/zk-proof-registry.json",
    },
    adversarial: {
      totalScenarios: adversarial.total_scenarios,
      rejected: adversarial.rejected,
      unexpectedSuccesses: adversarial.unexpected_successes,
      report: "docs/adversarial-report.json",
    },
    resilience: {
      failoverRecovered: resilience.summary.failoverRecovered,
      staleBlockhashRejected: resilience.summary.staleBlockhashRejected,
      staleBlockhashRecovered: resilience.summary.staleBlockhashRecovered,
      unexpectedFailures: resilience.summary.unexpectedFailures,
      reportMd: "docs/devnet-resilience-report.md",
      reportJson: "docs/devnet-resilience-report.json",
    },
    collisions: {
      finalizeSuccessCount: race.finalizeRace.successCount,
      finalizeRejectedCount: race.finalizeRace.rejectedCount,
      executeSuccessCount: race.executeRace.successCount,
      executeRejectedCount: race.executeRace.rejectedCount,
      finalizeSingleWinner: race.summary.finalizeSingleWinner,
      executeSingleWinner: race.summary.executeSingleWinner,
      unexpectedSuccesses: race.summary.unexpectedSuccesses,
      reportMd: "docs/devnet-race-report.md",
      reportJson: "docs/devnet-race-report.json",
    },
    commands: [
      "npm run test:devnet:all",
      "npm run test:devnet:multi",
      "npm run test:devnet:race",
      "npm run test:devnet:resilience",
      "npm run build:operational-evidence",
      "npm run verify:operational-evidence",
      "npm run verify:all",
    ],
    docs: [
      "docs/load-test-report.md",
      "docs/devnet-bootstrap.json",
      "docs/devnet-tx-registry.json",
      "docs/performance-metrics.json",
      "docs/adversarial-report.json",
      "docs/zk-proof-registry.json",
      "docs/devnet-multi-proposal-report.md",
      "docs/devnet-multi-proposal-report.json",
      "docs/devnet-race-report.md",
      "docs/devnet-race-report.json",
      "docs/devnet-resilience-report.md",
      "docs/devnet-resilience-report.json",
    ],
  };

  fs.writeFileSync(path.resolve("docs/operational-evidence.generated.json"), JSON.stringify(artifact, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/operational-evidence.generated.md"), buildMarkdown(artifact));
  console.log("Wrote operational evidence package");
}

function buildMarkdown(artifact: {
  generatedAt: string;
  network: string;
  runLabels: Record<string, string>;
  transactionSummary: {
    walletCount: number;
    totalTxCount: number;
    totalAttemptCount: number;
    successCount: number;
    failureCount: number;
    retryCount: number;
    averageTxLatencyMs: number;
    totalExecutionTimeMs: number;
    failureRate: number;
    retryRate: number;
    phaseCounts: Record<string, number>;
  };
  voting: {
    fullLifecycleReport: string;
    bootstrapRegistry: string;
    txRegistry: string;
    proposalIsolation: {
      proposalCount: number;
      executedCount: number;
      crossProposalRejections: number;
      unexpectedSuccesses: number;
      reportMd: string;
      reportJson: string;
    };
  };
  zk: {
    verificationMode: string;
    onchainVerifier: boolean;
    proofCount: number;
    verifiedProofCount: number;
    layerCounts: Record<string, number>;
    registry: string;
  };
  adversarial: {
    totalScenarios: number;
    rejected: number;
    unexpectedSuccesses: number;
    report: string;
  };
  resilience: {
    failoverRecovered: boolean;
    staleBlockhashRejected: boolean;
    staleBlockhashRecovered: boolean;
    unexpectedFailures: number;
    reportMd: string;
    reportJson: string;
  };
  collisions: {
    finalizeSuccessCount: number;
    finalizeRejectedCount: number;
    executeSuccessCount: number;
    executeRejectedCount: number;
    finalizeSingleWinner: boolean;
    executeSingleWinner: boolean;
    unexpectedSuccesses: number;
    reportMd: string;
    reportJson: string;
  };
  commands: string[];
  docs: string[];
}) {
  return `# Operational Evidence Package

## Overview

- Generated at: \`${artifact.generatedAt}\`
- Network: \`${artifact.network}\`
- Canonical run label: \`${artifact.runLabels.canonical}\`
- Multi-proposal run label: \`${artifact.runLabels.multiProposal}\`
- Race run label: \`${artifact.runLabels.race}\`
- Resilience run label: \`${artifact.runLabels.resilience}\`

## Transaction Summary

- Wallet count: \`${artifact.transactionSummary.walletCount}\`
- Total transactions: \`${artifact.transactionSummary.totalTxCount}\`
- Total attempts: \`${artifact.transactionSummary.totalAttemptCount}\`
- Success count: \`${artifact.transactionSummary.successCount}\`
- Failure count: \`${artifact.transactionSummary.failureCount}\`
- Retry count: \`${artifact.transactionSummary.retryCount}\`
- Average tx latency ms: \`${artifact.transactionSummary.averageTxLatencyMs}\`
- Total execution time ms: \`${artifact.transactionSummary.totalExecutionTimeMs}\`
- Failure rate: \`${artifact.transactionSummary.failureRate}\`
- Retry rate: \`${artifact.transactionSummary.retryRate}\`

### Phase Counts

${Object.entries(artifact.transactionSummary.phaseCounts)
  .map(([phase, count]) => `- ${phase}: \`${count}\``)
  .join("\n")}

## Voting And Lifecycle Evidence

- Full lifecycle report: \`${artifact.voting.fullLifecycleReport}\`
- Bootstrap registry: \`${artifact.voting.bootstrapRegistry}\`
- Explorer tx registry: \`${artifact.voting.txRegistry}\`
- Multi-proposal executed: \`${artifact.voting.proposalIsolation.executedCount}/${artifact.voting.proposalIsolation.proposalCount}\`
- Cross-proposal rejections: \`${artifact.voting.proposalIsolation.crossProposalRejections}\`
- Multi-proposal unexpected successes: \`${artifact.voting.proposalIsolation.unexpectedSuccesses}\`
- Multi-proposal markdown: \`${artifact.voting.proposalIsolation.reportMd}\`
- Multi-proposal json: \`${artifact.voting.proposalIsolation.reportJson}\`

## ZK Companion Evidence

- Verification mode: \`${artifact.zk.verificationMode}\`
- On-chain verifier present: \`${artifact.zk.onchainVerifier}\`
- Proof entries: \`${artifact.zk.proofCount}\`
- Verified proof entries: \`${artifact.zk.verifiedProofCount}\`
- Registry: \`${artifact.zk.registry}\`

### ZK Layer Counts

${Object.entries(artifact.zk.layerCounts)
  .map(([layer, count]) => `- ${layer}: \`${count}\``)
  .join("\n")}

## Adversarial Evidence

- Total scenarios: \`${artifact.adversarial.totalScenarios}\`
- Rejected as expected: \`${artifact.adversarial.rejected}\`
- Unexpected successes: \`${artifact.adversarial.unexpectedSuccesses}\`
- Report: \`${artifact.adversarial.report}\`

## Resilience Evidence

- RPC failover recovered: \`${artifact.resilience.failoverRecovered}\`
- Stale blockhash rejected: \`${artifact.resilience.staleBlockhashRejected}\`
- Stale blockhash recovered: \`${artifact.resilience.staleBlockhashRecovered}\`
- Unexpected failures: \`${artifact.resilience.unexpectedFailures}\`
- Markdown report: \`${artifact.resilience.reportMd}\`
- JSON report: \`${artifact.resilience.reportJson}\`

## Collision Evidence

- Finalize winners: \`${artifact.collisions.finalizeSuccessCount}\`
- Finalize rejections: \`${artifact.collisions.finalizeRejectedCount}\`
- Execute winners: \`${artifact.collisions.executeSuccessCount}\`
- Execute rejections: \`${artifact.collisions.executeRejectedCount}\`
- Finalize single winner: \`${artifact.collisions.finalizeSingleWinner}\`
- Execute single winner: \`${artifact.collisions.executeSingleWinner}\`
- Unexpected successes: \`${artifact.collisions.unexpectedSuccesses}\`
- Markdown report: \`${artifact.collisions.reportMd}\`
- JSON report: \`${artifact.collisions.reportJson}\`

## Commands

${artifact.commands.map((command) => `- \`${command}\``).join("\n")}

## Source Documents

${artifact.docs.map((doc) => `- \`${doc}\``).join("\n")}

## Interpretation

This package binds the canonical Devnet voting lifecycle, zk companion proofs, adversarial rejection behavior, RPC interruption recovery, and finalize/execute collision handling into one reviewer-facing operational surface. It is intended to show that PrivateDAO is not only specified and documented, but also reproducibly exercised under realistic multi-wallet and failure-path conditions.
`;
}

function summarizePhases(
  entries: Array<{ phase: string }>,
): Record<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.phase, (counts.get(entry.phase) || 0) + 1);
  }
  return Object.fromEntries(Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b)));
}

function summarizeZkLayers(
  entries: Array<{ layer: string }>,
): Record<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.layer, (counts.get(entry.layer) || 0) + 1);
  }
  return Object.fromEntries(Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b)));
}

function round(value: number) {
  return Number(value.toFixed(4));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
