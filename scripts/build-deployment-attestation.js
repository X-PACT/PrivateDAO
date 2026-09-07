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
    const zk = readJson("docs/zk-registry.generated.json");
    const attestation = {
        project: submission.project,
        programId: submission.programId,
        verificationWallet: submission.verificationWallet,
        deployTx: proof.deployTx,
        governanceAnchors: {
            dao: proof.dao,
            governanceMint: proof.governanceMint,
            treasury: proof.treasury,
            proposal: proof.proposal,
        },
        pdaoToken: proof.pdaoToken
            ? {
                mint: proof.pdaoToken.mint,
                programId: proof.pdaoToken.programId,
                tokenAccount: proof.pdaoToken.tokenAccount,
                supplyUi: proof.pdaoToken.supplyUi,
                metadataUri: proof.pdaoToken.metadataUri,
            }
            : undefined,
        readiness: submission.status,
        verificationGates: submission.gates,
        gateCount: submission.gates.length,
        packageCounts: {
            strategy: submission.packages.strategy.length,
            security: submission.packages.security.length,
            zk: submission.packages.zk.length,
            proof: submission.packages.proof.length,
            operations: submission.packages.operations.length,
        },
        zk: {
            stackVersion: zk.zkStackVersion,
            entryCount: zk.entryCount,
        },
        runtimeDocs: [
            "docs/wallet-runtime.md",
            "docs/fair-voting.md",
            "docs/magicblock/private-payments.md",
            "docs/magicblock/operator-flow.md",
            "docs/magicblock/runtime-evidence.md",
            "docs/magicblock/runtime.generated.md",
            "docs/zk/enforced-runtime-evidence.md",
            "docs/zk/enforced-runtime.generated.md",
            "docs/zk/enforced-operator-flow.md",
            "docs/mainnet-readiness.generated.md",
            "docs/go-live-criteria.md",
            "docs/operational-drillbook.md",
        ],
    };
    const outPath = path_1.default.resolve("docs/deployment-attestation.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
    console.log(`Wrote deployment attestation: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
