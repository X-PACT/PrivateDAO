import fs from "fs";
import path from "path";

type ReleaseCeremonyAttestation = {
  project: string;
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
};

function main() {
  const jsonPath = path.resolve("docs/release-ceremony-attestation.generated.json");
  const mdPath = path.resolve("docs/release-ceremony-attestation.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing release ceremony attestation artifacts");
  }

  const attestation = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as ReleaseCeremonyAttestation;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(attestation.project === "PrivateDAO", "release ceremony project mismatch");
  assert(attestation.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "release ceremony program mismatch");
  assert(attestation.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "release ceremony verification wallet mismatch");
  assert(attestation.releaseCommit.length >= 7, "release ceremony commit is unexpectedly short");
  assert(attestation.releaseBranch.length > 0, "release ceremony branch is missing");
  assert(attestation.observedGateCount > 0, "release ceremony gate count is unexpectedly low");
  assert(attestation.deploymentGateCount >= 4, "release ceremony deployment gate count is unexpectedly low");
  assert(attestation.goLiveDecision === "blocked-pending-external-steps", "release ceremony go-live decision mismatch");
  assert(attestation.anchors.dao?.length > 0, "release ceremony DAO anchor is missing");
  assert(attestation.anchors.governanceMint?.length > 0, "release ceremony governance mint is missing");
  assert(attestation.anchors.treasury?.length > 0, "release ceremony treasury is missing");
  assert(attestation.anchors.proposal?.length > 0, "release ceremony proposal is missing");

  for (const doc of [
    "docs/release-ceremony.md",
    "docs/mainnet-cutover-runbook.md",
    "docs/operator-checklist.md",
    "docs/mainnet-readiness.generated.md",
    "docs/deployment-attestation.generated.json",
    "docs/go-live-attestation.generated.json",
  ]) {
    assert(attestation.ceremonyDocs.includes(doc), `missing ceremony doc: ${doc}`);
  }

  for (const gate of [
    "npm run verify:live-proof",
    "npm run verify:release-manifest",
    "npm run verify:review-links",
    "npm run verify:review-surface",
    "npm run check:mainnet",
  ]) {
    assert(attestation.mandatoryGates.includes(gate), `missing release ceremony gate: ${gate}`);
  }

  assert(attestation.unresolvedBlockers.some((entry) => entry.name === "externalAudit"), "release ceremony missing externalAudit blocker");
  assert(markdown.includes("# Release Ceremony Attestation"), "release ceremony markdown missing title");
  assert(markdown.includes("Go-live decision"), "release ceremony markdown missing go-live decision");
  assert(markdown.includes("Mandatory Gates"), "release ceremony markdown missing mandatory gates");

  console.log("Release ceremony attestation verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
