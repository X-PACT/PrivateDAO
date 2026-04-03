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

## Lifecycle Transactions

${Object.entries(proof.transactions)
  .map(([label, tx]) => `- \`${label}\`: \`${tx}\``)
  .join("\n")}

## Artifact Integrity

- Integrity note: \`docs/cryptographic-integrity.md\`
- Cryptographic manifest: \`docs/cryptographic-manifest.generated.json\`
- Algorithm: \`${cryptographicManifest.algorithm}\`
- Manifest entries: \`${cryptographicManifest.entryCount}\`
- Aggregate sha256: \`${cryptographicManifest.aggregateSha256}\`

## ZK Package

- ZK layer note: \`docs/zk-layer.md\`
- ZK stack note: \`docs/zk-stack.md\`
- ZK threat extension: \`docs/zk-threat-extension.md\`
- ZK registry: \`docs/zk-registry.generated.json\`
- ZK stack version: \`${zkRegistry.zkStackVersion}\`
- ZK registry entries: \`${zkRegistry.entryCount}\`

${zkRegistry.entries
  .map(
    (entry) =>
      `- \`${entry.layer}\` -> \`${entry.circuit}\` | public signals: \`${entry.publicSignalCount}\` | build: \`${entry.commands.build}\` | verify: \`${entry.commands.verify}\``,
  )
  .join("\n")}

## Strategy Package

${submission.packages.strategy.map((entry) => `- \`${entry}\``).join("\n")}

## Security Package

${submission.packages.security.map((entry) => `- \`${entry}\``).join("\n")}

## ZK Review Package

${submission.packages.zk.map((entry) => `- \`${entry}\``).join("\n")}

## Proof Package

${submission.packages.proof.map((entry) => `- \`${entry}\``).join("\n")}

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
