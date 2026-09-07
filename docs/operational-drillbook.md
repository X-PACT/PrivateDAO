# Operational Drillbook

This drillbook records the minimum manual exercises operators should perform before a production cutover.

It does not replace the on-chain tests. It complements them with operational rehearsal.

## Drill 1: Wallet Runtime Validation

Scenario:
Verify that supported wallets can connect, report capabilities, and sign or send in real browser environments.

Expected safe outcome:

- supported providers are detected correctly
- disconnected state is handled cleanly
- capability reporting matches runtime behavior
- failed wallet paths do not corrupt UI state

Primary surfaces:

- `https://privatedao.org/diagnostics/`
- `docs/wallet-runtime.md`

## Drill 2: Review Surface Rebuild

Scenario:
Rebuild all generated artifacts and confirm the proof surface remains coherent.

Expected safe outcome:

- generated artifacts rebuild without drift
- manifest hashes stay aligned
- review links remain intact
- zk attestations and readiness reports remain current

Primary command:

```bash
npm run verify:all
```

## Drill 3: ZK Artifact Verification

Scenario:
Re-run the zk verification stack and tamper-rejection checks.

Expected safe outcome:

- stored proofs verify
- recomputed public signals remain consistent
- tampered proof or public-signal payloads are rejected

Primary commands:

```bash
npm run zk:all
npm run verify:zk-consistency
npm run verify:zk-negative
```

## Drill 4: Mainnet Gate Rehearsal

Scenario:
Run the full mainnet readiness gate before any release-candidate announcement.

Expected safe outcome:

- program builds
- Rust unit tests pass
- review surface passes
- readiness report and deployment attestation rebuild cleanly

Primary command:

```bash
bash scripts/check-mainnet-readiness.sh
```

## Drill 5: Incident Routing Review

Scenario:
Confirm that signer compromise, treasury anomalies, and RPC degradation paths are documented and assigned.

Expected safe outcome:

- operator ownership is explicit
- monitoring and alert channels are known
- pause, cutover, and investigation procedures are reachable

Primary references:

- `docs/incident-response.md`
- `docs/monitoring-alerts.md`
- `docs/mainnet-cutover-runbook.md`
- `docs/risk-register.md`

## Honest Boundary

This drillbook improves operational discipline inside the repository.

It does not prove:

- external audit completion
- live mainnet rollout
- wallet behavior across every client or browser variant without real runtime testing
