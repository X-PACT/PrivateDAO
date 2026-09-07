# Auction RPC and State-Propagation Diagnostic

Status: `RPC_AND_PERMISSION_VISIBILITY_VERIFIED`

No Rust business logic was changed in this diagnostic.

## Endpoints actually used

- Base HTTP: `https://api.devnet.solana.com`
- Base WebSocket pairing: `wss://api.devnet.solana.com`
- ER HTTP: not used in this flow
- ER WebSocket: not used in this flow
- TEE HTTP origin: `https://devnet-tee.magicblock.app`
- TEE authenticated HTTP: `https://devnet-tee.magicblock.app?token=<redacted>`
- TEE authenticated WebSocket: `wss://devnet-tee.magicblock.app?token=<redacted>`

The Base RPC is the public Solana Devnet endpoint. Private-runtime instructions are sent only through the authenticated TEE connection.

## Connection by step

| Step | Connection |
|---|---|
| initialize | Base |
| authorize bidders | Base |
| activate | Base |
| delegate | Base, validator `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo` |
| init_permission | authenticated TEE |
| set_private | authenticated TEE |
| submit_private_bid | authenticated TEE, one connection per bidder |
| close | authenticated TEE |
| commit/undelegate | authenticated TEE |

## Propagation observations

After `init_permission`, polling used bounded exponential backoff. Observed:

- TEE permission owner: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- TEE permission data length: `68`
- TEE session owner: auction program
- Base permission: `null`
- Base session owner: delegation program

After `set_private`, polling observed:

- TEE permission owner: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- TEE permission data length: `167`, the expected size for the authority plus two bidder members
- Base permission: `null`

The bid was submitted only after this state was visible. The failure remained unchanged.

## Sequential runs

Three runs were executed sequentially, never in parallel, using fresh auction/session PDAs and the public Base RPC:

- Run 1: permission propagation passed; first private bid failed with `InvalidWritableAccount`.
- Run 2: permission propagation passed; first private bid failed with `InvalidWritableAccount`.
- Run 3: timed out in the Base setup phase; it did not reach permission or bidding.

Raw redacted run log: `docs/magicblock/AUCTION_RPC_TIMING_DIAGNOSTIC_20260810.log`

## Root cause isolated

`SubmitPrivateBid` declares `config` as writable in `programs/privatedao-auction/src/lib.rs`, although the handler only reads it. The ordered accounts are `bidder`, `config`, `session`, `authorization`; the runtime error identifies account index 1, matching `config`.

The delegated `session` is the state being written. The non-delegated `config` must not be included as writable in the private-runtime transaction. This is an account-meta/program declaration issue, not endpoint routing or state-propagation timing.

No Rust change was made pending owner approval of this isolated finding.
