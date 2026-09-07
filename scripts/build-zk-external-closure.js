"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const source = readJson("docs/zk/external-closure.json");
    const runtime = readJson("docs/zk/enforced-runtime.generated.json");
    const pendingBlocking = source.stages.filter((stage) => stage.blocking && stage.status !== "complete");
    const payload = {
        project: source.project,
        path: source.path,
        status: source.status,
        generatedAt: new Date().toISOString(),
        pendingBlockingCount: pendingBlocking.length,
        runtimeCaptureSummary: {
            status: runtime.status,
            targetCount: runtime.summary.targetCount,
            completedTargetCount: runtime.summary.completedTargetCount,
            modeActivationSuccessCount: runtime.summary.modeActivationSuccessCount,
            finalizeSuccessCount: runtime.summary.finalizeSuccessCount,
            diagnosticsCaptureCount: runtime.summary.diagnosticsCaptureCount,
            pendingTargets: runtime.summary.pendingTargets,
        },
        stages: source.stages,
        requiredDocs: [
            "docs/zk/external-closure.json",
            "docs/zk/enforced-runtime-evidence.md",
            "docs/zk/enforced-runtime.generated.md",
            "docs/zk/enforced-operator-flow.md",
            "docs/zk-external-audit-scope.md",
            "docs/canonical-verifier-boundary-decision.md",
            "docs/audit-handoff.md"
        ],
        commands: [
            "npm run build:zk-enforced-runtime",
            "npm run verify:zk-enforced-runtime",
            "npm run capture:zk-enforced-runtime -- <target> --template-only",
            "npm run record:zk-enforced-runtime -- <capture-json-path>",
            "npm run build:zk-external-closure",
            "npm run verify:zk-external-closure"
        ],
        notes: [
            "This package closes the remaining external path into one machine-readable tracker.",
            "It does not invent captures, audit findings, or a frozen verifier decision before they exist."
        ]
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/zk/external-closure.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/zk/external-closure.generated.md"), buildMarkdown(payload));
    console.log("Wrote zk external closure package");
}
function buildMarkdown(payload) {
    const stageLines = payload.stages
        .map((stage) => {
        const noteLines = stage.notes.map((note) => `  - ${note}`).join("\n");
        return `- ${stage.label}: ${stage.status}\n  - owner: ${stage.owner}\n  - blocking: ${stage.blocking ? "yes" : "no"}\n${noteLines}`;
    })
        .join("\n");
    return `# ZK External Closure Package

## Status

- Project: ${payload.project}
- Path: ${payload.path}
- Status: ${payload.status}
- Generated At: ${payload.generatedAt}
- Pending Blocking Count: ${payload.pendingBlockingCount}

## Runtime Capture Summary

- Runtime status: ${payload.runtimeCaptureSummary.status}
- Capture targets: ${payload.runtimeCaptureSummary.completedTargetCount}/${payload.runtimeCaptureSummary.targetCount}
- Mode activation successes: ${payload.runtimeCaptureSummary.modeActivationSuccessCount}
- Finalize successes: ${payload.runtimeCaptureSummary.finalizeSuccessCount}
- Diagnostics captures: ${payload.runtimeCaptureSummary.diagnosticsCaptureCount}
- Pending targets: ${payload.runtimeCaptureSummary.pendingTargets.join(", ") || "none"}

## Stages

${stageLines}

## Required Docs

${payload.requiredDocs.map((entry) => `- \`${entry}\``).join("\n")}

## Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Notes

${payload.notes.map((entry) => `- ${entry}`).join("\n")}
`;
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
