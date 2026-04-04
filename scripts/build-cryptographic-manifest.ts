import crypto from "crypto";
import fs from "fs";
import path from "path";

type ManifestEntry = {
  path: string;
  sha256: string;
  bytes: number;
};

const MANIFEST_FILES = [
  "zk/circuits/private_dao_vote_overlay.circom",
  "zk/circuits/private_dao_delegation_overlay.circom",
  "zk/circuits/private_dao_tally_overlay.circom",
  "zk/setup/private_dao_vote_overlay_vkey.json",
  "zk/setup/private_dao_delegation_overlay_vkey.json",
  "zk/setup/private_dao_tally_overlay_vkey.json",
  "zk/proofs/private_dao_vote_overlay.proof.json",
  "zk/proofs/private_dao_vote_overlay.public.json",
  "zk/proofs/private_dao_delegation_overlay.proof.json",
  "zk/proofs/private_dao_delegation_overlay.public.json",
  "zk/proofs/private_dao_tally_overlay.proof.json",
  "zk/proofs/private_dao_tally_overlay.public.json",
  "docs/proof-registry.json",
  "docs/devnet-wallet-registry.json",
  "docs/devnet-bootstrap.json",
  "docs/devnet-tx-registry.json",
  "docs/adversarial-report.json",
  "docs/zk-proof-registry.json",
  "docs/performance-metrics.json",
  "docs/load-test-report.md",
  "docs/devnet-multi-proposal-report.json",
  "docs/devnet-multi-proposal-report.md",
  "docs/devnet-race-report.json",
  "docs/devnet-race-report.md",
  "docs/devnet-resilience-report.json",
  "docs/devnet-resilience-report.md",
  "docs/devnet-release-manifest.md",
  "docs/live-proof.md",
  "docs/submission-registry.json",
  "docs/independent-verification.md",
  "docs/token.md",
  "docs/pdao-token.md",
  "docs/pdao-attestation.generated.json",
  "docs/assets/pdao-token.json",
  "docs/fair-voting.md",
  "docs/wallet-runtime.md",
  "docs/runtime-evidence.generated.md",
  "docs/runtime-evidence.generated.json",
  "docs/cryptographic-posture.md",
  "docs/supply-chain-security.md",
  "docs/supply-chain-attestation.generated.md",
  "docs/supply-chain-attestation.generated.json",
  "docs/wallet-compatibility-matrix.generated.md",
  "docs/wallet-compatibility-matrix.generated.json",
  "docs/devnet-canary.generated.md",
  "docs/devnet-canary.generated.json",
  "docs/mainnet-acceptance-matrix.generated.md",
  "docs/mainnet-acceptance-matrix.generated.json",
  "docs/mainnet-proof-package.generated.md",
  "docs/mainnet-proof-package.generated.json",
  "docs/external-readiness-intake.md",
  "docs/go-live-criteria.md",
  "docs/operational-drillbook.md",
  "docs/runtime-attestation.generated.json",
  "docs/security-review.md",
  "docs/deployment-attestation.generated.json",
  "docs/go-live-attestation.generated.json",
  "docs/release-ceremony.md",
  "docs/release-ceremony-attestation.generated.md",
  "docs/release-ceremony-attestation.generated.json",
  "docs/release-drill.generated.md",
  "docs/release-drill.generated.json",
  "docs/zk-layer.md",
  "docs/zk-stack.md",
  "docs/zk-threat-extension.md",
  "docs/zk-assumption-matrix.md",
  "docs/zk-capability-matrix.md",
  "docs/zk-provenance.md",
  "docs/zk-verification-flow.md",
  "docs/zk-registry.generated.json",
  "docs/zk-transcript.generated.md",
  "docs/zk-attestation.generated.json",
  "docs/verification-gates.md",
];

function main() {
  const entries = MANIFEST_FILES.map(buildEntry);
  const aggregateSha256 = sha256Hex(entries.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));

  const manifest = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    algorithm: "sha256",
    entryCount: entries.length,
    aggregateSha256,
    files: entries,
  };

  const outPath = path.resolve("docs/cryptographic-manifest.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote cryptographic manifest: ${path.relative(process.cwd(), outPath)}`);
}

function buildEntry(relativePath: string): ManifestEntry {
  const absolutePath = path.resolve(relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`missing manifest file: ${relativePath}`);
  }

  const body = fs.readFileSync(absolutePath);
  return {
    path: relativePath,
    sha256: sha256Hex(body),
    bytes: body.byteLength,
  };
}

function sha256Hex(input: crypto.BinaryLike): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

main();
