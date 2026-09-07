# Mainnet Readiness

## What is true now

PrivateDAO already has:

- a live Solana program on devnet
- end-to-end governance lifecycle coverage
- additive `Governance Hardening V3` and `Settlement Hardening V3` paths with dedicated Devnet proof
- treasury execution validation
- live explorer-linked proof
- web and Android-native product surfaces

## Hardening gates before mainnet

### Protocol integrity

- no zero-balance vote commits
- no zero-value treasury deposit noise
- invalid treasury wiring rejected
- timelock and veto behavior validated
- direct-commit/delegation overlap rejected on-chain and mirrored by operator/frontend surfaces
- additive governance-policy and settlement-policy V3 paths proven on Devnet without reinterpreting legacy objects

### Release discipline

- clean `anchor build`
- passing Rust unit tests
- passing strategy validator
- regenerated submission bundle
- reviewed live proof links

### Operational controls

- deploy authority handling reviewed
- RPC policy defined
- treasury operator path reviewed
- incident response documented

## Mainnet readiness checklist

### Audit and review

- external program audit required
- independent external security review recommended
- specification and threat-model review completed internally
- failure-mode and replay analysis reviewed

### Authority and upgrade strategy

- upgrade authority strategy defined
- authority key custody policy defined
- authority rotation plan defined
- post-mainnet upgrade discipline defined

### Emergency controls

- veto path reviewed
- cancel path reviewed
- emergency governance procedure documented
- incident-response owner identified

### Treasury protection

- treasury recovery strategy documented
- treasury operator runbook documented
- recipient validation reviewed
- token mint and token ownership checks reviewed

### Monitoring and operations

- transaction monitoring integrated
- proposal/execution alerting integrated
- RPC redundancy configured
- explorer verification path documented

### Deployment discipline

- build reproducibility checked
- release checklist completed
- program ID and environment mapping reviewed
- deploy logs and verification records stored

### Infrastructure assumptions

- reliable RPC providers selected
- signer environment reviewed
- wallet security reviewed
- backup operational access defined

## Readiness command

```bash
bash scripts/check-mainnet-readiness.sh
```

This gate is intentionally conservative. It does not claim audit completion or automatic mainnet approval. It ensures the current repository clears the minimum internal release bar before any production cutover.

## Dedicated V3 Proof

The readiness story now includes a dedicated Devnet packet for the stricter additive path:

- `docs/governance-hardening-v3.md`
- `docs/settlement-hardening-v3.md`
- `docs/test-wallet-live-proof-v3.generated.md`

That packet strengthens the internal readiness story, but it does not remove the pending-external blockers for real-funds mainnet launch.

## Production blocker register

The repository also carries an explicit mainnet production blocker register:

- `docs/mainnet-blockers.json`
- `docs/mainnet-blockers.md`

Run:

```bash
npm run verify:mainnet-blockers
```

This verifier does not turn open external blockers into a repository failure. It verifies that the blockers are explicit, evidence-linked, and incompatible with any premature real-funds mainnet claim.
