# Mainnet Readiness

## What is true now

PrivateDAO already has:

- a live Solana program on devnet
- end-to-end governance lifecycle coverage
- treasury execution validation
- live explorer-linked proof
- web and Android-native product surfaces

## Hardening gates before mainnet

### Protocol integrity

- no zero-balance vote commits
- no zero-value treasury deposit noise
- invalid treasury wiring rejected
- timelock and veto behavior validated

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

## Readiness command

```bash
bash scripts/check-mainnet-readiness.sh
```

This gate is intentionally conservative. It does not claim audit completion or automatic mainnet approval. It ensures the current repository clears the minimum internal release bar before any production cutover.
