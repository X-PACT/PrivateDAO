# Test Wallet Live Proof V3

This packet captures two real Devnet flows executed with local test-only wallets outside git:

1. `Governance Hardening V3` with token-supply quorum and a dedicated reveal rebate vault
2. `Settlement Hardening V3` with a proposal-scoped settlement snapshot, REFHE settlement, and verified settlement evidence

## Context

- generated at: `2026-04-09T15:06:53.614Z`
- mode: `test-wallet-devnet-proof-v3`
- operator wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

## Governance Hardening V3

### Accounts

- DAO: `4cbohLbBBTao8Wo3oNdXZTx6VcdLVXDUBuKSzWoQAkgw`
- Governance mint: `7yYTRn8bzBupM7MgwGS1KaSQBy5y5yomXsWeGQ3HiJK`
- Treasury PDA: `CqNjLCND1qDhRVMQcjQ6MfLAVXaa2Pu9LAPFKg1nexHH`
- Proposal PDA: `DYrU5yZ22fmUQHeTXwgSoQtfBKo7e7ZLsHJxRzvWLh4i`
- Governance policy: `Cif6Nc1H1WAQXCaifztwP217oZ2Vsrs3tbV86oztU4Yn`
- Governance snapshot: `4SoBCzFqR5xF9EJzB3Fa33hPTGUNy4r8VuT6eNGiNz58`
- Reveal rebate vault: `9mDBnzVJnnTiwtHHBuSnsuHqzZ9LDm3UHcAGYk3yjjsb`
- Recipient wallet: `DTNcmMTWi1KFGVPzckZ396a5Ga6R9ngCXcbRR1VguCc6`

### Explorer links

- DAO: `https://solscan.io/account/4cbohLbBBTao8Wo3oNdXZTx6VcdLVXDUBuKSzWoQAkgw?cluster=devnet`
- Mint: `https://solscan.io/account/7yYTRn8bzBupM7MgwGS1KaSQBy5y5yomXsWeGQ3HiJK?cluster=devnet`
- Treasury: `https://solscan.io/account/CqNjLCND1qDhRVMQcjQ6MfLAVXaa2Pu9LAPFKg1nexHH?cluster=devnet`
- Proposal: `https://solscan.io/account/DYrU5yZ22fmUQHeTXwgSoQtfBKo7e7ZLsHJxRzvWLh4i?cluster=devnet`

### Transactions

