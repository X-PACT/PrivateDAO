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
  proposalPublicKey: string;
  policyPda?: string | null;
  receiptModes: {
    vote: "missing" | "parallel" | "zk_enforced";
    delegation: "missing" | "parallel" | "zk_enforced";
    tally: "missing" | "parallel" | "zk_enforced";
  };
  diagnosticsSnapshotCaptured: boolean;
  modeActivationResult: "success" | "failure" | "not-attempted";
  finalizeResult: "success" | "failure" | "not-attempted";
  enableModeTxSignature?: string | null;
  finalizeTxSignature?: string | null;
  explorerUrls?: {
    enableMode?: string | null;
    finalize?: string | null;
  };
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
    throw new Error("usage: npm run record:zk-enforced-runtime -- <capture-json-path>");
  }

  const registryPath = path.resolve("docs/zk-enforced-runtime-captures.json");
  const registry = readJson<CaptureRegistry>(registryPath);
  const incoming = readJson<Capture>(inputPath);

  if (incoming.network !== "devnet") {
    throw new Error("zk-enforced runtime capture must remain on devnet");
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
    explorerUrls: {
      enableMode:
        incoming.enableModeTxSignature && incoming.modeActivationResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.enableModeTxSignature}?cluster=devnet`
          : null,
      finalize:
        incoming.finalizeTxSignature && incoming.finalizeResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.finalizeTxSignature}?cluster=devnet`
          : null,
    },
    evidenceRefs: incoming.evidenceRefs ?? [],
  };

  if (normalized.modeActivationResult === "success") {
    if (!normalized.enableModeTxSignature) {
      throw new Error("successful zk-enforced mode activation must include enableModeTxSignature");
    }
    if (!allStrong(normalized.receiptModes)) {
      throw new Error("successful zk-enforced mode activation requires zk_enforced receipt modes for vote, delegation, and tally");
    }
  }

  if (normalized.finalizeResult === "success" && !normalized.finalizeTxSignature) {
    throw new Error("successful zk-enforced finalize must include finalizeTxSignature");
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
  console.log(`Recorded zk-enforced runtime capture for ${normalized.walletLabel} (${normalized.id})`);
}

function allStrong(receiptModes: Capture["receiptModes"]) {
  return receiptModes.vote === "zk_enforced"
    && receiptModes.delegation === "zk_enforced"
    && receiptModes.tally === "zk_enforced";
}

function deriveTargetStatus(capture: Capture): string {
  if (capture.modeActivationResult === "success" && capture.finalizeResult === "success") {
    return "captured";
  }
  if (capture.modeActivationResult === "success" || capture.finalizeResult === "success") {
    return "captured-with-failures";
  }
  return "attempted-no-success";
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
