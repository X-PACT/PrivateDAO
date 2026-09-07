// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";
import { createCipheriv, createHash, randomBytes } from "crypto";
import { parseArgs } from "./utils";

type EncryptedManifest = {
  project: "PrivateDAO";
  version: 1;
  algorithm: "aes-256-gcm";
  keyCommitmentHash: string;
  plaintextHash: string;
  ciphertextHash: string;
  manifestHash: string;
  aad: string;
  ivBase64: string;
  authTagBase64: string;
  ciphertextBase64: string;
  createdAt: string;
};

function canonicalize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => [key, sortValue(nested)]),
  );
}

function sha256Hex(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function parseKey(args: Record<string, unknown>): Buffer {
  const keyHex = String(args.keyHex || process.env.CONFIDENTIAL_MANIFEST_KEY_HEX || "").trim();
  if (keyHex) {
    const key = Buffer.from(keyHex.replace(/^0x/i, ""), "hex");
    if (key.length !== 32) throw new Error("--key-hex must be a 32-byte hex value");
    return key;
  }
  return randomBytes(32);
}

function main() {
  const args = parseArgs();
  const inputPath = args.input ? path.resolve(String(args.input)) : "";
  const outputPath = args.output ? path.resolve(String(args.output)) : "";
  const aad = String(args.aad || "privatedao-confidential-payout-manifest-v1");

  if (!inputPath || !outputPath) {
    throw new Error("usage: npm run encrypt:confidential-manifest -- --input <plaintext.json> --output <encrypted.json> [--key-out <tmp-key-file>] [--key-hex <hex32>] [--aad <string>]");
  }

  const plaintext = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const canonicalPlaintext = Buffer.from(canonicalize(plaintext), "utf8");
  const key = parseKey(args);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(canonicalPlaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const manifestWithoutHash = {
    project: "PrivateDAO" as const,
    version: 1 as const,
    algorithm: "aes-256-gcm" as const,
    keyCommitmentHash: sha256Hex(key),
    plaintextHash: sha256Hex(canonicalPlaintext),
    ciphertextHash: sha256Hex(ciphertext),
    aad,
    ivBase64: iv.toString("base64"),
    authTagBase64: authTag.toString("base64"),
    ciphertextBase64: ciphertext.toString("base64"),
    createdAt: new Date().toISOString(),
  };

  const encrypted: EncryptedManifest = {
    ...manifestWithoutHash,
    manifestHash: sha256Hex(canonicalize(manifestWithoutHash)),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(encrypted, null, 2) + "\n");

  if (args.keyOut) {
    const keyOut = path.resolve(String(args.keyOut));
    fs.mkdirSync(path.dirname(keyOut), { recursive: true });
    fs.writeFileSync(keyOut, key.toString("hex") + "\n", { mode: 0o600 });
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
