import fs from "fs";
import path from "path";

type RuntimeEvidence = {
  project: string;
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
    totalAttemptCount: number;
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
};

function main() {
  const jsonPath = path.resolve("docs/runtime-evidence.generated.json");
  const mdPath = path.resolve("docs/runtime-evidence.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing runtime evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as RuntimeEvidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "runtime evidence project mismatch");
  assert(evidence.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "runtime evidence program mismatch");
  assert(evidence.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "runtime evidence verification wallet mismatch");
  assert(evidence.diagnosticsPage.endsWith("/diagnostics/"), "runtime evidence diagnostics page mismatch");
  assert(evidence.walletCount >= 5, "runtime evidence wallet count is unexpectedly low");
  assert(evidence.walletLabels.includes("Phantom"), "runtime evidence is missing Phantom");
  assert(evidence.walletLabels.includes("Solflare"), "runtime evidence is missing Solflare");
  assert(evidence.devnetCanary.network === "devnet", "runtime evidence canary network mismatch");
  assert(evidence.devnetCanary.unexpectedFailures === 0, "runtime evidence canary unexpected failures are non-zero");
  assert(evidence.resilience.fallbackRecovered, "runtime evidence missing fallback recovery");
  assert(evidence.resilience.staleBlockhashRejected, "runtime evidence missing stale blockhash rejection");
  assert(evidence.resilience.staleBlockhashRecovered, "runtime evidence missing stale blockhash recovery");
  assert(evidence.realDevice.targetCount >= 5, "runtime evidence real-device target count is unexpectedly low");
  assert(evidence.realDevice.pendingTargets.length >= 1, "runtime evidence real-device boundary should remain honest until captures exist");
  assert(evidence.operational.walletCount >= 50, "runtime evidence operational wallet count is unexpectedly low");
  assert(evidence.operational.totalAttemptCount >= 200, "runtime evidence operational attempt count is unexpectedly low");
  assert(evidence.operational.zkProofCount >= 1, "runtime evidence operational zk proof count is unexpectedly low");
  assert(evidence.operational.adversarialScenarioCount >= 1, "runtime evidence operational adversarial coverage is unexpectedly low");
  assert(evidence.operational.unexpectedAdversarialSuccesses === 0, "runtime evidence operational adversarial summary is invalid");
  assert(evidence.operational.finalizeSingleWinner, "runtime evidence operational finalize race summary is invalid");
  assert(evidence.operational.executeSingleWinner, "runtime evidence operational execute race summary is invalid");

  for (const doc of [
    "docs/wallet-runtime.md",
    "docs/runtime/real-device.md",
    "docs/runtime/real-device-captures.json",
    "docs/runtime/real-device.generated.md",
    "docs/runtime/real-device.generated.json",
    "docs/runtime-attestation.generated.json",
    "docs/frontier-integrations.generated.md",
    "docs/frontier-integrations.generated.json",
    "docs/operational-evidence.generated.md",
    "docs/operational-evidence.generated.json",
    "docs/governance-runtime-proof.generated.md",
    "docs/governance-runtime-proof.generated.json",
    "docs/wallet-compatibility-matrix.generated.md",
    "docs/devnet-canary.generated.md",
    "docs/devnet-resilience-report.md",
    "docs/fair-voting.md",
  ]) {
    assert(evidence.docs.includes(doc), `runtime evidence is missing doc: ${doc}`);
  }

  for (const command of [
    "npm run build:governance-runtime-proof",
    "npm run verify:governance-runtime-proof",
    "npm run build:wallet-matrix",
    "npm run verify:wallet-matrix",
    "npm run build:real-device-runtime",
    "npm run verify:real-device-runtime",
    "npm run build:frontier-integrations",
    "npm run verify:frontier-integrations",
    "npm run build:devnet-canary",
    "npm run verify:devnet-canary",
    "npm run test:devnet:resilience",
    "npm run verify:devnet:resilience-report",
    "npm run verify:runtime-surface",
    "npm run verify:all",
  ]) {
    assert(evidence.commands.includes(command), `runtime evidence is missing command: ${command}`);
  }

  assert(markdown.includes("# Runtime Evidence Package"), "runtime evidence markdown missing title");
  assert(markdown.includes("Devnet Canary Summary"), "runtime evidence markdown missing canary summary");
  assert(markdown.includes("Resilience Summary"), "runtime evidence markdown missing resilience summary");
  assert(markdown.includes("Real-Device Runtime Intake"), "runtime evidence markdown missing real-device summary");
  assert(markdown.includes("Operational Summary"), "runtime evidence markdown missing operational summary");
  assert(markdown.includes("Governance Runtime Proof"), "runtime evidence markdown missing governance proof section");

  console.log("Runtime evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
