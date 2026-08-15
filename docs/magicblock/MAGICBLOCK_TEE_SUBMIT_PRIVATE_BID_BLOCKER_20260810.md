# MagicBlock TEE SubmitPrivateBid Differential

Status: `MAGICBLOCK TEE RUNTIME BLOCKER`

## Program and environment

- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Local artifact: `target/deploy/privatedao_auction.so`
- Local artifact SHA-256: `e049ce9ef5b074746f0a0e635e78b37730dd379d5039d0afc7ba1d005af7546c`
- Local artifact size: `435920` bytes
- Deployed Devnet account size: `436624` bytes; local artifact prefix comparison passes, with 704 bytes account padding
- SDK: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2`
- Permission program: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- Delegation program: `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`
- TEE validator: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`
- Tested TEE endpoints: `https://devnet-tee.magicblock.app` and `https://devnet-tee-as.magicblock.app`
- Base endpoint: `https://api.devnet.solana.com`

## Source and IDL

`programs/privatedao-auction/src/lib.rs` contains:

```rust
pub struct SubmitPrivateBid<'info> {
    pub bidder: Signer<'info>,
    pub config: Account<'info, AuctionConfig>,
    #[account(mut)]
    pub session: Account<'info, AuctionSession>,
    pub authorization: Account<'info, BidderAuthorization>,
}
```

Anchor-generated IDL confirms the same ordered metadata:

```text
bidder: signer, read-only
config: read-only
session: writable
authorization: read-only
```

## Exact observed behavior

The E2E creates a fresh auction, authorizes two funded bidder wallets, activates, delegates to the TEE validator, authenticates the wallets, creates the private permission, and reaches permission state lengths 68 and 167 bytes.

Base simulation of the exact read-only bid instruction:

```text
Instruction: SubmitPrivateBid
consumed 6658 of 200000 compute units
success
```

TEE execution of the same logical instruction and account order:

```text
Anchor error code: 2000
Error message: A mut constraint was violated
```

The transaction metadata logged by the client was:

```text
bidder         signer=true  writable=false
config         signer=false writable=false
session        signer=false writable=true
authorization  signer=false writable=false
```

Control diagnostic: changing only the config meta to writable on the TEE caused the instruction to reach the handler and return:

```text
Instruction: SubmitPrivateBid
Error Code: DeadlinePassed (6007)
```

That control is diagnostic only and is not part of the product path.

## Commands used

```text
anchor idl build -p privatedao_auction --provider.cluster devnet --out /tmp/privatedao-auction-generated-idl.json
bash scripts/build-auction-sbf.sh
solana program dump 4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd /tmp/auction-program-dump.so --url https://api.devnet.solana.com
cmp -n 435920 target/deploy/privatedao_auction.so /tmp/auction-program-dump.so
node scripts/run-auction-devnet-e2e.mjs
```

The E2E uses `AUCTION_SOLANA_RPC`, `AUCTION_TEE_RPC`, and paired `AUCTION_TEE_WS_RPC`; no private endpoint token is recorded here.

## Conclusion

The Base Layer, source, generated IDL, and client wire metadata agree. The TEE path does not. This is an external MagicBlock TEE runtime interpretation/cache/permission-propagation issue, not a reason to re-add `mut` to `config` or weaken the product contract.

Required external action: MagicBlock must inspect the TEE execution/cache for program `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd` and explain why read-only `config` produces `ConstraintMut` while Base simulation succeeds.

No Mainnet deployment or production mutation occurred.
