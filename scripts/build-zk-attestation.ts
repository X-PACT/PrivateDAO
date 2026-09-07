import crypto from "crypto";
import fs from "fs";
import path from "path";

type ZkRegistry = {
  project: string;
  zkStackVersion: number;
  provingSystem: string;
  ptau: {
    path: string;
    sha256: string;
    bytes: number;
  };
  entryCount: number;
  entries: Array<{
    circuit: string;
    layer: string;
    publicSignalCount: number;
    commands: {
      build: string;
      prove: string;
      verify: string;
    };
    artifacts: {
      proof: { sha256: string; bytes: number };
      publicSignals: { sha256: string; bytes: number };
      verificationKey: { sha256: string; bytes: number };
    };
  }>;
};

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
  const registry = readJson<ZkRegistry>(REGISTRY_PATH);
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

  const outPath = path.resolve("docs/zk-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote zk attestation: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function buildFileSummary(relativePath: string) {
  const body = fs.readFileSync(path.resolve(relativePath));
  return {
    path: relativePath,
    sha256: crypto.createHash("sha256").update(body).digest("hex"),
    bytes: body.byteLength,
  };
}

main();
