"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/governance-runtime-proof.generated.json");
    const mdPath = path_1.default.resolve("docs/governance-runtime-proof.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing governance runtime proof artifacts");
    }
    const packet = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(packet.project === "PrivateDAO", "project mismatch");
    assert(packet.network === "devnet", "network mismatch");
    assert(packet.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "program id mismatch");
    assert(packet.liveWalletLaneCount === 6, "live wallet lane count mismatch");
    assert(packet.repoScriptProofCount === 6, "repo-script proof count mismatch");
    assert(packet.browserWalletProofCount === 6, "browser-wallet proof count should match the captured Solflare cycle");
    assert(packet.realDeviceProofCount === 3, "real-device proof count should match the captured Android stages");
    assert(packet.actions.length === 6, "action count mismatch");
    assert(packet.pendingBrowserWalletProofActions.length === 0, "pending browser proof list mismatch");
    assert(packet.pendingRealDeviceProofActions.length === 3, "pending real-device proof list mismatch");
    assert(packet.unsupportedExecutionBoundary.includes("CustomCPI"), "unsupported execution boundary must mention CustomCPI");
    for (const action of ["Create DAO", "Create Proposal", "Commit Vote", "Reveal Vote", "Finalize Proposal", "Execute Proposal"]) {
        assert(markdown.includes(`### ${action}`), `markdown missing action section: ${action}`);
    }
    for (const action of ["Reveal Vote", "Finalize Proposal", "Execute Proposal"]) {
        assert(packet.pendingRealDeviceProofActions.includes(action), `missing real-device pending action: ${action}`);
    }
    for (const doc of [
        "docs/test-wallet-live-proof.generated.md",
        "docs/test-wallet-live-proof-v3.generated.md",
        "docs/runtime-evidence.generated.md",
        "docs/runtime/real-device.generated.md",
    ]) {
        assert(packet.linkedDocs.includes(doc), `missing linked doc: ${doc}`);
    }
    for (const command of [
        "npm run live-proof",
        "npm run live-proof:v3",
        "npm run build:governance-runtime-proof",
        "npm run verify:governance-runtime-proof",
    ]) {
        assert(packet.commands.includes(command), `missing command: ${command}`);
    }
    assert(markdown.includes("# Governance Runtime Proof Status"), "markdown missing title");
    assert(markdown.includes("Pending browser-wallet captures"), "markdown missing pending browser section");
    assert(markdown.includes("Pending real-device captures"), "markdown missing pending device section");
    assert(markdown.includes("Pending browser-wallet captures: none"), "markdown should show no pending browser captures");
    assert(markdown.includes("Real-device proofs captured: `3`"), "markdown should show Android progress");
    console.log("Governance runtime proof verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
