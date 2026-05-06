"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
function main() {
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    const deployment = readJson("docs/deployment-attestation.generated.json");
    const goLive = readJson("docs/go-live-attestation.generated.json");
    const commit = safeGit("git rev-parse HEAD");
    const branch = safeGit("git rev-parse --abbrev-ref HEAD");
    const mandatoryGates = [
        "npm run verify:live-proof",
        "npm run verify:test-wallet-live-proof:v3",
        "npm run verify:release-manifest",
        "npm run verify:review-links",
        "npm run verify:review-surface",
        "npm run check:mainnet",
    ];
    const attestation = {
        project: submission.project,
        generatedAt: deterministicGeneratedAt(),
        releaseCommit: commit,
        releaseBranch: branch,
        programId: submission.programId,
        verificationWallet: submission.verificationWallet,
        deployTx: proof.deployTx,
        anchors: {
            dao: proof.dao,
            governanceMint: proof.governanceMint,
            treasury: proof.treasury,
            proposal: proof.proposal,
        },
        ceremonyDocs: [
            "docs/release-ceremony.md",
            "docs/mainnet-cutover-runbook.md",
            "docs/operator-checklist.md",
            "docs/mainnet-readiness.generated.md",
            "docs/test-wallet-live-proof-v3.generated.md",
            "docs/governance-hardening-v3.md",
            "docs/settlement-hardening-v3.md",
            "docs/deployment-attestation.generated.json",
            "docs/go-live-attestation.generated.json",
        ],
        mandatoryGates,
        observedGateCount: submission.gates.length,
        deploymentGateCount: deployment.gateCount,
        goLiveDecision: goLive.decision,
        unresolvedBlockers: goLive.blockers.filter((entry) => entry.status !== "cleared"),
        notes: [
            "This attestation records release discipline, not a claim that mainnet cutover has already happened.",
            "External audit and organizational custody approvals remain out-of-repo blockers.",
            "The ceremony surface is reviewer-visible so release rigor can be inspected rather than asserted.",
        ],
    };
    const jsonPath = path_1.default.resolve("docs/release-ceremony-attestation.generated.json");
    const mdPath = path_1.default.resolve("docs/release-ceremony-attestation.generated.md");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(attestation, null, 2) + "\n");
    fs_1.default.writeFileSync(mdPath, buildMarkdown(attestation));
    console.log("Wrote release ceremony attestation");
}
function buildMarkdown(attestation) {
    return `# Release Ceremony Attestation

## Overview

- Generated at: \`${attestation.generatedAt}\`
- Release commit: \`${attestation.releaseCommit}\`
- Release branch: \`${attestation.releaseBranch}\`
- Program id: \`${attestation.programId}\`
- Verification wallet: \`${attestation.verificationWallet}\`
- Deploy transaction: \`${attestation.deployTx}\`

## Anchors

${Object.entries(attestation.anchors)
        .map(([label, value]) => `- ${label}: \`${value}\``)
        .join("\n")}

## Ceremony Documents

${attestation.ceremonyDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Mandatory Gates

${attestation.mandatoryGates.map((gate) => `- \`${gate}\``).join("\n")}

## Ceremony Status

- Observed gate count: \`${attestation.observedGateCount}\`
- Deployment gate count: \`${attestation.deploymentGateCount}\`
- Go-live decision: \`${attestation.goLiveDecision}\`

## Unresolved Blockers

${attestation.unresolvedBlockers.map((entry) => `- ${entry.name}: \`${entry.status}\``).join("\n")}

## Notes

${attestation.notes.map((note) => `- ${note}`).join("\n")}
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function safeGit(command) {
    return (0, child_process_1.execSync)(command, { cwd: process.cwd(), stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
}
function deterministicGeneratedAt() {
    const explicit = process.env.PRIVATE_DAO_BUILD_TIMESTAMP;
    if (explicit) {
        return explicit;
    }
    return safeGit("git log -1 --format=%cI");
}
main();
