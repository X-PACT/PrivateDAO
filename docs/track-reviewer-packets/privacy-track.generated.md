# Confidential Governance Reviewer Packet Reviewer Packet

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-11T13:32:50.038Z`
- track slug: `privacy-track`
- sponsor: `MagicBlock and privacy-aligned partners`
- objective: Show PrivateDAO as the clearest privacy-native governance and confidential treasury product in the field.

## Judge-First Opening

1. What works now: Use the comprehensive story video as the first-pass demo for judges. Lead the click path from /security to the ZK matrix, confidence engine, and V3 proof packet. Keep the pitch deck anchored around private governance, confidential payouts, and honest launch boundaries.
2. What is externally proven: Live Proof V3 via /documents/live-proof-v3 and ZK capability matrix via /documents/zk-capability-matrix.
3. Exact blocker: magicblock-refhe-source-receipts. Privacy launch remains blocked until settlement receipts or verifier-grade source proof replace the current integration boundary.
4. Best demo route: open /story first. Lead with /story, then keep proof, custody truth, and the blocker in the same judge flow instead of splitting the story across routes.

Voiceover script:

What works now: Use the comprehensive story video as the first-pass demo for judges. Lead the click path from /security to the ZK matrix, confidence engine, and V3 proof packet. Keep the pitch deck anchored around private governance, confidential payouts, and honest launch boundaries. What is externally proven: Live Proof V3 via /documents/live-proof-v3 and ZK capability matrix via /documents/zk-capability-matrix. Exact blocker: magicblock-refhe-source-receipts. Privacy launch remains blocked until settlement receipts or verifier-grade source proof replace the current integration boundary. Best demo route: open /story first. Lead with /story, then keep proof, custody truth, and the blocker in the same judge flow instead of splitting the story across routes.

## Proof Closure

### What Works Now

- Use the comprehensive story video as the first-pass demo for judges.
- Lead the click path from /security to the ZK matrix, confidence engine, and V3 proof packet.
- Keep the pitch deck anchored around private governance, confidential payouts, and honest launch boundaries.

### What Is Externally Proven

- Live Proof V3: Devnet proposal lifecycle, V3 hardening, and explorer-verifiable proof anchors are already documented. (/documents/live-proof-v3)
- ZK capability matrix: The repo already states what the privacy layer proves today and what remains outside the claim boundary. (/documents/zk-capability-matrix)

### What Is Still Pending

Custody evidence is still required, and the signer or transfer packet can now be ingested through /custody in a strict repo-safe shape. The exact privacy-side blocker still remains the source-verifiable receipt path, not generic wording.

## Exact Blocker

- `magicblock-refhe-source-receipts`
- Privacy launch remains blocked until settlement receipts or verifier-grade source proof replace the current integration boundary.

## Best Demo Route

- route: `/story`
- Lead with /story, then keep proof, custody truth, and the blocker in the same judge flow instead of splitting the story across routes.

## Reviewer Links

- Track workspace: /tracks/privacy-track
- Live proof V3: /documents/live-proof-v3
- Judge route: /proof/?judge=1
- Story video: /story
- Launch trust packet: /documents/launch-trust-packet
- Canonical custody proof: /documents/canonical-custody-proof
- Custody reviewer packet: /documents/custody-proof-reviewer-packet
- ZK capability matrix: /documents/zk-capability-matrix
- Confidence engine: /documents/cryptographic-confidence-engine
- Frontier integrations: /documents/frontier-integrations

## Validation Gates

- `npm run verify:test-wallet-live-proof:v3`
- `npm run verify:zk-docs`
- `npm run verify:magicblock-runtime`

## Mainnet Discipline

### Before Mainnet

- External review of the encrypted operations corridor and the exact proposal-to-payout path.
- Stronger runtime evidence for wallet, signer, and payout execution across the confidential workflow.
- Explicit signer policy, timelock, and launch-boundary closure for real-funds governance.

### Devnet Only

- Reviewer packet and proof-first demonstrations of encrypted payroll and grant approvals.
- Confidence-engine interpretation used as deterministic guidance, not as a formal proof artifact.

### Release Discipline

Keep privacy claims bounded to the exact encrypted workflow that is evidenced, and keep all mainnet statements tied to blocker closure rather than aspiration.
