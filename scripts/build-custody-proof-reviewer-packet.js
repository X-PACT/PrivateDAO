"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function hasExplorerArtifact(entry) {
    return Boolean(entry.signature && entry.href);
}
function main() {
    const custody = readJson("docs/canonical-custody-proof.generated.json");
    const trust = readJson("docs/launch-trust-packet.generated.json");
    const judgeFirstOpenings = readJson("docs/track-judge-first-openings.generated.json");
    const payload = {
        project: "PrivateDAO",
        generatedAt: new Date().toISOString(),
        reviewerIntent: "Explain the current custody truth, show what is externally proven now, and make the missing external ceremony evidence explicit without narrative drift.",
        custodyStatus: custody.status,
        productionMainnetClaimAllowed: custody.productionMainnetClaimAllowed,
        trustDecision: trust.decision,
        custodyCompletion: `${custody.completedItems}/${custody.totalItems}`,
        exactBlocker: custody.blocker,
        currentTruth: {
            summary: custody.summary,
            multisigImplementation: custody.multisig.implementation,
            multisigAddress: custody.multisig.address,
            threshold: custody.multisig.threshold,
            configuredTimelockHours: custody.timelock.configuredHours,
            minimumTimelockHours: custody.timelock.minimumHours,
        },
        externallyProvenNow: {
            observedReadouts: custody.observedReadouts
                .filter((entry) => entry.status === "observed")
                .map((entry) => ({
                label: entry.label,
                cluster: entry.cluster,
                address: entry.address,
                explorerUrl: entry.explorerUrl,
                authority: entry.authority,
                programDataAddress: entry.programDataAddress,
                lastDeploySlot: entry.lastDeploySlot,
            })),
            explorerLinkedArtifacts: [
                {
                    label: "Program creation signature",
                    signature: custody.multisig.creationSignature,
                    href: custody.multisig.creationExplorerUrl,
                },
                {
                    label: "Rehearsal signature",
                    signature: custody.multisig.rehearsalSignature,
                    href: custody.multisig.rehearsalExplorerUrl,
                },
                {
                    label: "Timelock configuration signature",
                    signature: custody.timelock.configurationSignature,
                    href: custody.timelock.configurationExplorerUrl,
                },
                ...custody.authorityTransfers.map((transfer) => ({
                    label: `${transfer.surface} transfer signature`,
                    signature: transfer.transferSignature,
                    href: transfer.transferExplorerUrl,
                })),
            ].filter(hasExplorerArtifact),
        },
        exactPendingItems: custody.pendingItems,
        strictIngestionRoute: [
            "Build the public-key and signature packet in https://privatedao.org/custody/",
            "Save it locally as docs/custody-evidence-intake.json",
            "Run npm run apply:custody-evidence-intake",
            "Re-open canonical custody proof, launch trust packet, and the track proof closure surfaces",
        ],
        judgeFirstTrackOpenings: judgeFirstOpenings.tracks,
        requiredExternalInputs: trust.requiredExternalInputs,
        linkedDocs: Array.from(new Set([
            "docs/canonical-custody-proof.generated.md",
            "docs/track-judge-first-openings.generated.md",
            "docs/launch-trust-packet.generated.md",
            "docs/production-custody-ceremony.md",
            "docs/multisig-setup-intake.md",
            "docs/multisig-setup-intake.json",
            "docs/mainnet-blockers.md",
            ...trust.linkedDocs,
        ])),
        canonicalCommands: Array.from(new Set([
            "npm run build:custody-proof-reviewer-packet",
            "npm run verify:custody-proof-reviewer-packet",
            "npm run build:track-judge-first-openings",
            "npm run verify:track-judge-first-openings",
            "npm run apply:custody-evidence-intake",
            ...trust.commands,
        ])),
        liveRoutes: [
            "https://privatedao.org/custody/",
            "https://privatedao.org/security/",
            "https://privatedao.org/documents/launch-trust-packet/",
            "https://privatedao.org/documents/canonical-custody-proof/",
        ],
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/custody-proof-reviewer-packet.generated.json"), `${JSON.stringify(payload, null, 2)}\n`);
    fs_1.default.writeFileSync(path_1.default.resolve("docs/custody-proof-reviewer-packet.generated.md"), buildMarkdown(payload));
    console.log("Wrote custody proof reviewer packet");
}
function buildMarkdown(payload) {
    const observedReadouts = payload.externallyProvenNow.observedReadouts
        .map((entry) => [
        `- ${entry.label} (${entry.cluster})`,
        `  - address: \`${entry.address}\``,
        `  - explorer: ${entry.explorerUrl ?? "pending"}`,
        `  - authority: \`${entry.authority ?? "pending"}\``,
        `  - program data: \`${entry.programDataAddress ?? "pending"}\``,
        `  - last deploy slot: \`${entry.lastDeploySlot ?? "pending"}\``,
    ].join("\n"))
        .join("\n");
    const explorerArtifacts = payload.externallyProvenNow.explorerLinkedArtifacts.length
        ? payload.externallyProvenNow.explorerLinkedArtifacts
            .map((entry) => `- ${entry.label}: \`${entry.signature}\` -> ${entry.href}`)
            .join("\n")
        : "- No custody ceremony signatures are recorded yet.";
    const judgeFirstOpenings = payload.judgeFirstTrackOpenings
        .map((track) => [
        `### ${track.title}`,
        `- best demo route: \`${track.bestDemoRoute}\``,
        ...track.openingSequence.map((line, index) => `${index + 1}. ${line}`),
        `- voiceover: ${track.voiceoverScript}`,
    ].join("\n"))
        .join("\n\n");
    return `# Custody Proof Reviewer Packet

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- reviewer intent: ${payload.reviewerIntent}
- custody status: \`${payload.custodyStatus}\`
- trust decision: \`${payload.trustDecision}\`
- production mainnet claim allowed: \`${payload.productionMainnetClaimAllowed}\`
- custody completion: \`${payload.custodyCompletion}\`

## Current Truth

- summary: ${payload.currentTruth.summary}
- multisig implementation: \`${payload.currentTruth.multisigImplementation ?? "pending"}\`
- multisig address: \`${payload.currentTruth.multisigAddress ?? "pending"}\`
- threshold: \`${payload.currentTruth.threshold}\`
- configured timelock hours: \`${payload.currentTruth.configuredTimelockHours ?? "pending"}\`
- minimum timelock hours: \`${payload.currentTruth.minimumTimelockHours}\`

## What Is Externally Proven Now

${observedReadouts}

Explorer-linked artifacts:

${explorerArtifacts}

## Exact Pending Items

${payload.exactPendingItems.map((entry) => `- ${entry}`).join("\n")}

## Exact Mainnet Blocker

- blocker id: \`${payload.exactBlocker.id}\`
- severity: \`${payload.exactBlocker.severity}\`
- status: \`${payload.exactBlocker.status}\`
- next action: ${payload.exactBlocker.nextAction}

Blocker evidence refs:

${payload.exactBlocker.evidence.map((entry) => `- ${entry}`).join("\n")}

## Strict Ingestion Route

${payload.strictIngestionRoute.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}

## Judge-First Track Openings

Use these exact opening sequences to keep the first 30 to 45 seconds of the track videos aligned with the judge-first top strip and the reviewer packet.

${judgeFirstOpenings}

## Required External Inputs

${payload.requiredExternalInputs.map((entry) => `- ${entry}`).join("\n")}

## Live Routes

${payload.liveRoutes.map((entry) => `- ${entry}`).join("\n")}

## Linked Docs

${payload.linkedDocs.map((entry) => `- \`${entry}\``).join("\n")}

## Canonical Commands

${payload.canonicalCommands.map((entry) => `- \`${entry}\``).join("\n")}

## Honest Boundary

This reviewer packet proves the current observed custody state, the exact missing ceremony evidence, and the strict repo-safe ingestion path.

It does not claim that production multisig, signer closure, authority transfer, or post-transfer readouts already exist until those exact public artifacts are recorded.
`;
}
main();
