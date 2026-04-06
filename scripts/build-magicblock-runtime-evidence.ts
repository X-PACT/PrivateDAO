import fs from "fs";
import path from "path";

type Target = {
  id: string;
  walletLabel: string;
  environmentType: string;
  status: string;
};

type Capture = {
  id: string;
  walletLabel: string;
  walletVersion?: string;
  environmentType: string;
  os?: string;
  browserOrClient?: string;
  network: string;
  proposalPublicKey: string;
  corridorPda: string;
  settlementWallet: string;
  validator: string | null;
  transferQueue: string | null;
  mintInitializationResult: "success" | "failure" | "not-attempted";
  depositResult: "success" | "failure" | "not-attempted";
  privateTransferResult: "success" | "failure" | "not-attempted";
  withdrawResult: "success" | "failure" | "not-attempted";
  settleResult: "success" | "failure" | "not-attempted";
  executeResult: "success" | "failure" | "not-attempted";
  diagnosticsSnapshotCaptured: boolean;
  depositTxSignature?: string | null;
  transferTxSignature?: string | null;
  withdrawTxSignature?: string | null;
  settleTxSignature?: string | null;
  executeTxSignature?: string | null;
  explorerUrls?: {
    deposit?: string | null;
    transfer?: string | null;
    withdraw?: string | null;
    settle?: string | null;
    execute?: string | null;
  };
  errorMessage?: string | null;
  evidenceRefs?: string[];
  capturedAt: string;
};

type CaptureRegistry = {
  project: string;
  network: string;
  generatedAt: string;
  targets: Target[];
  captures: Capture[];
};

function main() {
  const source = readJson<CaptureRegistry>("docs/magicblock-runtime-captures.json");

  const completedTargets = new Set(
    source.captures
      .filter(
        (capture) =>
          capture.depositResult === "success" &&
          capture.privateTransferResult === "success" &&
          capture.withdrawResult === "success" &&
          capture.settleResult === "success" &&
          capture.executeResult === "success",
      )
      .map((capture) => capture.walletLabel),
  );

  const summary = {
    targetCount: source.targets.length,
    completedTargetCount: Array.from(new Set(source.captures.map((capture) => capture.walletLabel))).length,
    depositSuccessCount: source.captures.filter((capture) => capture.depositResult === "success").length,
    privateTransferSuccessCount: source.captures.filter((capture) => capture.privateTransferResult === "success").length,
    settleSuccessCount: source.captures.filter((capture) => capture.settleResult === "success").length,
    executeSuccessCount: source.captures.filter((capture) => capture.executeResult === "success").length,
    diagnosticsCaptureCount: source.captures.filter((capture) => capture.diagnosticsSnapshotCaptured).length,
    pendingTargets: source.targets
      .filter((target) => !completedTargets.has(target.walletLabel))
      .map((target) => target.walletLabel),
  };

  const payload = {
    project: source.project,
    generatedAt: new Date().toISOString(),
    network: source.network,
    summary,
    targets: source.targets,
    captures: source.captures,
    requiredDocs: [
      "docs/magicblock-private-payments.md",
      "docs/magicblock-operator-flow.md",
      "docs/magicblock-runtime-evidence.md",
      "docs/magicblock-runtime-captures.json",
    ],
    commands: [
      "npm run build:magicblock-runtime",
      "npm run verify:magicblock-runtime",
      "npm run record:magicblock-runtime -- <capture-json-path>",
      "npm run configure:magicblock",
      "npm run settle:magicblock",
      "npm run magicblock:payments -- transfer --from <OWNER> --to <SETTLEMENT> --mint <MINT> --amount <RAW> --visibility private --from-balance base --to-balance ephemeral",
    ],
    status:
      summary.pendingTargets.length === 0 && summary.executeSuccessCount > 0
        ? "magicblock-runtime-captured"
        : "pending-magicblock-capture",
  };

  fs.writeFileSync(path.resolve("docs/magicblock-runtime.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/magicblock-runtime.generated.md"), buildMarkdown(payload));
  console.log("Wrote MagicBlock runtime evidence package");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    depositSuccessCount: number;
    privateTransferSuccessCount: number;
    settleSuccessCount: number;
    executeSuccessCount: number;
    diagnosticsCaptureCount: number;
    pendingTargets: string[];
  };
  targets: Target[];
  captures: Capture[];
  requiredDocs: string[];
  commands: string[];
  status: string;
}) {
  return `# MagicBlock Runtime Evidence

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- network: \`${payload.network}\`
- status: \`${payload.status}\`
- target count: \`${payload.summary.targetCount}\`
- completed target count: \`${payload.summary.completedTargetCount}\`
- deposit success count: \`${payload.summary.depositSuccessCount}\`
- private transfer success count: \`${payload.summary.privateTransferSuccessCount}\`
- settle success count: \`${payload.summary.settleSuccessCount}\`
- execute success count: \`${payload.summary.executeSuccessCount}\`
- diagnostics snapshot count: \`${payload.summary.diagnosticsCaptureCount}\`

## Target Matrix

${payload.targets.map((target) => `- ${target.walletLabel} (\`${target.id}\`) | environment: \`${target.environmentType}\` | status: \`${target.status}\``).join("\n")}

## Pending Targets

${payload.summary.pendingTargets.length ? payload.summary.pendingTargets.map((target) => `- ${target}`).join("\n") : "- none"}

## Captures

${payload.captures.length
  ? payload.captures.map((capture) => `### ${capture.walletLabel}

- captured at: \`${capture.capturedAt}\`
- environment: \`${capture.environmentType}\`
- proposal: \`${capture.proposalPublicKey}\`
- corridor PDA: \`${capture.corridorPda}\`
- settlement wallet: \`${capture.settlementWallet}\`
- validator: \`${capture.validator || "none"}\`
- transfer queue: \`${capture.transferQueue || "none"}\`
- mint initialization result: \`${capture.mintInitializationResult}\`
- deposit result: \`${capture.depositResult}\`
- private transfer result: \`${capture.privateTransferResult}\`
- withdraw result: \`${capture.withdrawResult}\`
- settle result: \`${capture.settleResult}\`
- execute result: \`${capture.executeResult}\`
- diagnostics snapshot captured: \`${capture.diagnosticsSnapshotCaptured}\`
- deposit tx: \`${capture.depositTxSignature || "none"}\`
- transfer tx: \`${capture.transferTxSignature || "none"}\`
- withdraw tx: \`${capture.withdrawTxSignature || "none"}\`
- settle tx: \`${capture.settleTxSignature || "none"}\`
- execute tx: \`${capture.executeTxSignature || "none"}\`
- error message: \`${capture.errorMessage || "none"}\``).join("\n\n")
  : "No MagicBlock runtime captures have been committed yet. The intake and generated review package now exist so real wallet runs can be attached without changing the reviewer surface."}

## Required Docs

${payload.requiredDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Honest Boundary

This package makes the MagicBlock runtime path reviewable without pretending that every wallet environment has already been captured. It exists to turn future captures into stable evidence, not into ad hoc demo claims.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
