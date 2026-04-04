import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  frontend: string;
  proofCenter: string;
  judgeMode: string;
  securityPage: string;
  youtubePitch: string;
  androidGuide: string;
  awardNote: string;
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
    commands: {
      build: string;
      prove: string;
      verify: string;
    };
  }>;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const cryptographicManifest = readJson<CryptographicManifest>("docs/cryptographic-manifest.generated.json");
  const zkRegistry = readJson<ZkRegistry>("docs/zk-registry.generated.json");
  const outPath = path.resolve("docs/audit-packet.generated.md");

  const markdown = `# Audit Packet

## Identity

- Project: ${submission.project}
- Program ID: \`${proof.programId}\`
- Deploy transaction: \`${proof.deployTx}\`
- Verification wallet: \`${proof.verificationWallet}\`

## Reviewer Entry Points

- Live frontend: ${submission.frontend}
- Proof Center: ${submission.proofCenter}
- Judge Mode: ${submission.judgeMode}
- Security page: ${submission.securityPage}
- YouTube pitch: ${submission.youtubePitch}

## Live Devnet Anchors

- DAO PDA: \`${proof.dao}\`
- Governance mint: \`${proof.governanceMint}\`
- Treasury PDA: \`${proof.treasury}\`
- Proposal PDA: \`${proof.proposal}\`

${proof.pdaoToken
  ? `## PDAO Token Surface

- PDAO mint: \`${proof.pdaoToken.mint}\`
- PDAO program: \`${proof.pdaoToken.programId}\`
- PDAO token account: \`${proof.pdaoToken.tokenAccount}\`
- PDAO metadata URI: \`${proof.pdaoToken.metadataUri}\`
- PDAO decimals: \`${proof.pdaoToken.decimals}\`
- PDAO initial supply: \`${proof.pdaoToken.supplyUi}\`
- PDAO attestation: \`docs/pdao-attestation.generated.json\`

### Program Boundary

- PrivateDAO governance program: \`${proof.programId}\`
- PDAO token program: \`${proof.pdaoToken.programId}\`
- Boundary note: the Token-2022 program id belongs to the PDAO mint surface and does not indicate a second PrivateDAO governance program.

### PDAO Token Transactions

${Object.entries(proof.pdaoToken.transactions)
  .map(([label, tx]) => `- \`${label}\`: \`${tx}\``)
  .join("\n")}`
  : ""}

## Lifecycle Transactions

${Object.entries(proof.transactions)
  .map(([label, tx]) => `- \`${label}\`: \`${tx}\``)
  .join("\n")}

## Artifact Integrity

- Integrity note: \`docs/cryptographic-integrity.md\`
- Cryptographic manifest: \`docs/cryptographic-manifest.generated.json\`
- Mainnet readiness report: \`docs/mainnet-readiness.generated.md\`
- Deployment attestation: \`docs/deployment-attestation.generated.json\`
- Go-live attestation: \`docs/go-live-attestation.generated.json\`
- PDAO attestation: \`docs/pdao-attestation.generated.json\`
- Algorithm: \`${cryptographicManifest.algorithm}\`
- Manifest entries: \`${cryptographicManifest.entryCount}\`
- Aggregate sha256: \`${cryptographicManifest.aggregateSha256}\`

## ZK Package

- ZK layer note: \`docs/zk-layer.md\`
- ZK stack note: \`docs/zk-stack.md\`
- ZK threat extension: \`docs/zk-threat-extension.md\`
- ZK assumption matrix: \`docs/zk-assumption-matrix.md\`
- ZK capability matrix: \`docs/zk-capability-matrix.md\`
- ZK provenance: \`docs/zk-provenance.md\`
- ZK verification flow: \`docs/zk-verification-flow.md\`
- ZK registry: \`docs/zk-registry.generated.json\`
- ZK transcript: \`docs/zk-transcript.generated.md\`
- ZK attestation: \`docs/zk-attestation.generated.json\`
- ZK stack version: \`${zkRegistry.zkStackVersion}\`
- ZK registry entries: \`${zkRegistry.entryCount}\`

${zkRegistry.entries
  .map(
    (entry) =>
      `- \`${entry.layer}\` -> \`${entry.circuit}\` | public signals: \`${entry.publicSignalCount}\` | build: \`${entry.commands.build}\` | verify: \`${entry.commands.verify}\``,
  )
  .join("\n")}

### ZK Review Commands

- \`npm run build:zk-registry\`
- \`npm run build:zk-transcript\`
- \`npm run build:zk-attestation\`
- \`npm run verify:zk-registry\`
- \`npm run verify:zk-transcript\`
- \`npm run verify:zk-attestation\`
- \`npm run verify:zk-docs\`
- \`npm run verify:zk-consistency\`
- \`npm run verify:zk-negative\`
- \`npm run zk:all\`

## Strategy Package

${submission.packages.strategy.map((entry) => `- \`${entry}\``).join("\n")}

## Security Package

${submission.packages.security.map((entry) => `- \`${entry}\``).join("\n")}

## ZK Review Package

${submission.packages.zk.map((entry) => `- \`${entry}\``).join("\n")}

## Proof Package

${submission.packages.proof.map((entry) => `- \`${entry}\``).join("\n")}

## Runtime Package

- \`docs/fair-voting.md\`
- \`docs/wallet-runtime.md\`
- \`docs/mainnet-readiness.generated.md\`
- \`docs/deployment-attestation.generated.json\`
- \`docs/go-live-criteria.md\`
- \`docs/operational-drillbook.md\`
- \`docs/runtime-attestation.generated.json\`
- \`docs/go-live-attestation.generated.json\`

## Devnet Stress Package

- \`docs/devnet-wallet-registry.json\`
- \`docs/devnet-bootstrap.json\`
- \`docs/devnet-tx-registry.json\`
- \`docs/adversarial-report.json\`
- \`docs/zk-proof-registry.json\`
- \`docs/performance-metrics.json\`
- \`docs/load-test-report.md\`

## Operations Package

${submission.packages.operations.map((entry) => `- \`${entry}\``).join("\n")}

## Verification Gates

${submission.gates.map((gate) => `- \`${gate}\``).join("\n")}

## Current Status

${Object.entries(submission.status)
  .map(([key, value]) => `- ${key}: \`${value}\``)
  .join("\n")}
`;

  fs.writeFileSync(outPath, markdown);
  console.log(`Wrote audit packet: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
