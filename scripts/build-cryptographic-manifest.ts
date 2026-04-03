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
  "docs/devnet-release-manifest.md",
  "docs/live-proof.md",
  "docs/submission-registry.json",
  "docs/independent-verification.md",
  "docs/token.md",
  "docs/pdao-token.md",
  "docs/security-review.md",
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
