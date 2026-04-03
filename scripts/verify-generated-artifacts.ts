import fs from "fs";
import path from "path";

function main() {
  const auditPacketPath = path.resolve("docs/audit-packet.generated.md");
  const attestationPath = path.resolve("docs/review-attestation.generated.json");
  const cryptographicManifestPath = path.resolve("docs/cryptographic-manifest.generated.json");
  const zkRegistryPath = path.resolve("docs/zk-registry.generated.json");
  const zkTranscriptPath = path.resolve("docs/zk-transcript.generated.md");
  const zkAttestationPath = path.resolve("docs/zk-attestation.generated.json");
  const mainnetReadinessReportPath = path.resolve("docs/mainnet-readiness.generated.md");

  if (!fs.existsSync(auditPacketPath)) {
    throw new Error("missing generated audit packet");
  }
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing generated review attestation");
  }
  if (!fs.existsSync(cryptographicManifestPath)) {
    throw new Error("missing generated cryptographic manifest");
  }
  if (!fs.existsSync(zkRegistryPath)) {
    throw new Error("missing generated zk registry");
  }
  if (!fs.existsSync(zkTranscriptPath)) {
    throw new Error("missing generated zk transcript");
  }
  if (!fs.existsSync(zkAttestationPath)) {
    throw new Error("missing generated zk attestation");
  }
  if (!fs.existsSync(mainnetReadinessReportPath)) {
    throw new Error("missing generated mainnet readiness report");
  }

  const auditPacket = fs.readFileSync(auditPacketPath, "utf8");
  const attestation = JSON.parse(fs.readFileSync(attestationPath, "utf8")) as {
    project: string;
    programId: string;
    verificationWallet: string;
    pdaoToken?: {
      mint: string;
      programId: string;
      tokenAccount: string;
      metadataUri: string;
      decimals: number;
      supplyUi: string;
      transactionLabels: string[];
    };
    gateCount: number;
    packageCounts: Record<string, number>;
    zk?: {
      stackVersion: number;
      entryCount: number;
      verificationDocs?: string[];
      layers: Array<{ layer: string; circuit: string; publicSignalCount: number }>;
    };
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
  const zkRegistry = JSON.parse(fs.readFileSync(zkRegistryPath, "utf8")) as {
    project: string;
    zkStackVersion: number;
    entryCount: number;
    entries: Array<{ circuit: string; layer: string; publicSignalCount: number }>;
  };
  const zkTranscript = fs.readFileSync(zkTranscriptPath, "utf8");
  const mainnetReadinessReport = fs.readFileSync(mainnetReadinessReportPath, "utf8");
  const zkAttestation = JSON.parse(fs.readFileSync(zkAttestationPath, "utf8")) as {
    project: string;
    zkStackVersion: number;
    provingSystem: string;
    layerCount: number;
    layers: Array<{ layer: string; circuit: string; publicSignalCount: number }>;
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

  if (!attestation.pdaoToken) {
    throw new Error("generated attestation is missing the PDAO token summary");
  }

  if (attestation.pdaoToken.mint !== "AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt") {
    throw new Error("generated attestation PDAO mint mismatch");
  }

  if (attestation.pdaoToken.programId !== "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb") {
    throw new Error("generated attestation PDAO program mismatch");
  }

  if (attestation.pdaoToken.transactionLabels.length < 4) {
    throw new Error("generated attestation PDAO transaction labels are incomplete");
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

  if (!attestation.zk) {
    throw new Error("generated attestation is missing zk summary");
  }

  if (attestation.packageCounts.zk <= 0) {
    throw new Error("generated attestation zk package count is invalid");
  }

  if (attestation.zk.stackVersion < 1 || attestation.zk.entryCount < 3 || attestation.zk.layers.length < 3) {
    throw new Error("generated attestation zk summary is unexpectedly weak");
  }

  if (!attestation.zk.verificationDocs || attestation.zk.verificationDocs.length < 4) {
    throw new Error("generated attestation zk verification docs are missing");
  }

  if (!attestation.zk.verificationDocs.includes("docs/zk-attestation.generated.json")) {
    throw new Error("generated attestation is missing the zk attestation doc");
  }

  if (zkRegistry.project !== "PrivateDAO") {
    throw new Error("generated zk registry project mismatch");
  }

  if (zkRegistry.zkStackVersion < 1) {
    throw new Error("generated zk registry version mismatch");
  }

  if (zkRegistry.entryCount !== zkRegistry.entries.length || zkRegistry.entries.length < 3) {
    throw new Error("generated zk registry entry count mismatch");
  }

  for (const entry of zkRegistry.entries) {
    if (!entry.circuit || !entry.layer || entry.publicSignalCount <= 0) {
      throw new Error(`generated zk registry entry is invalid for ${entry.circuit || "unknown-circuit"}`);
    }
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

  if (!auditPacket.includes("## ZK Package")) {
    throw new Error("generated audit packet is missing the ZK package section");
  }

  if (!auditPacket.includes("## PDAO Token Surface")) {
    throw new Error("generated audit packet is missing the PDAO token section");
  }

  if (!auditPacket.includes("### ZK Review Commands")) {
    throw new Error("generated audit packet is missing the ZK review command section");
  }

  if (!auditPacket.includes("docs/mainnet-readiness.generated.md")) {
    throw new Error("generated audit packet is missing the mainnet readiness report reference");
  }

  if (!zkTranscript.includes("# ZK Transcript")) {
    throw new Error("generated zk transcript content is invalid");
  }

  if (!mainnetReadinessReport.includes("# Mainnet Readiness Report")) {
    throw new Error("generated mainnet readiness report content is invalid");
  }

  if (zkAttestation.project !== "PrivateDAO") {
    throw new Error("generated zk attestation project mismatch");
  }

  if (zkAttestation.zkStackVersion !== zkRegistry.zkStackVersion || zkAttestation.layerCount !== zkRegistry.entryCount) {
    throw new Error("generated zk attestation summary mismatch");
  }

  if (zkAttestation.provingSystem !== "groth16" || zkAttestation.layers.length < 3) {
    throw new Error("generated zk attestation proving summary is unexpectedly weak");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-registry.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the zk registry");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-transcript.generated.md")) {
    throw new Error("generated cryptographic manifest is missing the zk transcript");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/zk-attestation.generated.json")) {
    throw new Error("generated cryptographic manifest is missing the zk attestation");
  }

  if (!cryptographicManifest.files.some((entry) => entry.path === "docs/mainnet-readiness.generated.md")) {
    throw new Error("generated cryptographic manifest is missing the mainnet readiness report");
  }

  console.log("Generated artifact verification: PASS");
}

main();
