"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const attestationPath = path_1.default.resolve("docs/deployment-attestation.generated.json");
    if (!fs_1.default.existsSync(attestationPath)) {
        throw new Error("missing deployment attestation");
    }
    const attestation = readJson("docs/deployment-attestation.generated.json");
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    assert(attestation.project === submission.project, "deployment attestation project mismatch");
    assert(attestation.programId === submission.programId, "deployment attestation program id mismatch");
    assert(attestation.verificationWallet === submission.verificationWallet, "deployment attestation verification wallet mismatch");
    assert(attestation.deployTx === proof.deployTx, "deployment attestation deploy tx mismatch");
    assert(attestation.governanceAnchors.dao === proof.dao, "deployment attestation dao mismatch");
    assert(attestation.governanceAnchors.governanceMint === proof.governanceMint, "deployment attestation governance mint mismatch");
    assert(attestation.governanceAnchors.treasury === proof.treasury, "deployment attestation treasury mismatch");
    assert(attestation.governanceAnchors.proposal === proof.proposal, "deployment attestation proposal mismatch");
    for (const gate of [
        "npm run verify:all",
        "npm run verify:review-surface",
        "npm run verify:deployment-attestation",
        "npm run verify:mainnet-readiness-report",
    ]) {
        assert(attestation.verificationGates.includes(gate), `deployment attestation is missing gate: ${gate}`);
    }
    for (const doc of [
        "docs/wallet-runtime.md",
        "docs/fair-voting.md",
        "docs/mainnet-readiness.generated.md",
        "docs/go-live-criteria.md",
        "docs/operational-drillbook.md",
    ]) {
        assert(attestation.runtimeDocs.includes(doc), `deployment attestation is missing runtime doc: ${doc}`);
    }
    for (const [key, value] of Object.entries(submission.status)) {
        assert(attestation.readiness[key] === value, `deployment attestation readiness mismatch for ${key}`);
    }
    if (proof.pdaoToken) {
        assert(Boolean(attestation.pdaoToken), "deployment attestation is missing PDAO token section");
        assert(attestation.pdaoToken?.mint === proof.pdaoToken.mint, "deployment attestation PDAO mint mismatch");
        assert(attestation.pdaoToken?.programId === proof.pdaoToken.programId, "deployment attestation PDAO program mismatch");
    }
    console.log("Deployment attestation verification: PASS");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
