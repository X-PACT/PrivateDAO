#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="dist/reviewer-bundle"
ARCHIVE="dist/reviewer-bundle.tar.gz"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/docs"

cp README.md "$OUT_DIR/"
cp docs/reviewer-fast-path.md "$OUT_DIR/docs/"
cp docs/security-review.md "$OUT_DIR/docs/"
cp docs/threat-model.md "$OUT_DIR/docs/"
cp docs/security-coverage-map.md "$OUT_DIR/docs/"
cp docs/failure-modes.md "$OUT_DIR/docs/"
cp docs/replay-analysis.md "$OUT_DIR/docs/"
cp docs/protocol-spec.md "$OUT_DIR/docs/"
cp docs/security-architecture.md "$OUT_DIR/docs/"
cp docs/security-guarantees.md "$OUT_DIR/docs/"
cp docs/protocol-maturity.md "$OUT_DIR/docs/"
cp docs/independent-verification.md "$OUT_DIR/docs/"
cp docs/verification-gates.md "$OUT_DIR/docs/"
cp docs/live-proof.md "$OUT_DIR/docs/"
cp docs/devnet-release-manifest.md "$OUT_DIR/docs/"
cp docs/proof-registry.json "$OUT_DIR/docs/"
cp docs/audit-packet.generated.md "$OUT_DIR/docs/"
cp docs/review-attestation.generated.json "$OUT_DIR/docs/"
cp docs/reviewer-surface-map.md "$OUT_DIR/docs/"
cp docs/submission-dossier.md "$OUT_DIR/docs/"
cp docs/audit-handoff.md "$OUT_DIR/docs/"
cp docs/operator-checklist.md "$OUT_DIR/docs/"
cp docs/risk-register.md "$OUT_DIR/docs/"
cp docs/mainnet-readiness.md "$OUT_DIR/docs/"
cp docs/production-operations.md "$OUT_DIR/docs/"

tar -czf "$ARCHIVE" -C dist reviewer-bundle

echo "Wrote review bundle: $ARCHIVE"
