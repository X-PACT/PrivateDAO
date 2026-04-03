import fs from "fs";
import path from "path";

const README = path.resolve("README.md");
const FRONTEND = path.resolve("docs/index.html");

const requiredReadmeRefs = [
  "docs/security-review.md",
  "docs/threat-model.md",
  "docs/security-coverage-map.md",
  "docs/failure-modes.md",
  "docs/replay-analysis.md",
  "docs/live-proof.md",
  "docs/devnet-release-manifest.md",
  "docs/verification-gates.md",
  "docs/mainnet-readiness.md",
  "docs/mainnet-readiness.generated.md",
  "docs/deployment-attestation.generated.json",
  "docs/go-live-criteria.md",
  "docs/operational-drillbook.md",
  "docs/runtime-attestation.generated.json",
  "docs/go-live-attestation.generated.json",
  "docs/production-operations.md",
  "docs/fair-voting.md",
  "docs/wallet-runtime.md",
  "docs/strategy-operations.md",
  "docs/reviewer-fast-path.md",
  "docs/reviewer-surface-map.md",
  "docs/cryptographic-integrity.md",
  "docs/cryptographic-manifest.generated.json",
];

const requiredFrontendRefs = [
  "security-review.md",
  "threat-model.md",
  "security-coverage-map.md",
  "failure-modes.md",
  "replay-analysis.md",
  "live-proof.md",
  "devnet-release-manifest.md",
  "verification-gates.md",
  "mainnet-readiness.generated.md",
  "deployment-attestation.generated.json",
  "go-live-criteria.md",
  "operational-drillbook.md",
  "runtime-attestation.generated.json",
  "go-live-attestation.generated.json",
  "production-operations.md",
  "fair-voting.md",
  "wallet-runtime.md",
  "reviewer-fast-path.md",
  "strategy-operations.md",
  "cryptographic-integrity.md",
  "cryptographic-manifest.generated.json",
];

function main() {
  const readme = fs.readFileSync(README, "utf8");
  const frontend = fs.readFileSync(FRONTEND, "utf8");

  for (const ref of requiredReadmeRefs) {
    assertContains(readme, ref, `README is missing review reference: ${ref}`);
  }

  for (const ref of requiredFrontendRefs) {
    assertContains(frontend, ref, `docs/index.html is missing review reference: ${ref}`);
  }

  assertContains(readme, "https://x-pact.github.io/PrivateDAO/?page=proof&judge=1", "README is missing Judge Mode entry point");
  assertContains(readme, "https://x-pact.github.io/PrivateDAO/?page=diagnostics", "README is missing Wallet Diagnostics entry point");
  assertContains(frontend, "Judge Mode", "frontend is missing Judge Mode surface");
  assertContains(frontend, "Proof Center", "frontend is missing Proof Center surface");
  assertContains(frontend, "Security Evidence", "frontend is missing Security Evidence section");
  assertContains(frontend, "Wallet Diagnostics", "frontend is missing Wallet Diagnostics surface");

  console.log("Review link verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
