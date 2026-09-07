"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const registryPath = path_1.default.resolve("docs/zk-registry.generated.json");
    if (!fs_1.default.existsSync(registryPath)) {
        throw new Error("missing zk registry");
    }
    const registry = JSON.parse(fs_1.default.readFileSync(registryPath, "utf8"));
    if (registry.project !== "PrivateDAO") {
        throw new Error("zk registry project mismatch");
    }
    if (registry.zkStackVersion < 1) {
        throw new Error("zk registry version is invalid");
    }
    if (registry.provingSystem !== "groth16") {
        throw new Error("zk registry proving system mismatch");
    }
    if (!registry.ptau) {
        throw new Error("zk registry ptau is missing");
    }
    verifyArtifact(registry.ptau.path, registry.ptau.sha256, registry.ptau.bytes, "ptau");
    if (registry.entryCount !== registry.entries.length || registry.entries.length < 3) {
        throw new Error("zk registry entry count mismatch");
    }
    for (const entry of registry.entries) {
        verifyEntry(entry);
    }
    console.log("ZK registry verification: PASS");
}
function verifyEntry(entry) {
    const requiredPaths = [
        entry.source,
        entry.sampleInput,
        entry.proof,
        entry.publicSignals,
        entry.verificationKey,
        entry.provingKey,
        entry.r1cs,
        entry.wasm,
        entry.witness,
    ];
    for (const relativePath of requiredPaths) {
        if (!fs_1.default.existsSync(path_1.default.resolve(relativePath))) {
            throw new Error(`zk registry missing path: ${relativePath}`);
        }
    }
    if (!entry.commands.build.includes(`zk:build:${entry.layer}`)) {
        throw new Error(`zk registry build command mismatch: ${entry.circuit}`);
    }
    if (!entry.commands.prove.includes(`zk:prove:${entry.layer}`)) {
        throw new Error(`zk registry prove command mismatch: ${entry.circuit}`);
    }
    if (!entry.commands.verify.includes(`zk:verify:${entry.layer}`)) {
        throw new Error(`zk registry verify command mismatch: ${entry.circuit}`);
    }
    const publicSignals = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(entry.publicSignals), "utf8"));
    if (publicSignals.length !== entry.publicSignalCount || entry.publicSignalCount <= 0) {
        throw new Error(`zk registry public signal count mismatch: ${entry.circuit}`);
    }
    for (const [key, artifact] of Object.entries(entry.artifacts)) {
        const target = entry[key];
        if (typeof target !== "string") {
            throw new Error(`zk registry artifact mapping mismatch: ${entry.circuit}:${key}`);
        }
        verifyArtifact(target, artifact.sha256, artifact.bytes, `${entry.circuit}:${key}`);
    }
}
function verifyArtifact(relativePath, expectedSha256, expectedBytes, label) {
    const body = fs_1.default.readFileSync(path_1.default.resolve(relativePath));
    const sha256 = crypto_1.default.createHash("sha256").update(body).digest("hex");
    if (sha256 !== expectedSha256) {
        throw new Error(`zk registry artifact sha256 mismatch: ${label}`);
    }
    if (body.byteLength !== expectedBytes || expectedBytes <= 0) {
        throw new Error(`zk registry artifact byte-size mismatch: ${label}`);
    }
}
main();
