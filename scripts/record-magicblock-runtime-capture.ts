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
  corridorPda: string;
  settlementWallet: string;
  validator: string | null;
  transferQueue: string | null;
  mintInitializationResult: "success" | "failure" | "not-attempted";
  depositResult: "success" | "failure" | "not-attempted";
  privateTransferResult: "success" | "failure" | "not-attempted";
  withdrawResult: "success" | "failure" | "not-attempted";
  settleResult: "success" | "failure" | "not-attempted";
  executeResult: "success" | "failure" | "not-attempted";
  diagnosticsSnapshotCaptured: boolean;
  depositTxSignature?: string | null;
  transferTxSignature?: string | null;
  withdrawTxSignature?: string | null;
  settleTxSignature?: string | null;
  executeTxSignature?: string | null;
  explorerUrls?: {
    deposit?: string | null;
    transfer?: string | null;
    withdraw?: string | null;
    settle?: string | null;
    execute?: string | null;
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
    throw new Error("usage: npm run record:magicblock-runtime -- <capture-json-path>");
  }

  const registryPath = path.resolve("docs/magicblock-runtime-captures.json");
  const registry = readJson<CaptureRegistry>(registryPath);
  const incoming = readJson<Capture>(inputPath);

  if (incoming.network !== "devnet") {
    throw new Error("MagicBlock runtime capture must remain on devnet");
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
      deposit:
        incoming.depositTxSignature && incoming.depositResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.depositTxSignature}?cluster=devnet`
          : null,
      transfer:
        incoming.transferTxSignature && incoming.privateTransferResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.transferTxSignature}?cluster=devnet`
          : null,
      withdraw:
        incoming.withdrawTxSignature && incoming.withdrawResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.withdrawTxSignature}?cluster=devnet`
          : null,
      settle:
        incoming.settleTxSignature && incoming.settleResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.settleTxSignature}?cluster=devnet`
          : null,
      execute:
        incoming.executeTxSignature && incoming.executeResult === "success"
          ? `https://explorer.solana.com/tx/${incoming.executeTxSignature}?cluster=devnet`
          : null,
    },
    evidenceRefs: incoming.evidenceRefs ?? [],
  };

  if (normalized.depositResult === "success" && !normalized.depositTxSignature) {
    throw new Error("successful MagicBlock deposit must include depositTxSignature");
  }
  if (normalized.privateTransferResult === "success" && !normalized.transferTxSignature) {
    throw new Error("successful MagicBlock transfer must include transferTxSignature");
  }
  if (normalized.settleResult === "success") {
    if (!normalized.settleTxSignature) throw new Error("successful MagicBlock settlement must include settleTxSignature");
    if (!normalized.validator) throw new Error("successful MagicBlock settlement must include validator");
    if (!normalized.transferQueue) throw new Error("successful MagicBlock settlement must include transferQueue");
  }
  if (normalized.executeResult === "success" && !normalized.executeTxSignature) {
    throw new Error("successful MagicBlock execution must include executeTxSignature");
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
  console.log(`Recorded MagicBlock runtime capture for ${normalized.walletLabel} (${normalized.id})`);
}

function deriveTargetStatus(capture: Capture): string {
  if (
    capture.depositResult === "success" &&
    capture.privateTransferResult === "success" &&
    capture.settleResult === "success" &&
    capture.executeResult === "success" &&
    capture.diagnosticsSnapshotCaptured
  ) {
    return "captured";
  }
  if (
    capture.depositResult === "success" ||
    capture.privateTransferResult === "success" ||
    capture.settleResult === "success" ||
    capture.executeResult === "success"
  ) {
    return "captured-with-failures";
  }
  return "attempted-no-success";
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
