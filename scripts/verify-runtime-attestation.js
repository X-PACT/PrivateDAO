"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const attestationPath = path_1.default.resolve("docs/runtime-attestation.generated.json");
    if (!fs_1.default.existsSync(attestationPath)) {
        throw new Error("missing runtime attestation");
    }
    const attestation = readJson("docs/runtime-attestation.generated.json");
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    assert(attestation.project === submission.project, "runtime attestation project mismatch");
    assert(attestation.programId === submission.programId, "runtime attestation program mismatch");
    assert(attestation.verificationWallet === submission.verificationWallet, "runtime attestation verification wallet mismatch");
    assert(attestation.diagnosticsPage === `${submission.frontend}diagnostics/`, "runtime attestation diagnostics URL mismatch");
    for (const doc of [
        "docs/wallet-runtime.md",
        "docs/runtime/browser-wallet.md",
        "docs/runtime/browser-wallet-captures.json",
        "docs/runtime/browser-wallet.generated.md",
        "docs/runtime/browser-wallet.generated.json",
        "docs/runtime/real-device.md",
        "docs/runtime/real-device-captures.json",
        "docs/runtime/real-device.generated.md",
        "docs/runtime/real-device.generated.json",
        "docs/frontier-integrations.generated.md",
        "docs/frontier-integrations.generated.json",
        "docs/zk/enforced-runtime-evidence.md",
        "docs/zk/enforced-runtime-captures.json",
        "docs/zk/enforced-runtime.generated.md",
        "docs/zk/enforced-runtime.generated.json",
        "docs/zk/enforced-operator-flow.md",
        "docs/zk/external-closure.json",
        "docs/zk/external-closure.generated.md",
        "docs/zk/external-closure.generated.json",
        "docs/fair-voting.md",
        "docs/go-live-criteria.md",
        "docs/operational-drillbook.md",
    ]) {
        assert(attestation.runtimeDocs.includes(doc), `runtime attestation is missing runtime doc: ${doc}`);
    }
    for (const wallet of ["auto-detect", "phantom", "solflare", "backpack", "glow"]) {
        assert(attestation.supportedWallets.some((entry) => entry.id === wallet), `runtime attestation is missing wallet: ${wallet}`);
    }
    assert(attestation.runtimeNotes.length >= 3, "runtime attestation notes are unexpectedly weak");
    if (proof.pdaoToken) {
        assert(Boolean(attestation.pdaoToken), "runtime attestation is missing PDAO token section");
        assert(attestation.pdaoToken?.mint === proof.pdaoToken.mint, "runtime attestation PDAO mint mismatch");
        assert(attestation.pdaoToken?.programId === proof.pdaoToken.programId, "runtime attestation PDAO program mismatch");
    }
    console.log("Runtime attestation verification: PASS");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
