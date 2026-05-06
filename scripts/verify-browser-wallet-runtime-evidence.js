"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/runtime/browser-wallet.generated.json");
    const mdPath = path_1.default.resolve("docs/runtime/browser-wallet.generated.md");
    const sourcePath = path_1.default.resolve("docs/runtime/browser-wallet-captures.json");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath) || !fs_1.default.existsSync(sourcePath)) {
        throw new Error("missing browser-wallet runtime evidence artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(evidence.project === "PrivateDAO", "browser-wallet runtime evidence project mismatch");
    assert(evidence.network === "devnet", "browser-wallet runtime evidence network mismatch");
    assert(evidence.summary.targetCount >= 4, "browser-wallet runtime evidence target count is unexpectedly low");
    assert(evidence.targets.some((target) => target.walletLabel === "Phantom"), "browser-wallet runtime evidence missing Phantom target");
    assert(evidence.targets.some((target) => target.walletLabel === "Solflare"), "browser-wallet runtime evidence missing Solflare target");
    assert(evidence.targets.some((target) => target.walletLabel === "Backpack"), "browser-wallet runtime evidence missing Backpack target");
    assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "browser-wallet runtime evidence missing Glow target");
    assert(evidence.requiredDocs.includes("docs/runtime/browser-wallet.md"), "browser-wallet runtime evidence missing guide doc");
    assert(evidence.requiredDocs.includes("docs/runtime/browser-wallet-captures.json"), "browser-wallet runtime evidence missing source registry doc");
    assert(evidence.commands.includes("npm run build:browser-wallet-runtime"), "browser-wallet runtime evidence missing build command");
    assert(evidence.commands.includes("npm run verify:browser-wallet-runtime"), "browser-wallet runtime evidence missing verify command");
    for (const capture of evidence.captures) {
        assert(capture.network === "devnet", "browser-wallet runtime capture must remain devnet-scoped");
        assert(capture.actionsCovered.length >= 1, "browser-wallet runtime capture must record action coverage");
        if (capture.submissionResult === "success") {
            assert(Boolean(capture.txSignature), "browser-wallet runtime capture success is missing tx signature");
            assert(Boolean(capture.explorerUrl?.includes("devnet")), "browser-wallet runtime capture success is missing devnet explorer url");
        }
    }
    assert(markdown.includes("# Browser-Wallet Runtime Evidence"), "browser-wallet runtime markdown missing title");
    assert(markdown.includes("Target Matrix"), "browser-wallet runtime markdown missing target matrix");
    assert(markdown.includes("Honest Boundary"), "browser-wallet runtime markdown missing honest boundary");
    console.log("Browser-wallet runtime evidence verification: PASS");
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
main();
