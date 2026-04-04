import fs from "fs";
import path from "path";

type ReleaseDrill = {
  project: string;
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
};

function main() {
  const jsonPath = path.resolve("docs/release-drill.generated.json");
  const mdPath = path.resolve("docs/release-drill.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing release drill evidence artifacts");
  }

  const drill = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as ReleaseDrill;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(drill.project === "PrivateDAO", "release drill project mismatch");
  assert(drill.mode === "repository-simulated-drill", "release drill mode mismatch");
  assert(drill.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "release drill program mismatch");
  assert(drill.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "release drill verification wallet mismatch");
  assert(drill.releaseCommit.length >= 7, "release drill commit is unexpectedly short");
  assert(drill.releaseBranch.length > 0, "release drill branch is missing");
  assert(drill.stages.some((entry) => entry.stage === "commit-freeze" && entry.status === "simulated-pass"), "release drill is missing commit-freeze stage");
  assert(drill.stages.some((entry) => entry.stage === "mainnet-cutover" && entry.status === "blocked-external-step"), "release drill is missing mainnet-cutover blocker");
  assert(drill.unresolvedBlockers.some((entry) => entry.name === "externalAudit"), "release drill missing externalAudit blocker");

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

  console.log("Release drill verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
