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
  actionsCovered: string[];
  connectResult: "success" | "failure";
  signingResult: "success" | "failure" | "not-attempted";
  submissionResult: "success" | "failure" | "not-attempted";
  diagnosticsSnapshotCaptured: boolean;
  txSignature?: string | null;
  explorerUrl?: string | null;
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
  const source = readJson<CaptureRegistry>("docs/runtime/browser-wallet-captures.json");

  const completedTargets = new Set(
    source.captures
      .filter((capture) => capture.connectResult === "success" && capture.diagnosticsSnapshotCaptured)
      .map((capture) => capture.walletLabel),
  );

  const summary = {
    targetCount: source.targets.length,
    completedTargetCount: Array.from(new Set(source.captures.map((capture) => capture.walletLabel))).length,
    successfulConnectCount: source.captures.filter((capture) => capture.connectResult === "success").length,
    successfulSubmissionCount: source.captures.filter((capture) => capture.submissionResult === "success").length,
    diagnosticsCaptureCount: source.captures.filter((capture) => capture.diagnosticsSnapshotCaptured).length,
    actionCoverageCount: Array.from(new Set(source.captures.flatMap((capture) => capture.actionsCovered))).length,
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
      "docs/runtime/browser-wallet.md",
      "docs/runtime/browser-wallet-captures.json",
      "docs/governance-runtime-proof.generated.json",
      "docs/wallet-runtime.md",
    ],
    commands: [
      "npm run build:browser-wallet-runtime",
      "npm run verify:browser-wallet-runtime",
      "npm run verify:runtime-surface",
      "npm run verify:all",
    ],
    status:
      summary.pendingTargets.length === 0 && summary.successfulSubmissionCount > 0
        ? "browser-wallet-runtime-captured"
        : "pending-browser-wallet-capture",
  };

  fs.writeFileSync(path.resolve("docs/runtime/browser-wallet.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/runtime/browser-wallet.generated.md"), buildMarkdown(payload));
  console.log("Wrote browser-wallet runtime evidence package");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    successfulConnectCount: number;
    successfulSubmissionCount: number;
    diagnosticsCaptureCount: number;
    actionCoverageCount: number;
    pendingTargets: string[];
  };
  targets: Target[];
  captures: Capture[];
  requiredDocs: string[];
  commands: string[];
  status: string;
}) {
  return `# Browser-Wallet Runtime Evidence

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- network: \`${payload.network}\`
- status: \`${payload.status}\`
- target count: \`${payload.summary.targetCount}\`
- completed target count: \`${payload.summary.completedTargetCount}\`
- successful connect count: \`${payload.summary.successfulConnectCount}\`
- successful submission count: \`${payload.summary.successfulSubmissionCount}\`
- diagnostics snapshot count: \`${payload.summary.diagnosticsCaptureCount}\`
- action coverage count: \`${payload.summary.actionCoverageCount}\`

## Target Matrix

${payload.targets
  .map(
    (target) =>
      `- ${target.walletLabel} (\`${target.id}\`) | environment: \`${target.environmentType}\` | status: \`${target.status}\``,
  )
  .join("\n")}

## Pending Targets

${payload.summary.pendingTargets.length ? payload.summary.pendingTargets.map((target) => `- ${target}`).join("\n") : "- none"}

## Captures

${payload.captures.length
  ? payload.captures
      .map(
        (capture) => `### ${capture.walletLabel}

- captured at: \`${capture.capturedAt}\`
- environment: \`${capture.environmentType}\`
- os: \`${capture.os || "unknown"}\`
- browser or client: \`${capture.browserOrClient || "unknown"}\`
- actions covered: \`${capture.actionsCovered.join(", ") || "none"}\`
- connect result: \`${capture.connectResult}\`
- signing result: \`${capture.signingResult}\`
- submission result: \`${capture.submissionResult}\`
- diagnostics snapshot captured: \`${capture.diagnosticsSnapshotCaptured}\`
- tx signature: \`${capture.txSignature || "none"}\`
- explorer url: \`${capture.explorerUrl || "none"}\`
- error message: \`${capture.errorMessage || "none"}\``,
      )
      .join("\n\n")
  : "No browser-wallet captures have been committed yet. The intake and verification path is now in place so real runs can be added without changing the reviewer surface."}

## Required Docs

${payload.requiredDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Honest Boundary

This package makes browser-wallet runtime QA reviewer-visible and reproducible as an intake process. It does not treat live wallet-first code paths as a substitute for actual browser-wallet captures.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
