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
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
    supplyUi: string;
  };
};

type ReviewAttestation = {
  gateCount: number;
  packageCounts: Record<string, number>;
  cryptographicIntegrity?: {
    algorithm: string;
    entryCount: number;
    aggregateSha256: string;
  };
  zk?: {
    stackVersion: number;
    entryCount: number;
  };
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");
  const attestation = readJson<ReviewAttestation>("docs/review-attestation.generated.json");

  const verified = Object.entries(submission.status)
    .filter(([, status]) => status === "verified")
    .map(([name]) => name);
  const pending = Object.entries(submission.status)
    .filter(([, status]) => status !== "verified")
    .map(([name, status]) => ({ name, status }));

  const markdown = `# Mainnet Readiness Report

This report is generated from the canonical PrivateDAO registries and reviewer artifacts. It exists to summarize what is already verified inside the repository and what still remains outside repository scope before any production cutover.

## Current Identity

- Project: \`${submission.project}\`
- Program ID: \`${submission.programId}\`
- Verification wallet: \`${submission.verificationWallet}\`
- Deploy transaction: \`${proof.deployTx}\`
- DAO PDA: \`${proof.dao}\`
- Governance mint: \`${proof.governanceMint}\`
- Treasury PDA: \`${proof.treasury}\`
- Proposal PDA: \`${proof.proposal}\`
${proof.pdaoToken ? `- PDAO mint: \`${proof.pdaoToken.mint}\`\n- PDAO token program: \`${proof.pdaoToken.programId}\`\n- PDAO token account: \`${proof.pdaoToken.tokenAccount}\`\n- PDAO initial supply: \`${proof.pdaoToken.supplyUi}\`` : ""}

## Verified Internal Surfaces

${verified.map((item) => `- \`${item}\``).join("\n")}

## Pending Or External Dependencies

${pending.map((item) => `- \`${item.name}\` -> \`${item.status}\``).join("\n")}

## Reviewer Artifact Summary

- Verification gates tracked: \`${submission.gates.length}\`
- Gate count in review attestation: \`${attestation.gateCount}\`
- Strategy package count: \`${attestation.packageCounts.strategy}\`
- Security package count: \`${attestation.packageCounts.security}\`
- ZK package count: \`${attestation.packageCounts.zk}\`
- Proof package count: \`${attestation.packageCounts.proof}\`
- Operations package count: \`${attestation.packageCounts.operations}\`
- Runtime attestation: \`docs/runtime-attestation.generated.json\`
- Go-live criteria: \`docs/go-live-criteria.md\`
- Operational drillbook: \`docs/operational-drillbook.md\`
- Go-live attestation: \`docs/go-live-attestation.generated.json\`
${attestation.zk ? `- ZK stack version: \`${attestation.zk.stackVersion}\`\n- ZK layer count: \`${attestation.zk.entryCount}\`` : ""}
${attestation.cryptographicIntegrity ? `- Integrity algorithm: \`${attestation.cryptographicIntegrity.algorithm}\`\n- Integrity entries: \`${attestation.cryptographicIntegrity.entryCount}\`\n- Integrity aggregate sha256: \`${attestation.cryptographicIntegrity.aggregateSha256}\`` : ""}

## Mainnet Conclusion

What is strong now:

- the governance lifecycle is live on devnet
- reviewer-facing proof and security artifacts are published
- the zk companion stack is registry-backed, transcript-backed, and attested
- the frontend, Android guide, and proof surfaces are integrated into one verification package

What still requires real-world completion before mainnet should be claimed:

- external audit
- production key custody and multisig enforcement
- runtime wallet QA on real client environments
- monitoring, alert delivery, and incident ownership in live infrastructure
- operational cutover from devnet proof to mainnet execution

## Canonical Commands

\`\`\`bash
npm run build:mainnet-readiness-report
npm run build:deployment-attestation
npm run build:runtime-attestation
npm run build:go-live-attestation
npm run verify:mainnet-readiness-report
npm run verify:deployment-attestation
npm run verify:runtime-attestation
npm run verify:go-live-attestation
npm run verify:all
bash scripts/check-mainnet-readiness.sh
\`\`\`

## Honest Boundary

This report is an internal readiness artifact.

It does not claim:

- external audit completion
- automatic mainnet approval
- production rollout completion
- custody policy enforcement outside the repository
`;

  const outPath = path.resolve("docs/mainnet-readiness.generated.md");
  fs.writeFileSync(outPath, markdown);
  console.log(`Wrote mainnet readiness report: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
