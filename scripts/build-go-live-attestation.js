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
    const deployment = readJson("docs/deployment-attestation.generated.json");
    const verifiedInsideRepo = Object.entries(submission.status)
        .filter(([, status]) => status === "verified")
        .map(([name]) => name);
    const blockers = Object.entries(submission.status)
        .filter(([, status]) => status !== "verified")
        .map(([name, status]) => ({ name, status }));
    const attestation = {
        project: submission.project,
        programId: submission.programId,
        verificationWallet: submission.verificationWallet,
        deployTx: proof.deployTx,
        decision: blockers.length === 0 ? "ready-for-mainnet" : "blocked-pending-external-steps",
        verifiedInsideRepo,
        blockers,
        mandatoryGates: [
            "npm run verify:all",
            "npm run verify:mainnet-readiness-report",
            "npm run verify:deployment-attestation",
            "npm run verify:go-live-attestation",
            "npm run verify:test-wallet-live-proof:v3",
        ],
        criteriaDocs: [
            "docs/go-live-criteria.md",
            "docs/operational-drillbook.md",
            "docs/mainnet-readiness.md",
            "docs/mainnet-readiness.generated.md",
            "docs/governance-hardening-v3.md",
            "docs/settlement-hardening-v3.md",
            "docs/test-wallet-live-proof-v3.generated.md",
            "docs/deployment-attestation.generated.json",
            "docs/zk/enforced-runtime-evidence.md",
            "docs/zk/enforced-runtime.generated.md",
            "docs/zk/enforced-operator-flow.md",
            "docs/zk/external-closure.generated.md",
            "docs/zk-external-audit-scope.md",
            "docs/canonical-verifier-boundary-decision.md",
        ],
        runtimeDocs: deployment.runtimeDocs,
        deploymentGateCount: deployment.gateCount,
        pdaoToken: proof.pdaoToken
            ? {
                mint: proof.pdaoToken.mint,
                programId: proof.pdaoToken.programId,
                tokenAccount: proof.pdaoToken.tokenAccount,
                supplyUi: proof.pdaoToken.supplyUi,
            }
            : undefined,
    };
    const outPath = path_1.default.resolve("docs/go-live-attestation.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
    console.log(`Wrote go-live attestation: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
