"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SPDX-License-Identifier: AGPL-3.0-or-later
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const utils_1 = require("./utils");
function canonicalize(value) {
    return JSON.stringify(sortValue(value));
}
function sortValue(value) {
    if (Array.isArray(value))
        return value.map(sortValue);
    if (!value || typeof value !== "object")
        return value;
    return Object.fromEntries(Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortValue(nested)]));
}
function sha256Hex(buffer) {
    return (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
}
function parseKey(args) {
    const keyHex = String(args.keyHex || process.env.CONFIDENTIAL_MANIFEST_KEY_HEX || "").trim();
    if (keyHex) {
        const key = Buffer.from(keyHex.replace(/^0x/i, ""), "hex");
        if (key.length !== 32)
            throw new Error("--key-hex must be a 32-byte hex value");
        return key;
    }
    return (0, crypto_1.randomBytes)(32);
}
function main() {
    const args = (0, utils_1.parseArgs)();
    const inputPath = args.input ? path_1.default.resolve(String(args.input)) : "";
    const outputPath = args.output ? path_1.default.resolve(String(args.output)) : "";
    const aad = String(args.aad || "privatedao-confidential-payout-manifest-v1");
    if (!inputPath || !outputPath) {
        throw new Error("usage: npm run encrypt:confidential-manifest -- --input <plaintext.json> --output <encrypted.json> [--key-out <tmp-key-file>] [--key-hex <hex32>] [--aad <string>]");
    }
    const plaintext = JSON.parse(fs_1.default.readFileSync(inputPath, "utf8"));
    const canonicalPlaintext = Buffer.from(canonicalize(plaintext), "utf8");
    const key = parseKey(args);
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", key, iv);
    cipher.setAAD(Buffer.from(aad, "utf8"));
    const ciphertext = Buffer.concat([cipher.update(canonicalPlaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const manifestWithoutHash = {
        project: "PrivateDAO",
        version: 1,
        algorithm: "aes-256-gcm",
        keyCommitmentHash: sha256Hex(key),
        plaintextHash: sha256Hex(canonicalPlaintext),
        ciphertextHash: sha256Hex(ciphertext),
        aad,
        ivBase64: iv.toString("base64"),
        authTagBase64: authTag.toString("base64"),
        ciphertextBase64: ciphertext.toString("base64"),
        createdAt: new Date().toISOString(),
    };
    const encrypted = {
        ...manifestWithoutHash,
        manifestHash: sha256Hex(canonicalize(manifestWithoutHash)),
    };
    fs_1.default.mkdirSync(path_1.default.dirname(outputPath), { recursive: true });
    fs_1.default.writeFileSync(outputPath, JSON.stringify(encrypted, null, 2) + "\n");
    if (args.keyOut) {
        const keyOut = path_1.default.resolve(String(args.keyOut));
        fs_1.default.mkdirSync(path_1.default.dirname(keyOut), { recursive: true });
        fs_1.default.writeFileSync(keyOut, key.toString("hex") + "\n", { mode: 0o600 });
    }
    console.log(JSON.stringify({
        output: outputPath,
        algorithm: encrypted.algorithm,
        manifestHash: encrypted.manifestHash,
        ciphertextHash: encrypted.ciphertextHash,
        keyWritten: Boolean(args.keyOut),
    }, null, 2));
}
main();