- `createDao`: `3ncJuKRk1dbAm9QfxDRLNMgzQc2ECBFr9GYk7JACV3D47fxroi4hHbndRCU5VkNJrCXb3AQBsUwaow6ieqfP6x9H`
- Explorer: `https://solscan.io/tx/3ncJuKRk1dbAm9QfxDRLNMgzQc2ECBFr9GYk7JACV3D47fxroi4hHbndRCU5VkNJrCXb3AQBsUwaow6ieqfP6x9H?cluster=devnet`
- `initializeGovernancePolicyV3`: `Mo6cL9p8Hp93sitx3hjY9WrR7iE2pdnnSfEGL4tkHbqeZuoHg5f9up1i4SUSAc7DSpkQD3AdDcdLDFy6X6r8gYy`
- Explorer: `https://solscan.io/tx/Mo6cL9p8Hp93sitx3hjY9WrR7iE2pdnnSfEGL4tkHbqeZuoHg5f9up1i4SUSAc7DSpkQD3AdDcdLDFy6X6r8gYy?cluster=devnet`
- `fundRevealRebateVaultV3`: `3pc7saV5aWWkK9jzgxcvox4WpTW8Tnwch1ZTbfphJUodsZmusa8ttyPZMYGoAbzpSmuw6K5aLcgkGdjRRKyiPoA3`
- Explorer: `https://solscan.io/tx/3pc7saV5aWWkK9jzgxcvox4WpTW8Tnwch1ZTbfphJUodsZmusa8ttyPZMYGoAbzpSmuw6K5aLcgkGdjRRKyiPoA3?cluster=devnet`
- `deposit`: `5PLctwJyhswNQahhHWc6vqJsZpuE7mEMGu7BrSC7jueDFEAQV7cDvdeTUWazaADSSvNwE1f4ZXN7UjLRgifsEjwu`
- Explorer: `https://solscan.io/tx/5PLctwJyhswNQahhHWc6vqJsZpuE7mEMGu7BrSC7jueDFEAQV7cDvdeTUWazaADSSvNwE1f4ZXN7UjLRgifsEjwu?cluster=devnet`
- `createProposal`: `g1Tk8SiaP5w12kCXUCySSKUADme8h4jLBiuVT4UUbFAGeYvHsS7gVPgipUpUhv3LV2jnQkxjQ8jDduR68E2EqDS`
- Explorer: `https://solscan.io/tx/g1Tk8SiaP5w12kCXUCySSKUADme8h4jLBiuVT4UUbFAGeYvHsS7gVPgipUpUhv3LV2jnQkxjQ8jDduR68E2EqDS?cluster=devnet`
- `snapshotGovernancePolicyV3`: `LUmCuVZyL5Pup4HtNcs7zy7mc1gTaprmizMK7KZgCymHmQX58SwySps1KETdRCXuwMGXQ13ycsDQs4MjHvgrqvK`
- Explorer: `https://solscan.io/tx/LUmCuVZyL5Pup4HtNcs7zy7mc1gTaprmizMK7KZgCymHmQX58SwySps1KETdRCXuwMGXQ13ycsDQs4MjHvgrqvK?cluster=devnet`
- `commit`: `35fvSCguMsVCq4SYwsGG95P9GHmKEApcWpLV3q3xYRio5x1BZDU16aAe7xUoTxaezH5xKfjSLwofqivQv4Krf3QB`
- Explorer: `https://solscan.io/tx/35fvSCguMsVCq4SYwsGG95P9GHmKEApcWpLV3q3xYRio5x1BZDU16aAe7xUoTxaezH5xKfjSLwofqivQv4Krf3QB?cluster=devnet`
- `revealV3`: `3Mdfzzz8q5LaTt6NKLyYCcDyK8dFeu7jKNjPDX1XVdnF2QouqfQdxh8vRYqQBTfCYkjTwDgJhtP3P7rtAoGbZkVf`
- Explorer: `https://solscan.io/tx/3Mdfzzz8q5LaTt6NKLyYCcDyK8dFeu7jKNjPDX1XVdnF2QouqfQdxh8vRYqQBTfCYkjTwDgJhtP3P7rtAoGbZkVf?cluster=devnet`
- `finalizeV3`: `5A3dgKk9La54JVKDX3vDP27QmF6vcG58nLMdmMvz2X1bfxkciYD3gn6qNXPntW4B4ajctdQPaeDQm86vxa1Br1P5`
- Explorer: `https://solscan.io/tx/5A3dgKk9La54JVKDX3vDP27QmF6vcG58nLMdmMvz2X1bfxkciYD3gn6qNXPntW4B4ajctdQPaeDQm86vxa1Br1P5?cluster=devnet`
- `execute`: `2JXz4dZwR53BSfZwaQi3KsQYk6TkoK6YmYkPoDeYjyzeka5C2Nhmz5NihhQcZqxTLa4iwTH6ij9RSECSRmC7zMh3`
- Explorer: `https://solscan.io/tx/2JXz4dZwR53BSfZwaQi3KsQYk6TkoK6YmYkPoDeYjyzeka5C2Nhmz5NihhQcZqxTLa4iwTH6ij9RSECSRmC7zMh3?cluster=devnet`

### Observed invariants

- status: `Passed`
- `isExecuted = true`
- `eligibleCapital = 1000000000`
- `yesCapital = 1000000000`
- `revealCount = 1 / 1`
- voting end: `2026-04-09 15:06:04 UTC`
- reveal end: `2026-04-09 15:06:10 UTC`
- execution unlock: `2026-04-09 15:06:16 UTC`
- reveal rebate vault before: `0.0032 SOL`
- reveal rebate vault after: `0.0022 SOL`
- treasury before execute: `0.2000 SOL`
- treasury after execute: `0.1500 SOL`
- recipient before: `0.0050 SOL`
- recipient after: `0.0550 SOL`

## Settlement Hardening V3

### Accounts

