import fs from "fs";
import path from "path";

type Intake = {
  project: string;
  status: string;
  closureRequirements: Array<{
    id: string;
    label: string;
    status: string;
    evidence: string;
  }>;
  supportingArtifacts: string[];
};

function main() {
  const intake = readJson<Intake>("docs/settlement-receipt-closure-intake.json");
  const closedCount = intake.closureRequirements.filter((item) => item.status === "closed").length;
  const payload = {
    project: intake.project,
    generatedAt: new Date().toISOString(),
    status: intake.status,
    summary: {
      requirementCount: intake.closureRequirements.length,
      closedRequirementCount: closedCount,
      supportingArtifactCount: intake.supportingArtifacts.length,
    },
    closureRequirements: intake.closureRequirements,
    supportingArtifacts: intake.supportingArtifacts,
    commands: [
      "npm run build:settlement-receipt-closure",
      "npm run verify:settlement-receipt-closure",
    ],
  };

  fs.writeFileSync(path.resolve("docs/settlement-receipt-closure.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/settlement-receipt-closure.generated.md"), buildMarkdown(payload));
  console.log("Wrote settlement receipt closure evidence package");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  status: string;
  summary: {
    requirementCount: number;
    closedRequirementCount: number;
    supportingArtifactCount: number;
  };
  closureRequirements: Intake["closureRequirements"];
  supportingArtifacts: string[];
  commands: string[];
}) {
  return `# Settlement Receipt Closure Evidence

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- status: \`${payload.status}\`
- closure requirements: \`${payload.summary.closedRequirementCount}/${payload.summary.requirementCount}\`
- supporting artifacts: \`${payload.summary.supportingArtifactCount}\`

## Closure Requirements

${payload.closureRequirements.map((item) => `- ${item.label} | ${item.status} | evidence: ${item.evidence}`).join("\n")}

## Supporting Artifacts

${payload.supportingArtifacts.map((item) => `- \`${item}\``).join("\n")}

## Commands

${payload.commands.map((item) => `- \`${item}\``).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
