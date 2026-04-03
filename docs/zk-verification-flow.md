# ZK Verification Flow

This is the shortest deterministic path for independently checking the PrivateDAO zk stack.

## 1. Build The Registry

```bash
npm run build:zk-registry
```

Expected outcome:

- `docs/zk-registry.generated.json` exists
- each zk layer is mapped to its source, sample input, setup artifacts, proof artifacts, and commands

## 2. Verify The Registry

```bash
npm run verify:zk-registry
```

Expected outcome:

- every registry path exists
- each layer has a non-zero public signal count
- per-layer commands align with the registry entries

## 3. Verify The ZK Docs

```bash
npm run verify:zk-docs
```

Expected outcome:

- the zk reviewer docs stay aligned on:
  - layer names
  - replay boundaries
  - verification commands
  - tracked circuit references

## 4. Recompute Public Signals

```bash
npm run verify:zk-consistency
```

Expected outcome:

- SDK-side recomputation matches the stored public outputs for:
  - vote
  - delegation
  - tally

## 5. Check Tamper Rejection

```bash
npm run verify:zk-negative
```

Expected outcome:

- modified public signals are rejected
- modified proof objects are rejected

## 6. Replay The Full Proof Path

```bash
npm run zk:all
```

Expected outcome:

- circuits compile
- witnesses are generated from the tracked sample inputs
- proofs are generated
- proofs verify against the tracked verification keys

## 7. Verify The ZK Surface

```bash
npm run verify:zk-surface
```

Expected outcome:

- zk docs remain present
- registry is rebuilt and checked
- consistency and tamper checks pass
- reviewer-facing zk references stay coherent

## 8. Verify The Full Review Surface

```bash
npm run verify:all
```

Expected outcome:

- zk package stays aligned with the wider proof, integrity, and reviewer surfaces

## What Reviewers Should Conclude

If these commands pass, the repository supports a stronger claim than “we added zk notes.”

The supported claim is:

- the zk stack is real
- the zk artifacts are wired coherently
- the public outputs are reproducible
- altered zk artifacts are rejected
- the zk review package is integrated into the same verification discipline as the rest of PrivateDAO
