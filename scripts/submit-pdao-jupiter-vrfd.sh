#!/usr/bin/env bash
set -euo pipefail

TOKEN="9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump"
PROJECT_TWITTER="https://x.com/privateDAOOS"
DESCRIPTION="PrivateDAO is a live Solana product ecosystem with public GitHub evidence, AWS-hosted APIs, Solana payment-gated utility, Proof Workflows, Private Governance, Treasury Coordination, Sealed Auctions, and the PDAO community token."
META_DESCRIPTION="PDAO is the PrivateDAO community token connected to proof workflows, private governance, treasury coordination, sealed auctions, payment-gated access receipts, public APIs, GitHub evidence, and live market references."
STANDARD_SUBMIT_URL="https://verified.jup.ag/tokens/submit?token=${TOKEN}&tier=standard"
STANDARD_PACKET_URL="https://privatedao.org/vrfd-pdao-standard.json"
STATUS_URL="https://token-verify-api.jup.ag/verifications/token/${TOKEN}"
HISTORY_URL="https://token-verify-api.jup.ag/submissions/history?tokenId=${TOKEN}"
ELIGIBILITY_URL="https://token-verify-api.jup.ag/basic/check-eligibility?tokenId=${TOKEN}"

case "${1:-}" in
  -h|--help)
    cat <<'USAGE'
Usage:
  scripts/submit-pdao-jupiter-vrfd.sh [--dry-run|--json|--status]

Purpose:
  Prepare the PDAO Standard VRFD packet for https://verified.jup.ag.

Important:
  This helper does not call `jup vrfd submit`.
  Jupiter CLI v0.10.1 routes `jup vrfd submit` through Express Verification
  endpoints internally, so this repository keeps Standard VRFD browser-only.
  The current public Jupiter state is a pending Basic/Standard request.
USAGE
    exit 0
    ;;
esac

if [[ "${1:-}" == "--status" ]]; then
  echo "Standard VRFD status endpoint:"
  curl -fsSL "$STATUS_URL"
  echo
  echo "Standard VRFD history endpoint:"
  curl -fsSL "$HISTORY_URL"
  echo
  echo "Basic eligibility endpoint:"
  curl -fsSL "$ELIGIBILITY_URL"
  echo
  exit 0
fi

if [[ "${1:-}" == "--json" ]]; then
  jq -n \
    --arg token "$TOKEN" \
    --arg projectTwitter "$PROJECT_TWITTER" \
    --arg description "$DESCRIPTION" \
    --arg metaDescription "$META_DESCRIPTION" \
    --arg standardSubmitUrl "$STANDARD_SUBMIT_URL" \
    --arg standardPacketUrl "$STANDARD_PACKET_URL" \
    --arg statusUrl "$STATUS_URL" \
    --arg historyUrl "$HISTORY_URL" \
    '{
      route: $standardSubmitUrl,
      mode: "standard-vrfd",
      expressVerification: false,
      standardPacket: $standardPacketUrl,
      token: $token,
      status: {
        state: "pending",
        tier: "basic",
        submissionId: 13951,
        requestOrigin: "ui",
        senderTwitterHandle: "privateDAOOS",
        createdAt: "2026-06-22 23:39:12.071167+00",
        publicStatusEndpoint: $statusUrl,
        publicHistoryEndpoint: $historyUrl
      },
      projectTwitter: $projectTwitter,
      senderTwitter: $projectTwitter,
      description: $description,
      metadata: {
        icon: "https://privatedao.org/assets/token/pdao-token-logo.png",
        name: "PrivateDAO",
        symbol: "PDAO",
        website: "https://privatedao.org/token/",
        telegram: "https://t.me/PrivateDAOO",
        twitter: $projectTwitter,
        discord: "https://discord.gg/PRcD9nFeVf",
        circulatingSupply: "965554358.433758",
        circulatingSupplyUrl: "https://privatedao.org/token.json",
        description: $metaDescription,
        otherUrl: "https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz"
      }
    }'
  exit 0
fi

cat <<EOF
PDAO Standard VRFD packet prepared.

Open: $STANDARD_SUBMIT_URL
Packet: $STANDARD_PACKET_URL

Current Jupiter public status:
- State: pending
- Tier: basic
- Submission id: 13951
- Created: 2026-06-22 23:39:12.071167+00
- Status API: $STATUS_URL
- History API: $HISTORY_URL

Token mint:
$TOKEN

Project X:
$PROJECT_TWITTER

Description:
$DESCRIPTION

Metadata:
- Icon: https://privatedao.org/assets/token/pdao-token-logo.png
- Name: PrivateDAO
- Symbol: PDAO
- Website: https://privatedao.org/token/
- Telegram: https://t.me/PrivateDAOO
- Twitter/X: $PROJECT_TWITTER
- Discord: https://discord.gg/PRcD9nFeVf
- Circulating supply: 965554358.433758
- Circulating supply URL: https://privatedao.org/token.json
- Description: $META_DESCRIPTION
- Other URL: https://dexscreener.com/solana/EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz

Safety:
- Express Verification: disabled
- CLI submit: disabled because Jupiter CLI v0.10.1 uses Express endpoints internally
- Duplicate Standard submit: disabled because Jupiter already reports a pending Basic/Standard request
- Secrets: not printed
EOF
