# Operation Ledger

- project: `PrivateDAO`
- generated at: `2026-05-23T00:33:58.138Z`
- purpose: Machine-readable operation ledger for custody, ZK, and REFHE/FHE evidence surfaced on the reviewer site.

## Entries

### Testnet program upgrade authority transferred to Squads 2-of-3 vault

- id: `squads-testnet-upgrade-authority`
- lane: `custody`
- status: `verified`
- evidence:
  - `docs/squads-testnet-custody-transfer-2026-05-22.md`
  - `docs/custody-observed-readouts.json`
- verification:
  - `solana program show EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva --url https://api.testnet.solana.com`
  - `npm run verify:canonical-custody-proof`

### DAO operating authority handoff upgrade has reached Squads 2-of-3 approval and is waiting for timelock release

- id: `dao-authority-handoff`
- lane: `custody`
- status: `pending-timelock`
- evidence:
  - `docs/dao-treasury-authority-handoff-2026-05-23.md`
  - `docs/squads-testnet-upgrade-proposal-2026-05-23.md`
  - `programs/private-dao/src/dao.rs`
  - `tests/private-dao.ts`
- verification:
  - `anchor build`
  - `solana program dump HSX3ZK3BzueJnVy4EmrQ5xHUPq3LtXxxaVWuuZqew1Mz /tmp/privatedao-buffer-final.so --url https://api.testnet.solana.com`
  - `Squads proposal approval signature: 2wpJ27Mkb5CffngRx9U6upPjB8jbzWHoFrDLnxhB5NSCiiXCFGt5HVDYU8U7FtwYusynRCcWhy1T6av22VzCC7MY`
  - `Timelock release target: 2026-05-25T00:31:05Z`
  - `node --import tsx ./node_modules/mocha/bin/mocha --timeout 20000 --exit test/unit/anonymous-governance-primitive.unit.ts`

### Solana anonymous governance primitive packaged with frozen roots, nullifiers, and tally modes

- id: `anonymous-governance-primitive`
- lane: `zk`
- status: `verified`
- evidence:
  - `docs/solana-anonymous-governance-primitive.md`
  - `sdk/src/index.ts`
  - `test/unit/anonymous-governance-primitive.unit.ts`
- verification:
  - `node --import tsx ./node_modules/mocha/bin/mocha --timeout 20000 --exit test/unit/anonymous-governance-primitive.unit.ts`
  - `npm run zk:verify:sample`

### PDAO Token-2022 governance mint is live on Solana Testnet with disabled mint authority

- id: `pdao-token-2022-testnet`
- lane: `runtime`
- status: `verified`
- evidence:
  - `docs/pdao-token.md`
  - `docs/pdao-attestation.generated.json`
  - `docs/assets/pdao-token.json`
  - `docs/proof-registry.json`
- verification:
  - `spl-token display --program-2022 DFYvBdivHCe4bSErgCiKm2RhwGEcZYbBPFQzLNr37Bie --url https://api.testnet.solana.com --output json-compact`
  - `npm run verify:pdao-surface`
  - `npm run verify:pdao-attestation`
  - `npm run verify:pdao-live`

### ZK-enforced runtime captures remain machine-tracked until wallet evidence closes them

- id: `zk-enforced-runtime`
- lane: `zk`
- status: `pending-runtime-capture`
- evidence:
  - `docs/zk/enforced-runtime.generated.json`
  - `docs/zk/enforced-runtime-captures.json`
  - `docs/zk/enforced-operator-flow.md`
- verification:
  - `npm run build:zk-enforced-runtime`
  - `npm run verify:zk-enforced-runtime`

### REFHE/FHE confidential operations are documented with explicit runtime and audit boundaries

- id: `refhe-fhe-confidential-ops`
- lane: `refhe-fhe`
- status: `pending-runtime-capture`
- evidence:
  - `docs/refhe-protocol.md`
  - `docs/refhe-security-model.md`
  - `docs/refhe-operator-flow.md`
  - `docs/encrypt-ika-2pcmpc-refhe-desktop-report-2026-05-21.md`
- verification:
  - `npm run configure:refhe`
  - `npm run settle:refhe`
  - `npm run inspect:refhe`

## Boundary

This ledger records what is verified, what is code-ready, and what still needs runtime signatures or wallet captures. It must not be used to claim a DAO authority transfer, treasury authority handoff, ZK-enforced runtime close, or REFHE/FHE production close until the corresponding signature or capture exists in the evidence files above.
