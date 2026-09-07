# PrivateDAO Testnet Architecture Migration

Date: 2026-04-19

## Current operating boundary

PrivateDAO is now operating as a live Solana Testnet product path.

The Devnet phase remains preserved as rehearsal evidence: it proved early wallet flows, stress behavior, generated packets, Android Solflare capture, and reviewer artifacts. The current public operating path should point judges, funders, and users to Testnet for live protocol execution.

## What moved to Testnet

- Anchor provider cluster is `testnet`.
- Canonical program id is preserved across localnet, Devnet history, and Testnet: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`.
- Web wallet provider now defaults to Testnet.
- Browser RPC resolution now uses Solana `clusterApiUrl("testnet")` so authenticated RPCFast keys never enter the browser bundle.
- Backend/indexer/telemetry paths use `RPC_FAST_*` and `SOLANA_RPC_URL` host secrets.
- Wallet adapter network now resolves from `NEXT_PUBLIC_SOLANA_NETWORK` and defaults to Testnet.
- Public governance UI copy now describes Create DAO, Create Proposal, Commit, Reveal, Finalize, and Execute as Testnet operations.
- Billing rehearsal now has a canonical Testnet route: `/services/testnet-billing-rehearsal`.
- The old `/services/devnet-billing-rehearsal` route is only a redirect alias.
- Solscan transaction helpers now generate Testnet explorer links by default.

## Testnet lifecycle proof

Reference packet: [`docs/testnet-lifecycle-rehearsal-2026-04-19.md`](testnet-lifecycle-rehearsal-2026-04-19.md)

Key facts:

- Program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Operator: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- DAO: `A92MLx8DZgVUeSTjCMVW59HFj7a1Yh2vwqs8CDxvtQZF`
- Proposal: `9F6NaCA6eaWJ31NWTMdsnA1Uk8vhxe8o2Q1fiHmtqzoN`
- Treasury: `EM11wvUYPpvNtHuzYA4onKtdpeHGjeKLMrSehi1xNcWE`
- Recipient: `AgVyjfYGGEtHeV65xe7dkXP2QTU2NRDtVjwJYMfsZWwP`
- Execute signature: `4pP21HhzVz5dgMPjXTNFXDLV2mup5xxXdBp8okAjk5vx164ZWe9WHwDXagJ6y8AipGgjzfSgFypeuZntWNEcZai7`

Verified result:

- proposal status: `Passed`
- executed: `true`
- commit count: `1`
- reveal count: `1`
- treasury delta: `5000000` lamports
- recipient delta: `5000000` lamports

## Devnet evidence preserved

The following Devnet artifacts remain valuable, but they are now historical rehearsal evidence rather than the primary operating network:

- 50-wallet rehearsal and adversarial reports
- browser-wallet runtime captures
- Android Solflare real-device capture
- generated operational evidence
- Devnet canary and latency records
- early MagicBlock / REFHE / ZK evidence packets

These should be described as "Devnet rehearsal history" or "transition evidence", not as the current public product network.

## Remaining production gates

Testnet-live does not mean Mainnet-ready. The remaining gates are:

- external audit completion
- multisig upgrade-authority custody closure
- production monitoring alert delivery
- broader real-device wallet runtime matrix
- source-verifiable MagicBlock / REFHE receipt publication
- final Mainnet cutover ceremony

## Reviewer wording

Recommended public wording:

> PrivateDAO is live on Solana Testnet with a preserved Anchor program id, wallet-first governance execution, public Testnet hashes, and a documented Devnet-to-Testnet transition trail. Devnet remains preserved as rehearsal evidence; the current operating path is Testnet while final audit, custody, monitoring, and Mainnet cutover gates are closed.

Avoid stale or overstated wording:

- describing the Testnet release as a Devnet surface
- claiming Mainnet readiness before the final release gates close
- implying real-fund production usage before Mainnet cutover
- reducing the product to a demo
