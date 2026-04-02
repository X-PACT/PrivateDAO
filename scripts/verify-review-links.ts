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
  "docs/production-operations.md",
  "docs/strategy-operations.md",
  "docs/reviewer-fast-path.md",
  "docs/reviewer-surface-map.md",
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
  "production-operations.md",
  "reviewer-fast-path.md",
  "strategy-operations.md",
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
  assertContains(frontend, "Judge Mode", "frontend is missing Judge Mode surface");
  assertContains(frontend, "Proof Center", "frontend is missing Proof Center surface");
  assertContains(frontend, "Security Evidence", "frontend is missing Security Evidence section");

  console.log("Review link verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
