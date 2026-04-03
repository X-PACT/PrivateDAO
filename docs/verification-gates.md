# Verification Gates

PrivateDAO maintains a reviewer-visible verification layer so the repository can be checked without trusting prose alone.

## Core Gates

Run these from the repository root.

### Strategy Surface

```bash
npm run verify:strategy-surface
```

Checks that the strategy-facing review package is present and internally coherent.

### Submission Registry

```bash
npm run verify:submission-registry
```

Checks that the canonical submission registry contains the required packages, links, gates, and core identity values.

### Registry Consistency

```bash
npm run verify:registry-consistency
```

Checks that the submission registry and proof registry stay aligned on canonical live references.

### Generated Artifacts

```bash
npm run verify:generated-artifacts
```

Checks that generated reviewer artifacts such as the audit packet and review attestation exist and remain structurally valid.

### Cryptographic Integrity

```bash
npm run verify:cryptographic-manifest
```

Checks that the sha256 manifest covering zk artifacts, live-proof anchors, and generated review materials still matches the canonical files on disk.

### ZK Registry

```bash
npm run build:zk-registry
npm run verify:zk-registry
```

Builds and verifies the machine-readable registry for the live Circom and Groth16 stack, including artifact paths, public signal counts, and per-layer commands.

### ZK Consistency And Tamper Rejection

```bash
npm run verify:zk-consistency
npm run verify:zk-negative
```

Checks that recomputed public signals match the stored outputs and that tampered public signals or proof objects are rejected.

### Live Proof

```bash
npm run verify:live-proof
```

Checks that the live-proof document stays aligned with the canonical proof registry and expected devnet evidence.

### Release Manifest

```bash
npm run verify:release-manifest
```

Checks that the release manifest, proof registry, README references, and generated handoff surfaces remain consistent.

### Review Links

```bash
npm run verify:review-links
```

Checks that the canonical reviewer path remains visible from the README and the GitHub Pages frontend.

### Ops Surface

```bash
npm run verify:ops-surface
```

Checks that production-ops, incident-response, monitoring, cutover, and operator docs remain present.

### Review Surface

```bash
npm run verify:review-surface
```

Runs the broader review-surface gate, including release-manifest, live-proof, registry, and reviewer-link consistency.

## Unified Gate

```bash
npm run verify:all
```

This is the canonical repo-wide verification command. It rebuilds generated reviewer artifacts and runs the verification gates needed to keep the reviewer, operator, and proof surfaces coherent.

## CI Enforcement

The unified gate is also enforced in CI on push and pull request events, so review-surface drift is caught automatically.
