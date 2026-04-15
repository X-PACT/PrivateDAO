import fs from "fs";
import path from "path";

type MonitoringDeliveryIntake = {
  project: string;
  environment: string;
  status: string;
  owners: Array<{
    role: string;
    scope: string;
    status: string;
  }>;
  deliveryRequirements: Array<{
    id: string;
    label: string;
    status: string;
    evidence: string;
  }>;
  transcriptRequirements: string[];
};

type MonitoringAlertRulesJson = {
  claimBoundary: string;
  rules: Array<{
    id: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
};

function main() {
  const intake = readJson<MonitoringDeliveryIntake>("docs/monitoring-delivery-intake.json");
  const rules = readJson<MonitoringAlertRulesJson>("docs/monitoring-alert-rules.json");

  const ownerAssignedCount = intake.owners.filter((item) => item.status !== "pending-assignment").length;
  const closedRequirementCount = intake.deliveryRequirements.filter((item) => item.status === "closed").length;
  const payload = {
    project: intake.project,
    generatedAt: new Date().toISOString(),
    environment: intake.environment,
    status: intake.status,
    summary: {
      ownerCount: intake.owners.length,
      ownerAssignedCount,
      deliveryRequirementCount: intake.deliveryRequirements.length,
      closedRequirementCount,
      transcriptRequirementCount: intake.transcriptRequirements.length,
      criticalRuleCount: rules.rules.filter((rule) => rule.severity === "critical").length,
      highRuleCount: rules.rules.filter((rule) => rule.severity === "high").length,
    },
    owners: intake.owners,
    deliveryRequirements: intake.deliveryRequirements,
    transcriptRequirements: intake.transcriptRequirements,
    claimBoundary: rules.claimBoundary,
    commands: [
      "npm run record:monitoring-delivery -- /path/to/intake.json",
      "npm run build:monitoring-delivery",
      "npm run verify:monitoring-delivery",
    ],
  };

  fs.writeFileSync(path.resolve("docs/monitoring-delivery.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/monitoring-delivery.generated.md"), buildMarkdown(payload));
  console.log("Wrote monitoring delivery evidence package");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  environment: string;
  status: string;
  summary: {
    ownerCount: number;
    ownerAssignedCount: number;
    deliveryRequirementCount: number;
    closedRequirementCount: number;
    transcriptRequirementCount: number;
    criticalRuleCount: number;
    highRuleCount: number;
  };
  owners: MonitoringDeliveryIntake["owners"];
  deliveryRequirements: MonitoringDeliveryIntake["deliveryRequirements"];
  transcriptRequirements: string[];
  claimBoundary: string;
  commands: string[];
}) {
  return `# Monitoring Delivery Evidence

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- environment: \`${payload.environment}\`
- status: \`${payload.status}\`
- owner assignments: \`${payload.summary.ownerAssignedCount}/${payload.summary.ownerCount}\`
- closed delivery requirements: \`${payload.summary.closedRequirementCount}/${payload.summary.deliveryRequirementCount}\`
- transcript requirements: \`${payload.summary.transcriptRequirementCount}\`
- rule severity mix: \`${payload.summary.criticalRuleCount}\` critical / \`${payload.summary.highRuleCount}\` high

## Owners

${payload.owners.map((item) => `- ${item.role} | ${item.status} | ${item.scope}`).join("\n")}

## Delivery Requirements

${payload.deliveryRequirements.map((item) => `- ${item.label} | ${item.status} | evidence: ${item.evidence}`).join("\n")}

## Transcript Requirements

${payload.transcriptRequirements.map((item) => `- ${item}`).join("\n")}

## Claim Boundary

${payload.claimBoundary}

## Commands

${payload.commands.map((item) => `- \`${item}\``).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
