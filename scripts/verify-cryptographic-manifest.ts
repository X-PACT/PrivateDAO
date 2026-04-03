import crypto from "crypto";
import fs from "fs";
import path from "path";

type ManifestEntry = {
  path: string;
  sha256: string;
  bytes: number;
};

type CryptographicManifest = {
  project: string;
  generatedAt: string;
  algorithm: string;
  entryCount: number;
  aggregateSha256: string;
  files: ManifestEntry[];
};

function main() {
  const manifestPath = path.resolve("docs/cryptographic-manifest.generated.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("missing cryptographic manifest");
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as CryptographicManifest;

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

  const regeneratedAggregate = sha256Hex(
    manifest.files.map((entry) => `${entry.path}:${verifyEntry(entry)}`).join("\n"),
  );

  if (regeneratedAggregate !== manifest.aggregateSha256) {
    throw new Error("cryptographic manifest aggregate mismatch");
  }

  console.log("Cryptographic manifest verification: PASS");
}

function verifyEntry(entry: ManifestEntry): string {
  const absolutePath = path.resolve(entry.path);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`cryptographic manifest file missing: ${entry.path}`);
  }

  const body = fs.readFileSync(absolutePath);
  if (body.byteLength !== entry.bytes) {
    throw new Error(`cryptographic manifest byte-length mismatch: ${entry.path}`);
  }

  const digest = sha256Hex(body);
  if (digest !== entry.sha256) {
    throw new Error(`cryptographic manifest sha256 mismatch: ${entry.path}`);
  }

  return digest;
}

function sha256Hex(input: crypto.BinaryLike): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

main();
