#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MINT="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.mint)')"
TOKEN_PROGRAM="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.programId)')"
TOKEN_ACCOUNT="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.tokenAccount)')"
METADATA_URI="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.metadataUri)')"
TOKEN_NETWORK="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write((proof.pdaoToken.network || "Devnet").toLowerCase())')"
MINT_AUTHORITY_STATUS="$(node -e 'const proof=require("./docs/proof-registry.json"); process.stdout.write(proof.pdaoToken.mintAuthorityStatus || "")')"

RPC_URL="https://api.${TOKEN_NETWORK}.solana.com"

echo "[pdao-live] checking live mint account"
solana account "$MINT" --url "$RPC_URL" --output json >/dev/null

echo "[pdao-live] checking live token account"
solana account "$TOKEN_ACCOUNT" --url "$RPC_URL" --output json >/dev/null

echo "[pdao-live] checking token-2022 metadata"
TMP_JSON="$(mktemp)"
spl-token display --program-2022 "$MINT" --url "$RPC_URL" --output json-compact >"$TMP_JSON"
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
  if (process.argv[5] === "disabled" && body.mintAuthority !== null) throw new Error("live PDAO mint authority should be disabled");
  if (tokenMetadata.name !== "PrivateDAO Governance Token") throw new Error("live PDAO name mismatch");
  if (tokenMetadata.symbol !== "PDAO") throw new Error("live PDAO symbol mismatch");
  if (tokenMetadata.uri !== process.argv[4]) {
    console.error(`[pdao-live] on-chain metadata URI: ${tokenMetadata.uri || "<missing>"}`);
    console.error(`[pdao-live] expected published URI: ${process.argv[4]}`);
    console.error("[pdao-live] blocker: Token-2022 metadata still points to the old published asset; update authority cutover is still pending");
    process.exit(1);
  }
  if (String(body.supply) !== "1000000000000000") throw new Error("live PDAO raw supply mismatch");
' "$TMP_JSON" "$TOKEN_PROGRAM" "$MINT" "$METADATA_URI" "$MINT_AUTHORITY_STATUS"
rm -f "$TMP_JSON"

echo "[pdao-live] checking published metadata asset"
curl -fsSL "$METADATA_URI" >/dev/null

echo "[pdao-live] checking finalized token transactions"
while IFS= read -r tx; do
  [[ -z "$tx" ]] && continue
  solana confirm --url "$RPC_URL" "$tx" >/dev/null
done < <(node -e 'const proof=require("./docs/proof-registry.json"); console.log(Object.values(proof.pdaoToken.transactions).filter(Boolean).join("\n"))')

echo "[pdao-live] PASS"
