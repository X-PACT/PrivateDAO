// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";
import { createDecipheriv, createHash } from "crypto";
import { parseArgs } from "./utils";

type EncryptedManifest = {
  project: string;
  version: number;
  algorithm: string;
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

const DEFAULT_ENCRYPTED_PATH = "docs/runtime/confidential-manifests/devnet-stable-magicblock-refhe.enc.json";
const DEFAULT_FORBIDDEN_TERMS = [
  "alice",
  "bob",
  "employee",
  "salary",
  "payroll",
  "recipientAllocation",
  "baseCompensation",
  "bonusAmount",
];

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

function readKey(args: Record<string, unknown>): Buffer | null {
  const keyHex = args.keyHex
    ? String(args.keyHex)
    : args.keyFile
      ? fs.readFileSync(path.resolve(String(args.keyFile)), "utf8")
      : process.env.CONFIDENTIAL_MANIFEST_KEY_HEX || "";
  const normalized = keyHex.trim().replace(/^0x/i, "");
  if (!normalized) return null;
  const key = Buffer.from(normalized, "hex");
  if (key.length !== 32) throw new Error("confidential manifest key must be 32 bytes");
  return key;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const args = parseArgs();
  const encryptedPath = path.resolve(String(args.encrypted || DEFAULT_ENCRYPTED_PATH));
  const raw = fs.readFileSync(encryptedPath, "utf8");
  const encrypted = JSON.parse(raw) as EncryptedManifest;

  assert(encrypted.project === "PrivateDAO", "confidential manifest project mismatch");
  assert(encrypted.version === 1, "confidential manifest version mismatch");
  assert(encrypted.algorithm === "aes-256-gcm", "confidential manifest must use aes-256-gcm");
  assert(Buffer.from(encrypted.ivBase64, "base64").length === 12, "AES-GCM IV must be 12 bytes");
  assert(Buffer.from(encrypted.authTagBase64, "base64").length === 16, "AES-GCM auth tag must be 16 bytes");

  const ciphertext = Buffer.from(encrypted.ciphertextBase64, "base64");
  assert(ciphertext.length > 0, "confidential manifest ciphertext must not be empty");
  assert(encrypted.ciphertextHash === sha256Hex(ciphertext), "confidential manifest ciphertextHash mismatch");

  const { manifestHash, ...withoutManifestHash } = encrypted;
  assert(manifestHash === sha256Hex(canonicalize(withoutManifestHash)), "confidential manifest manifestHash mismatch");

  const forbiddenTerms = String(args.forbid || DEFAULT_FORBIDDEN_TERMS.join(","))
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const rawLower = raw.toLowerCase();
  for (const term of forbiddenTerms) {
    assert(!rawLower.includes(term), `encrypted manifest leaked forbidden plaintext term: ${term}`);
  }

  const key = readKey(args);
  if (key) {
    assert(encrypted.keyCommitmentHash === sha256Hex(key), "confidential manifest key commitment mismatch");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.ivBase64, "base64"));
    decipher.setAAD(Buffer.from(encrypted.aad, "utf8"));
    decipher.setAuthTag(Buffer.from(encrypted.authTagBase64, "base64"));
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    assert(encrypted.plaintextHash === sha256Hex(plaintext), "confidential manifest plaintextHash mismatch");

    if (args.plaintext) {
      const expected = Buffer.from(canonicalize(JSON.parse(fs.readFileSync(path.resolve(String(args.plaintext)), "utf8"))), "utf8");
      assert(plaintext.equals(expected), "confidential manifest decrypted plaintext mismatch");
    }
  }

  console.log("Confidential manifest encryption verification: PASS");
}

main();
