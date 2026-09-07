# ZK Standalone Verifier Testnet Receipt 2026-05-23

PrivateDAO now has a standalone Anchor verifier program on Solana Testnet that calls the native BN254 pairing syscall and emits a reviewer-visible receipt event.

## Program

- network: `testnet`
- verifier program id: `5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j`
- deploy signature: `4cNDHe5dNkKH7V3CFyPu6devXF8wPuTruwjVj2tQWvfy57DVzPyyKiVn7MifBDZAP9Swr22vaQUakBzNKASka9rF`
- upgrade authority: `CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv`
- upgrade authority transfer signature: `3g24JACSz3AyAmeV6qU3kaZsMowfTq3KbJMDZ7ATZ3NbAzDK1USjBkzzPEwPA7tqQTMSXxLbT7gsVrF5yvLTFrhg`
- source: `programs/zk-groth16-verifier/src/lib.rs`
- instruction: `verify_groth16_receipt`
- syscall: `sol_alt_bn128_group_op`
- operation: `ALT_BN128_PAIRING`

## Receipt

- receipt signature: `zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67`
- receipt id: `faf71fd6c69be3a9ff79cee17305285b80c6f14ef7f4477416df6e12f61d2dd6`
- public inputs hash: `4601ac22de7524b4f1f0ad1e5612e8f4f3f7615b4a4e31554a8cc89067895671`
- pairing input length: `384`
- observed compute units: `50335`
- event: `Groth16ReceiptVerified`

Explorer links:

- deploy: `https://explorer.solana.com/tx/4cNDHe5dNkKH7V3CFyPu6devXF8wPuTruwjVj2tQWvfy57DVzPyyKiVn7MifBDZAP9Swr22vaQUakBzNKASka9rF?cluster=testnet`
- upgrade authority transfer: `https://explorer.solana.com/tx/3g24JACSz3AyAmeV6qU3kaZsMowfTq3KbJMDZ7ATZ3NbAzDK1USjBkzzPEwPA7tqQTMSXxLbT7gsVrF5yvLTFrhg?cluster=testnet`
- receipt: `https://explorer.solana.com/tx/zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67?cluster=testnet`
- program: `https://explorer.solana.com/address/5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j?cluster=testnet`

## Why It Matters

This moves the ZK lane from local-only proof verification to a live on-chain verifier receipt path. The Testnet transaction proves that a deployed PrivateDAO-owned program can call Solana's native BN254 pairing syscall and emit a receipt that reviewers can inspect independently.

## Boundary

This receipt proves the standalone on-chain pairing verifier path. It does not claim that the canonical governance program already enforces the full vote, delegation, and tally Groth16 verification keys. The production path remains:

- keep local Groth16 artifacts and verification packets for vote, delegation, and tally circuits;
- use this standalone verifier as the live Testnet syscall receipt path;
- after the Squads timelock releases, upgrade the canonical governance program;
- embed circuit-specific verification keys and bind proof receipts to proposal execution policy.

## Verification Commands

```bash
solana program show 5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j --url https://api.testnet.solana.com
solana confirm --url https://api.testnet.solana.com 4cNDHe5dNkKH7V3CFyPu6devXF8wPuTruwjVj2tQWvfy57DVzPyyKiVn7MifBDZAP9Swr22vaQUakBzNKASka9rF
solana confirm --url https://api.testnet.solana.com 3g24JACSz3AyAmeV6qU3kaZsMowfTq3KbJMDZ7ATZ3NbAzDK1USjBkzzPEwPA7tqQTMSXxLbT7gsVrF5yvLTFrhg
solana confirm --url https://api.testnet.solana.com zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67
npm run verify:zk-standalone-verifier
```
