# Program ID Reconciliation

Checked on 2026-09-17 before any key synchronization or deployment action.

| Value | Evidence |
| --- | --- |
| Canonical source and Anchor Testnet ID | `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva` |
| Testnet account | Exists and is executable; owner is the upgradeable BPF loader |
| Local `target/deploy` keypair public ID | `6Df8DXkg1R8w1APN9HDTh7rTb3ucpVYkBaNp4SzNSATp` |
| Local keypair on Testnet | No account found |
| Local keypair on Devnet | No account found |

`check:mainnet` correctly stops at the Anchor key mismatch. The local keypair
must not be synchronized automatically: doing so could change the identity
used for a future deployment. The canonical Testnet program remains unchanged,
and no signing or deployment was performed by this check.
