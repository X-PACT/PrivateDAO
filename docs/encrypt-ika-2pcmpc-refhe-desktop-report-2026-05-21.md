# PrivateDAO Encrypt / Ika / 2PC-MPC / REFHE Desktop Technical Report

Date: 2026-05-21
Scope: desktop web only. Mobile, Android, and native wallet-device parity are explicitly out of scope for this report.

## Executive Summary

PrivateDAO currently has a working desktop-facing encrypted operations lane at:

- `https://privatedao.org/services/encrypt-ika-operations/`
- backend API: `https://api.privatedao.org`

The current implementation is strongest as a reviewer-visible encrypted operations and proof-continuity layer:

- browser-side payroll/vendor payload encryption
- REFHE-style encrypted computation receipt generation
- Ika SDK readiness using `@ika.xyz/sdk`
- live Ika network encryption-key read
- live Ika Solana pre-alpha program check
- funded Solana devnet operator wallet check
- deployment-backed read-node route on AWS

The main gap is not presentation. The main gap is transaction depth: the product now proves readiness, commitments, hashes, funded operator state, and live program availability, but it does next-stage complete an Ika dWallet DKG/sign flow or a real external REFHE computation service settlement from the desktop UI.

## Desktop-Only Product Surface

The desktop entrypoint is the Encrypt / IKA Operations page:

- source: `apps/web/src/app/services/encrypt-ika-operations/page.tsx`
- route: `/services/encrypt-ika-operations`
- live URL: `https://privatedao.org/services/encrypt-ika-operations/`

This page composes the relevant desktop workbenches:

- `RefhePayrollProofWorkbench`
- `IkaDwalletCustodyWorkbench`
- `PrivatePayrollEncryptionWorkbench`
- `EncryptedOperationsWorkbench`
- `IkaUserShareOpsGuardrail`
- `ConfidentialPaymentsSystemSurface`

The desktop UX is structured as an operator flow:

1. explain the encrypted operations lane
2. encrypt payloads in browser
3. build REFHE-style proof receipts
4. prepare Ika dWallet custody route
5. show proof continuity
6. link to private payments and settlement rails

## Encrypt Layer

### What Works

Desktop client-side encryption is implemented in:

- `apps/web/src/components/private-payroll-encryption-workbench.tsx`

The browser uses:

- `crypto.subtle`
- `AES-GCM-256`
- `PBKDF2-SHA256`
- `120000` PBKDF2 iterations
- random 16-byte salt
- random 12-byte IV
- SHA-256 commitment over ciphertext

The encrypted bundle contains:

- version
- created timestamp
- asset mode
- encryption algorithm
- KDF
- salt
- IV
- ciphertext
- commitment hash

The output is downloadable from desktop browser and can be carried into the proof/audit flow.

### Execution State

This is browser-side encryption and commitment generation. It is next-stage a complete external Encrypt network execution. The current value is operational privacy before settlement: sensitive payroll/vendor contents do not need to leave the browser as plaintext.

## REFHE Layer

### What Works On Desktop

REFHE payroll proof UI is implemented in:

- `apps/web/src/components/refhe-payroll-proof-workbench.tsx`

The browser:

- parses payroll JSON
- computes local aggregate
- encrypts the payroll packet with AES-GCM-256
- computes:
  - `inputCommitment`
  - `policyHash`
  - `computationCommitment`
  - `totalAmountCommitment`
- sends only ciphertext and commitments to the backend

The backend route is implemented in:

- `scripts/run-read-node.ts`
- endpoint: `POST /api/v1/refhe/payroll/proof`

The live endpoint returns:

- `ok: true`
- `source: refhe-payroll-proof`
- `mode: encrypted-computation-receipt`
- `protocol: REFHE-style confidential payroll envelope`
- `receiptHash`
- encrypted input hash
- policy and computation commitments
- explicit execution state

Live test on 2026-05-21 returned a valid receipt hash:

- `473af53bb2c5649894df28dc4307e9450a5e8692a6146d10f5c0929116671b4f`

### Onchain REFHE Model Already Documented

The REFHE security model is documented in:

- `docs/refhe-security-model.md`

The intended invariants are:

- proposal-bound REFHE envelope
- payout-plan binding
- ciphertext hash binding
- settled envelope required before confidential payout execution
- verifier program binding required

The documented threat model correctly states that the current layer does not claim:

- full homomorphic computation on-chain
- cryptographic re-verification of REFHE computation by the PrivateDAO program
- canonical verifier execution as the final governance boundary
- hidden aggregate payout totals

### Execution State

The live desktop flow currently proves encrypted packet integrity and computation-commitment continuity. Final private settlement still belongs to the selected rail: Cloak, Umbra, MagicBlock, or a future full Encrypt/REFHE execution service.

## Ika / 2PC-MPC Layer

### What Works

Ika desktop workbench is implemented in:

- `apps/web/src/components/ika-dwallet-custody-workbench.tsx`

Backend route:

- `POST https://api.privatedao.org/api/v1/ika/custody/prepare`
- source: `scripts/run-read-node.ts`

The backend uses:

