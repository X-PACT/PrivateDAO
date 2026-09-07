"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/release-drill.generated.json");
    const mdPath = path_1.default.resolve("docs/release-drill.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing release drill evidence artifacts");
    }
    const drill = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(drill.project === "PrivateDAO", "release drill project mismatch");
    assert(drill.mode === "repository-simulated-drill", "release drill mode mismatch");
    assert(drill.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "release drill program mismatch");
    assert(drill.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "release drill verification wallet mismatch");
    assert(drill.releaseCommit.length >= 7, "release drill commit is unexpectedly short");
    assert(drill.releaseBranch.length > 0, "release drill branch is missing");
    assert(drill.stages.some((entry) => entry.stage === "commit-freeze" && entry.status === "simulated-pass"), "release drill is missing commit-freeze stage");
    assert(drill.stages.some((entry) => entry.stage === "mainnet-cutover" && entry.status === "blocked-external-step"), "release drill is missing mainnet-cutover blocker");
    assert(drill.unresolvedBlockers.some((entry) => entry.name === "externalAudit"), "release drill missing externalAudit blocker");
    assert(drill.executionSummary.executedSteps >= 5, "release drill summary is missing executed steps");
    assert(drill.executionSummary.blockedExternalSteps >= 2, "release drill summary is missing blocked external steps");
    assert(drill.executionSummary.reviewerArtifactsObserved >= 3, "release drill summary is missing reviewer artifact count");
    assert(drill.executionTrace.length >= 8, "release drill trace is unexpectedly short");
    assert(drill.executionTrace.some((entry) => entry.step === "release-drill-generation" && entry.command === "npm run build:release-drill"), "release drill trace is missing generation step");
    assert(drill.executionTrace.some((entry) => entry.step === "runtime-evidence-verification" && entry.command === "npm run verify:runtime-evidence"), "release drill trace is missing runtime verification step");
    assert(drill.executionTrace.some((entry) => entry.step === "unified-release-gate" && entry.command === "npm run verify:all"), "release drill trace is missing unified gate step");
    assert(drill.executionTrace.some((entry) => entry.category === "external-blocker" && entry.status === "blocked-external-step"), "release drill trace is missing blocked external steps");
    for (const gate of [
        "npm run verify:live-proof",
        "npm run verify:release-manifest",
        "npm run verify:review-links",
        "npm run verify:review-surface",
        "npm run check:mainnet",
    ]) {
        assert(drill.mandatoryGates.includes(gate), `release drill missing gate: ${gate}`);
    }
    for (const doc of [
        "docs/release-ceremony.md",
        "docs/release-ceremony-attestation.generated.md",
        "docs/mainnet-cutover-runbook.md",
        "docs/operator-checklist.md",
        "docs/go-live-criteria.md",
        "docs/mainnet-readiness.generated.md",
    ]) {
        assert(drill.drillDocs.includes(doc), `release drill missing doc: ${doc}`);
    }
    assert(markdown.includes("# Release Drill Evidence"), "release drill markdown missing title");
    assert(markdown.includes("repository-simulated-drill"), "release drill markdown missing mode");
    assert(markdown.includes("Unresolved Blockers"), "release drill markdown missing blockers");
    assert(markdown.includes("Simulated Execution Trace"), "release drill markdown is missing execution trace");
    assert(markdown.includes("npm run verify:all"), "release drill markdown is missing unified gate command");
    console.log("Release drill verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
