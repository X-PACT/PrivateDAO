import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  packages: Record<string, string[]>;
  gates: string[];
  status: Record<string, string>;
};

type ProofRegistry = {
  deployTx: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
  transactions: Record<string, string>;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  const attestation = {
    project: submission.project,
    programId: submission.programId,
    verificationWallet: submission.verificationWallet,
    deployTx: proof.deployTx,
    anchors: {
      dao: proof.dao,
      governanceMint: proof.governanceMint,
      treasury: proof.treasury,
      proposal: proof.proposal,
    },
    transactionLabels: Object.keys(proof.transactions),
    packageCounts: {
      strategy: submission.packages.strategy.length,
      security: submission.packages.security.length,
      proof: submission.packages.proof.length,
      operations: submission.packages.operations.length,
    },
    gateCount: submission.gates.length,
    statuses: submission.status,
  };

  const outPath = path.resolve("docs/review-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote review attestation: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