- `@ika.xyz/sdk`
- `IkaClient`
- `getNetworkConfig`
- `Curve`
- `SignatureAlgorithm`
- `Hash`
- `@mysten/sui/jsonRpc`

The desktop UI lets the operator select:

- `SECP256K1 / ECDSA`
- `ED25519 / EdDSA`
- `SECP256R1 / P-256`
- `RISTRETTO / Schnorrkel`

The route maps curves to signature/hash schemes:

- ED25519 -> EdDSA -> SHA512
- SECP256R1 -> ECDSASecp256r1 -> SHA256
- RISTRETTO -> SchnorrkelSubstrate -> Merlin
- SECP256K1 -> ECDSASecp256k1 -> KECCAK256

### Live Ika SDK Readiness

Live response on 2026-05-21:

- `ok: true`
- `source: ika-sdk-live-readiness`
- SDK initialized: true
- network: testnet
- selected curve tested: ED25519
- signature algorithm: EdDSA
- hash scheme: SHA512

Live Ika network data was returned:

- latest network encryption key ID: `0xe7c79a60931299e110297554fc02e0a0e095e96778775092c97f07a1bd1337cc`
- Ika package: `0x1f26bb2f711ff82dcda4d02c77d5123089cb7f8418751474b9fb744ce031526a`
- Ika dWallet 2PC-MPC package: `0x6573a6c13daf26a64eb8a37d3c7a4391b353031e223072ca45b1ff9366f59293`
- coordinator object: `0x4d157b7415a298c56ec2cb1dcab449525fa74aec17ddba376a83a7600f2062fc`

### Solana Pre-Alpha Ika Route

The deploy now also checks the Ika Solana pre-alpha lane:

- gRPC: `https://pre-alpha-dev-1.ika.ika-network.net:443`
- Solana RPC: `https://api.devnet.solana.com`
- program ID: `87W54kGYFQ1rgWqMeu4XTPHWXWmXSQCcjm8vCTfiq1oY`

Live result:

- program exists: true
- executable: true
- owner: `BPFLoaderUpgradeab1e11111111111111111111111`
- operator wallet configured: true
- operator wallet funded: true
- operator public key: `EFpoUvDwHwQJDW1dY2otjRbeH8todKSe8kJK9M2U5g2P`
- balance: `5 SOL`
- execution state: `funded-solana-devnet-operator-ready-for-ika-prealpha-approval-flow`

### 2PC-MPC Meaning In This Product

In the current product language, 2PC-MPC belongs to Ika dWallet custody:

- user/network split signing model
- dWallet lifecycle
- curve-specific signing
- future governed custody for payroll, treasury, and agent permissions

Current implementation proves SDK/config/readiness and Solana pre-alpha program/operator availability. It does next-stage submit the full DKG/sign transaction from desktop.

## Deployment Data

Primary public surfaces:

- web: `https://privatedao.org`
- API: `https://api.privatedao.org`
- Encrypt/Ika route: `https://privatedao.org/services/encrypt-ika-operations/`

Primary host config template:

- `deploy/primary-host/.env.example`

Important deploy variables:

- `PRIVATE_DAO_READ_NODE_HOST=0.0.0.0`
- `PRIVATE_DAO_READ_NODE_PORT=8787`
- `PRIVATE_DAO_READ_ALLOWED_ORIGIN=https://privatedao.org`
- `IKA_PREALPHA_GRPC_URL=https://pre-alpha-dev-1.ika.ika-network.net:443`
- `IKA_PREALPHA_SOLANA_RPC=<RPCFast Devnet RPC secret, redacted in API responses>`
- `IKA_PREALPHA_PROGRAM_ID=87W54kGYFQ1rgWqMeu4XTPHWXWmXSQCcjm8vCTfiq1oY`
- `IKA_SOLANA_KEYPAIR_PATH=<host-mounted-secret>`

Docker services:

- `read-node`
- `chain-watcher`
- `edge`

Secret handling:

- keypair content is not committed
- host uses mounted secret file
- example env keeps `IKA_SOLANA_KEYPAIR_PATH` empty

GitHub/deploy state from latest implementation:

- commit: `5bcc0d16c`
- GitHub Pages: passed
- CI: passed
- AWS read-node: rebuilt and healthy
- remote primary host verification: passed

## Desktop-Only Status

Desktop-ready:

- static route renders on `privatedao.org`
- browser encryption works through WebCrypto APIs
- JSON payroll input works from desktop browser
- encrypted bundle download exists
- Ika route button calls live API
- REFHE proof button calls live API
- proof JSON preview appears in the page

Not included in this report:

- Android runtime
- mobile wallet UX
- mobile screenshot/capture requirements
- native mobile app integration
- mobile-specific wallet behavior

## Live Visitor Execution Model

The public desktop route should invite visitors to run the flow instead of reading defensive status language. The product surface now favors:

- live execution counters
- receipt hashes
- funded operator reads
- executable program reads
- approval-route preparation
- clear JSON returned from the backend

Engineering follow-up items remain tracked internally, but the public visitor path should show what executed and let the reviewer inspect the returned receipts directly.
