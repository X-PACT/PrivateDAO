"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const governance_runtime_status_1 = require("../apps/web/src/lib/governance-runtime-status");
const onchain_parity_generated_1 = require("../apps/web/src/lib/onchain-parity.generated");
const ROOT = path_1.default.resolve(__dirname, "..");
const JSON_PATH = path_1.default.join(ROOT, "docs/governance-runtime-proof.generated.json");
const MD_PATH = path_1.default.join(ROOT, "docs/governance-runtime-proof.generated.md");
function main() {
    const actions = governance_runtime_status_1.GOVERNANCE_RUNTIME_STATUS_ORDER.map((action) => {
        const parity = onchain_parity_generated_1.PRIVATE_DAO_CORE_INSTRUCTION_PARITY[action];
        const runtime = governance_runtime_status_1.GOVERNANCE_RUNTIME_STATUS[action];
        return {
            action,
            displayName: parity.displayName,
            instructionName: parity.instructionName,
            liveWalletLane: runtime.liveWalletLane,
            repoScriptProofCaptured: runtime.repoScriptProofCaptured,
            browserWalletProofCaptured: runtime.browserWalletProofCaptured,
            realDeviceProofCaptured: runtime.realDeviceProofCaptured,
            supportNote: runtime.supportNote,
        };
    });
    const payload = {
        project: "PrivateDAO",
        generatedAt: new Date().toISOString(),
        network: "devnet",
        programId: onchain_parity_generated_1.PRIVATE_DAO_PROGRAM_ID,
        liveWalletLaneCount: actions.filter((entry) => entry.liveWalletLane).length,
        repoScriptProofCount: actions.filter((entry) => entry.repoScriptProofCaptured).length,
        browserWalletProofCount: actions.filter((entry) => entry.browserWalletProofCaptured).length,
        realDeviceProofCount: actions.filter((entry) => entry.realDeviceProofCaptured).length,
        pendingBrowserWalletProofActions: actions
            .filter((entry) => entry.liveWalletLane && !entry.browserWalletProofCaptured)
            .map((entry) => entry.displayName),
        pendingRealDeviceProofActions: actions
            .filter((entry) => entry.liveWalletLane && !entry.realDeviceProofCaptured)
            .map((entry) => entry.displayName),
        unsupportedExecutionBoundary: "CustomCPI treasury actions remain outside the executable release boundary.",
        actions,
        linkedDocs: [
            "docs/test-wallet-live-proof.generated.md",
            "docs/test-wallet-live-proof-v3.generated.md",
            "docs/runtime-evidence.generated.md",
            "docs/runtime/browser-wallet.generated.md",
            "docs/runtime/browser-wallet.md",
            "docs/runtime/real-device.generated.md",
            "docs/runtime/real-device.md",
            "docs/launch-trust-packet.generated.md",
            "docs/treasury-reviewer-packet.generated.md",
        ],
        commands: [
            "npm run live-proof",
            "npm run live-proof:v3",
            "npm run build:governance-runtime-proof",
            "npm run verify:governance-runtime-proof",
            "npm run build:browser-wallet-runtime",
            "npm run verify:browser-wallet-runtime",
            "npm run build:real-device-runtime",
            "npm run verify:real-device-runtime",
        ],
        notes: [
            "This packet separates live web wallet capability from runtime proof capture so the product does not overclaim based on shipped code alone.",
            "Repo-script proof exists for the governance core lifecycle, the full Solflare browser cycle is captured on the live web route, and Android Solflare now proves the mobile path through Create DAO, Create Proposal, and Commit Vote.",
            "The web wallet lane currently covers Create DAO, Create Proposal, Commit Vote, Reveal Vote, Finalize Proposal, and Execute Proposal for standard, SendSol, and SendToken proposals.",
        ],
    };
    fs_1.default.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(MD_PATH, buildMarkdown(payload));
    console.log(`wrote ${path_1.default.relative(ROOT, JSON_PATH)}`);
    console.log(`wrote ${path_1.default.relative(ROOT, MD_PATH)}`);
}
function buildMarkdown(payload) {
    const actionLines = payload.actions
        .map((entry) => {
        return [
            `### ${entry.displayName}`,
            "",
            `- Instruction: \`${entry.instructionName}\``,
            `- Live wallet-first lane: \`${entry.liveWalletLane}\``,
            `- Repo-script proof captured: \`${entry.repoScriptProofCaptured}\``,
            `- Browser-wallet proof captured: \`${entry.browserWalletProofCaptured}\``,
            `- Real-device proof captured: \`${entry.realDeviceProofCaptured}\``,
            `- Note: ${entry.supportNote}`,
        ].join("\n");
    })
        .join("\n\n");
    return `# Governance Runtime Proof Status

## Overview

- Generated at: \`${payload.generatedAt}\`
- Project: \`${payload.project}\`
- Network: \`${payload.network}\`
- Program id: \`${payload.programId}\`
- Live wallet-first actions: \`${payload.liveWalletLaneCount}\`
- Repo-script proofs captured: \`${payload.repoScriptProofCount}\`
- Browser-wallet proofs captured: \`${payload.browserWalletProofCount}\`
- Real-device proofs captured: \`${payload.realDeviceProofCount}\`

## Current Boundary

- Unsupported executable boundary: ${payload.unsupportedExecutionBoundary}
- Pending browser-wallet captures: ${payload.pendingBrowserWalletProofActions.length ? payload.pendingBrowserWalletProofActions.join(", ") : "none"}
- Pending real-device captures: ${payload.pendingRealDeviceProofActions.length ? payload.pendingRealDeviceProofActions.join(", ") : "none"}

## Action Status

${actionLines}

## Linked Docs

${payload.linkedDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Notes

${payload.notes.map((note) => `- ${note}`).join("\n")}
`;
}
main();