- DAO: `3gKB8YFz5gD712LTApLqjWPgFwgz5tssy15G5fmg29fy`
- Treasury PDA: `79cyjf7hzaNF3iqVGrR8B595fa2hSrzJt1wynbJqYTtE`
- Proposal PDA: `4i2sCjJogN1xy3irRs1L5JdU1cJkWp2kK7XHA1oGE7z4`
- Security policy: `2aTmq1FdJjawLt1zRZiiSsVQpsepYzRveZUiDZxxPDXd`
- Governance policy: `6JZqP7ZH4nMu1FLxorH4MGXbdnyN2b94FAo1kXH3PsF8`
- Governance snapshot: `FCDJxgvszS5U6BTsPcBeVAY6hwgeYmqRbBdk2aBamAMa`
- Settlement policy: `3bdgSEkBqbzTAe7L5DVCtCR8As8PMkbodun8gLU83S5A`
- Settlement snapshot: `7dHmDvkoP8HcRvNWR1C4148kEUqjXRXsh88X8h1oFzwf`
- Payout plan: `9mEiU86iYW6zUwFoVvZtMLvTXuxW7rZ2hZ9VBqkLwXnp`
- REFHE envelope: `BjSTgHbRebyRdBDApdBVEJ8yJvDoWCi3yi3rZesDZF9C`
- MagicBlock corridor PDA: `98cRoG9LCPb3CRM5Fe5GA3hLLc2WvSHfLUmmkZFWnrQV`
- Settlement evidence: `CHuV39kjan3uPWtXjrvrvJSrgihxCikjAFT3yv7xtV9n`
- Settlement consumption record: `2LCsDsssyADLmq4mpD7BUjheiaiw7x6is5kWUZzYzq4y`
- Recipient wallet: `9bKBH1TFauMT7cYJ4YziuAnT5FJW8ikk8w3CSyyhFSMq`

### Explorer links

- DAO: `https://solscan.io/account/3gKB8YFz5gD712LTApLqjWPgFwgz5tssy15G5fmg29fy?cluster=devnet`
- Treasury: `https://solscan.io/account/79cyjf7hzaNF3iqVGrR8B595fa2hSrzJt1wynbJqYTtE?cluster=devnet`
- Proposal: `https://solscan.io/account/4i2sCjJogN1xy3irRs1L5JdU1cJkWp2kK7XHA1oGE7z4?cluster=devnet`
- Settlement evidence: `https://solscan.io/account/CHuV39kjan3uPWtXjrvrvJSrgihxCikjAFT3yv7xtV9n?cluster=devnet`
- Payout plan: `https://solscan.io/account/9mEiU86iYW6zUwFoVvZtMLvTXuxW7rZ2hZ9VBqkLwXnp?cluster=devnet`

### Transactions

