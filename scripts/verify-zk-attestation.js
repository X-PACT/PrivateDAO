"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const attestationPath = "docs/zk-attestation.generated.json";
    const registryPath = "docs/zk-registry.generated.json";
    const transcriptPath = "docs/zk-transcript.generated.md";
    const manifestPath = "docs/cryptographic-manifest.generated.json";
    if (!fs_1.default.existsSync(path_1.default.resolve(attestationPath))) {
        throw new Error("missing zk attestation");
    }
    const attestation = readJson(attestationPath);
    const registry = readJson(registryPath);
    const manifest = readJson(manifestPath);
    assert(attestation.project === "PrivateDAO", "zk attestation project mismatch");
    assert(attestation.zkStackVersion === registry.zkStackVersion, "zk attestation version mismatch");
    assert(attestation.provingSystem === registry.provingSystem, "zk attestation proving system mismatch");
    assert(attestation.layerCount === registry.entryCount, "zk attestation layer count mismatch");
    assert(attestation.ptau.sha256 === registry.ptau.sha256, "zk attestation ptau mismatch");
    verifyFileSummary(attestation.registry, registryPath);
    verifyFileSummary(attestation.transcript, transcriptPath);
    for (const requiredDoc of [
        "docs/zk-provenance.md",
        "docs/zk-verification-flow.md",
        "docs/zk-transcript.generated.md",
    ]) {
        assert(attestation.reviewDocs.includes(requiredDoc), `zk attestation is missing review doc: ${requiredDoc}`);
    }
    for (const command of [
        "npm run build:zk-attestation",
        "npm run verify:zk-attestation",
        "npm run verify:zk-consistency",
        "npm run verify:zk-negative",
    ]) {
        assert(attestation.verificationCommands.includes(command), `zk attestation is missing command: ${command}`);
    }
    for (const entry of registry.entries) {
        const layer = attestation.layers.find((candidate) => candidate.circuit === entry.circuit);
        assert(Boolean(layer), `zk attestation is missing layer: ${entry.circuit}`);
        assert(layer?.layer === entry.layer, `zk attestation layer mismatch for ${entry.circuit}`);
        assert(layer?.publicSignalCount === entry.publicSignalCount, `zk attestation public signal count mismatch for ${entry.circuit}`);
        assert(layer?.commands.build === entry.commands.build, `zk attestation build command mismatch for ${entry.circuit}`);
        assert(layer?.commands.prove === entry.commands.prove, `zk attestation prove command mismatch for ${entry.circuit}`);
        assert(layer?.commands.verify === entry.commands.verify, `zk attestation verify command mismatch for ${entry.circuit}`);
        assert(layer?.proofSha256 === entry.artifacts.proof.sha256, `zk attestation proof hash mismatch for ${entry.circuit}`);
        assert(layer?.publicSignalsSha256 === entry.artifacts.publicSignals.sha256, `zk attestation public signal hash mismatch for ${entry.circuit}`);
        assert(layer?.verificationKeySha256 === entry.artifacts.verificationKey.sha256, `zk attestation vkey hash mismatch for ${entry.circuit}`);
    }
    assert(manifest.files.some((entry) => entry.path === attestationPath), "cryptographic manifest is missing the zk attestation");
    console.log("ZK attestation verification: PASS");
}
function verifyFileSummary(summary, expectedPath) {
    assert(summary.path === expectedPath, `zk attestation path mismatch for ${expectedPath}`);
    const body = fs_1.default.readFileSync(path_1.default.resolve(expectedPath));
    const sha256 = crypto_1.default.createHash("sha256").update(body).digest("hex");
    assert(summary.sha256 === sha256, `zk attestation sha256 mismatch for ${expectedPath}`);
    assert(summary.bytes === body.byteLength, `zk attestation byte size mismatch for ${expectedPath}`);
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
