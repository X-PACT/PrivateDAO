import fs from "fs";
import path from "path";

function main() {
  const auditPacketPath = path.resolve("docs/audit-packet.generated.md");
  const attestationPath = path.resolve("docs/review-attestation.generated.json");
  const cryptographicManifestPath = path.resolve("docs/cryptographic-manifest.generated.json");

  if (!fs.existsSync(auditPacketPath)) {
    throw new Error("missing generated audit packet");
  }
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing generated review attestation");
  }
  if (!fs.existsSync(cryptographicManifestPath)) {
    throw new Error("missing generated cryptographic manifest");
  }

  const auditPacket = fs.readFileSync(auditPacketPath, "utf8");
  const attestation = JSON.parse(fs.readFileSync(attestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    gateCount: number;
    packageCounts: Record<string, number>;
    cryptographicIntegrity?: {
      algorithm: string;
      entryCount: number;
      aggregateSha256: string;
    };
  };
  const cryptographicManifest = JSON.parse(fs.readFileSync(cryptographicManifestPath, "utf8")) as {
    project: string;
    algorithm: string;
    entryCount: number;
    aggregateSha256: string;
    files: Array<{ path: string; sha256: string }>;
  };

  if (attestation.project !== "PrivateDAO") {
    throw new Error("generated attestation project mismatch");
  }

  if (attestation.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("generated attestation program id mismatch");
  }

  if (attestation.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("generated attestation verification wallet mismatch");
  }

  if (attestation.gateCount < 8) {
    throw new Error("generated attestation gate count is unexpectedly low");
  }

  if (cryptographicManifest.project !== "PrivateDAO") {
    throw new Error("generated cryptographic manifest project mismatch");
  }

  if (cryptographicManifest.algorithm !== "sha256") {
    throw new Error("generated cryptographic manifest algorithm mismatch");
  }

  if (cryptographicManifest.entryCount < 10 || cryptographicManifest.files.length !== cryptographicManifest.entryCount) {
    throw new Error("generated cryptographic manifest entry count is unexpectedly low");
  }

  if (!attestation.cryptographicIntegrity) {
    throw new Error("generated attestation is missing cryptographic integrity summary");
  }

  if (attestation.cryptographicIntegrity.algorithm !== cryptographicManifest.algorithm) {
    throw new Error("generated attestation cryptographic algorithm mismatch");
  }

  if (attestation.cryptographicIntegrity.entryCount !== cryptographicManifest.entryCount) {
    throw new Error("generated attestation cryptographic entry count mismatch");
  }

  if (attestation.cryptographicIntegrity.aggregateSha256 !== cryptographicManifest.aggregateSha256) {
    throw new Error("generated attestation cryptographic aggregate mismatch");
  }

  for (const [pkg, count] of Object.entries(attestation.packageCounts)) {
    if (count <= 0) {
      throw new Error(`generated attestation package count is invalid for ${pkg}`);
    }
  }

  if (!auditPacket.includes("# Audit Packet")) {
    throw new Error("generated audit packet content is invalid");
  }

  console.log("Generated artifact verification: PASS");
}

main();
