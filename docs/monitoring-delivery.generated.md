# Monitoring Delivery Evidence

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-18T00:06:02.633Z`
- environment: `mainnet-candidate`
- status: `pending-delivery-closure`
- owner assignments: `3/3`
- closed delivery requirements: `0/6`
- transcript requirements: `5`
- rule severity mix: `2` critical / `5` high

## Owners

- operations-lead | assigned | alert destination ownership and response windows
- rpc-operator | assigned | primary and fallback RPC probe routing
- release-manager | assigned | incident acknowledgment transcript retention

## Delivery Requirements

- Alert destination ownership | pending | evidence: named destination and explicit owner
- Primary and fallback RPC probes | pending | evidence: provider assignment documented; active primary path remains public Devnet until RPCFast passes devnet truth validation
- Proposal lifecycle monitor | pending | evidence: test event and routed alert transcript
- Treasury balance monitor | pending | evidence: balance anomaly alert transcript
- Proof and settlement monitor | pending | evidence: strict proof or settlement failure transcript
- Authority activity monitor | pending | evidence: upgrade-authority or deployment activity alert transcript

## Provider Assignments

- candidate primary RPC: `RPC_FAST_TESTNET_RPC` or `SOLANA_RPC_URL` host secret
- active primary RPC: `https://api.devnet.solana.com`
- fallback RPC: `RPC_FAST_TESTNET_FALLBACK_RPC` host secret
- read path: `backend-indexer`
- status: `candidate-documented-awaiting-devnet-validation`

## Transcript Requirements

- trigger source and timestamp
- alert destination and delivery result
- acknowledging operator
- response window
- linked runbook and incident note

## Claim Boundary

alert rules are defined in-repo; production delivery is pending external setup

## Commands

- `npm run record:monitoring-delivery -- /path/to/intake.json`
- `npm run build:monitoring-delivery`
- `npm run verify:monitoring-delivery`
