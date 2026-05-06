"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    const attestation = {
        project: submission.project,
        programId: submission.programId,
        verificationWallet: submission.verificationWallet,
        diagnosticsPage: `${submission.frontend}diagnostics/`,
        runtimeDocs: [
            "docs/read-node/indexer.md",
            "docs/rpc-architecture.md",
            "docs/backend-operator-flow.md",
            "docs/read-node/snapshot.generated.md",
            "docs/read-node/snapshot.generated.json",
            "docs/read-node/ops.generated.md",
            "docs/read-node/ops.generated.json",
            "docs/frontier-integrations.generated.md",
            "docs/frontier-integrations.generated.json",
            "docs/competitive/analysis.generated.md",
            "docs/competitive/analysis.generated.json",
            "docs/read-node/same-domain-deploy.md",
            "docs/wallet-runtime.md",
            "docs/runtime/browser-wallet.md",
            "docs/runtime/browser-wallet-captures.json",
            "docs/runtime/browser-wallet.generated.md",
            "docs/runtime/browser-wallet.generated.json",
            "docs/runtime/real-device.md",
            "docs/runtime/real-device-captures.json",
            "docs/runtime/real-device.generated.md",
            "docs/runtime/real-device.generated.json",
            "docs/magicblock/runtime-evidence.md",
            "docs/magicblock/runtime-captures.json",
            "docs/magicblock/runtime.generated.md",
            "docs/magicblock/runtime.generated.json",
            "docs/magicblock/private-payments.md",
            "docs/magicblock/operator-flow.md",
            "docs/zk/enforced-runtime-evidence.md",
            "docs/zk/enforced-runtime-captures.json",
            "docs/zk/enforced-runtime.generated.md",
            "docs/zk/enforced-runtime.generated.json",
            "docs/zk/enforced-operator-flow.md",
            "docs/zk/external-closure.json",
            "docs/zk/external-closure.generated.md",
            "docs/zk/external-closure.generated.json",
            "docs/wallet-compatibility-matrix.generated.md",
            "docs/wallet-compatibility-matrix.generated.json",
            "docs/fair-voting.md",
            "docs/devnet-canary.generated.md",
            "docs/devnet-canary.generated.json",
            "docs/go-live-criteria.md",
            "docs/operational-drillbook.md",
        ],
        supportedWallets: [
            { id: "auto-detect", label: "Auto Detect" },
            { id: "phantom", label: "Phantom" },
            { id: "solflare", label: "Solflare" },
            { id: "backpack", label: "Backpack" },
            { id: "glow", label: "Glow" },
        ],
        runtimeNotes: [
            "Browser-side wallet diagnostics are exposed through the live frontend.",
            "Provider detection and capability reporting are reviewer-visible.",
            "A generated wallet compatibility matrix makes per-wallet support surfaces explicit.",
            "A read-only Devnet canary provides a lightweight operational signal between heavy stress runs.",
            "A read-only backend read node can serve proposal, DAO, and wallet-readiness data without pushing every read through browser RPC calls.",
            "A generated read-node snapshot captures runtime, cache, proposal, zk-mode, and confidential-payout coverage for reviewer-visible backend health.",
            "A generated Frontier integration package binds ZK anchors, MagicBlock settlement, REFHE settlement, and backend-indexed RPC state into one Devnet-verified review path.",
            "A generated Colosseum competitive analysis anchors the product wedge against comparable privacy, DAO, and treasury projects instead of relying on vague market claims.",
            "Browser-wallet runtime capture intake is tracked separately so live web governance claims stay tied to captured injected-wallet runs.",
            "Real-device runtime capture intake is tracked separately so mobile and desktop wallet runs can be added without rewriting reviewer docs.",
            "A separate MagicBlock runtime capture path tracks confidential token payout corridor execution across wallets without overstating full coverage.",
            "A separate zk_enforced runtime capture path tracks stronger-path wallet evidence without overstating production readiness.",
            "A separate zk external closure package tracks the remaining external execution path: captures, audit, and verifier-boundary freeze.",
            "Real client-side wallet QA remains required before any mainnet cutover claim.",
        ],
        pdaoToken: proof.pdaoToken
            ? {
                mint: proof.pdaoToken.mint,
                programId: proof.pdaoToken.programId,
                tokenAccount: proof.pdaoToken.tokenAccount,
            }
            : undefined,
    };
    const outPath = path_1.default.resolve("docs/runtime-attestation.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
    console.log(`Wrote runtime attestation: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
