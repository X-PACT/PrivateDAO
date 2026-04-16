# Runtime And Infrastructure Backlog 2026

## Scope

This backlog covers RPC posture, read-node maturity, monitoring, settlement evidence, wallet runtime proof, and mainnet operations closure.

## Now

### 1. Close real-device wallet matrix

Target:

- capture real device/browser wallet runs for the remaining target matrix

Done when:

- missing wallets and environments move from placeholder status to evidenced status

### 2. Turn monitoring delivery into live evidence

Target:

- move from rules and packets to real monitoring delivery transcripts, owners, and alert routing proof

Done when:

- monitoring evidence shows real operational delivery, not only planned rules

### 3. Close settlement receipt evidence

Target:

- move from closure packets and intake registers to source-verifiable settlement receipt examples

Done when:

- a reviewer can follow a settlement path without trusting narrative alone

## Next

### 4. Read-node and API maturity

Target:

- tighten low-latency read posture
- clarify REST, WebSocket, gRPC-ready, and webhook export boundaries

Done when:

- `/analytics`, `/diagnostics`, and docs tell the same infrastructure story

### 5. Production monitoring stack plan

Target:

- document and stage Prometheus/Grafana/Vault alignment to the actual deploy target

### 6. Mainnet cutover ceremony preparation

Target:

- prepare final runbook for:
  - authority handoff
  - custody controls
  - release validation
  - rollback path

## Later

### 7. Regional RPC topology

Target:

- explicit deployment and load-balancing model for low-latency hosted reads

### 8. Backup and restore drill

Target:

- repeatable restoration proof for PDA/state snapshots

## Validation

Minimum:

```bash
cd /home/x-pact/PrivateDAO
git diff --check
```

For generated runtime or reviewer evidence:

```bash
cd /home/x-pact/PrivateDAO
npm run verify:review-bundle
```
