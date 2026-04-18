# Governance Runtime Proof Status

## Overview

- Generated at: `2026-04-18T02:53:01.097Z`
- Project: `PrivateDAO`
- Network: `devnet`
- Program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Live wallet-first actions: `6`
- Repo-script proofs captured: `6`
- Browser-wallet proofs captured: `0`
- Real-device proofs captured: `0`

## Current Boundary

- Unsupported executable boundary: CustomCPI treasury actions remain outside the executable release boundary.
- Pending browser-wallet captures: Create DAO, Create Proposal, Commit Vote, Reveal Vote, Finalize Proposal, Execute Proposal
- Pending real-device captures: Create DAO, Create Proposal, Commit Vote, Reveal Vote, Finalize Proposal, Execute Proposal

## Action Status

### Create DAO

- Instruction: `initialize_dao`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: DAO bootstrap is live in the web wallet lane. Repo-script proof exists, and browser-wallet plus real-device capture expansion is already underway.

### Create Proposal

- Instruction: `create_proposal`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: Proposal submit is live in the web wallet lane, including the current SendSol and SendToken treasury motions. Browser-wallet and real-device capture expansion is the next visible runtime lift.

### Commit Vote

- Instruction: `commit_vote`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: Commit vote is live in the web wallet lane once a real DAO and proposal already exist in session state. Browser-wallet and real-device capture expansion is the next visible runtime lift.

### Reveal Vote

- Instruction: `reveal_vote`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: Reveal vote is live in the web wallet lane once a live commit already exists in the same session. Browser-wallet and real-device capture expansion is the next visible runtime lift.

### Finalize Proposal

- Instruction: `finalize_proposal`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: Finalize proposal is live in the web wallet lane. Repo-script proof exists, and browser-wallet plus real-device capture expansion is already underway.

### Execute Proposal

- Instruction: `execute_proposal`
- Live wallet-first lane: `true`
- Repo-script proof captured: `true`
- Browser-wallet proof captured: `false`
- Real-device proof captured: `false`
- Note: Execute proposal is live in the web wallet lane for standard, SendSol, and SendToken proposals. CustomCPI remains outside the current executable release boundary.

## Linked Docs

- `docs/test-wallet-live-proof.generated.md`
- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/runtime-evidence.generated.md`
- `docs/runtime/browser-wallet.generated.md`
- `docs/runtime/browser-wallet.md`
- `docs/runtime/real-device.generated.md`
- `docs/runtime/real-device.md`
- `docs/launch-trust-packet.generated.md`
- `docs/treasury-reviewer-packet.generated.md`

## Commands

- `npm run live-proof`
- `npm run live-proof:v3`
- `npm run build:governance-runtime-proof`
- `npm run verify:governance-runtime-proof`
- `npm run build:browser-wallet-runtime`
- `npm run verify:browser-wallet-runtime`
- `npm run build:real-device-runtime`
- `npm run verify:real-device-runtime`

## Notes

- This packet separates live web wallet capability from runtime proof capture so the product does not overclaim based on shipped code alone.
- Repo-script proof exists for the governance core lifecycle, but browser-wallet proof on the web and real-device action proof on Android remain pending until captures are recorded in their runtime registries.
- The web wallet lane currently covers Create DAO, Create Proposal, Commit Vote, Reveal Vote, Finalize Proposal, and Execute Proposal for standard, SendSol, and SendToken proposals.
