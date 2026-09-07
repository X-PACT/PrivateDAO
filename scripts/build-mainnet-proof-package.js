"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const readiness = readMarkdown("docs/mainnet-readiness.generated.md");
    const matrix = readJson("docs/mainnet-acceptance-matrix.generated.json");
    const payload = {
        project: "PrivateDAO",
        generatedAt: new Date().toISOString(),
        packageDecision: matrix.acceptanceDecision,
        coreArtifacts: [
            "docs/mainnet-readiness.generated.md",
            "docs/mainnet-acceptance-matrix.generated.md",
            "docs/test-wallet-live-proof-v3.generated.md",
            "docs/governance-hardening-v3.md",
            "docs/settlement-hardening-v3.md",
            "docs/release-ceremony-attestation.generated.md",
            "docs/release-drill.generated.md",
            "docs/operational-evidence.generated.md",
            "docs/runtime-evidence.generated.md",
            "docs/runtime/real-device.generated.md",
            "docs/deployment-attestation.generated.json",
            "docs/go-live-attestation.generated.json",
            "docs/external-readiness-intake.md",
        ],
        summary: matrix.summary,
        readinessAnchor: readiness.anchor,
        commands: [
            "npm run build:mainnet-readiness-report",
            "npm run build:mainnet-acceptance-matrix",
            "npm run build:mainnet-proof-package",
            "npm run verify:mainnet-readiness-report",
            "npm run verify:mainnet-acceptance-matrix",
            "npm run verify:mainnet-proof-package",
            "npm run verify:all",
            "bash scripts/check-mainnet-readiness.sh",
        ],
    };
    const jsonPath = path_1.default.resolve("docs/mainnet-proof-package.generated.json");
    const mdPath = path_1.default.resolve("docs/mainnet-proof-package.generated.md");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(mdPath, buildMarkdown(payload));
    console.log(`Wrote mainnet proof package: ${path_1.default.relative(process.cwd(), mdPath)}`);
}
function buildMarkdown(payload) {
    return `# Mainnet Proof Package

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- package decision: \`${payload.packageDecision}\`
- program id: \`${payload.readinessAnchor.programId}\`
- verification wallet: \`${payload.readinessAnchor.verificationWallet}\`
- accepted in repo: \`${payload.summary.acceptedInRepo}\`
- pending external: \`${payload.summary.pendingExternal}\`
- not in repo: \`${payload.summary.notInRepo}\`

## Core Artifacts

${payload.coreArtifacts.map((entry) => `- \`${entry}\``).join("\n")}

## Canonical Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Purpose

This package is the shortest reviewer-facing path for mainnet readiness discussions. It binds the readiness report, acceptance matrix, baseline and additive V3 proof surfaces, runtime package, release discipline, and honest external-intake boundary into one compact surface.
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function readMarkdown(relativePath) {
    const body = fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8");
    const project = /Project: `([^`]+)`/.exec(body)?.[1] ?? "PrivateDAO";
    const programId = /Program ID: `([^`]+)`/.exec(body)?.[1] ?? "";
    const verificationWallet = /Verification wallet: `([^`]+)`/.exec(body)?.[1] ?? "";
    return { body, anchor: { project, programId, verificationWallet } };
}
main();
