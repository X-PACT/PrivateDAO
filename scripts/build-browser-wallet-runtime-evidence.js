"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const source = readJson("docs/runtime/browser-wallet-captures.json");
    const completedTargets = new Set(source.captures
        .filter((capture) => capture.connectResult === "success" && capture.diagnosticsSnapshotCaptured)
        .map((capture) => capture.walletLabel));
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
        status: summary.pendingTargets.length === 0 && summary.successfulSubmissionCount > 0
            ? "browser-wallet-runtime-captured"
            : "pending-browser-wallet-capture",
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/runtime/browser-wallet.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/runtime/browser-wallet.generated.md"), buildMarkdown(payload));
    console.log("Wrote browser-wallet runtime evidence package");
}
function buildMarkdown(payload) {
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
        .map((target) => `- ${target.walletLabel} (\`${target.id}\`) | environment: \`${target.environmentType}\` | status: \`${target.status}\``)
        .join("\n")}

## Pending Targets

${payload.summary.pendingTargets.length ? payload.summary.pendingTargets.map((target) => `- ${target}`).join("\n") : "- none"}

## Captures

${payload.captures.length
        ? payload.captures
            .map((capture) => `### ${capture.walletLabel}

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
- error message: \`${capture.errorMessage || "none"}\``)
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
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
