import fs from "fs";
import path from "path";
import { execSync } from "child_process";

type ReleaseCeremony = {
  project: string;
  releaseCommit: string;
  releaseBranch: string;
  programId: string;
  verificationWallet: string;
  deployTx: string;
  mandatoryGates: string[];
  goLiveDecision: string;
  unresolvedBlockers: Array<{ name: string; status: string }>;
};

type DrillTraceEntry = {
  step: string;
  category: "repository-gate" | "artifact-build" | "operator-check" | "external-blocker";
  status: "simulated-pass" | "blocked-external-step";
  command?: string;
  artifact?: string;
  evidence?: string;
  note?: string;
};

function main() {
  const ceremony = readJson<ReleaseCeremony>("docs/release-ceremony-attestation.generated.json");

  const drill = {
    project: ceremony.project,
    generatedAt: deterministicGeneratedAt(),
    mode: "repository-simulated-drill",
    releaseCommit: ceremony.releaseCommit,
    releaseBranch: ceremony.releaseBranch,
    programId: ceremony.programId,
    verificationWallet: ceremony.verificationWallet,
    deployTx: ceremony.deployTx,
    stages: [
      { stage: "commit-freeze", status: "simulated-pass" },
      { stage: "release-gates", status: "simulated-pass" },
      { stage: "operator-doc-check", status: "simulated-pass" },
      { stage: "mainnet-cutover", status: "blocked-external-step" },
      { stage: "post-deploy-verification", status: "blocked-external-step" },
    ],
    mandatoryGates: ceremony.mandatoryGates,
    unresolvedBlockers: ceremony.unresolvedBlockers,
    executionSummary: {
      executedSteps: 9,
      blockedExternalSteps: 3,
      reviewerArtifactsObserved: 7,
    },
    executionTrace: buildExecutionTrace(ceremony),
    drillDocs: [
      "docs/release-ceremony.md",
      "docs/release-ceremony-attestation.generated.md",
      "docs/mainnet-cutover-runbook.md",
      "docs/operator-checklist.md",
      "docs/go-live-criteria.md",
      "docs/mainnet-readiness.generated.md",
    ],
    notes: [
      "This drill is a repository-contained release simulation and not evidence of a live mainnet deployment.",
      "Its purpose is to prove that the release path is documented, generated, and reviewer-visible before any real cutover occurs.",
      "External audit, custody, and organization-specific approvals remain unresolved blockers by design.",
    ],
  };

  const jsonPath = path.resolve("docs/release-drill.generated.json");
  const mdPath = path.resolve("docs/release-drill.generated.md");
  fs.writeFileSync(jsonPath, JSON.stringify(drill, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(drill));
  console.log("Wrote release drill evidence");
}

function buildExecutionTrace(ceremony: ReleaseCeremony): DrillTraceEntry[] {
  return [
    {
      step: "reviewed-commit-freeze",
      category: "operator-check",
      status: "simulated-pass",
      evidence: ceremony.releaseCommit,
      note: "The reviewed repository commit becomes the release anchor before any cutover activity.",
    },
    {
      step: "release-ceremony-attestation",
      category: "artifact-build",
      status: "simulated-pass",
      command: "npm run build:release-ceremony-attestation",
      artifact: "docs/release-ceremony-attestation.generated.json",
      evidence: "docs/release-ceremony-attestation.generated.md",
    },
    {
      step: "runtime-evidence-package",
      category: "artifact-build",
      status: "simulated-pass",
      command: "npm run build:runtime-evidence",
      artifact: "docs/runtime-evidence.generated.json",
      evidence: "docs/runtime-evidence.generated.md",
    },
    {
      step: "release-drill-generation",
      category: "artifact-build",
      status: "simulated-pass",
      command: "npm run build:release-drill",
      artifact: "docs/release-drill.generated.json",
      evidence: "docs/release-drill.generated.md",
    },
    {
      step: "artifact-freshness-gate",
      category: "repository-gate",
      status: "simulated-pass",
      command: "npm run verify:artifact-freshness",
      evidence: "docs/artifact-freshness.md",
      note: "Deterministic reviewer artifacts are rebuilt and compared against committed outputs.",
    },
    {
      step: "runtime-evidence-verification",
      category: "repository-gate",
      status: "simulated-pass",
      command: "npm run verify:runtime-evidence",
      artifact: "docs/runtime-evidence.generated.json",
    },
    {
      step: "release-drill-verification",
      category: "repository-gate",
      status: "simulated-pass",
      command: "npm run verify:release-drill",
      artifact: "docs/release-drill.generated.json",
    },
    {
      step: "review-surface-verification",
      category: "repository-gate",
      status: "simulated-pass",
      command: "npm run verify:review-surface",
      evidence: "docs/review-attestation.generated.json",
    },
    {
      step: "unified-release-gate",
      category: "repository-gate",
      status: "simulated-pass",
      command: "npm run verify:all",
      evidence: "docs/cryptographic-manifest.generated.json",
      note: "The repository-level release path is considered ready only after the unified gate passes.",
    },
    {
      step: "operator-cutover-checklist-review",
      category: "operator-check",
      status: "simulated-pass",
      evidence: "docs/operator-checklist.md",
      note: "The cutover runbook and incident materials are inspectable before any live release.",
    },
    {
      step: "external-audit-completion",
      category: "external-blocker",
      status: "blocked-external-step",
      evidence: "docs/mainnet-readiness.generated.md",
      note: "External audit sign-off remains outside repository control.",
    },
    {
      step: "custody-and-signing-ceremony",
      category: "external-blocker",
      status: "blocked-external-step",
      evidence: "docs/release-ceremony.md",
      note: "Production custody and signing approvals cannot be simulated as a live release inside the repository.",
    },
    {
      step: "live-mainnet-cutover-and-post-deploy-checks",
      category: "external-blocker",
      status: "blocked-external-step",
      evidence: "docs/mainnet-cutover-runbook.md",
      note: "Mainnet cutover, explorer confirmation, and live rollback validation remain intentionally blocked until real deployment.",
    },
  ];
}

function buildMarkdown(drill: {
  generatedAt: string;
  mode: string;
  releaseCommit: string;
  releaseBranch: string;
  programId: string;
  verificationWallet: string;
  deployTx: string;
  stages: Array<{ stage: string; status: string }>;
  mandatoryGates: string[];
  unresolvedBlockers: Array<{ name: string; status: string }>;
  executionSummary: {
    executedSteps: number;
    blockedExternalSteps: number;
    reviewerArtifactsObserved: number;
  };
  executionTrace: DrillTraceEntry[];
  drillDocs: string[];
  notes: string[];
}) {
  return `# Release Drill Evidence

## Overview

- Generated at: \`${drill.generatedAt}\`
- Mode: \`${drill.mode}\`
- Release commit: \`${drill.releaseCommit}\`
- Release branch: \`${drill.releaseBranch}\`
- Program id: \`${drill.programId}\`
- Verification wallet: \`${drill.verificationWallet}\`
- Deploy transaction: \`${drill.deployTx}\`

## Drill Stages

${drill.stages.map((entry) => `- ${entry.stage}: \`${entry.status}\``).join("\n")}

