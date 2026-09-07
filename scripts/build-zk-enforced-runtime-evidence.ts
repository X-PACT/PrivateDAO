import fs from "fs";
import path from "path";

type Target = {
  id: string;
  walletLabel: string;
  environmentType: string;
  status: string;
};

type ReceiptModes = {
  vote: "missing" | "parallel" | "zk_enforced";
  delegation: "missing" | "parallel" | "zk_enforced";
  tally: "missing" | "parallel" | "zk_enforced";
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
  policyPda?: string | null;
  receiptModes: ReceiptModes;
  diagnosticsSnapshotCaptured: boolean;
  modeActivationResult: "success" | "failure" | "not-attempted";
  finalizeResult: "success" | "failure" | "not-attempted";
  enableModeTxSignature?: string | null;
  finalizeTxSignature?: string | null;
  explorerUrls?: {
    enableMode?: string | null;
    finalize?: string | null;
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
  const source = readJson<CaptureRegistry>("docs/zk/enforced-runtime-captures.json");

  const completedTargets = new Set(
    source.captures
      .filter((capture) => capture.modeActivationResult === "success" && capture.finalizeResult === "success")
      .map((capture) => capture.walletLabel),
  );

  const summary = {
    targetCount: source.targets.length,
    completedTargetCount: Array.from(new Set(source.captures.map((capture) => capture.walletLabel))).length,
    modeActivationSuccessCount: source.captures.filter((capture) => capture.modeActivationResult === "success").length,
    finalizeSuccessCount: source.captures.filter((capture) => capture.finalizeResult === "success").length,
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
      "docs/zk/enforced-runtime-evidence.md",
      "docs/zk/enforced-runtime-captures.json",
      "docs/zk/enforced-operator-flow.md",
      "docs/phase-c-hardening.md",
    ],
    commands: [
      "npm run build:zk-enforced-runtime",
      "npm run verify:zk-enforced-runtime",
      "npm run record:zk-enforced-runtime -- <capture-json-path>",
      "npm run inspect:zk-proposal -- --proposal <PDA>",
      "npm run configure:zk-mode -- --proposal <PDA> --mode zk_enforced",
      "npm run anchor:zk-verify:enforced",
    ],
    status:
      summary.pendingTargets.length === 0 && summary.finalizeSuccessCount > 0
        ? "zk-enforced-runtime-captured"
        : "pending-zk-enforced-capture",
  };

  fs.writeFileSync(path.resolve("docs/zk/enforced-runtime.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/zk/enforced-runtime.generated.md"), buildMarkdown(payload));
  console.log("Wrote zk-enforced runtime evidence package");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    modeActivationSuccessCount: number;
    finalizeSuccessCount: number;
    diagnosticsCaptureCount: number;
    pendingTargets: string[];
  };
  targets: Target[];
  captures: Capture[];
  requiredDocs: string[];
  commands: string[];
  status: string;
}) {
  return `# ZK-Enforced Runtime Evidence

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- network: \`${payload.network}\`
- status: \`${payload.status}\`
- target count: \`${payload.summary.targetCount}\`
- completed target count: \`${payload.summary.completedTargetCount}\`
- mode activation success count: \`${payload.summary.modeActivationSuccessCount}\`
- finalize success count: \`${payload.summary.finalizeSuccessCount}\`
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
- policy PDA: \`${capture.policyPda || "unknown"}\`
- receipt modes: \`vote=${capture.receiptModes.vote}, delegation=${capture.receiptModes.delegation}, tally=${capture.receiptModes.tally}\`
- mode activation result: \`${capture.modeActivationResult}\`
- finalize result: \`${capture.finalizeResult}\`
- diagnostics snapshot captured: \`${capture.diagnosticsSnapshotCaptured}\`
- enable mode tx: \`${capture.enableModeTxSignature || "none"}\`
- finalize tx: \`${capture.finalizeTxSignature || "none"}\`
- enable explorer: \`${capture.explorerUrls?.enableMode || "none"}\`
- finalize explorer: \`${capture.explorerUrls?.finalize || "none"}\`
- error message: \`${capture.errorMessage || "none"}\``).join("\n\n")
  : "No zk_enforced runtime captures have been committed yet. The intake, generated review package, and verification path are now in place so real runs can be added without changing the reviewer surface."}

## Required Docs

${payload.requiredDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Honest Boundary

This package makes the missing \`zk_enforced\` runtime blocker concrete and machine-visible. It does not claim that the stronger path has production-grade runtime evidence until actual wallet runs are captured here.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
