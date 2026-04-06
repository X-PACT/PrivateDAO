# Independent Verification Guide

This guide is for reviewers, judges, and auditors who want to verify PrivateDAO without trusting any summary alone.

The goal is to let an independent reviewer:

- set up the environment
- run the proposal lifecycle
- inspect transaction evidence
- verify treasury effects
- reproduce rejection paths

## 1. Environment Setup

Use the repository root for all commands below.

### Install prerequisites

- Solana CLI
- Anchor CLI `0.31.1`
- Rust stable
- Node.js
- npm or yarn

### Clone and install

```bash
git clone https://github.com/X-PACT/PrivateDAO.git
cd PrivateDAO
yarn install
```

### Configure wallet and cluster

For local verification:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
solana config set --keypair "$ANCHOR_WALLET" --url localhost
```

For devnet verification:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export ANCHOR_PROVIDER_URL="https://devnet.helius-rpc.com/?api-key=YOUR_KEY"
solana config set --keypair "$ANCHOR_WALLET" --url "$ANCHOR_PROVIDER_URL"
```

### Build the program

```bash
anchor build
```

### Check local validator capability

```bash
npm run verify:local-validator
```

### Start a local validator

In a separate terminal on an AVX2-capable host:

```bash
solana-test-validator --reset
```

### Optional deploy for local/manual operation

```bash
anchor deploy
```

### Optional deploy for devnet verification

```bash
anchor deploy --provider.cluster devnet
```

## 2. Reproduce The Lifecycle

The canonical lifecycle is:

```text
create proposal
→ commit
→ reveal
→ finalize
→ execute
```

### Fastest verifier path: use the captured devnet run

Open:

- `docs/live-proof.md`

This file contains:

- program ID
- DAO PDA
- treasury PDA
- proposal PDA
- real transaction hashes
- explorer links
- observed balance deltas

### Reviewer-visible local/demo path

Run:

```bash
npm run demo
```

Expected result:

- the test harness runs the lifecycle end to end
- proposal moves through commit, reveal, finalize, execute
- no duplicate execution is permitted

### Reviewer-visible devnet path

Run:

```bash
ANCHOR_PROVIDER_URL="https://devnet.helius-rpc.com/?api-key=YOUR_KEY" \
ANCHOR_WALLET="$HOME/.config/solana/id.json" \
npm run live-proof
```

Expected result:

- DAO is created
- treasury is funded
- proposal is created
- vote is committed
- vote is revealed
- proposal is finalized
- treasury action is executed
- transaction hashes are printed

## 3. Manual CLI Reproduction

These commands reproduce the real flow from repository scripts.

### Create DAO

```bash
yarn create-dao -- --name "VerifierDAO" --quorum 51 --mode dual
```

Expected output:

- DAO PDA
- treasury PDA
- transaction signature
- explorer link when running on devnet

### Deposit treasury

```bash
DAO_PDA="$DAO_PDA" yarn deposit -- --dao "$DAO_PDA" --amount 1.0
```

Expected output:

- deposit signature
- treasury funding confirmation

### Create proposal

```bash
DAO_PDA="$DAO_PDA"
RECIPIENT_PUBKEY="$RECIPIENT_PUBKEY"

yarn create-proposal -- \
  --dao "$DAO_PDA" \
  --title "Fund ops: 0.1 SOL" \
  --treasury-recipient "$RECIPIENT_PUBKEY" \
  --treasury-amount 0.1
```

Expected output:

- proposal PDA
- create-proposal signature

### Commit vote

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn commit -- --proposal "$PROPOSAL_PDA" --vote yes
```

Expected output:

- commit signature
- saved salt file under `~/.privatedao/salts/`

### Reveal vote

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn reveal -- --proposal "$PROPOSAL_PDA"
```

Expected output:

- reveal signature
- vote counted on-chain

