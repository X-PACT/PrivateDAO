# PrivateDAO EVM Verification

This package contains the Phase 2 Sepolia/Base Sepolia verification contracts.

- `PrivateDaoBlindPolicyGroth16Verifier.sol` is generated from the committed
  `private_dao_blind_policy_overlay_final.zkey` with `snarkjs`.
- `BlindVerificationRegistry.sol` verifies the real Groth16 proof and binds
  its public policy field to the product, schema, record, chain ID, and deployed
  verifier address.
- `RecordVerificationRegistry.sol` anchors a selective-disclosure record digest
  with chain and contract domain separation, expiry, and owner revocation.
- `scripts/run-e2e.mjs` is a real deployment and E2E runner. It requires funded
  testnet credentials and fails closed when they are absent.

## Real testnet E2E

Set these variables outside the repository:

```text
PDAO_EVM_DEPLOYER_PRIVATE_KEY=0x...
PDAO_EVM_ETHEREUM_SEPOLIA_RPC_URL=https://...
PDAO_EVM_BASE_SEPOLIA_RPC_URL=https://...
```

Then run:

```bash
npm run compile:evm-verification
npm run test:evm:phase2
```

The runner checks the RPC chain IDs, deploys independent contracts to the
explicitly selected standard-EVM testnets, generates a Groth16 proof from the committed WASM/zkey, verifies and
anchors it, anchors and verifies a record digest, tests wrong-chain,
altered-proof, cross-network replay, expired-input rejection, and executes
owner revocation against disposable record and blind-proof entries before
asserting that both become invalid. It writes
deployment evidence only after confirmed on-chain transactions.

No Mainnet configuration is accepted by this runner. No public RPC fallback is
used. No mock receipt or synthetic success path exists.

The generic runner can be selected with `PDAO_EVM_NETWORKS` for Ethereum
Sepolia, Base Sepolia, Arbitrum Sepolia, BNB Testnet, or Robinhood Testnet.
Tempo Testnet is deliberately rejected by this runner because its fee-payer
transaction flow is not the standard native-gas EVM flow; it requires a
dedicated Tempo transport before any E2E claim is possible.

## Current evidence boundary

Ethereum Sepolia has a committed `testnet_verified` artifact at
`deployments/phase-2-e2e-ethereum-sepolia.json`. Its record and blind
transactions were independently read from a public Sepolia RPC and returned
successful receipts:

- Record anchor: [`0x96d67851c8567e575ffabaabe506c4104c42edeb464c606be2d64ec73d3fc043`](https://sepolia.etherscan.io/tx/0x96d67851c8567e575ffabaabe506c4104c42edeb464c606be2d64ec73d3fc043)
- Blind proof anchor: [`0x042400bd1be2f7dffeee536e13ade5610d84ee28ca2192ee37b70c93c2fc07a7`](https://sepolia.etherscan.io/tx/0x042400bd1be2f7dffeee536e13ade5610d84ee28ca2192ee37b70c93c2fc07a7)
- Disposable record revocation: [`0x3fcf9b0283ea8a1dc68fd40325d0640c87736e6c0a3d53ecac6c981439443bf2`](https://sepolia.etherscan.io/tx/0x3fcf9b0283ea8a1dc68fd40325d0640c87736e6c0a3d53ecac6c981439443bf2)
- Disposable blind-proof revocation: [`0x7bb8e17d3ffac17f5aec0fd18addb27c8371999e66fb99397def65cd8420e6ce`](https://sepolia.etherscan.io/tx/0x7bb8e17d3ffac17f5aec0fd18addb27c8371999e66fb99397def65cd8420e6ce)

The public verification routes return HTTP 200 for both artifacts. This is
evidence for the verification package only; Ethereum Sepolia is not yet in the
customer-executable product catalog until its application binding is wired.
Base Sepolia remains unverified until a valid RPC endpoint and funded testnet
account are available. No capability is upgraded from this documentation
alone.
