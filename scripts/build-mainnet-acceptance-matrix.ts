import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  status: Record<string, string>;
};

type RuntimeEvidence = {
  walletCount: number;
  devnetCanary: {
    primaryHealthy: boolean;
    fallbackHealthy: boolean;
    anchorAccountsPresent: boolean;
    unexpectedFailures: number;
  };
  resilience: {
    fallbackRecovered: boolean;
    staleBlockhashRecovered: boolean;
    staleBlockhashRejected: boolean;
    unexpectedFailures: number;
  };
};

type GoLiveAttestation = {
  decision: string;
  blockers: Array<{ name: string; status: string }>;
};

type MatrixRow = {
  layer: string;
  status: "accepted-in-repo" | "pending-external" | "not-in-repo";
  evidence: string[];
  rationale: string;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const runtimeEvidence = readJson<RuntimeEvidence>("docs/runtime-evidence.generated.json");
  const goLive = readJson<GoLiveAttestation>("docs/go-live-attestation.generated.json");

  const rows: MatrixRow[] = [
    {
      layer: "governance-lifecycle",
      status: "accepted-in-repo",
      evidence: ["docs/live-proof.md", "docs/load-test-report.md", "tests/full-flow-test.ts"],
      rationale: "The lifecycle is live on Devnet and is covered by deterministic tests and published proof surfaces.",
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
      status:
        runtimeEvidence.devnetCanary.primaryHealthy &&
        runtimeEvidence.devnetCanary.fallbackHealthy &&
        runtimeEvidence.resilience.fallbackRecovered &&
        runtimeEvidence.resilience.staleBlockhashRecovered &&
        runtimeEvidence.resilience.staleBlockhashRejected &&
        runtimeEvidence.resilience.unexpectedFailures === 0
          ? "accepted-in-repo"
          : "pending-external",
      evidence: ["docs/operational-evidence.generated.md", "docs/runtime-evidence.generated.md", "docs/devnet-canary.generated.md", "docs/devnet-resilience-report.md"],
      rationale: "The repository proves runtime diagnostics, full lifecycle execution, RPC fallback, stale-blockhash recovery, and collision handling on Devnet.",
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
      evidence: ["docs/real-device-runtime.md", "docs/real-device-runtime.generated.md", "docs/wallet-compatibility-matrix.generated.md", "docs/external-readiness-intake.md"],
      rationale: "Support surfaces are documented and the real-device capture intake is enforced, but live device/browser evidence still has to be collected externally.",
    },
    {
      layer: "magicblock-runtime-corridor",
      status: "pending-external",
      evidence: ["docs/magicblock-private-payments.md", "docs/magicblock-runtime-evidence.md", "docs/magicblock-runtime.generated.md"],
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

  const jsonPath = path.resolve("docs/mainnet-acceptance-matrix.generated.json");
  const mdPath = path.resolve("docs/mainnet-acceptance-matrix.generated.md");
  fs.writeFileSync(jsonPath, JSON.stringify(matrix, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(matrix));
  console.log(`Wrote mainnet acceptance matrix: ${path.relative(process.cwd(), mdPath)}`);
}

function buildMarkdown(matrix: {
  project: string;
  programId: string;
  verificationWallet: string;
  generatedAt: string;
  acceptanceDecision: string;
  summary: {
    acceptedInRepo: number;
    pendingExternal: number;
    notInRepo: number;
    runtimeWalletCount: number;
  };
  rows: MatrixRow[];
}) {
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
  .map(
    (row) => `### ${row.layer}

- status: \`${row.status}\`
- rationale: ${row.rationale}
- evidence:
${row.evidence.map((entry) => `  - \`${entry}\``).join("\n")}`,
  )
  .join("\n\n")}

## Interpretation

This matrix separates what PrivateDAO can already prove inside the repository from what still requires external completion. It is meant to make mainnet-readiness discussions precise rather than implied.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
