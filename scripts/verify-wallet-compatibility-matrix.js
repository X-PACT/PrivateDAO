"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const matrixPath = path_1.default.resolve("docs/wallet-compatibility-matrix.generated.json");
    const markdownPath = path_1.default.resolve("docs/wallet-compatibility-matrix.generated.md");
    if (!fs_1.default.existsSync(matrixPath) || !fs_1.default.existsSync(markdownPath)) {
        throw new Error("wallet compatibility matrix artifacts are missing");
    }
    const matrix = JSON.parse(fs_1.default.readFileSync(matrixPath, "utf8"));
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    const runtime = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("docs/runtime-attestation.generated.json"), "utf8"));
    if (matrix.programId !== runtime.programId) {
        throw new Error("wallet compatibility matrix program mismatch");
    }
    if (matrix.diagnosticsPage !== runtime.diagnosticsPage) {
        throw new Error("wallet compatibility matrix diagnostics page mismatch");
    }
    if (matrix.entries.length !== runtime.supportedWallets.length) {
        throw new Error("wallet compatibility matrix entry count mismatch");
    }
    for (const wallet of runtime.supportedWallets) {
        const entry = matrix.entries.find((candidate) => candidate.id === wallet.id);
        if (!entry || entry.label !== wallet.label) {
            throw new Error(`wallet compatibility matrix is missing ${wallet.id}`);
        }
        if (!entry.diagnosticsVisible || !entry.selectorVisible) {
            throw new Error(`wallet compatibility matrix is unexpectedly weak for ${wallet.id}`);
        }
    }
    if (!markdown.includes("# Wallet Compatibility Matrix") || !markdown.includes("runtime QA")) {
        throw new Error("wallet compatibility matrix markdown is incomplete");
    }
    console.log("Wallet compatibility matrix verification: PASS");
}
main();
