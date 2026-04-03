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
  programId: string;
  deployTx: string;
  verificationWallet: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
    supplyUi: string;
    metadataUri: string;
  };
};

type ZkRegistry = {
  zkStackVersion: number;
  entryCount: number;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const zk = readJson<ZkRegistry>("docs/zk-registry.generated.json");

  const attestation = {
    project: submission.project,
    programId: submission.programId,
    verificationWallet: submission.verificationWallet,
    deployTx: proof.deployTx,
    governanceAnchors: {
      dao: proof.dao,
      governanceMint: proof.governanceMint,
      treasury: proof.treasury,
      proposal: proof.proposal,
    },
    pdaoToken: proof.pdaoToken
      ? {
          mint: proof.pdaoToken.mint,
          programId: proof.pdaoToken.programId,
          tokenAccount: proof.pdaoToken.tokenAccount,
          supplyUi: proof.pdaoToken.supplyUi,
          metadataUri: proof.pdaoToken.metadataUri,
        }
      : undefined,
    readiness: submission.status,
    verificationGates: submission.gates,
    gateCount: submission.gates.length,
    packageCounts: {
      strategy: submission.packages.strategy.length,
      security: submission.packages.security.length,
      zk: submission.packages.zk.length,
      proof: submission.packages.proof.length,
      operations: submission.packages.operations.length,
    },
    zk: {
      stackVersion: zk.zkStackVersion,
      entryCount: zk.entryCount,
    },
    runtimeDocs: [
      "docs/wallet-runtime.md",
      "docs/fair-voting.md",
      "docs/mainnet-readiness.generated.md",
      "docs/go-live-criteria.md",
      "docs/operational-drillbook.md",
    ],
  };

  const outPath = path.resolve("docs/deployment-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote deployment attestation: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
