import fs from "fs";
import path from "path";

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

type DeploymentAttestation = {
  runtimeDocs: string[];
  gateCount: number;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const deployment = readJson<DeploymentAttestation>("docs/deployment-attestation.generated.json");

  const verifiedInsideRepo = Object.entries(submission.status)
    .filter(([, status]) => status === "verified")
    .map(([name]) => name);

  const blockers = Object.entries(submission.status)
    .filter(([, status]) => status !== "verified")
    .map(([name, status]) => ({ name, status }));

  const attestation = {
    project: submission.project,
    programId: submission.programId,
    verificationWallet: submission.verificationWallet,
    deployTx: proof.deployTx,
    decision: blockers.length === 0 ? "ready-for-mainnet" : "blocked-pending-external-steps",
    verifiedInsideRepo,
    blockers,
    mandatoryGates: [
      "npm run verify:all",
      "npm run verify:mainnet-readiness-report",
      "npm run verify:deployment-attestation",
      "npm run verify:go-live-attestation",
      "npm run verify:test-wallet-live-proof:v3",
    ],
    criteriaDocs: [
      "docs/go-live-criteria.md",
      "docs/operational-drillbook.md",
      "docs/mainnet-readiness.md",
      "docs/mainnet-readiness.generated.md",
      "docs/governance-hardening-v3.md",
      "docs/settlement-hardening-v3.md",
      "docs/test-wallet-live-proof-v3.generated.md",
      "docs/deployment-attestation.generated.json",
      "docs/zk/enforced-runtime-evidence.md",
      "docs/zk/enforced-runtime.generated.md",
      "docs/zk/enforced-operator-flow.md",
      "docs/zk/external-closure.generated.md",
      "docs/zk-external-audit-scope.md",
      "docs/canonical-verifier-boundary-decision.md",
    ],
    runtimeDocs: deployment.runtimeDocs,
    deploymentGateCount: deployment.gateCount,
    pdaoToken: proof.pdaoToken
      ? {
          mint: proof.pdaoToken.mint,
          programId: proof.pdaoToken.programId,
          tokenAccount: proof.pdaoToken.tokenAccount,
          supplyUi: proof.pdaoToken.supplyUi,
        }
      : undefined,
  };

  const outPath = path.resolve("docs/go-live-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote go-live attestation: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
