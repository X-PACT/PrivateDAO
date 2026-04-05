import fs from "fs";
import path from "path";

type OperationalEvidence = {
  project: string;
  network: string;
  transactionSummary: {
    walletCount: number;
    totalTxCount: number;
    successCount: number;
    failureCount: number;
    retryCount: number;
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
};

function main() {
  const jsonPath = path.resolve("docs/operational-evidence.generated.json");
  const mdPath = path.resolve("docs/operational-evidence.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing operational evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as OperationalEvidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  if (evidence.project !== "PrivateDAO") {
    throw new Error("operational evidence project mismatch");
  }
  if (evidence.network !== "devnet") {
    throw new Error("operational evidence must remain devnet-scoped");
  }
  if (evidence.transactionSummary.walletCount < 50) {
    throw new Error("operational evidence wallet count is below canonical threshold");
  }
  if (evidence.transactionSummary.totalTxCount < 200) {
    throw new Error("operational evidence tx count is unexpectedly low");
  }
  if ((evidence.transactionSummary.phaseCounts.commit || 0) === 0) {
    throw new Error("operational evidence is missing commit-phase entries");
  }
  if ((evidence.transactionSummary.phaseCounts.reveal || 0) === 0) {
    throw new Error("operational evidence is missing reveal-phase entries");
  }
  if ((evidence.transactionSummary.phaseCounts.execute || 0) === 0) {
    throw new Error("operational evidence is missing execute-phase entries");
  }
  if (evidence.voting.proposalIsolation.executedCount !== evidence.voting.proposalIsolation.proposalCount) {
    throw new Error("operational evidence multi-proposal execution count mismatch");
  }
  if (evidence.voting.proposalIsolation.unexpectedSuccesses !== 0) {
    throw new Error("operational evidence records unexpected multi-proposal successes");
  }
  if (evidence.zk.verificationMode !== "offchain-groth16") {
    throw new Error("operational evidence zk verification mode mismatch");
  }
  if (evidence.zk.proofCount < 1 || evidence.zk.verifiedProofCount < 1) {
    throw new Error("operational evidence is missing verified zk proofs");
  }
  if (evidence.adversarial.unexpectedSuccesses !== 0) {
    throw new Error("operational evidence records unexpected adversarial success");
  }
  if (!evidence.resilience.failoverRecovered || !evidence.resilience.staleBlockhashRecovered || !evidence.resilience.staleBlockhashRejected) {
    throw new Error("operational evidence resilience summary is incomplete");
  }
  if (!evidence.collisions.finalizeSingleWinner || !evidence.collisions.executeSingleWinner) {
    throw new Error("operational evidence race summary lost single-winner guarantee");
  }
  if (evidence.collisions.unexpectedSuccesses !== 0) {
    throw new Error("operational evidence records unexpected race success");
  }

  for (const doc of evidence.docs) {
    if (!fs.existsSync(path.resolve(doc))) {
      throw new Error(`operational evidence references missing doc: ${doc}`);
    }
  }

  for (const command of [
    "npm run test:devnet:all",
    "npm run test:devnet:multi",
    "npm run test:devnet:race",
    "npm run test:devnet:resilience",
    "npm run build:operational-evidence",
    "npm run verify:operational-evidence",
  ]) {
    if (!evidence.commands.includes(command)) {
      throw new Error(`operational evidence missing command: ${command}`);
    }
  }

  for (const fragment of [
    "Operational Evidence Package",
    "Voting And Lifecycle Evidence",
    "ZK Companion Evidence",
    "Adversarial Evidence",
    "Resilience Evidence",
    "Collision Evidence",
  ]) {
    if (!markdown.includes(fragment)) {
      throw new Error(`operational evidence markdown missing fragment: ${fragment}`);
    }
  }

  console.log("Operational evidence verification: PASS");
}

main();
