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
        throw new Error("usage: npm run record:zk-enforced-runtime -- <capture-json-path>");
    }
    const registryPath = path_1.default.resolve("docs/zk/enforced-runtime-captures.json");
    const registry = readJson(registryPath);
    const incoming = readJson(inputPath);
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
    const normalized = {
        ...incoming,
        explorerUrls: {
            enableMode: incoming.enableModeTxSignature && incoming.modeActivationResult === "success"
                ? `https://explorer.solana.com/tx/${incoming.enableModeTxSignature}?cluster=devnet`
                : null,
            finalize: incoming.finalizeTxSignature && incoming.finalizeResult === "success"
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
    }
    else {
        registry.captures.push(normalized);
    }
    target.status = deriveTargetStatus(normalized);
    registry.generatedAt = new Date().toISOString();
    registry.captures.sort((a, b) => a.id.localeCompare(b.id));
    fs_1.default.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
    console.log(`Recorded zk-enforced runtime capture for ${normalized.walletLabel} (${normalized.id})`);
}
function allStrong(receiptModes) {
    return receiptModes.vote === "zk_enforced"
        && receiptModes.delegation === "zk_enforced"
        && receiptModes.tally === "zk_enforced";
}
function deriveTargetStatus(capture) {
    if (capture.modeActivationResult === "success" && capture.finalizeResult === "success") {
        return "captured";
    }
    if (capture.modeActivationResult === "success" || capture.finalizeResult === "success") {
        return "captured-with-failures";
    }
    return "attempted-no-success";
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
