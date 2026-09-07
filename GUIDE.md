<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# PrivateDAO Operator Guide

This is the longer walk-through for someone actually running the repo, not a pitch deck.

## Current deployment snapshot

- Network: Solana devnet
- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Explorer: https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet

## What the protocol does

1. DAO authority creates a DAO with a voting mode and timelock policy.
2. Any wallet holding the DAO governance token can create proposals, optionally with a treasury action.
3. Token holders commit vote hashes during the voting window.
4. Voters or approved keepers reveal after `voting_end`.
5. Anyone finalizes after `reveal_end`.
6. If passed, anyone executes after the timelock unless authority vetoes first.

## Voting modes

- `TokenWeighted`: raw SPL token balance
- `Quadratic`: integer square root of token balance
- `DualChamber`: token-weighted capital threshold and quadratic community threshold must both pass

## Treasury actions

- `SendSol`: fully executed on-chain
- `SendToken`: fully executed on-chain with mint and ownership checks
- `CustomCPI`: event-only by design in the current version

That last point matters. The repo does not currently expose arbitrary CPI execution from governance, and that is intentional.

## Local run

```bash
yarn install
solana-test-validator --reset
anchor build
anchor test
```

Useful targeted runs:

```bash
anchor test -- --grep "PrivateDAO"
anchor test -- --grep "Full flow"
anchor test -- --grep "demo"
```

## Devnet run

Configure wallet and RPC:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export ALCHEMY_API_KEY="<alchemy-key>"
solana config set \
  --keypair "$ANCHOR_WALLET" \
  --url "https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
```

Fund:

```bash
bash scripts/fund-devnet.sh 2
bash scripts/check-rpc-health.sh
```

Deploy:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

## Script flow

Create a DAO:

```bash
yarn create-dao -- --name "MyDAO" --quorum 51 --mode dual
```

Deposit treasury SOL:

```bash
DAO_PDA="$DAO_PDA" yarn deposit -- --dao "$DAO_PDA" --amount 1.0
```

Create a proposal:

```bash
DAO_PDA="$DAO_PDA"
RECIPIENT_WALLET="$RECIPIENT_WALLET"

yarn create-proposal -- \
  --dao "$DAO_PDA" \
  --title "Fund community work: 0.1 SOL" \
  --treasury-recipient "$RECIPIENT_WALLET" \
  --treasury-amount 0.1
```

Commit:

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn commit -- --proposal "$PROPOSAL_PDA" --vote yes
```

Delegate first, then commit as the delegatee:

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" DELEGATEE="$DELEGATEE" DELEGATOR="$DELEGATOR"
yarn delegate -- --proposal "$PROPOSAL_PDA" --delegatee "$DELEGATEE"
yarn commit -- --proposal "$PROPOSAL_PDA" --vote yes --delegator "$DELEGATOR"
```

Reveal:

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn reveal -- --proposal "$PROPOSAL_PDA"
```

Finalize and execute:

```bash
PROPOSAL_PDA="$PROPOSAL_PDA"
yarn finalize -- --proposal "$PROPOSAL_PDA"
yarn execute -- --proposal "$PROPOSAL_PDA"
```

## Realms note

This repo has a migration-oriented Realms path, not a claim of full Realms replacement.

What exists:

- `migrate_from_realms`
- `migrations/migrate-realms-dao.ts`
- `Dao.migrated_from_realms`
- a Realms-style `VoterWeightRecord`

What still takes more work:

- native proposal lifecycle coupling to Realms proposals
- automatic execution bridging between Realms and PrivateDAO

## Operational cautions

- Commit-reveal hides the vote, not the fact that a wallet participated
- Unrevealed votes do not count
- The reveal rebate helps but does not remove liveness risk entirely
- Devnet behavior is useful for iteration, not proof of mainnet readiness
