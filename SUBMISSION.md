# PrivateDAO — Private Voting Infrastructure for Solana DAOs

**Solana Graveyard Hackathon 2026**
Tracks: DAOs (Realms) · Migration (Sunrise) · Overall (Solana Foundation)

---

## The Problem We're Solving

DAOs didn't die because of bad UX. They died because of a structural flaw:
**every vote is visible the moment it's cast.**

This creates three attack vectors that kill legitimate governance:

**1. Vote buying** — A whale watches incoming votes in real time. When a proposal is losing, they buy enough votes to flip it in the final hour. This happened repeatedly in Compound, MakerDAO, and Uniswap governance. It's actively happening on Solana DAOs today.

**2. Whale intimidation** — Small holders see a major token holder vote YES. They flip their own vote to match — not because they agree, but because they assume the whale knows something. The final tally looks like consensus. It wasn't.

**3. Treasury front-running** — A proposal to buy Token X starts passing. Bots see it and buy ahead of the treasury. The DAO pays a worse price. MEV extracts value from every treasury action.

**None of this is fixable with better UI.** The root cause is architectural: public voting.

---

## The Solution: Commit-Reveal Voting

PrivateDAO implements **commit-reveal voting** — the proven cryptographic primitive for binding someone to a vote without revealing it.

### How It Works

**Phase 1 — Commit (voting open)**
```
commitment = sha256(vote_byte || salt_32_bytes || voter_pubkey_32_bytes)
```
The voter computes this hash client-side and submits it on-chain. **Nobody — not the DAO admin, not a validator, not a full node operator — can determine the vote from the hash.**

During this entire phase, the on-chain state shows:
```
Commits: 127    YES: 0    NO: 0
```
The tally is invisible. Zero bandwagon effect.

**Phase 2 — Reveal (after voting ends)**

Voters submit their plaintext `(vote, salt)`. The program recomputes:
```
sha256(vote_byte || salt || voter_pubkey) == stored_commitment
```
If it matches, the vote is counted. Any mismatch is rejected. The 32-byte salt makes brute-force impossible (2^256 combinations).

**Phase 3 — Finalize + Execute (anyone calls after reveal window)**

Final tally is published. Treasury action executes automatically via CPI after the timelock expires.

### Security Properties

| Attack | Public Voting | PrivateDAO |
|--------|--------------|------------|
| Real-time tally tracking | ✅ Trivial | ❌ Impossible during commit |
| Vote buying by watching tally | ✅ Common | ❌ No tally to watch |
| Whale intimidation | ✅ Systemic | ❌ No visible pressure |
| Treasury MEV / front-running | ✅ Rampant | ❌ Action hidden until finalize |
| Replay commitment to another proposal | ✅ Possible | ❌ Voter pubkey in preimage |
| Vote-weight manipulation after commit | ✅ Common | ❌ Weight snapshotted at commit |

---

## Technical Architecture

### On-Chain Program (Anchor / Rust)

```
programs/private-dao/src/lib.rs
```

**State accounts:**

| Account | Size | Purpose |
|---------|------|---------|
| `Dao` | 210B | DAO config, quorum, token mint, voting mode |
| `Proposal` | 1,390B | Title, timing, tally, treasury action |
| `VoterRecord` | 157B | Commitment hash + weight snapshot |
| `VoteDelegation` | 122B | Private delegation record |
| `VoterWeightRecord` | 164B | Realms-compatible plugin record |

**Instructions:**

