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

The runner checks the RPC chain IDs, deploys independent contracts to both
testnets, generates a Groth16 proof from the committed WASM/zkey, verifies and
anchors it, anchors and verifies a record digest, and tests wrong-chain,
altered-proof, cross-network replay, expiry, and revocation behavior. It writes
deployment evidence only after confirmed on-chain transactions.

No Mainnet configuration is accepted by this runner. No public RPC fallback is
used. No mock receipt or synthetic success path exists.

## Current evidence boundary

Ethereum Sepolia has a committed `testnet_verified` artifact at
`deployments/phase-2-e2e-ethereum-sepolia.json`. Its record and blind
transactions were independently read from a public Sepolia RPC and returned
successful receipts:

- Record anchor: [`0xbc1b6484d235366ab2b3e55f3105a78efe18716859bb2b28f12b5d69b550d98a`](https://sepolia.etherscan.io/tx/0xbc1b6484d235366ab2b3e55f3105a78efe18716859bb2b28f12b5d69b550d98a)
- Blind proof anchor: [`0xbdb2acaa52360c12ff858b5cd721e8d2505446e2dd6487deb914f6d417390fde`](https://sepolia.etherscan.io/tx/0xbdb2acaa52360c12ff858b5cd721e8d2505446e2dd6487deb914f6d417390fde)

The public verification routes return HTTP 200 for both artifacts. This is
evidence for the verification package only; Ethereum Sepolia is not yet in the
customer-executable product catalog until its application binding is wired.
Base Sepolia remains unverified until a valid RPC endpoint and funded testnet
account are available. No capability is upgraded from this documentation
alone.
