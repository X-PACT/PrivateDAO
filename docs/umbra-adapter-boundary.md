# Umbra Adapter Boundary

Umbra is modeled as a confidential payout / stealth settlement provider.

It is not the governance privacy primitive.

Governance privacy is owned by the PrivateDAO workflow:

1. proposal public metadata
2. intelligence before signing
3. private vote while deciding
4. reveal after voting ends
5. proof verification
6. execution

Umbra can help at step 6 when an approved outcome needs a private payout receipt.

## Server Env

- `UMBRA_PROVIDER_ENABLED=true`
- `UMBRA_API_BASE_URL`
- `UMBRA_API_KEY`
- `UMBRA_NETWORK=testnet`
- `UMBRA_RECEIPT_MODE=proof-only`

Secrets stay server-side. Browser code must not receive `UMBRA_API_KEY`.

## Product Rule

Do not over-promote Umbra on the homepage.

Umbra status belongs in:

- API status
- proof
- execution/payroll private payout rehearsal
- technical docs

The primary public UX remains:

Connect -> Intelligence -> Private Vote -> Reveal -> Verify -> Execute
