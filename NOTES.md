# dev notes

## why commit-reveal and not ZK proofs?

shortest answer: ZK proofs would require a circuit for vote tallying and I
can't build that in 8 days. commit-reveal is the proven primitive for this —
it's what Ethereum's ENS used for name registration auctions, it works.

the reveal phase is a real tradeoff though. if a voter doesn't reveal, their
vote doesn't count. need to think about incentives. options:
1. SOL rebate on reveal (included in the code, needs wiring)
2. future vote eligibility gated on revealing past votes
3. punishment — lose governance token stake if you don't reveal
  (too harsh for first version, skip)

going with option 1 for now — just a comment in finalize_proposal.

## commitment scheme choices

```
sha256(vote_byte || salt_32_bytes || voter_pubkey)
         ^              ^                 ^
     1 byte         32 bytes          32 bytes
```

why include voter_pubkey? prevents an attack where the same commitment is
replayed by a different voter. without the pubkey:
  - voter A: commitment = sha256(YES || saltX)
  - voter B: copies commitment = sha256(YES || saltX)
  - both reveal with the same salt → double yes vote

with voter_pubkey in the preimage, the commitment only works for the original voter.

why 32-byte salt? brute force prevention. 1-byte salt = 256 possible values,
attacker can guess by trying all 256 sha256 combinations. 32 bytes = 2^256.

## the token weight snapshot issue

snapshotting token balance at commit time (not at finalize time) prevents:
  - voter buys 1000 tokens to influence proposal
  - votes
  - sells tokens immediately after
  - next proposal: tokens are gone but influence was exerted

the snapshot is stored in VoterRecord.vote_weight. the downside: if a voter's
tokens are locked in a vesting contract, they might not show up correctly.
TODO after hackathon: use a delegation registry instead of raw balance.

## quorum calculation

using reveal_count / commit_count instead of reveal_count / total_holders
because we don't track total holders on-chain (expensive).

the implication: if quorum = 51% and 100 people committed, need 51 reveals
to pass. unrevealed votes count as abstentions. this is fine and arguably
the right behavior — if you care enough to commit, you should care enough to reveal.

## Realms integration — how deep does it go?

Realms has a voter weight plugin interface. you implement:
```rust
pub fn update_voter_weight_record(ctx: Context<UpdateVoterWeightRecord>) -> Result<()>
```
and Realms calls it before counting votes on proposals.

the issue: our system has proposals separate from Realms' proposals. for a
real Realms plugin, we'd need to tie our proposal PDAs to Realms' proposal PDAs.
that's a bigger integration than what I can do in the remaining days.

current approach: PrivateDAO works standalone. Realms compatibility is shown
via the get_voter_weight_record instruction which follows the interface pattern.
the pitch to judges is: "here's the plugin pattern, Realms can integrate this."

## what breaks in production (honest list)

1. no treasury execution — the TreasuryAction struct is defined, finalize reads
   the passed flag, but the actual SOL/token transfer isn't wired in. would need
   a multisig CPI or just emit an event for frontend to handle.

2. no UI — pure Rust program + TypeScript tests. no frontend. for the demo
   I'll use CLI scripts. not ideal but fine for a hackathon.

3. timing attacks — even though the tally is hidden, an adversary watching
   commit transactions could potentially infer voting patterns from timing
   (who commits early vs late). this is a known limitation of commit-reveal.
   real fix: ZK proofs, where no timing correlation exists.

4. gas costs at scale — every voter creates a VoterRecord PDA. at 127 voters
   that's 127 account creations. fine for typical DAO sizes (<1000 members).
   at 10,000 members it gets expensive. pagination or compression would help.
