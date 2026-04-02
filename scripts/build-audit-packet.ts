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

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
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

## Strategy Package

${submission.packages.strategy.map((entry) => `- \`${entry}\``).join("\n")}

## Security Package

${submission.packages.security.map((entry) => `- \`${entry}\``).join("\n")}

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
