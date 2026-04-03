import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  status: Record<string, string>;
};

type ProofRegistry = {
  deployTx: string;
  dao: string;
  governanceMint: string;
  treasury: string;
  proposal: string;
};

function main() {
  const reportPath = path.resolve("docs/mainnet-readiness.generated.md");
  if (!fs.existsSync(reportPath)) {
    throw new Error("missing generated mainnet readiness report");
  }

  const report = fs.readFileSync(reportPath, "utf8");
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  for (const token of [
    "# Mainnet Readiness Report",
    submission.project,
    submission.programId,
    submission.verificationWallet,
    proof.deployTx,
    proof.dao,
    proof.governanceMint,
    proof.treasury,
    proof.proposal,
    "external audit",
    "runtime wallet QA",
    "npm run build:mainnet-readiness-report",
    "npm run build:deployment-attestation",
    "npm run build:go-live-attestation",
    "npm run verify:mainnet-readiness-report",
    "npm run verify:deployment-attestation",
    "npm run verify:go-live-attestation",
    "docs/go-live-criteria.md",
    "docs/operational-drillbook.md",
    "docs/go-live-attestation.generated.json",
    "npm run verify:all",
    "bash scripts/check-mainnet-readiness.sh",
  ]) {
    assertContains(report, token);
  }

  for (const [key, status] of Object.entries(submission.status)) {
    assertContains(report, `\`${key}\``);
    if (status !== "verified") {
      assertContains(report, `\`${status}\``);
    }
  }

  console.log("Mainnet readiness report verification: PASS");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function assertContains(body: string, fragment: string) {
  if (!body.includes(fragment)) {
    throw new Error(`mainnet readiness report is missing: ${fragment}`);
  }
}

main();
