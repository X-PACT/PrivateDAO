import fs from "fs";
import path from "path";

const README = path.resolve("README.md");
const HOME_SHELL = path.resolve("apps/web/src/components/home-shell.tsx");
const PROOF_CENTER = path.resolve("apps/web/src/components/proof-center.tsx");
const SECURITY_CENTER = path.resolve("apps/web/src/components/security-center.tsx");
const DIAGNOSTICS_CENTER = path.resolve("apps/web/src/components/diagnostics-center.tsx");
const SERVICES_SURFACE = path.resolve("apps/web/src/components/services-surface.tsx");
const CURATED_DOCUMENTS = path.resolve("apps/web/src/lib/curated-documents.ts");

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
  "docs/frontier-integrations.generated.md",
  "docs/frontier-guided-flow.md",
  "docs/test-wallet-live-proof-v3.generated.md",
  "docs/governance-hardening-v3.md",
  "docs/settlement-hardening-v3.md",
  "docs/runtime/real-device.md",
  "docs/runtime/real-device.generated.md",
  "docs/launch-trust-packet.generated.md",
  "docs/production-custody-ceremony.md",
  "docs/external-audit-engagement.md",
  "docs/pilot-onboarding-playbook.md",
  "docs/go-live-attestation.generated.json",
  "docs/production-operations.md",
  "docs/fair-voting.md",
  "docs/wallet-runtime.md",
  "docs/operational-evidence.generated.md",
  "docs/pdao-attestation.generated.json",
  "docs/strategy-operations.md",
  "docs/reviewer-fast-path.md",
  "docs/reviewer-surface-map.md",
  "docs/cryptographic-integrity.md",
  "docs/cryptographic-manifest.generated.json",
];

function main() {
  const readme = fs.readFileSync(README, "utf8");
  const homeShell = fs.readFileSync(HOME_SHELL, "utf8");
  const proofCenter = fs.readFileSync(PROOF_CENTER, "utf8");
  const securityCenter = fs.readFileSync(SECURITY_CENTER, "utf8");
  const diagnosticsCenter = fs.readFileSync(DIAGNOSTICS_CENTER, "utf8");
  const servicesSurface = fs.readFileSync(SERVICES_SURFACE, "utf8");
  const curatedDocuments = fs.readFileSync(CURATED_DOCUMENTS, "utf8");

  for (const ref of requiredReadmeRefs) {
    assertContains(readme, ref, `README is missing review reference: ${ref}`);
  }

  const hasJudgeEntry =
    readme.includes("https://privatedao.org/proof/?judge=1") ||
    readme.includes("https://privatedao.org/proof/?judge=1");
  if (!hasJudgeEntry) {
    throw new Error("README is missing Judge Mode entry point");
  }

  const hasDiagnosticsEntry =
    readme.includes("https://privatedao.org/diagnostics/") ||
    readme.includes("https://privatedao.org/diagnostics/");
  if (!hasDiagnosticsEntry) {
    throw new Error("README is missing Wallet Diagnostics entry point");
  }
  assertContains(homeShell, "Open judge proof view", "Next home shell is missing Judge Mode entry point");
  assertContains(proofCenter, "Proof center", "Next proof center is missing");
  assertContains(securityCenter, "Security architecture", "Next security center is missing");
  assertContains(diagnosticsCenter, "Operational diagnostics", "Next diagnostics center is missing");
  assertContains(servicesSurface, "Pilot and trust journey", "Next services surface is missing the pilot journey");
  for (const ref of [
    'slug: "reviewer-fast-path"',
    'slug: "audit-packet"',
    'slug: "live-proof-v3"',
    'slug: "launch-trust-packet"',
    'slug: "mainnet-blockers"',
    'slug: "trust-package"',
  ]) {
    assertContains(curatedDocuments, ref, `Next curated document library is missing review reference: ${ref}`);
  }

  console.log("Review link verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
