# PrivateDAO Integrations Map

This file maps each track technology to the live product lane.

## Evidence Note
- Signature-level proof is dynamic and appears in `/proof` via Proof Matrix and operation receipts.
- Base explorer: `https://solscan.io/?cluster=testnet`

| Track | Technology | How it is used | Product route | Judge route | Proof route | On-chain evidence |
|---|---|---|---|---|---|---|
| 01 | GoldRush | Treasury and counterparty intelligence | `/intelligence` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 02 | Cloak | Private settlement lane | `/services/cloak-private-settlement` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 03 | Jupiter | Treasury route preview and execution prep | `/services/jupiter-treasury-route` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 04 | Zerion | Policy-bound agent execution surface | `/services/zerion-agent-policy` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 05 | Torque | Growth event loop tied to real actions | `/services/torque-growth-loop` | `/judge` | `/proof` | Event + receipt references in `/proof` |
| 06 | AUDD | AUD settlement lane | `/services/audd-stablecoin` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 07 | PUSD | Stable treasury/payroll lane | `/services/pusd-stablecoin` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 08 | Umbra | Confidential payout/claim lane | `/services/umbra-confidential-payout` | `/judge` | `/proof` | Dynamic TX links in Proof Matrix |
| 09 | Eitherway | Wallet-first connect/sign/verify lane | `/services/eitherway-live-dapp` | `/judge` | `/proof` | Profile-sign receipts + proof continuity |
| 10 | Runtime Infra | Read-node + telemetry + host readiness | `/services/runtime-infrastructure` | `/judge` | `/proof` | Runtime evidence + proof continuity |
| 11 | Encrypt/IKA | Encrypted operations and payload prep | `/services/encrypt-ika-operations` | `/judge` | `/proof` | Commitment receipts + proof continuity |
| 12 | SolRouter AI | Deterministic AI briefs with encrypted export | `/services/solrouter-encrypted-ai` | `/judge` | `/proof` | Encrypted AI brief receipts |
| 13 | Consumer UX | Normal-user governance flow (web + android) | `/services/consumer-governance-ux` | `/judge` | `/proof` | Wallet flow receipts in proof |
| 14 | Main Frontier | Unified integrated operating route | `/services/main-frontier-closure` | `/judge` | `/proof` | Aggregated proof continuity |

