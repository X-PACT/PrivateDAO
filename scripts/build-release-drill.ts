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