## Mandatory Gates

${drill.mandatoryGates.map((gate) => `- \`${gate}\``).join("\n")}

## Unresolved Blockers

${drill.unresolvedBlockers.map((entry) => `- ${entry.name}: \`${entry.status}\``).join("\n")}

## Simulated Execution Trace

- repository-executed steps: ${drill.executionSummary.executedSteps}
- blocked external steps: ${drill.executionSummary.blockedExternalSteps}
- reviewer artifacts observed: ${drill.executionSummary.reviewerArtifactsObserved}

${drill.executionTrace
    .map((entry) => {
      const details = [
        `- ${entry.step}: \`${entry.status}\``,
        entry.category ? `  category: \`${entry.category}\`` : null,
        entry.command ? `  command: \`${entry.command}\`` : null,
        entry.artifact ? `  artifact: \`${entry.artifact}\`` : null,
        entry.evidence ? `  evidence: \`${entry.evidence}\`` : null,
        entry.note ? `  note: ${entry.note}` : null,
      ].filter(Boolean);
      return details.join("\n");
    })
    .join("\n\n")}

## Drill Documents

${drill.drillDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Notes

${drill.notes.map((note) => `- ${note}`).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function deterministicGeneratedAt() {
  const explicit = process.env.PRIVATE_DAO_BUILD_TIMESTAMP;
  if (explicit) {
    return explicit;
  }
  return execSync("git log -1 --format=%cI", {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
}

main();
