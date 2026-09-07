"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const intake = readJson("docs/monitoring-delivery-intake.json");
    const rules = readJson("docs/monitoring-alert-rules.json");
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
        providerAssignments: intake.providerAssignments,
        transcriptRequirements: intake.transcriptRequirements,
        claimBoundary: rules.claimBoundary,
        commands: [
            "npm run record:monitoring-delivery -- /path/to/intake.json",
            "npm run build:monitoring-delivery",
            "npm run verify:monitoring-delivery",
        ],
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/monitoring-delivery.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/monitoring-delivery.generated.md"), buildMarkdown(payload));
    console.log("Wrote monitoring delivery evidence package");
}
function buildMarkdown(payload) {
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

## Provider Assignments

${payload.providerAssignments
        ? `- candidate primary RPC: \`${payload.providerAssignments.candidatePrimaryRpc || "not documented"}\`
- active primary RPC: \`${payload.providerAssignments.activePrimaryRpc || "not documented"}\`
- fallback RPC: \`${payload.providerAssignments.fallbackRpc}\`
- read path: \`${payload.providerAssignments.readPath}\`
- status: \`${payload.providerAssignments.status}\``
        : "- not yet configured"}

## Transcript Requirements

${payload.transcriptRequirements.map((item) => `- ${item}`).join("\n")}

## Claim Boundary

${payload.claimBoundary}

## Commands

${payload.commands.map((item) => `- \`${item}\``).join("\n")}
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