| Instruction | Auth | Description |
|-------------|------|-------------|
| `initialize_dao` | Authority | Create a new private DAO |
| `migrate_from_realms` | Authority | Mirror Realms DAO config |
| `create_proposal` | Authority | Proposal with optional treasury action |
| `cancel_proposal` | Authority | Kill a proposal during voting |
| `commit_vote` | Voter | Submit commitment hash |
| `delegate_vote` | Delegator | Grant weight to delegatee (private) |
| `commit_delegated_vote` | Delegatee | Commit with own + delegated weight |
| `reveal_vote` | Voter / Keeper | Prove vote + receive SOL rebate |
| `finalize_proposal` | Anyone | Compute result, set timelock |
| `veto_proposal` | Authority | Block execution during timelock |
| `execute_proposal` | Anyone | Move treasury funds after timelock |
| `deposit_treasury` | Anyone | Fund the DAO treasury |
| `update_voter_weight_record` | Voter | Realms plugin: update weight |

### Commitment Scheme

```
preimage = vote_byte (1) || salt (32) || voter_pubkey (32) = 65 bytes
commitment = sha256(preimage) stored as [u8; 32] in VoterRecord
```

`voter_pubkey` in the preimage prevents replay attacks: without it, voter B could copy voter A's commitment and reveal with the same salt, double-counting one vote. With the pubkey, commitment is voter-specific and non-transferable.

### Voting Modes

**TokenWeighted** — weight = raw token balance. Standard governance.

**Quadratic** — weight = √(token balance). Anti-whale: a holder with 10,000 tokens gets √10,000 = 100 weight, not 10,000.

**DualChamber** — BOTH of these must independently clear their threshold:
- Capital chamber: token-weighted (whales matter)
- Community chamber: quadratic (broad participation matters)

A whale can't rubber-stamp a treasury withdrawal — they need community support. A small group can't raid the treasury — they need capital buy-in.

### Treasury Execution (Fully Wired)

```rust
TreasuryActionType::SendSol => {
    transfer(CpiContext::new_with_signer(..., signer_seeds), amount)?;
}
TreasuryActionType::SendToken => {
    token::transfer(CpiContext::new_with_signer(..., signer_seeds), amount)?;
}
```

The treasury is a PDA owned by the program (`seeds = ["treasury", dao_pubkey]`). Only a passed + timelock-expired proposal can move funds. No admin key, no multisig.

### Reveal Incentive (SOL Rebate)

Non-reveals count as abstentions. To prevent voter drop-off, `reveal_vote` pays 0.001 SOL to the revealer:

```rust
const REVEAL_REBATE_LAMPORTS: u64 = 1_000_000; // 0.001 SOL
```

Voters are paid to participate in governance finality. Keepers earn the rebate when revealing on behalf of an absent voter.

### Keeper Auto-Reveal

At commit time, a voter can authorize a keeper:

```typescript
await commitVote(commitment, keeper.publicKey)

// If voter doesn't return — keeper can reveal with the voter's salt:
await revealVote(vote, salt)  // signed by keeper
```

The keeper cannot change the vote. Only the voter holds the salt. The keeper's incentive: the 0.001 SOL rebate. The voter's incentive: their vote counts even if they're unavailable.

---

## Realms Integration (DAOs Track)

PrivateDAO implements the `spl-governance-addin-api` VoterWeightRecord interface exactly:

```rust
#[account]
pub struct VoterWeightRecord {
    pub realm:                 Pubkey,         // matches Realms layout
    pub governing_token_mint:  Pubkey,
    pub governing_token_owner: Pubkey,
    pub voter_weight:          u64,
    pub voter_weight_expiry:   Option<u64>,    // 100-slot expiry
    pub weight_action:         Option<u8>,
    pub weight_action_target:  Option<Pubkey>,
    pub reserved:              [u8; 8],
}
```

Any existing Realms DAO can add PrivateDAO as a voter weight plugin. The `update_voter_weight_record` instruction returns the correct weight (token-weighted, quadratic, or quadratic for DualChamber) with a 100-slot expiry.

**Integration steps for an existing Realms DAO:**
1. Add PrivateDAO program as a VoterWeight plugin in Realms settings
2. Members call `update_voter_weight_record` before each proposal
3. Private commit-reveal voting proceeds through PrivateDAO
4. Results are recorded in the VoterWeightRecord that Realms reads

---

## Migration Tool (Sunrise Track)

