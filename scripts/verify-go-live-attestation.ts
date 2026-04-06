import fs from "fs";
import path from "path";

type GoLiveAttestation = {
  project: string;
  programId: string;
  verificationWallet: string;
  deployTx: string;
  decision: string;
  verifiedInsideRepo: string[];
  blockers: Array<{ name: string; status: string }>;
  mandatoryGates: string[];
  criteriaDocs: string[];
  runtimeDocs: string[];
  deploymentGateCount: number;
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
    supplyUi: string;
  };
};

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  gates: string[];
  status: Record<string, string>;
};

type ProofRegistry = {
  deployTx: string;
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
    supplyUi: string;
  };
};

function main() {
  const attestationPath = path.resolve("docs/go-live-attestation.generated.json");
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing go-live attestation");
  }

  const attestation = readJson<GoLiveAttestation>("docs/go-live-attestation.generated.json");
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  assert(attestation.project === submission.project, "go-live attestation project mismatch");
  assert(attestation.programId === submission.programId, "go-live attestation program mismatch");
  assert(attestation.verificationWallet === submission.verificationWallet, "go-live attestation verification wallet mismatch");
  assert(attestation.deployTx === proof.deployTx, "go-live attestation deploy tx mismatch");

  for (const gate of [
    "npm run verify:all",
    "npm run verify:mainnet-readiness-report",
    "npm run verify:deployment-attestation",
    "npm run verify:go-live-attestation",
  ]) {
    assert(attestation.mandatoryGates.includes(gate), `go-live attestation is missing mandatory gate: ${gate}`);
  }

  for (const doc of [
    "docs/go-live-criteria.md",
    "docs/operational-drillbook.md",
    "docs/mainnet-readiness.generated.md",
    "docs/deployment-attestation.generated.json",
    "docs/zk-external-closure.generated.md",
    "docs/zk-external-audit-scope.md",
    "docs/canonical-verifier-boundary-decision.md",
  ]) {
    assert(attestation.criteriaDocs.includes(doc), `go-live attestation is missing criteria doc: ${doc}`);
  }

  for (const verified of [
    "governanceLifecycle",
    "securityReasoning",
    "zkCompanionStack",
    "reviewerSurface",
    "operationsSurface",
  ]) {
    assert(attestation.verifiedInsideRepo.includes(verified), `go-live attestation is missing verified status: ${verified}`);
  }

  for (const blocker of [
    ["externalAudit", "pending"],
    ["mainnetRollout", "pending"],
    ["strategyEngine", "not-in-repo"],
    ["livePerformance", "not-in-repo"],
  ] as const) {
    assert(
      attestation.blockers.some((entry) => entry.name === blocker[0] && entry.status === blocker[1]),
      `go-live attestation is missing blocker: ${blocker[0]}=${blocker[1]}`,
    );
  }

  assert(
    attestation.decision === "blocked-pending-external-steps",
    "go-live attestation decision should remain blocked until external dependencies close",
  );

  assert(attestation.runtimeDocs.includes("docs/wallet-runtime.md"), "go-live attestation is missing wallet runtime doc");
  assert(attestation.runtimeDocs.includes("docs/fair-voting.md"), "go-live attestation is missing fair-voting doc");
  assert(attestation.runtimeDocs.includes("docs/zk-enforced-runtime-evidence.md"), "go-live attestation is missing zk-enforced runtime doc");
  assert(attestation.runtimeDocs.includes("docs/zk-enforced-runtime.generated.md"), "go-live attestation is missing zk-enforced runtime package");
  assert(attestation.deploymentGateCount >= 4, "go-live attestation deployment gate count is unexpectedly low");

  if (proof.pdaoToken) {
    assert(Boolean(attestation.pdaoToken), "go-live attestation is missing PDAO token summary");
    assert(attestation.pdaoToken?.mint === proof.pdaoToken.mint, "go-live attestation PDAO mint mismatch");
    assert(attestation.pdaoToken?.programId === proof.pdaoToken.programId, "go-live attestation PDAO program mismatch");
  }

  console.log("Go-live attestation verification: PASS");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
