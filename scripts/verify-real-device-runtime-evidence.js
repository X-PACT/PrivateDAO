"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/runtime/real-device.generated.json");
    const mdPath = path_1.default.resolve("docs/runtime/real-device.generated.md");
    const sourcePath = path_1.default.resolve("docs/runtime/real-device-captures.json");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath) || !fs_1.default.existsSync(sourcePath)) {
        throw new Error("missing real-device runtime evidence artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(evidence.project === "PrivateDAO", "real-device runtime evidence project mismatch");
    assert(evidence.network === "devnet", "real-device runtime evidence network mismatch");
    assert(evidence.summary.targetCount >= 5, "real-device runtime evidence target count is unexpectedly low");
    assert(evidence.targets.some((target) => target.walletLabel === "Phantom"), "real-device runtime evidence missing Phantom target");
    assert(evidence.targets.some((target) => target.walletLabel === "Solflare"), "real-device runtime evidence missing Solflare target");
    assert(evidence.targets.some((target) => target.walletLabel === "Backpack"), "real-device runtime evidence missing Backpack target");
    assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "real-device runtime evidence missing Glow target");
    assert(evidence.targets.some((target) => target.environmentType === "android-or-mobile"), "real-device runtime evidence missing mobile target");
    assert(evidence.requiredDocs.includes("docs/runtime/real-device.md"), "real-device runtime evidence missing guide doc");
    assert(evidence.requiredDocs.includes("docs/runtime/real-device-captures.json"), "real-device runtime evidence missing source registry doc");
    assert(evidence.commands.includes("npm run build:real-device-runtime"), "real-device runtime evidence missing build command");
    assert(evidence.commands.includes("npm run verify:real-device-runtime"), "real-device runtime evidence missing verify command");
    for (const capture of evidence.captures) {
        assert(capture.network === "devnet", "real-device runtime capture must remain devnet-scoped");
        if (capture.submissionResult === "success") {
            assert(Boolean(capture.txSignature), "real-device runtime capture success is missing tx signature");
            assert(Boolean(capture.explorerUrl?.includes("devnet")), "real-device runtime capture success is missing devnet explorer url");
        }
    }
    assert(markdown.includes("# Real-Device Runtime Evidence"), "real-device runtime markdown missing title");
    assert(markdown.includes("Target Matrix"), "real-device runtime markdown missing target matrix");
    assert(markdown.includes("Honest Boundary"), "real-device runtime markdown missing honest boundary");
    console.log("Real-device runtime evidence verification: PASS");
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
main();
