# Changelog

## v2 — Revolutionary additions

### New features (all on-chain, fully tested)

**Vote Delegation** (`delegate_vote` + `commit_delegated_vote`)
- A token holder can delegate their voting weight to another address for a specific proposal
- The delegatee votes with combined weight (own tokens + delegated tokens)
- Privacy is fully preserved — tally still shows 0/0 during commit phase
- The delegator's preference stays hidden even from the delegatee
- **No other Solana DAO tool supports private delegation**

**Timelock Execution** (split `finalize_proposal` / `execute_proposal`)
- `finalize_proposal` — computes pass/fail, sets `execution_unlocks_at` timer
- `execute_proposal` — permissionless, fires treasury CPI after delay
- The delay is the guardian window: community can see a passed proposal and raise issues before funds move
- Mirrors: Compound Governor Bravo, Aave Governance, OpenZeppelin TimelockController
- Configurable per-DAO via `execution_delay_seconds`

**Cancel Proposal** (`cancel_proposal`)
- Authority can cancel any proposal while voting is still open
- Cancelled proposals are frozen — no commit, reveal, or execute possible
- Essential safety mechanism for governance emergencies

### Updated: VotingConfig modes
All three modes now fully independent at finalize time:
- `TokenWeighted` — yes_capital > no_capital
- `Quadratic`     — yes_community > no_community
- `DualChamber`   — BOTH chambers must independently clear their threshold

### Updated: Dao state
- Added `execution_delay_seconds: i64` — timelock duration per DAO

### Updated: Proposal state
- Added `execution_unlocks_at: i64` — when treasury can execute
- Added `is_executed: bool` — prevents double execution
- Added `Cancelled` to `ProposalStatus` enum

### New: VoteDelegation account
- PDA: `[b"delegation", proposal_key, delegator_key]`
- Tracks: delegator, delegatee, delegated_capital, delegated_community, is_used

### New events
- `ProposalCancelled { proposal, cancelled_by }`
- `VoteDelegated { proposal, delegator, delegatee, delegated_weight }`
- `ProposalFinalized` now includes `execution_unlocks_at`

## v2.1 — Submission hardening

- Added CI workflow for Anchor build/test and repository verification script.
- Added robust devnet funding helper with retry/backoff and RPC rotation.
- Removed hardcoded Helius API key from workflow and switched to GitHub Secrets.
- Added contribution/security docs, PR template, CODEOWNERS, and release checklist.
- Added hackathon submission pack material in README and demo walkthrough section in docs page.
