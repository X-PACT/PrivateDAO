# Devnet Canary Report

- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- primary rpc: `https://api.devnet.solana.com`
- fallback rpc: `https://api.devnet.solana.com`
- primary healthy: yes
- fallback healthy: yes
- anchor accounts present: yes
- unexpected failures: 0

## RPC Health

- primary slot: 453650616
- primary blockhash: `EQTgdaiL7FKaFMQhrzE5F2zzcumNih8yGftsTt96BjBT`
- primary version latency: 1182 ms
- primary blockhash latency: 225 ms
- fallback slot: 453650615
- fallback blockhash: `EQTgdaiL7FKaFMQhrzE5F2zzcumNih8yGftsTt96BjBT`
- fallback version latency: 1009 ms
- fallback blockhash latency: 221 ms

## Anchor Checks

- program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | exists: yes | owner: `BPFLoaderUpgradeab1e11111111111111111111111` | lamports: 1141440 | data length: 36
- verification-wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD` | exists: yes | owner: `11111111111111111111111111111111` | lamports: 49697768678 | data length: 0
- dao: `FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx` | exists: yes | owner: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | lamports: 2352480 | data length: 210
- treasury: `AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c` | exists: yes | owner: `11111111111111111111111111111111` | lamports: 150000000 | data length: 0
- proposal: `AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP` | exists: yes | owner: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` | lamports: 10565280 | data length: 1390
- governance-mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt` | exists: yes | owner: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | lamports: 3563520 | data length: 384
- pdao-token-account: `F4q77ZMJdC7eoEUw3CCR7DbKGTggyExjuMGKBEiM2ct4` | exists: yes | owner: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` | lamports: 2074080 | data length: 170

## Governance Mint Supply

- mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- ui amount: `1000000`
- decimals: `9`

## Interpretation

This read-only canary checks live Devnet RPC health and canonical PrivateDAO anchors without mutating protocol state. It exists to provide a sustainable operational signal between heavier multi-wallet stress runs.
