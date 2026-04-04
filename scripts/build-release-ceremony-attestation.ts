import fs from "fs";
import path from "path";
import { execSync } from "child_process";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  gates: string[];
  status: Record<string, string>;
};

type ProofRegistry = {
  deployTx: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
};

type DeploymentAttestation = {
  programId: string;
  verificationWallet: string;
  deployTx: string;
  gateCount: number;
  runtimeDocs: string[];
};

type GoLiveAttestation = {
  decision: string;
  blockers: Array<{ name: string; status: string }>;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const deployment = readJson<DeploymentAttestation>("docs/deployment-attestation.generated.json");
  const goLive = readJson<GoLiveAttestation>("docs/go-live-attestation.generated.json");

  const commit = safeGit("git rev-parse HEAD");
  const branch = safeGit("git rev-parse --abbrev-ref HEAD");

  const mandatoryGates = [
    "npm run verify:live-proof",
    "npm run verify:release-manifest",
    "npm run verify:review-links",
    "npm run verify:review-surface",
    "npm run check:mainnet",
  ];

  const attestation = {
    project: submission.project,
    generatedAt: deterministicGeneratedAt(),
    releaseCommit: commit,
    releaseBranch: branch,
    programId: submission.programId,
    verificationWallet: submission.verificationWallet,
    deployTx: proof.deployTx,
    anchors: {
      dao: proof.dao,
      governanceMint: proof.governanceMint,
      treasury: proof.treasury,
      proposal: proof.proposal,
    },
    ceremonyDocs: [
      "docs/release-ceremony.md",
      "docs/mainnet-cutover-runbook.md",
      "docs/operator-checklist.md",
      "docs/mainnet-readiness.generated.md",
      "docs/deployment-attestation.generated.json",
      "docs/go-live-attestation.generated.json",
    ],
    mandatoryGates,
    observedGateCount: submission.gates.length,
    deploymentGateCount: deployment.gateCount,
    goLiveDecision: goLive.decision,
    unresolvedBlockers: goLive.blockers.filter((entry) => entry.status !== "cleared"),
    notes: [
      "This attestation records release discipline, not a claim that mainnet cutover has already happened.",
      "External audit and organizational custody approvals remain out-of-repo blockers.",
      "The ceremony surface is reviewer-visible so release rigor can be inspected rather than asserted.",
    ],
  };

  const jsonPath = path.resolve("docs/release-ceremony-attestation.generated.json");
  const mdPath = path.resolve("docs/release-ceremony-attestation.generated.md");

  fs.writeFileSync(jsonPath, JSON.stringify(attestation, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(attestation));
  console.log("Wrote release ceremony attestation");
}

function buildMarkdown(attestation: {
  generatedAt: string;
  releaseCommit: string;
  releaseBranch: string;
  programId: string;
  verificationWallet: string;
  deployTx: string;
  anchors: Record<string, string>;
  ceremonyDocs: string[];
  mandatoryGates: string[];
  observedGateCount: number;
  deploymentGateCount: number;
  goLiveDecision: string;
  unresolvedBlockers: Array<{ name: string; status: string }>;
  notes: string[];
}) {
  return `# Release Ceremony Attestation

## Overview

- Generated at: \`${attestation.generatedAt}\`
- Release commit: \`${attestation.releaseCommit}\`
- Release branch: \`${attestation.releaseBranch}\`
- Program id: \`${attestation.programId}\`
- Verification wallet: \`${attestation.verificationWallet}\`
- Deploy transaction: \`${attestation.deployTx}\`

## Anchors

${Object.entries(attestation.anchors)
  .map(([label, value]) => `- ${label}: \`${value}\``)
  .join("\n")}

## Ceremony Documents

${attestation.ceremonyDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Mandatory Gates

${attestation.mandatoryGates.map((gate) => `- \`${gate}\``).join("\n")}

## Ceremony Status

- Observed gate count: \`${attestation.observedGateCount}\`
- Deployment gate count: \`${attestation.deploymentGateCount}\`
- Go-live decision: \`${attestation.goLiveDecision}\`

## Unresolved Blockers

${attestation.unresolvedBlockers.map((entry) => `- ${entry.name}: \`${entry.status}\``).join("\n")}

## Notes

${attestation.notes.map((note) => `- ${note}`).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function safeGit(command: string) {
  return execSync(command, { cwd: process.cwd(), stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
}

function deterministicGeneratedAt() {
  const explicit = process.env.PRIVATE_DAO_BUILD_TIMESTAMP;
  if (explicit) {
    return explicit;
  }
  return safeGit("git log -1 --format=%cI");
}

main();
