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
  const source = readJson<CaptureRegistry>("docs/runtime/real-device-captures.json");

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
      "docs/runtime/real-device.md",
      "docs/runtime/real-device-captures.json",
      "docs/runtime-attestation.generated.json",
      "docs/external-readiness-intake.md",
    ],
    commands: [
      "npm run build:real-device-runtime",
      "npm run verify:real-device-runtime",
      "npm run verify:runtime-surface",
      "npm run verify:all",
    ],
    status:
      summary.pendingTargets.length === 0 && summary.successfulSubmissionCount > 0
        ? "real-device-runtime-captured"
        : "pending-real-device-capture",
  };

  fs.writeFileSync(path.resolve("docs/runtime/real-device.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/runtime/real-device.generated.md"), buildMarkdown(payload));
  console.log("Wrote real-device runtime evidence package");
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
    pendingTargets: string[];
  };
  targets: Target[];
  captures: Capture[];
  requiredDocs: string[];
  commands: string[];
  status: string;
}) {
  return `# Real-Device Runtime Evidence

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
- connect result: \`${capture.connectResult}\`
- signing result: \`${capture.signingResult}\`
- submission result: \`${capture.submissionResult}\`
- diagnostics snapshot captured: \`${capture.diagnosticsSnapshotCaptured}\`
- tx signature: \`${capture.txSignature || "none"}\`
- explorer url: \`${capture.explorerUrl || "none"}\`
- error message: \`${capture.errorMessage || "none"}\``,
      )
      .join("\n\n")
  : "No real-device captures have been committed yet. The intake and verification path is now in place so these runs can be added without changing the reviewer surface."}

## Required Docs

${payload.requiredDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Honest Boundary

This package makes real-device wallet QA reviewer-visible and reproducible as an intake process. It does not treat browser-side diagnostics as a substitute for actual wallet, device, and client captures.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
