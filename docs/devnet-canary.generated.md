# Devnet Canary Report

- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- primary rpc: `https://api.devnet.solana.com`
- fallback rpc: `https://solana-rpc.rpcfast.com?api_key=REDACTED`
- primary healthy: yes
- fallback healthy: yes
- anchor accounts present: yes
- unexpected failures: 0

## RPC Health

- primary slot: 499573392
- primary blockhash: `6RDjkTw8FLhELYue9NjswqV5eW5Uk9K6msSVwPf77F33`
- primary version latency: 772 ms
- primary blockhash latency: 100 ms
- fallback slot: 447669826
- fallback blockhash: `6JWZFqkq4w8jdVsnBzeFj11RcKkKTn2HH6zf9ss1oQ4A`
- fallback version latency: 354 ms
- fallback blockhash latency: 415 ms

## Anchor Checks

- program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | exists: yes | owner: `BPFLoaderUpgradeab1e11111111111111111111111` | lamports: 1141440 | data length: 36
- verification-wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD` | exists: yes | owner: `11111111111111111111111111111111` | lamports: 12854986 | data length: 0
- dao: `FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx` | exists: yes | owner: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | lamports: 2352480 | data length: 210
- treasury: `AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c` | exists: yes | owner: `11111111111111111111111111111111` | lamports: 150000000 | data length: 0
- proposal: `AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP` | exists: yes | owner: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | lamports: 10565280 | data length: 1390
- governance-mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt` | exists: yes | owner: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | lamports: 3563520 | data length: 371

## Governance Mint Supply

- mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- ui amount: `1000000`
- decimals: `9`
- status: `captured`

## Interpretation

This read-only canary checks live legacy Devnet RPC health and canonical archived PrivateDAO anchors without mutating protocol state. The current PDAO Token-2022 mint is on Testnet, so it is intentionally excluded from this legacy Devnet account-presence gate.
