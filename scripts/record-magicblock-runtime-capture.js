"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const inputPath = process.argv[2];
    if (!inputPath) {
        throw new Error("usage: npm run record:magicblock-runtime -- <capture-json-path>");
    }
    const registryPath = path_1.default.resolve("docs/magicblock/runtime-captures.json");
    const registry = readJson(registryPath);
    const incoming = readJson(inputPath);
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
    const normalized = {
        ...incoming,
        explorerUrls: {
            deposit: incoming.depositTxSignature && incoming.depositResult === "success"
                ? `https://explorer.solana.com/tx/${incoming.depositTxSignature}?cluster=devnet`
                : null,
            transfer: incoming.transferTxSignature && incoming.privateTransferResult === "success"
                ? `https://explorer.solana.com/tx/${incoming.transferTxSignature}?cluster=devnet`
                : null,
            withdraw: incoming.withdrawTxSignature && incoming.withdrawResult === "success"
                ? `https://explorer.solana.com/tx/${incoming.withdrawTxSignature}?cluster=devnet`
                : null,
            settle: incoming.settleTxSignature && incoming.settleResult === "success"
                ? `https://explorer.solana.com/tx/${incoming.settleTxSignature}?cluster=devnet`
                : null,
            execute: incoming.executeTxSignature && incoming.executeResult === "success"
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
        if (!normalized.settleTxSignature)
            throw new Error("successful MagicBlock settlement must include settleTxSignature");
        if (!normalized.validator)
            throw new Error("successful MagicBlock settlement must include validator");
        if (!normalized.transferQueue)
            throw new Error("successful MagicBlock settlement must include transferQueue");
    }
    if (normalized.executeResult === "success" && !normalized.executeTxSignature) {
        throw new Error("successful MagicBlock execution must include executeTxSignature");
    }
    const captureIndex = registry.captures.findIndex((entry) => entry.id === normalized.id);
    if (captureIndex >= 0) {
        registry.captures[captureIndex] = normalized;
    }
    else {
        registry.captures.push(normalized);
    }
    target.status = deriveTargetStatus(normalized);
    registry.generatedAt = new Date().toISOString();
    registry.captures.sort((a, b) => a.id.localeCompare(b.id));
    fs_1.default.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
    console.log(`Recorded MagicBlock runtime capture for ${normalized.walletLabel} (${normalized.id})`);
}
function deriveTargetStatus(capture) {
    if (capture.depositResult === "success" &&
        capture.privateTransferResult === "success" &&
        capture.settleResult === "success" &&
        capture.executeResult === "success" &&
        capture.diagnosticsSnapshotCaptured) {
        return "captured";
    }
    if (capture.depositResult === "success" ||
        capture.privateTransferResult === "success" ||
        capture.settleResult === "success" ||
        capture.executeResult === "success") {
        return "captured-with-failures";
    }
    return "attempted-no-success";
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
