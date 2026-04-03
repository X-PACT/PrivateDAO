#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MINT="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.mint)')"
TOKEN_PROGRAM="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.programId)')"
TOKEN_ACCOUNT="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.tokenAccount)')"
METADATA_URI="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.metadataUri)')"

echo "[pdao-live] checking live mint account"
solana account "$MINT" --output json >/dev/null

echo "[pdao-live] checking live token account"
solana account "$TOKEN_ACCOUNT" --output json >/dev/null

echo "[pdao-live] checking token-2022 metadata"
TMP_JSON="$(mktemp)"
spl-token display --program-2022 "$MINT" --output json-compact >"$TMP_JSON"
node -e '
  const fs = require("fs");
  const body = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const tokenMetadata =
    body.metadata ||
    body.tokenMetadata ||
    body.extensions?.tokenMetadata ||
    body.extensions?.find?.((entry) => entry.extension === "tokenMetadata")?.state ||
    {};
  if (body.programId !== process.argv[2]) throw new Error("live PDAO token program mismatch");
  if (body.address !== process.argv[3]) throw new Error("live PDAO mint mismatch");
  if (String(body.decimals) !== "9") throw new Error("live PDAO decimals mismatch");
  if (tokenMetadata.name !== "PDAO") throw new Error("live PDAO name mismatch");
  if (tokenMetadata.symbol !== "PDAO") throw new Error("live PDAO symbol mismatch");
  if (tokenMetadata.uri !== process.argv[4]) throw new Error("live PDAO metadata URI mismatch");
  if (String(body.supply) !== "1000000000000000") throw new Error("live PDAO raw supply mismatch");
' "$TMP_JSON" "$TOKEN_PROGRAM" "$MINT" "$METADATA_URI"
rm -f "$TMP_JSON"

echo "[pdao-live] checking published metadata asset"
curl -fsSL "$METADATA_URI" >/dev/null

echo "[pdao-live] checking finalized token transactions"
solana confirm --url devnet 5zGeSePpx2q3dFTNBi8Vmn8ucd9B3jEW6MKqrCUWtQQa3FipwDPFVKRrAoWQhJagBVqKMfUcWxVfpA6Q2vymanA6 >/dev/null
solana confirm --url devnet 45gM6Jo3SSbwxzqyGRSMhTmz47r8wsaAMikdkbSQ2AyoXMEA3JAJM9X6eufjwnKY5QYU6QCFTjAfR9cVExKu2rhn >/dev/null
solana confirm --url devnet 4kgVoRGATdVAWVoYAYGqWnJBpDHiiRmFyQ3rgRz2uWEGdsx3Hosg5Ro7JGY7xSygD1vUUsGCduseCMWYx4MbXgur >/dev/null
solana confirm --url devnet 7LF3U3kooWfnRwaziceyRzKrHKhFQ6q6hfYeR6vU5gudjTPKYbw6kmXCxvvfurnQBnCBTCWH54rabcDqx1TBbLA >/dev/null

echo "[pdao-live] PASS"
