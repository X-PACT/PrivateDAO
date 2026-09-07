"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const registry = readJson("docs/zk-registry.generated.json");
    const markdown = `# ZK Transcript

## Purpose

This transcript gives reviewers a deterministic, machine-backed summary of the current PrivateDAO zk stack.

It is intended to answer:

- which proving system is used
- which ptau artifact underpins setup
- which files belong to each circuit layer
- which hashes identify the reviewer-facing artifacts
- which commands replay build, prove, and verify for each layer

## Stack Identity

- Project: \`${registry.project}\`
- ZK stack version: \`${registry.zkStackVersion}\`
- Proving system: \`${registry.provingSystem}\`
- PTau artifact: \`${registry.ptau.path}\`
- PTau sha256: \`${registry.ptau.sha256}\`
- PTau bytes: \`${registry.ptau.bytes}\`
- Attestation artifact: \`docs/zk-attestation.generated.json\`

## Layer Transcript

${registry.entries
        .map((entry) => `### ${entry.layer.toUpperCase()} — \`${entry.circuit}\`

- Source: \`${entry.source}\`
- Sample input: \`${entry.sampleInput}\`
- Proof: \`${entry.proof}\`
- Public signals: \`${entry.publicSignals}\`
- Verification key: \`${entry.verificationKey}\`
- Proving key: \`${entry.provingKey}\`
- R1CS: \`${entry.r1cs}\`
- WASM: \`${entry.wasm}\`
- Witness: \`${entry.witness}\`
- Public signal count: \`${entry.publicSignalCount}\`
- Build command: \`${entry.commands.build}\`
- Prove command: \`${entry.commands.prove}\`
- Verify command: \`${entry.commands.verify}\`

Artifact hashes:

- source sha256: \`${entry.artifacts.source.sha256}\`
- sample input sha256: \`${entry.artifacts.sampleInput.sha256}\`
- proof sha256: \`${entry.artifacts.proof.sha256}\`
- public signals sha256: \`${entry.artifacts.publicSignals.sha256}\`
- verification key sha256: \`${entry.artifacts.verificationKey.sha256}\`
- proving key sha256: \`${entry.artifacts.provingKey.sha256}\`
- r1cs sha256: \`${entry.artifacts.r1cs.sha256}\`
- wasm sha256: \`${entry.artifacts.wasm.sha256}\`
- witness sha256: \`${entry.artifacts.witness.sha256}\``)
        .join("\n\n")}

## Canonical Replay Commands

\`\`\`bash
npm run build:zk-registry
npm run build:zk-transcript
npm run build:zk-attestation
npm run verify:zk-registry
npm run verify:zk-transcript
npm run verify:zk-attestation
npm run verify:zk-docs
npm run verify:zk-consistency
npm run verify:zk-negative
npm run zk:all
\`\`\`

## Honest Boundary

This transcript proves that the current repository contains a real Circom and Groth16 artifact stack with reproducible layer commands and stable hashes for the tracked zk materials.

It does not claim:

- on-chain verifier integration
- arbitrary hidden execution
- full hidden tally replacement on the deployed Solana program
`;
    const outPath = path_1.default.resolve("docs/zk-transcript.generated.md");
    fs_1.default.writeFileSync(outPath, markdown);
    console.log(`Wrote zk transcript: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
