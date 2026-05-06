"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const manifestPath = path_1.default.resolve("docs/cryptographic-manifest.generated.json");
    if (!fs_1.default.existsSync(manifestPath)) {
        throw new Error("missing cryptographic manifest");
    }
    const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, "utf8"));
    if (manifest.project !== "PrivateDAO") {
        throw new Error("cryptographic manifest project mismatch");
    }
    if (manifest.algorithm !== "sha256") {
        throw new Error("cryptographic manifest algorithm mismatch");
    }
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
        throw new Error("cryptographic manifest is empty");
    }
    if (manifest.entryCount !== manifest.files.length) {
        throw new Error("cryptographic manifest entry count mismatch");
    }
    const regeneratedAggregate = sha256Hex(manifest.files.map((entry) => `${entry.path}:${verifyEntry(entry)}`).join("\n"));
    if (regeneratedAggregate !== manifest.aggregateSha256) {
        throw new Error("cryptographic manifest aggregate mismatch");
    }
    console.log("Cryptographic manifest verification: PASS");
}
function verifyEntry(entry) {
    const absolutePath = path_1.default.resolve(entry.path);
    if (!fs_1.default.existsSync(absolutePath)) {
        throw new Error(`cryptographic manifest file missing: ${entry.path}`);
    }
    const body = fs_1.default.readFileSync(absolutePath);
    if (body.byteLength !== entry.bytes) {
        throw new Error(`cryptographic manifest byte-length mismatch: ${entry.path}`);
    }
    const digest = sha256Hex(body);
    if (digest !== entry.sha256) {
        throw new Error(`cryptographic manifest sha256 mismatch: ${entry.path}`);
    }
    return digest;
}
function sha256Hex(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
main();
