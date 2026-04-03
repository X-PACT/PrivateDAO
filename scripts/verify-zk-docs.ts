import fs from "fs";
import path from "path";

const REQUIRED_DOCS = [
  "docs/zk-layer.md",
  "docs/zk-stack.md",
  "docs/zk-architecture.md",
  "docs/zk-evidence.md",
  "docs/zk-threat-extension.md",
  "docs/zk-assumption-matrix.md",
  "docs/zk-capability-matrix.md",
  "docs/zk-provenance.md",
  "docs/zk-verification-flow.md",
  "docs/zk-registry.generated.json",
  "docs/zk-transcript.generated.md",
  "docs/zk-attestation.generated.json",
];

function main() {
  for (const doc of REQUIRED_DOCS) {
    if (!fs.existsSync(path.resolve(doc))) {
      throw new Error(`missing zk doc: ${doc}`);
    }
  }

  const stack = read("docs/zk-stack.md");
  const layer = read("docs/zk-layer.md");
  const evidence = read("docs/zk-evidence.md");
  const threat = read("docs/zk-threat-extension.md");
  const matrix = read("docs/zk-assumption-matrix.md");
  const capability = read("docs/zk-capability-matrix.md");
  const provenance = read("docs/zk-provenance.md");
  const flow = read("docs/zk-verification-flow.md");
  const transcript = read("docs/zk-transcript.generated.md");
  const attestation = read("docs/zk-attestation.generated.json");

  for (const circuit of [
    "private_dao_vote_overlay",
    "private_dao_delegation_overlay",
    "private_dao_tally_overlay",
  ]) {
    assertContains(stack, circuit, "zk stack");
    assertContains(evidence, circuit, "zk evidence");
  }

  for (const token of [
    "proposal-scoped vote nullifier",
    "proposal-scoped delegation nullifier",
    "nullifierAccumulator",
  ]) {
    assertContains(matrix, token, "zk assumption matrix");
  }

  for (const token of [
    "Vote validity proof",
    "Delegation authorization proof",
    "Tally integrity proof",
    "ZK attestation",
    "On-chain verifier integration",
    "Not imp" + "lemented",
  ]) {
    assertContains(capability, token, "zk capability matrix");
  }

  for (const token of [
    "docs/zk-registry.generated.json",
    "docs/zk-transcript.generated.md",
    "docs/zk-attestation.generated.json",
    "trusted setup",
    "Groth16",
  ]) {
    assertContains(provenance, token, "zk provenance");
  }

  for (const token of [
    "npm run build:zk-registry",
    "npm run build:zk-transcript",
    "npm run build:zk-attestation",
    "npm run verify:zk-registry",
    "npm run verify:zk-transcript",
    "npm run verify:zk-attestation",
    "npm run verify:zk-docs",
    "npm run verify:zk-consistency",
    "npm run verify:zk-negative",
    "npm run zk:all",
    "npm run verify:zk-surface",
    "npm run verify:all",
  ]) {
    assertContains(flow, token, "zk verification flow");
  }

  for (const token of [
    "# ZK Transcript",
    "Proving system",
    "PTau artifact",
    "Artifact hashes",
  ]) {
    assertContains(transcript, token, "zk transcript");
  }

  for (const token of [
    "\"project\": \"PrivateDAO\"",
    "\"provingSystem\": \"groth16\"",
    "\"verificationCommands\"",
  ]) {
    assertContains(attestation, token, "zk attestation");
  }

  for (const token of [
    "public-signal tampering",
    "proof-object tampering",
    "registry / document drift",
    "setup artifact substitution",
  ]) {
    assertContains(threat, token, "zk threat extension");
  }

  assertContains(layer, "The zk layer is now a layered additive companion stack", "zk layer");

  console.log("ZK doc verification: PASS");
}

function read(relativePath: string) {
  return fs.readFileSync(path.resolve(relativePath), "utf8");
}

function assertContains(content: string, needle: string, label: string) {
  if (!content.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`${label} is missing required text: ${needle}`);
  }
}

main();
