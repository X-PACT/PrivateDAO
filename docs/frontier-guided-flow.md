# PrivateDAO Frontier Guided Flow

PrivateDAO now exposes one reviewer-friendly flow for the core product story:

1. **Create proposal**
   Create a confidential salary, bonus, or grant proposal against a DAO without placing the full recipient sheet on-chain. The proposal binds aggregate amount, recipient count, manifest hashes, settlement recipient, and any optional REFHE or MagicBlock inputs.

2. **Commit vote**
   Commit a hidden vote hash from a governance-token wallet. The commitment binds `vote || salt || proposal || voter`, so the vote remains private during the commit window while still being replay-safe and proposal-bound.

3. **Reveal and finalize**
   Reveal the original vote and salt after the commit window closes. Then finalize through the normal or `zk_enforced` path depending on the proposal's receipt state and policy.

4. **Execute treasury**
   Treasury execution remains blocked until:
   - the proposal is finalized,
   - the timelock has cleared,
   - and any confidential execution boundary is satisfied.

## Where Each Frontier Layer Fits

- **ZK**
  ZK companion proofs and proposal-bound proof anchors harden reviewability and the `zk_enforced` finalize path. They do not bypass wallet signatures or governance timing.

- **REFHE**
  REFHE is used when a confidential payroll, bonus, or grant flow needs encrypted evaluation before treasury release.

- **MagicBlock**
  MagicBlock is used for confidential token payout plans that should not execute until the proposal-bound private-payment corridor is settled.

- **RPC Fast / Read Node**
  The product surface reads runtime, proposal, and operations state through the backend-indexer path when available, giving reviewers and operators a stronger read experience without changing execution authority.

## Proposal-Aware Activation Rules

- **ZK** becomes stronger when the proposal carries the canonical proof path, parallel receipts, or a `zk_enforced` mode.
- **REFHE** is relevant only when the proposal carries a confidential payroll, bonus, or grant payout plan that needs encrypted evaluation.
- **MagicBlock** is relevant only when the confidential payout asset is token and the proposal has a private-payment corridor bound to it.
- **RPC Fast / Read Node** improves the read path whenever the backend-indexer route is available, but it does not change who can sign or execute treasury actions.

## Honest Boundary

This flow is live on Devnet and reviewer-ready. It does **not** claim:

- real-funds mainnet clearance,
- completed external audit,
- completed multisig cutover,
- or source-verifiable receipt closure from every external system.

Those remain documented launch blockers until they are actually closed with evidence.

## Dedicated V3 Proof

The original lifecycle proof remains live, and the repository now also carries a dedicated V3 Devnet packet for:

- `Governance Hardening V3`
- `Settlement Hardening V3`

Use [`test-wallet-live-proof-v3.generated.md`](test-wallet-live-proof-v3.generated.md) when you need the additive hardening path specifically, rather than only the baseline treasury execution proof.
