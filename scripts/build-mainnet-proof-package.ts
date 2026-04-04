import fs from "fs";
import path from "path";

type AcceptanceMatrix = {
  acceptanceDecision: string;
  summary: {
    acceptedInRepo: number;
    pendingExternal: number;
    notInRepo: number;
  };
};

type Readiness = {
  project: string;
  programId: string;
  verificationWallet: string;
};

function main() {
  const readiness = readMarkdown("docs/mainnet-readiness.generated.md");
  const matrix = readJson<AcceptanceMatrix>("docs/mainnet-acceptance-matrix.generated.json");

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    packageDecision: matrix.acceptanceDecision,
    coreArtifacts: [
      "docs/mainnet-readiness.generated.md",
      "docs/mainnet-acceptance-matrix.generated.md",
      "docs/release-ceremony-attestation.generated.md",
      "docs/release-drill.generated.md",
      "docs/runtime-evidence.generated.md",
      "docs/deployment-attestation.generated.json",
      "docs/go-live-attestation.generated.json",
      "docs/external-readiness-intake.md",
    ],
    summary: matrix.summary,
    readinessAnchor: readiness.anchor,
    commands: [
      "npm run build:mainnet-readiness-report",
      "npm run build:mainnet-acceptance-matrix",
      "npm run build:mainnet-proof-package",
      "npm run verify:mainnet-readiness-report",
      "npm run verify:mainnet-acceptance-matrix",
      "npm run verify:mainnet-proof-package",
      "npm run verify:all",
      "bash scripts/check-mainnet-readiness.sh",
    ],
  };

  const jsonPath = path.resolve("docs/mainnet-proof-package.generated.json");
  const mdPath = path.resolve("docs/mainnet-proof-package.generated.md");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(payload));
  console.log(`Wrote mainnet proof package: ${path.relative(process.cwd(), mdPath)}`);
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  packageDecision: string;
  coreArtifacts: string[];
  summary: { acceptedInRepo: number; pendingExternal: number; notInRepo: number };
  readinessAnchor: { project: string; programId: string; verificationWallet: string };
  commands: string[];
}) {
  return `# Mainnet Proof Package

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- package decision: \`${payload.packageDecision}\`
- program id: \`${payload.readinessAnchor.programId}\`
- verification wallet: \`${payload.readinessAnchor.verificationWallet}\`
- accepted in repo: \`${payload.summary.acceptedInRepo}\`
- pending external: \`${payload.summary.pendingExternal}\`
- not in repo: \`${payload.summary.notInRepo}\`

## Core Artifacts

${payload.coreArtifacts.map((entry) => `- \`${entry}\``).join("\n")}

## Canonical Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Purpose

This package is the shortest reviewer-facing path for mainnet readiness discussions. It binds the readiness report, acceptance matrix, runtime package, release discipline, and honest external-intake boundary into one compact surface.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function readMarkdown(relativePath: string) {
  const body = fs.readFileSync(path.resolve(relativePath), "utf8");
  const project = /Project: `([^`]+)`/.exec(body)?.[1] ?? "PrivateDAO";
  const programId = /Program ID: `([^`]+)`/.exec(body)?.[1] ?? "";
  const verificationWallet = /Verification wallet: `([^`]+)`/.exec(body)?.[1] ?? "";
  return { body, anchor: { project, programId, verificationWallet } };
}

main();
