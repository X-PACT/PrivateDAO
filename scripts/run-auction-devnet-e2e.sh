#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${HOME}/.local/share/solana/install/active_release/bin:${PATH}"
TMP_DIR="$(ccp mktemp -d /tmp/privatedao-auction-e2e.XXXXXX)"
trap 'ccp rm -rf "$TMP_DIR"' EXIT

ccp solana-keygen new --no-bip39-passphrase --silent --outfile "$TMP_DIR/bidder-a.json"
ccp solana-keygen new --no-bip39-passphrase --silent --outfile "$TMP_DIR/bidder-b.json"
ADDR_A="$(ccp solana address --keypair "$TMP_DIR/bidder-a.json")"
ADDR_B="$(ccp solana address --keypair "$TMP_DIR/bidder-b.json")"
CREATOR_KEYPAIR="${AUCTION_CREATOR_KEYPAIR:-${HOME}/.config/solana/id.json}"
# Keep temporary bidder wallets funded only for transaction fees. This avoids
# burning Devnet SOL when a later MagicBlock stage is unavailable.
ccp solana transfer "$ADDR_A" 0.25 --from "$CREATOR_KEYPAIR" --url https://api.devnet.solana.com --allow-unfunded-recipient
ccp solana transfer "$ADDR_B" 0.25 --from "$CREATOR_KEYPAIR" --url https://api.devnet.solana.com --allow-unfunded-recipient

cd "$ROOT"
AUCTION_CREATOR_KEYPAIR="$CREATOR_KEYPAIR" \
AUCTION_BIDDER_A_KEYPAIR="$TMP_DIR/bidder-a.json" \
AUCTION_BIDDER_B_KEYPAIR="$TMP_DIR/bidder-b.json" \
AUCTION_SOLANA_RPC="https://api.devnet.solana.com" \
AUCTION_TEE_RPC="https://devnet-tee.magicblock.app" \
AUCTION_ALLOW_TEE_ATTESTATION_UNAVAILABLE="${AUCTION_ALLOW_TEE_ATTESTATION_UNAVAILABLE:-1}" \
ccp node scripts/run-auction-devnet-e2e.mjs
