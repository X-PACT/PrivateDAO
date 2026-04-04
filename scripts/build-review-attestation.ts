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
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
    metadataUri: string;
    decimals: number;
    supplyUi: string;
    transactions: Record<string, string>;
  };
  transactions: Record<string, string>;
};

type CryptographicManifest = {
  algorithm: string;
  entryCount: number;
  aggregateSha256: string;
};

type ZkRegistry = {
  zkStackVersion: number;
  entryCount: number;
  entries: Array<{
    circuit: string;
    layer: string;
    publicSignalCount: number;
  }>;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const cryptographicManifest = readJson<CryptographicManifest>("docs/cryptographic-manifest.generated.json");
  const zkRegistry = readJson<ZkRegistry>("docs/zk-registry.generated.json");

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
    pdaoToken: proof.pdaoToken
      ? {
          mint: proof.pdaoToken.mint,
          programId: proof.pdaoToken.programId,
          tokenAccount: proof.pdaoToken.tokenAccount,
          metadataUri: proof.pdaoToken.metadataUri,
          metadataAssetPath: "docs/assets/pdao-token.json",
          decimals: proof.pdaoToken.decimals,
          supplyUi: proof.pdaoToken.supplyUi,
          transactionLabels: Object.keys(proof.pdaoToken.transactions),
        }
      : undefined,
    transactionLabels: Object.keys(proof.transactions),
    packageCounts: {
      strategy: submission.packages.strategy.length,
      security: submission.packages.security.length,
      zk: submission.packages.zk.length,
      proof: submission.packages.proof.length,
      operations: submission.packages.operations.length,
    },
    zk: {
      stackVersion: zkRegistry.zkStackVersion,
      entryCount: zkRegistry.entryCount,
      verificationDocs: [
        "docs/zk-threat-extension.md",
        "docs/zk-assumption-matrix.md",
        "docs/zk-capability-matrix.md",
        "docs/zk-provenance.md",
        "docs/zk-verification-flow.md",
        "docs/zk-transcript.generated.md",
        "docs/zk-attestation.generated.json",
      ],
      layers: zkRegistry.entries.map((entry) => ({
        layer: entry.layer,
        circuit: entry.circuit,
        publicSignalCount: entry.publicSignalCount,
      })),
    },
    cryptographicIntegrity: {
      algorithm: cryptographicManifest.algorithm,
      entryCount: cryptographicManifest.entryCount,
      aggregateSha256: cryptographicManifest.aggregateSha256,
    },
    runtimeDocs: [
      "docs/fair-voting.md",
      "docs/wallet-runtime.md",
      "docs/wallet-compatibility-matrix.generated.md",
      "docs/wallet-compatibility-matrix.generated.json",
      "docs/devnet-canary.generated.md",
      "docs/devnet-canary.generated.json",
      "docs/pdao-attestation.generated.json",
      "docs/mainnet-readiness.generated.md",
      "docs/deployment-attestation.generated.json",
      "docs/go-live-criteria.md",
      "docs/operational-drillbook.md",
      "docs/runtime-attestation.generated.json",
      "docs/go-live-attestation.generated.json",
    ],
    securityDocs: [
      "docs/security-review.md",
      "docs/cryptographic-integrity.md",
      "docs/cryptographic-posture.md",
      "docs/supply-chain-security.md",
      "docs/supply-chain-attestation.generated.md",
      "docs/supply-chain-attestation.generated.json",
    ],
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