- `fundRecipient`: `4wc6fTADGWKorycZLtR8A4hQoD7CX5dTTMRnefCXf2rdUNEqrWTutgqtj3M4JEy5fc2DnUCCz1k1toC85zChLfTo`
- Explorer: `https://solscan.io/tx/4wc6fTADGWKorycZLtR8A4hQoD7CX5dTTMRnefCXf2rdUNEqrWTutgqtj3M4JEy5fc2DnUCCz1k1toC85zChLfTo?cluster=devnet`
- `createDao`: `29sHWJKQjcSfj9fQChhfmSYZ2YZqyDreUXVmEP2sUPEJWCJSj8tCwYB2sjJKfTsxRGZ4pxAggzuEnzSQMJ32HE1i`
- Explorer: `https://solscan.io/tx/29sHWJKQjcSfj9fQChhfmSYZ2YZqyDreUXVmEP2sUPEJWCJSj8tCwYB2sjJKfTsxRGZ4pxAggzuEnzSQMJ32HE1i?cluster=devnet`
- `initializeSecurityPolicyV2`: `2sfs9NkPLa7BuapXVFve5djwUyb2Ax7EnNNrBJ2jyp3BJJX3X5dajApm7QPSsdjCPvtJWPd3JumzGWsNo57XFdAd`
- Explorer: `https://solscan.io/tx/2sfs9NkPLa7BuapXVFve5djwUyb2Ax7EnNNrBJ2jyp3BJJX3X5dajApm7QPSsdjCPvtJWPd3JumzGWsNo57XFdAd?cluster=devnet`
- `initializeGovernancePolicyV3`: `5A2Kodun61aZUA9kYSRNnCevXjnjkCdpYFDekJCWUGSbHF88q6xcw66aGsUtRnMmnU8JxfHDozq3upsGg3MQHnKw`
- Explorer: `https://solscan.io/tx/5A2Kodun61aZUA9kYSRNnCevXjnjkCdpYFDekJCWUGSbHF88q6xcw66aGsUtRnMmnU8JxfHDozq3upsGg3MQHnKw?cluster=devnet`
- `fundRevealRebateVaultV3`: `5Us3r1aDPr97iJkHF7dHRwUjEp7RrepdZJ1M5PPzt3uneqjBRFtHYHkcV3NTdWHEfoacUX22xRzjJhLxyyDyRPmr`
- Explorer: `https://solscan.io/tx/5Us3r1aDPr97iJkHF7dHRwUjEp7RrepdZJ1M5PPzt3uneqjBRFtHYHkcV3NTdWHEfoacUX22xRzjJhLxyyDyRPmr?cluster=devnet`
- `initializeSettlementPolicyV3`: `3yS5VPQzdAh1XVvxz7ZkSg7Xcn4vjhXZdvH9iyM7ccTq77tSQWxFyFcm1yhaZm1QMLR5gULSSFvQXGiiZSjStgC2`
- Explorer: `https://solscan.io/tx/3yS5VPQzdAh1XVvxz7ZkSg7Xcn4vjhXZdvH9iyM7ccTq77tSQWxFyFcm1yhaZm1QMLR5gULSSFvQXGiiZSjStgC2?cluster=devnet`
- `createProposal`: `DNvx7dsNpBC1tj4ApWK4B7LMRnBtpEj6KySi7dL7nKqGKW6tRr3BfVz4AmF6Uy3FPPP2egjSDnh3xTPxqZop7Zt`
- Explorer: `https://solscan.io/tx/DNvx7dsNpBC1tj4ApWK4B7LMRnBtpEj6KySi7dL7nKqGKW6tRr3BfVz4AmF6Uy3FPPP2egjSDnh3xTPxqZop7Zt?cluster=devnet`
- `configureConfidentialPayoutPlan`: `5U7uxs7nhYNM5omXf8dNU9mTwmhT9tzXhDSm6vVu8gf81wv1VcTGMQ8pXrNMXpDUFTfyuj7PViVPcJC9fmz2ktsR`
- Explorer: `https://solscan.io/tx/5U7uxs7nhYNM5omXf8dNU9mTwmhT9tzXhDSm6vVu8gf81wv1VcTGMQ8pXrNMXpDUFTfyuj7PViVPcJC9fmz2ktsR?cluster=devnet`
- `configureRefheEnvelope`: `5TZ17bmYzgH6xGdx3Z2exmPyPEVSskNN3ysRpxyh3i7n8mT42tX9j9cc2h8Q7WS1m5tnt7rVa7m7n1eL2q1dWiqN`
- Explorer: `https://solscan.io/tx/5TZ17bmYzgH6xGdx3Z2exmPyPEVSskNN3ysRpxyh3i7n8mT42tX9j9cc2h8Q7WS1m5tnt7rVa7m7n1eL2q1dWiqN?cluster=devnet`
- `snapshotGovernancePolicyV3`: `5YoydurVj1Wy9PBwK7e4vygDeGuDwiwHCQo4oCG36PNtRqr96X4RfCNTv7s8qV9MSP5CRaWjUchFbT7a2uzpCAXw`
- Explorer: `https://solscan.io/tx/5YoydurVj1Wy9PBwK7e4vygDeGuDwiwHCQo4oCG36PNtRqr96X4RfCNTv7s8qV9MSP5CRaWjUchFbT7a2uzpCAXw?cluster=devnet`
- `snapshotSettlementPolicyV3`: `3bp4rfiaSnRzNPKtSTnjtDtnX5NSLtp6TzG1PLQ1MHG5or1ihJAiAPKvT2ks2NfCyHjbG5wsRRJ3XmNfzMzp7dXg`
- Explorer: `https://solscan.io/tx/3bp4rfiaSnRzNPKtSTnjtDtnX5NSLtp6TzG1PLQ1MHG5or1ihJAiAPKvT2ks2NfCyHjbG5wsRRJ3XmNfzMzp7dXg?cluster=devnet`
- `deposit`: `2Z2H4D3xprczB45Msnj2fXQd2pu69qwaqyqdoCQ8Au5QozF8iehPnGHnkQLcwhZvvqgssWZnsGKMUaVD2fW2tG8q`
- Explorer: `https://solscan.io/tx/2Z2H4D3xprczB45Msnj2fXQd2pu69qwaqyqdoCQ8Au5QozF8iehPnGHnkQLcwhZvvqgssWZnsGKMUaVD2fW2tG8q?cluster=devnet`
- `commit`: `3jsux18bsnG86esfnKpYTa8GR8tkeMPC9nnv4d7zrYEXMBM3uKP5wUvS3UekPhM44yEiZgYMZ9AH1pjzMokLwVcp`
- Explorer: `https://solscan.io/tx/3jsux18bsnG86esfnKpYTa8GR8tkeMPC9nnv4d7zrYEXMBM3uKP5wUvS3UekPhM44yEiZgYMZ9AH1pjzMokLwVcp?cluster=devnet`
- `revealV3`: `4qSexCKuSMkY1E76KjKoxLeeHRZtPC5pEoBKaz7PZMchtUbhAZkMYyB86m85pFweJpJxqhPAQpUYXAfuP7gcNsas`
- Explorer: `https://solscan.io/tx/4qSexCKuSMkY1E76KjKoxLeeHRZtPC5pEoBKaz7PZMchtUbhAZkMYyB86m85pFweJpJxqhPAQpUYXAfuP7gcNsas?cluster=devnet`
- `finalizeV3`: `3emjBkJ4P4oZAVGyj3tJvaesHp7Dyhj1zm7wc2CXSQ2vrASrNWEkkAUtKnA6Ao7GrJCRrrqzHUg7SLS8wg1Br1gm`
- Explorer: `https://solscan.io/tx/3emjBkJ4P4oZAVGyj3tJvaesHp7Dyhj1zm7wc2CXSQ2vrASrNWEkkAUtKnA6Ao7GrJCRrrqzHUg7SLS8wg1Br1gm?cluster=devnet`
- `settleRefheEnvelope`: `peuutnsQ3WPVogVMvnDcPWuYqU9b4g7LuCWNY3xoD3Dzv6yCHGmz7mD4RGHPa23Yz8sWRCn1eLW4RRseCDVJHag`
- Explorer: `https://solscan.io/tx/peuutnsQ3WPVogVMvnDcPWuYqU9b4g7LuCWNY3xoD3Dzv6yCHGmz7mD4RGHPa23Yz8sWRCn1eLW4RRseCDVJHag?cluster=devnet`
- `recordSettlementEvidenceV2`: `5273pLiQi88rH3jdgFJmjXJoTkmD4C5ZBpHRNxMRMUc4fjEJ3DB9bHfTWSJ3TrFdGc7D4oCxTXXRtp6eC78xNj9y`
- Explorer: `https://solscan.io/tx/5273pLiQi88rH3jdgFJmjXJoTkmD4C5ZBpHRNxMRMUc4fjEJ3DB9bHfTWSJ3TrFdGc7D4oCxTXXRtp6eC78xNj9y?cluster=devnet`
- `executeV3`: `21NkGo4E9yJw38QWcNVDFVmgZqHrQgtjRA4zxEuEQ7XJEAxcSrdv7sn3o3XXG3GkMPc9V5csR2chiQqLWYdkbba7`
- Explorer: `https://solscan.io/tx/21NkGo4E9yJw38QWcNVDFVmgZqHrQgtjRA4zxEuEQ7XJEAxcSrdv7sn3o3XXG3GkMPc9V5csR2chiQqLWYdkbba7?cluster=devnet`

### Observed invariants

- status: `Passed`
- `isExecuted = true`
- payout status: `{"funded":{}}`
- evidence status: `{"verified":{}}`
- `evidenceConsumed = true`
- `eligibleCapital = 1000000000`
- `revealCount = 1 / 1`
- voting end: `2026-04-09 15:06:37 UTC`
- reveal end: `2026-04-09 15:06:43 UTC`
- execution unlock: `2026-04-09 15:06:45 UTC`
- reveal rebate vault before: `0.0032 SOL`
- reveal rebate vault after: `0.0022 SOL`
- treasury before execute: `0.1000 SOL`
- treasury after execute: `0.0500 SOL`
- recipient before: `0.0050 SOL`
- recipient after: `0.0550 SOL`

## Purpose

This artifact proves that the repository now carries a real Devnet proof for both `Governance Hardening V3` and `Settlement Hardening V3`. It is still a test-wallet Devnet artifact, not a production-custody or mainnet claim.
