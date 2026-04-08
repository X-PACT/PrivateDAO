<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Security Audit Remediation - 2026-04-08

This note records the verified fixes from the latest security review pass. It is intentionally narrow: only issues confirmed against the current repository were patched as code. Items that require a larger governance or cryptographic migration remain documented rather than overstated.

## Confirmed And Fixed

### Commitment Hash Mismatch In Demo Test

- Reported issue: the demo helper used `sha256(vote || salt || voter)`.
- Current protocol invariant: `sha256(vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32)`.
- Fix: `tests/demo.ts` now includes the proposal pubkey in every demo commitment.
- Regression: `scripts/verify-security-remediation.ts` checks the demo helper and generated call sites.

### Late Legacy Cancellation

- Reported issue: `cancel_proposal` v1 could cancel a voting proposal after commits/reveals.
- Fix: the v1 instruction keeps the same ABI but now enforces the same safety invariant as the strict path: proposal status is `Voting`, current time is before `voting_end`, and `commit_count == 0 && reveal_count == 0`.
- Regression: `tests/private-dao.ts` adds a cancellation-after-commit rejection test.

### Token Program Pinning

- Reported issue: token payout execution accepted a generic token interface without an explicit support check.
- Fix: token execution paths now require the token program to be either SPL Token or Token-2022 before parsing accounts or making the token CPI. The program still preserves support for both token programs.

### Optional REFHE / MagicBlock Account Ownership

- Reported issue: legacy confidential payout execution deserialized optional companion accounts when `lamports > 0`.
- Fix: optional REFHE and MagicBlock companion accounts must be owned by the PrivateDAO program before deserialization and status checks.

### Voter Weight Expiry Window

- Reported issue: the Realms voter-weight record expiry was very short.
- Fix: expiry now uses `VOTER_WEIGHT_EXPIRY_SLOTS = 10_000` instead of an inline `100`, reducing operational churn while keeping bounded freshness.

### Integer Square Root Arithmetic

- Reported issue: `isqrt` used native-width addition.
- Fix: the Newton step now performs the intermediate addition in `u128`.

## Reviewed But Not Claimed As Fully Solved

### Quorum Semantics

PrivateDAO currently defines quorum as a reveal-participation threshold over committed votes. That is a product/governance design choice, not silently changed in this patch because changing it would reinterpret existing proposals. Stronger denominator snapshots remain a separate policy/versioning path.

### ZK Verification Claims

The strict V2 path already distinguishes threshold-attested evidence from true cryptographic verifier CPI. This patch does not claim a new verifier CPI integration. The current security posture remains: threshold attestation is operational enforcement; true cryptographic verification requires a verifier program/source-verifiable receipt path.

## Verification

Use:

```bash
npm run verify:security-remediation
```

This gate checks the concrete remediation patterns above and is included in the broader validation flow.
