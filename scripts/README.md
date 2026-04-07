# Scripts Structure

The script surface is intentionally large because the repo ships protocol tooling, reviewer automation, evidence builders, and verification gates together.

## Main Clusters

- `build-*`
  - Rebuild generated reviewer, runtime, readiness, and submission artifacts.
- `verify-*`
  - Validate frontend coverage, runtime evidence, cryptographic integrity, registry consistency, and release surfaces.
- `record-*`
  - Append wallet and device capture results into the runtime registries.
- `configure-*`, `settle-*`, `inspect-*`
  - Operate protocol features such as confidential payouts, MagicBlock corridors, REFHE envelopes, and ZK-enforced proposals.
- `configure-security-policy-v2.ts`, `snapshot-proposal-policy-v2.ts`, `record-proof-verification-v2.ts`, `record-settlement-evidence-v2.ts`
  - Operate the additive strict-mode security policy, object-level proposal policy snapshot, threshold-attested proof verification, and replay-safe settlement evidence paths.
- `build-confidential-manifest.ts`, `verify-confidential-manifest.ts`
  - Encrypt confidential payout fixtures with AES-256-GCM and verify that committed ciphertext artifacts do not leak known plaintext terms.
- `run-*`
  - Start local operational services such as the read node or portable Anchor verification suite.
- `capture` shell scripts
  - Generate or fill runtime capture templates for MagicBlock, real-device, and ZK-enforced flows.

## Navigation Rule

If a script name starts with `build-` or `verify-`, it usually belongs to the reviewer and release surface rather than the on-chain protocol flow itself.
