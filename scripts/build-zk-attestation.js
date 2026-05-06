"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REGISTRY_PATH = "docs/zk-registry.generated.json";
const TRANSCRIPT_PATH = "docs/zk-transcript.generated.md";
const REVIEW_DOCS = [
    "docs/zk-layer.md",
    "docs/zk-stack.md",
    "docs/zk-threat-extension.md",
    "docs/zk-assumption-matrix.md",
    "docs/zk-capability-matrix.md",
    "docs/zk-provenance.md",
    "docs/zk-verification-flow.md",
    TRANSCRIPT_PATH,
];
const VERIFICATION_COMMANDS = [
    "npm run build:zk-registry",
    "npm run build:zk-transcript",
    "npm run build:zk-attestation",
    "npm run verify:zk-registry",
    "npm run verify:zk-transcript",
    "npm run verify:zk-attestation",
    "npm run verify:zk-docs",
    "npm run verify:zk-consistency",
    "npm run verify:zk-negative",
    "npm run zk:all",
];
function main() {
    const registry = readJson(REGISTRY_PATH);
    const attestation = {
        project: registry.project,
        zkStackVersion: registry.zkStackVersion,
        provingSystem: registry.provingSystem,
        ptau: registry.ptau,
        registry: buildFileSummary(REGISTRY_PATH),
        transcript: buildFileSummary(TRANSCRIPT_PATH),
        layerCount: registry.entryCount,
        reviewDocs: REVIEW_DOCS,
        verificationCommands: VERIFICATION_COMMANDS,
        layers: registry.entries.map((entry) => ({
            layer: entry.layer,
            circuit: entry.circuit,
            publicSignalCount: entry.publicSignalCount,
            commands: entry.commands,
            proofSha256: entry.artifacts.proof.sha256,
            publicSignalsSha256: entry.artifacts.publicSignals.sha256,
            verificationKeySha256: entry.artifacts.verificationKey.sha256,
        })),
        boundaries: [
            "off-chain additive Groth16 stack",
            "no on-chain verifier integration",
            "no contract interface changes",
        ],
    };
    const outPath = path_1.default.resolve("docs/zk-attestation.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
    console.log(`Wrote zk attestation: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function buildFileSummary(relativePath) {
    const body = fs_1.default.readFileSync(path_1.default.resolve(relativePath));
    return {
        path: relativePath,
        sha256: crypto_1.default.createHash("sha256").update(body).digest("hex"),
        bytes: body.byteLength,
    };
}
main();
