"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const runtime = readJson("docs/runtime-attestation.generated.json");
    const walletMatrix = readJson("docs/wallet-compatibility-matrix.generated.json");
    const canary = readJson("docs/devnet-canary.generated.json");
    const resilience = readJson("docs/devnet-resilience-report.json");
    const operational = readJson("docs/operational-evidence.generated.json");
    const realDevice = readJson("docs/runtime/real-device.generated.json");
    const browserWallet = readJson("docs/runtime/browser-wallet.generated.json");
    const magicBlock = readJson("docs/magicblock/runtime.generated.json");
    const zkEnforced = readJson("docs/zk/enforced-runtime.generated.json");
    const zkExternalClosure = readJson("docs/zk/external-closure.generated.json");
    const browserEvidenceBackedWalletLabels = Array.from(new Set(browserWallet.captures
        .filter((capture) => capture.connectResult === "success" && capture.submissionResult === "success")
        .map((capture) => capture.walletLabel)));
    const browserConnectOnlyWalletLabels = Array.from(new Set(browserWallet.captures
        .filter((capture) => capture.connectResult === "success" && capture.submissionResult !== "success")
        .map((capture) => capture.walletLabel)));
    const browserDiagnosticsWalletLabels = Array.from(new Set(browserWallet.captures
        .filter((capture) => capture.diagnosticsSnapshotCaptured)
        .map((capture) => capture.walletLabel)));
    const realDeviceEvidenceBackedWalletLabels = Array.from(new Set((realDevice.captures ?? [])
        .filter((capture) => capture.connectResult === "success" && capture.submissionResult === "success")
        .map((capture) => capture.walletLabel)));
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
        browserWallet: {
            status: browserWallet.status,
            targetCount: browserWallet.summary.targetCount,
            completedTargetCount: browserWallet.summary.completedTargetCount,
            successfulConnectCount: browserWallet.summary.successfulConnectCount,
            successfulSubmissionCount: browserWallet.summary.successfulSubmissionCount,
            diagnosticsCaptureCount: browserWallet.summary.diagnosticsCaptureCount,
            actionCoverageCount: browserWallet.summary.actionCoverageCount,
            pendingTargets: browserWallet.summary.pendingTargets,
        },
        walletEvidence: {
            browserTargetCount: browserWallet.summary.targetCount,
            browserEvidenceBackedWalletCount: browserEvidenceBackedWalletLabels.length,
            browserEvidenceBackedWalletLabels,
            browserConnectOnlyWalletCount: browserConnectOnlyWalletLabels.length,
            browserConnectOnlyWalletLabels,
            browserDiagnosticsWalletCount: browserDiagnosticsWalletLabels.length,
            browserDiagnosticsWalletLabels,
            realDeviceTargetCount: realDevice.summary.targetCount,
            realDeviceEvidenceBackedWalletCount: realDeviceEvidenceBackedWalletLabels.length,
            realDeviceEvidenceBackedWalletLabels,
            realDevicePendingTargetCount: realDevice.summary.pendingTargets.length,
            supportMatrixWalletCount: walletMatrix.entries.length,
            supportMatrixSelectorVisibleCount: walletMatrix.entries.filter((entry) => entry.selectorVisible).length,
            supportMatrixDiagnosticsVisibleCount: walletMatrix.entries.filter((entry) => entry.diagnosticsVisible).length,
            supportMatrixReviewReadyCount: walletMatrix.entries.filter((entry) => entry.status === "devnet-review-ready").length,
        },
        magicBlock: {
            status: magicBlock.status,
            targetCount: magicBlock.summary.targetCount,
            completedTargetCount: magicBlock.summary.completedTargetCount,
            depositSuccessCount: magicBlock.summary.depositSuccessCount,
            privateTransferSuccessCount: magicBlock.summary.privateTransferSuccessCount,
            settleSuccessCount: magicBlock.summary.settleSuccessCount,
            executeSuccessCount: magicBlock.summary.executeSuccessCount,
            diagnosticsCaptureCount: magicBlock.summary.diagnosticsCaptureCount,
            pendingTargets: magicBlock.summary.pendingTargets,
        },
        zkEnforced: {
            status: zkEnforced.status,
            targetCount: zkEnforced.summary.targetCount,
            completedTargetCount: zkEnforced.summary.completedTargetCount,
            modeActivationSuccessCount: zkEnforced.summary.modeActivationSuccessCount,
            finalizeSuccessCount: zkEnforced.summary.finalizeSuccessCount,
            diagnosticsCaptureCount: zkEnforced.summary.diagnosticsCaptureCount,
            pendingTargets: zkEnforced.summary.pendingTargets,
        },
        zkExternalClosure: {
            status: zkExternalClosure.status,
            pendingBlockingCount: zkExternalClosure.pendingBlockingCount,
            stages: zkExternalClosure.stages.map((stage) => ({
                id: stage.id,
                label: stage.label,
                status: stage.status,
                owner: stage.owner,
                blocking: stage.blocking,
            })),
        },
        operational: {
            walletCount: operational.transactionSummary.walletCount,
            totalTxCount: operational.transactionSummary.totalTxCount,
            totalAttemptCount: operational.transactionSummary.totalAttemptCount,
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
            "docs/runtime/real-device.md",
            "docs/runtime/real-device-captures.json",
            "docs/runtime/real-device.generated.md",
            "docs/runtime/real-device.generated.json",
            "docs/runtime/browser-wallet.md",
            "docs/runtime/browser-wallet-captures.json",
            "docs/runtime/browser-wallet.generated.md",
            "docs/runtime/browser-wallet.generated.json",
            "docs/magicblock/private-payments.md",
            "docs/magicblock/operator-flow.md",
            "docs/magicblock/runtime-evidence.md",
            "docs/magicblock/runtime-captures.json",
            "docs/magicblock/runtime.generated.md",
            "docs/magicblock/runtime.generated.json",
            "docs/frontier-integrations.generated.md",
            "docs/frontier-integrations.generated.json",
            "docs/zk/enforced-runtime-evidence.md",
            "docs/zk/enforced-runtime-captures.json",
            "docs/zk/enforced-runtime.generated.md",
            "docs/zk/enforced-runtime.generated.json",
            "docs/zk/enforced-operator-flow.md",
            "docs/zk/external-closure.json",
            "docs/zk/external-closure.generated.md",
            "docs/zk/external-closure.generated.json",
            "docs/runtime-attestation.generated.json",
            "docs/operational-evidence.generated.md",
            "docs/operational-evidence.generated.json",
            "docs/governance-runtime-proof.generated.md",
            "docs/governance-runtime-proof.generated.json",
            "docs/wallet-compatibility-matrix.generated.md",
            "docs/devnet-canary.generated.md",
            "docs/devnet-resilience-report.md",
            "docs/fair-voting.md",
        ],
        commands: [
            "npm run build:operational-evidence",
            "npm run verify:operational-evidence",
            "npm run build:governance-runtime-proof",
            "npm run verify:governance-runtime-proof",
            "npm run build:browser-wallet-runtime",
            "npm run verify:browser-wallet-runtime",
            "npm run build:wallet-matrix",
            "npm run verify:wallet-matrix",
            "npm run build:real-device-runtime",
            "npm run verify:real-device-runtime",
            "npm run build:magicblock-runtime",
            "npm run verify:magicblock-runtime",
            "npm run build:frontier-integrations",
            "npm run verify:frontier-integrations",
            "npm run build:zk-enforced-runtime",
            "npm run verify:zk-enforced-runtime",
            "npm run build:zk-external-closure",
            "npm run verify:zk-external-closure",
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
            "Wallet support matrix status is not treated as review-readiness by itself; browser-wallet and real-device captures drive the evidence-backed readiness counts.",
            "It includes a dedicated governance runtime proof packet so reviewers can see the difference between shipped wallet-first lanes and still-pending browser or device captures.",
            "It now carries a separate browser-wallet runtime intake so live web governance claims stay tied to actual injected-wallet captures instead of code paths alone.",
            "It exposes the MagicBlock confidential payout corridor as a separate runtime track instead of burying it inside generic payout claims.",
            "It adds a Frontier integration package that binds ZK anchors, MagicBlock settlement, REFHE settlement, and backend-indexed RPC state into one machine-checked review surface.",
            "It exposes the stronger zk_enforced runtime blocker as a first-class evidence track instead of leaving it implicit in prose.",
            "It tracks the remaining external closure path: runtime captures, external audit, and the canonical verifier-boundary freeze.",
        ],
    };
    const jsonPath = path_1.default.resolve("docs/runtime-evidence.generated.json");
    const mdPath = path_1.default.resolve("docs/runtime-evidence.generated.md");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(runtimeEvidence, null, 2) + "\n");
    fs_1.default.writeFileSync(mdPath, buildMarkdown(runtimeEvidence));
    console.log("Wrote runtime evidence package");
}
function buildMarkdown(evidence) {
    return `# Runtime Evidence Package

## Overview

- Generated at: \`${evidence.generatedAt}\`
- Program id: \`${evidence.programId}\`
- Verification wallet: \`${evidence.verificationWallet}\`
- Diagnostics page: \`${evidence.diagnosticsPage}\`
- Supported wallet classes: \`${evidence.walletCount}\`

## Wallet Matrix

${evidence.matrixStatuses
        .map((entry) => `- ${entry.label} (\`${entry.id}\`) | status: \`${entry.status}\` | diagnostics: \`${entry.diagnosticsVisible}\` | selector: \`${entry.selectorVisible}\``)
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

## Browser-Wallet Runtime Intake

- Status: \`${evidence.browserWallet.status}\`
- Target count: \`${evidence.browserWallet.targetCount}\`
- Completed target count: \`${evidence.browserWallet.completedTargetCount}\`
- Successful connect count: \`${evidence.browserWallet.successfulConnectCount}\`
- Successful submission count: \`${evidence.browserWallet.successfulSubmissionCount}\`
- Diagnostics capture count: \`${evidence.browserWallet.diagnosticsCaptureCount}\`
- Action coverage count: \`${evidence.browserWallet.actionCoverageCount}\`
- Pending targets: \`${evidence.browserWallet.pendingTargets.join(", ") || "none"}\`

## Evidence-Backed Wallet Readiness

- Browser wallet targets: \`${evidence.walletEvidence.browserTargetCount}\`
- Browser wallet evidence-backed: \`${evidence.walletEvidence.browserEvidenceBackedWalletCount}\`
- Browser wallet evidence-backed labels: \`${evidence.walletEvidence.browserEvidenceBackedWalletLabels.join(", ") || "none"}\`
- Browser connect-only captures: \`${evidence.walletEvidence.browserConnectOnlyWalletCount}\`
- Browser connect-only labels: \`${evidence.walletEvidence.browserConnectOnlyWalletLabels.join(", ") || "none"}\`
- Browser diagnostics captures: \`${evidence.walletEvidence.browserDiagnosticsWalletCount}\`
- Browser diagnostics labels: \`${evidence.walletEvidence.browserDiagnosticsWalletLabels.join(", ") || "none"}\`
- Real-device targets: \`${evidence.walletEvidence.realDeviceTargetCount}\`
- Real-device evidence-backed: \`${evidence.walletEvidence.realDeviceEvidenceBackedWalletCount}\`
- Real-device evidence-backed labels: \`${evidence.walletEvidence.realDeviceEvidenceBackedWalletLabels.join(", ") || "none"}\`
- Real-device pending targets: \`${evidence.walletEvidence.realDevicePendingTargetCount}\`
- Support matrix wallet count: \`${evidence.walletEvidence.supportMatrixWalletCount}\`
- Support matrix selector-visible count: \`${evidence.walletEvidence.supportMatrixSelectorVisibleCount}\`
- Support matrix diagnostics-visible count: \`${evidence.walletEvidence.supportMatrixDiagnosticsVisibleCount}\`
- Support matrix review-ready count: \`${evidence.walletEvidence.supportMatrixReviewReadyCount}\`

## MagicBlock Runtime Intake

- Status: \`${evidence.magicBlock.status}\`
- Target count: \`${evidence.magicBlock.targetCount}\`
- Completed target count: \`${evidence.magicBlock.completedTargetCount}\`
- Deposit success count: \`${evidence.magicBlock.depositSuccessCount}\`
- Private transfer success count: \`${evidence.magicBlock.privateTransferSuccessCount}\`
- Settle success count: \`${evidence.magicBlock.settleSuccessCount}\`
- Execute success count: \`${evidence.magicBlock.executeSuccessCount}\`
- Diagnostics capture count: \`${evidence.magicBlock.diagnosticsCaptureCount}\`
- Pending targets: \`${evidence.magicBlock.pendingTargets.join(", ") || "none"}\`

## ZK-Enforced Runtime Intake

- Status: \`${evidence.zkEnforced.status}\`
- Target count: \`${evidence.zkEnforced.targetCount}\`
- Completed target count: \`${evidence.zkEnforced.completedTargetCount}\`
- Mode activation success count: \`${evidence.zkEnforced.modeActivationSuccessCount}\`
- Finalize success count: \`${evidence.zkEnforced.finalizeSuccessCount}\`
- Diagnostics capture count: \`${evidence.zkEnforced.diagnosticsCaptureCount}\`
- Pending targets: \`${evidence.zkEnforced.pendingTargets.join(", ") || "none"}\`

## ZK External Closure

- Status: \`${evidence.zkExternalClosure.status}\`
- Pending blocking stages: \`${evidence.zkExternalClosure.pendingBlockingCount}\`
${evidence.zkExternalClosure.stages.map((stage) => `- ${stage.label}: \`${stage.status}\` (${stage.owner})`).join("\n")}

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

## Governance Runtime Proof

- Dedicated packet: \`docs/governance-runtime-proof.generated.md\`
- Machine-readable source: \`docs/governance-runtime-proof.generated.json\`
- Purpose: separate shipped wallet-first governance capability from repo proof, browser-wallet proof, and real-device proof so the product does not overclaim based on code alone.

## Commands

${evidence.commands.map((command) => `- \`${command}\``).join("\n")}

## Notes

${evidence.notes.map((note) => `- ${note}`).join("\n")}
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