`migrations/migrate-realms-dao.ts` migrates any existing Realms DAO to PrivateDAO in one transaction:

```bash
yarn ts-node migrations/migrate-realms-dao.ts \
  --governance <REALMS_GOVERNANCE_PUBKEY> \
  --name "MyDAO-Private" \
  --mint <GOVERNANCE_TOKEN_MINT> \
  --quorum 51 \
  --reveal-window 86400
```

The migration:
- Verifies the governance account exists on-chain
- Creates a PrivateDAO with matching governance token
- Records the source Realms governance pubkey in `Dao.migrated_from_realms`
- Outputs a machine-readable migration report JSON

**Non-destructive:**
- No treasury funds move
- No existing proposals are cancelled
- No token migration required
- Same governance token, new voting mechanism

---

## Running It

### Local Development (no devnet needed)

```bash
# Terminal 1: start local validator
solana-test-validator --reset

# Terminal 2: build and test
yarn install
anchor build
anchor test -- --grep "demo"   # full demo: DualChamber, delegation, keeper, timelock
anchor test -- --grep "Full flow"  # integration test with timing
```

### Deploy to Devnet

```bash
# Quick setup
bash scripts/setup-devnet.sh

# Full deploy (build + deploy + demo)
./deploy.sh

# Or step by step:
solana config set --url devnet
solana airdrop 2
anchor build
anchor deploy

# Create a DAO
yarn create-dao -- --name "MyDAO" --quorum 51 --mode dual

# Fund treasury
yarn deposit -- --dao <DAO_PDA> --amount 1.0

# Full governance flow
yarn create-proposal -- --dao <DAO_PDA> --title "Allocate 0.1 SOL for marketing"
yarn commit -- --proposal <PROPOSAL_PDA> --vote yes
yarn reveal -- --proposal <PROPOSAL_PDA>
yarn finalize -- --proposal <PROPOSAL_PDA>
yarn execute -- --proposal <PROPOSAL_PDA>
```

---

## Design Decisions

### Why commit-reveal and not ZK proofs?

ZK proofs give stronger privacy but require a circuit for vote tallying. Commit-reveal is the proven primitive — it's what Ethereum's ENS used for name registration auctions. It provides the core guarantee (tally hidden during voting) with well-understood tradeoffs.

The architecture is ZK-ready: replace `commit_vote` + `reveal_vote` with a single `submit_zk_vote` that verifies a proof. The `VoterRecord` commitment field becomes the nullifier. Everything else stays the same.

### Weight snapshotted at commit time

Preventing "buy tokens → vote → sell immediately" attacks. The snapshot makes vote weight permanent from the moment of commitment.

### Quorum uses reveal_count / commit_count

Not reveal_count / total_holders, because tracking total holders on-chain is expensive. Non-reveals count as abstentions. If you care enough to commit, you should care enough to reveal. The SOL rebate makes this economically rational.

---

## Honest Limitations

- **Reveal friction** — voters must return after voting closes. Keeper mechanism + SOL rebate help, but it's still two steps.
- **Timing correlation** — sophisticated observers watching commit transaction timing could potentially infer voting patterns. Full privacy needs ZK.
- **Quadratic Sybil risk** — splitting tokens across wallets games quadratic mode. A KYC/Sybil-resistance layer is a natural plugin point.

---

## What This Unlocks

PrivateDAO isn't a feature. It's infrastructure. The commit-reveal primitive composes:

- **Private grants** — members vote on fund allocation without recipient lobbying
- **Anonymous whistleblowing** — DAO members vote to investigate without retaliation
- **Confidential M&A** — protocol acquires another protocol without market movement
- **Anti-cartel elections** — leadership votes without coalition pressure

Any DAO on Solana can adopt it today.

---

## License

MIT

---

*Built for Solana Graveyard Hackathon 2026*
*Targeting: DAOs track (Realms) · Migration track (Sunrise) · Overall (Solana Foundation)*
