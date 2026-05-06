"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const intake = readJson("docs/settlement-receipt-closure-intake.json");
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
    fs_1.default.writeFileSync(path_1.default.resolve("docs/settlement-receipt-closure.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/settlement-receipt-closure.generated.md"), buildMarkdown(payload));
    console.log("Wrote settlement receipt closure evidence package");
}
function buildMarkdown(payload) {
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
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
