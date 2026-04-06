import fs from "fs";
import path from "path";

type Target = {
  id: string;
  walletLabel: string;
  environmentType: string;
  status: string;
};

type Capture = {
  id: string;
  walletLabel: string;
  walletVersion?: string;
  environmentType: string;
  os?: string;
  browserOrClient?: string;
  network: string;
  connectResult: "success" | "failure";
  signingResult: "success" | "failure" | "not-attempted";
  submissionResult: "success" | "failure" | "not-attempted";
  diagnosticsSnapshotCaptured: boolean;
  txSignature?: string | null;
  explorerUrl?: string | null;
  errorMessage?: string | null;
  evidenceRefs?: string[];
  capturedAt: string;
};

type CaptureRegistry = {
  project: string;
  network: string;
  generatedAt: string;
  targets: Target[];
  captures: Capture[];
};

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("usage: npm run record:real-device-runtime -- <capture-json-path>");
  }

  const registryPath = path.resolve("docs/runtime/real-device-captures.json");
  const registry = readJson<CaptureRegistry>(registryPath);
  const incoming = readJson<Capture>(inputPath);

  if (incoming.network !== "devnet") {
    throw new Error("real-device capture must remain on devnet");
  }

  const target = registry.targets.find((entry) => entry.id === incoming.id);
  if (!target) {
    throw new Error(`unknown target id: ${incoming.id}`);
  }

  if (incoming.walletLabel !== target.walletLabel) {
    throw new Error(`wallet label mismatch for target ${incoming.id}`);
  }

  if (incoming.environmentType !== target.environmentType) {
    throw new Error(`environment type mismatch for target ${incoming.id}`);
  }

  const normalized: Capture = {
    ...incoming,
    explorerUrl:
      incoming.txSignature && incoming.submissionResult === "success"
        ? `https://explorer.solana.com/tx/${incoming.txSignature}?cluster=devnet`
        : null,
    evidenceRefs: incoming.evidenceRefs ?? [],
  };

  if (normalized.submissionResult === "success" && !normalized.txSignature) {
    throw new Error("successful real-device submission must include txSignature");
  }

  const captureIndex = registry.captures.findIndex((entry) => entry.id === normalized.id);
  if (captureIndex >= 0) {
    registry.captures[captureIndex] = normalized;
  } else {
    registry.captures.push(normalized);
  }

  target.status = deriveTargetStatus(normalized);
  registry.generatedAt = new Date().toISOString();
  registry.captures.sort((a, b) => a.id.localeCompare(b.id));

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Recorded real-device capture for ${normalized.walletLabel} (${normalized.id})`);
}

function deriveTargetStatus(capture: Capture): string {
  if (capture.submissionResult === "success" && capture.diagnosticsSnapshotCaptured) {
    return "captured";
  }
  if (capture.connectResult === "success" || capture.signingResult === "success") {
    return "captured-with-failures";
  }
  return "attempted-no-success";
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