### Finalize

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn finalize -- --proposal "$PROPOSAL_PDA"
```

Expected output:

- finalize signature
- proposal status becomes `Passed` or `Failed`

### Execute

```bash
PROPOSAL_PDA="$PROPOSAL_PDA" yarn execute -- --proposal "$PROPOSAL_PDA"
```

Expected output:

- execute signature
- treasury balance decreases by intended amount
- recipient balance increases by intended amount

## 4. Verify Treasury Effects

### SOL execution

Before execute:

```bash
TREASURY_PDA="$TREASURY_PDA" RECIPIENT_PUBKEY="$RECIPIENT_PUBKEY"
solana account "$TREASURY_PDA"
solana account "$RECIPIENT_PUBKEY"
```

After execute:

```bash
TREASURY_PDA="$TREASURY_PDA" RECIPIENT_PUBKEY="$RECIPIENT_PUBKEY"
solana account "$TREASURY_PDA"
solana account "$RECIPIENT_PUBKEY"
```

Expected result:

- treasury lamports decrease by the configured amount
- recipient lamports increase by the configured amount
- proposal `isExecuted = true`

### SPL token execution

For token transfers, verify:

- source token account mint
- destination token account mint
- source token owner is treasury PDA
- destination token owner is the configured recipient

Expected result:

- only the correctly wired token accounts succeed
- wrong mint, wrong owner, duplicate source/destination, or non-treasury source fail

## 5. Validate Protections

These are the minimum negative checks an independent reviewer should try.

### Execute twice

Attempt:

```bash
PROPOSAL_PDA="$PROPOSAL_PDA"
yarn execute -- --proposal "$PROPOSAL_PDA"
yarn execute -- --proposal "$PROPOSAL_PDA"
```

Expected result:

- first execute may succeed
- second execute must fail with an `AlreadyExecuted`-style rejection

Reference:

- `tests/full-flow-test.ts`

### Invalid reveal

Attempt:

- reveal with wrong salt
- reveal with wrong vote payload
- reveal by wrong signer

Expected result:

- reveal fails
- tally does not change

Reference:

- `tests/private-dao.ts`

### Wrong treasury

Attempt:

- execute with a treasury PDA derived from another DAO

Expected result:

- execution fails before state mutation
- `isExecuted` remains false

Reference:

- `tests/full-flow-test.ts`

### Wrong proposal/account relation

Attempt:

- use a voter record or delegation account from another proposal

Expected result:

- seed or relation check fails
- no state is consumed

Reference:

- `tests/private-dao.ts`

## 6. Explorer Proof

The repository already includes real devnet proof in:

- `docs/live-proof.md`

Example transaction hashes:

- deploy: `2CMEujY1CKnC8rH8BuLy4GvwYk3zfqMfAKaUjybcAvRhS1dnzg3Zd3GeMttBp4vkUbu69GkQtr3TWgbmBqGY8cyC`
- create-dao: `5mcyVi3SbZo4hvpVMjH2eZH8FYeywdbbPz4ArmE5wHXH5X9EnP6gSq76ogBWYWVkVUwzrCchPnSdhGV1mFb48s5Q`
- create-proposal: `E93ikMXVJbtvz8ewAHA2BasZPVKYyUXe3Jy88h3b3AQubm7PSYFMNtDveBkRts7uYodwzb8cGZSVDoneKF16X2L`
- commit: `3RMbrcYGx297hgcTrov9PqtUqM97ZFg6A21qxmepTboLQAoXov6toY2QTa8yU1i8zmQPvjR3ArNGpvR3jat79uTP`
- reveal: `5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5`
- finalize: `4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG`
- execute: `x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9`

Use the explorer links in `docs/live-proof.md` to independently inspect:

- proposal account
- DAO account
- treasury account
- each lifecycle transaction

## 7. Independent Verifier Checklist

An independent reviewer should be able to confirm all of the following:

- the program exists on devnet
- proposal lifecycle is on-chain rather than frontend-simulated
- commit and reveal are separate and enforced
- finalize is phase-gated
- execute is timelock-gated
- treasury execution moves the intended asset only once
- invalid reveal paths fail
- miswired treasury paths fail
- account substitution attempts fail

## 8. Honest Limits

- local validator startup may depend on the host environment
- devnet verification depends on RPC availability
- external audit completeness is not claimed here

This guide exists to reduce trust assumptions and make the repository independently verifiable.
