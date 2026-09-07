"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const submission = readJson("docs/submission-registry.json");
    const runtimeEvidence = readJson("docs/runtime-evidence.generated.json");
    const goLive = readJson("docs/go-live-attestation.generated.json");
    const rows = [
        {
            layer: "governance-lifecycle",
            status: "accepted-in-repo",
            evidence: ["docs/live-proof.md", "docs/test-wallet-live-proof-v3.generated.md", "docs/load-test-report.md", "tests/full-flow-test.ts"],
            rationale: "The lifecycle is live on Devnet across both the baseline path and the additive V3 path, and is covered by deterministic tests and published proof surfaces.",
        },
        {
            layer: "security-reasoning",
            status: "accepted-in-repo",
            evidence: ["docs/security-review.md", "docs/threat-model.md", "docs/replay-analysis.md"],
            rationale: "Threats, replay, and failure behavior are documented and tied to tests and gates.",
        },
        {
            layer: "cryptographic-integrity",
            status: "accepted-in-repo",
            evidence: ["docs/cryptographic-manifest.generated.json", "docs/supply-chain-attestation.generated.json"],
            rationale: "Reviewer artifacts and top-level dependency manifests are sha256-bound and drift-checked.",
        },
        {
            layer: "zk-companion-stack",
            status: "accepted-in-repo",
            evidence: ["docs/zk-attestation.generated.json", "docs/zk-transcript.generated.md", "docs/zk-registry.generated.json"],
            rationale: "Groth16 companion proofs are generated, verified, transcript-backed, and explicitly bounded as off-chain.",
        },
        {
            layer: "token-surface",
            status: "accepted-in-repo",
            evidence: ["docs/pdao-token.md", "docs/pdao-attestation.generated.json", "docs/assets/pdao-token.json"],
            rationale: "The PDAO token surface is attested, metadata-backed, and aligned with the canonical Devnet proof package.",
        },
        {
            layer: "runtime-and-resilience",
            status: runtimeEvidence.devnetCanary.primaryHealthy &&
                runtimeEvidence.devnetCanary.fallbackHealthy &&
                runtimeEvidence.resilience.fallbackRecovered &&
                runtimeEvidence.resilience.staleBlockhashRecovered &&
                runtimeEvidence.resilience.staleBlockhashRejected &&
                runtimeEvidence.resilience.unexpectedFailures === 0
                ? "accepted-in-repo"
                : "pending-external",
            evidence: ["docs/operational-evidence.generated.md", "docs/runtime-evidence.generated.md", "docs/devnet-canary.generated.md", "docs/devnet-resilience-report.md", "docs/test-wallet-live-proof-v3.generated.md"],
            rationale: "The repository proves runtime diagnostics, full lifecycle execution, RPC fallback, stale-blockhash recovery, and collision handling on Devnet.",
        },
        {
            layer: "additive-v3-hardening",
            status: submission.status.governanceHardeningV3 === "verified" &&
                submission.status.settlementHardeningV3 === "verified" &&
                submission.status.liveProofV3 === "verified"
                ? "accepted-in-repo"
                : "pending-external",
            evidence: [
                "docs/governance-hardening-v3.md",
                "docs/settlement-hardening-v3.md",
                "docs/test-wallet-live-proof-v3.generated.md",
                "docs/test-wallet-live-proof-v3.generated.json",
            ],
            rationale: "The stricter additive hardening path is documented, machine-checked, and proven on Devnet without reinterpreting legacy objects.",
        },
        {
            layer: "release-discipline",
            status: "accepted-in-repo",
            evidence: ["docs/release-ceremony-attestation.generated.md", "docs/release-drill.generated.md", "docs/review-automation.md"],
            rationale: "Release gating, artifact freshness, and simulated cutover traces are all reviewer-visible and automated.",
        },
        {
            layer: "real-device-wallet-qa",
            status: "pending-external",
            evidence: ["docs/runtime/real-device.md", "docs/runtime/real-device.generated.md", "docs/wallet-compatibility-matrix.generated.md", "docs/external-readiness-intake.md"],
            rationale: "Support surfaces are documented and the real-device capture intake is enforced, but live device/browser evidence still has to be collected externally.",
        },
        {
            layer: "magicblock-runtime-corridor",
            status: "pending-external",
            evidence: ["docs/magicblock/private-payments.md", "docs/magicblock/runtime-evidence.md", "docs/magicblock/runtime.generated.md"],
            rationale: "The MagicBlock corridor is wired into the program and frontend, but real wallet/runtime captures across environments still need to be collected externally.",
        },
        {
            layer: "external-audit",
            status: "pending-external",
            evidence: ["docs/mainnet-readiness.generated.md", "docs/external-readiness-intake.md"],
            rationale: "The repository cannot fabricate an external audit outcome.",
        },
        {
            layer: "mainnet-rollout",
            status: goLive.decision === "blocked-pending-external-prerequisites" ? "pending-external" : "accepted-in-repo",
            evidence: ["docs/go-live-attestation.generated.json", "docs/mainnet-cutover-runbook.md", "docs/operator-checklist.md"],
            rationale: "Mainnet execution remains intentionally blocked until external prerequisites are resolved.",
        },
        {
            layer: "strategy-engine-and-live-performance",
            status: "not-in-repo",
            evidence: ["docs/mainnet-readiness.generated.md"],
            rationale: "The repository does not claim a production strategy engine or live performance layer.",
        },
    ];
    const acceptedCount = rows.filter((row) => row.status === "accepted-in-repo").length;
    const pendingCount = rows.filter((row) => row.status === "pending-external").length;
    const notInRepoCount = rows.filter((row) => row.status === "not-in-repo").length;
    const matrix = {
        project: submission.project,
        programId: submission.programId,
        verificationWallet: submission.verificationWallet,
        generatedAt: new Date().toISOString(),
        acceptanceDecision: pendingCount === 0 && notInRepoCount === 0 ? "repository-ready-without-external-blockers" : "repository-strong-but-external-blockers-remain",
        summary: {
            acceptedInRepo: acceptedCount,
            pendingExternal: pendingCount,
            notInRepo: notInRepoCount,
            runtimeWalletCount: runtimeEvidence.walletCount,
            declaredSubmissionStatuses: submission.status,
        },
        rows,
    };
    const jsonPath = path_1.default.resolve("docs/mainnet-acceptance-matrix.generated.json");
    const mdPath = path_1.default.resolve("docs/mainnet-acceptance-matrix.generated.md");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(matrix, null, 2) + "\n");
    fs_1.default.writeFileSync(mdPath, buildMarkdown(matrix));
    console.log(`Wrote mainnet acceptance matrix: ${path_1.default.relative(process.cwd(), mdPath)}`);
}
function buildMarkdown(matrix) {
    return `# Mainnet Acceptance Matrix

## Overview

- project: \`${matrix.project}\`
- program id: \`${matrix.programId}\`
- verification wallet: \`${matrix.verificationWallet}\`
- generated at: \`${matrix.generatedAt}\`
- acceptance decision: \`${matrix.acceptanceDecision}\`
- accepted in repo: \`${matrix.summary.acceptedInRepo}\`
- pending external: \`${matrix.summary.pendingExternal}\`
- not in repo: \`${matrix.summary.notInRepo}\`
- runtime wallet count in evidence package: \`${matrix.summary.runtimeWalletCount}\`

## Acceptance Rows

${matrix.rows
        .map((row) => `### ${row.layer}

- status: \`${row.status}\`
- rationale: ${row.rationale}
- evidence:
${row.evidence.map((entry) => `  - \`${entry}\``).join("\n")}`)
        .join("\n\n")}

## Interpretation

This matrix separates what PrivateDAO can already prove inside the repository from what still requires external completion. It is meant to make mainnet-readiness discussions precise rather than implied.
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
