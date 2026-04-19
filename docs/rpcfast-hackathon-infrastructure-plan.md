# RPCFast Hackathon Infrastructure Plan

RPCFast activated Hackathon/Aperture infrastructure support for PrivateDAO through the end of Frontier (`2026-05-11`). This moves the infrastructure plan from public-RPC fallback toward a production-grade Solana data plane.

No API keys belong in Git. This document records capability, rollout order, and truth boundaries only.

## Activated Capability

- Devnet Yellowstone gRPC
- Testnet RPC and WebSocket release-candidate path
- Testnet Yellowstone gRPC when provisioned
- Mainnet Aperture gRPC
- Mainnet ShredStream gRPC
- Mainnet Yellowstone gRPC
- high-performance Solana RPC access
- real-time streaming APIs for monitoring, analytics, and reviewer telemetry

## Activated Application Groups

Keep the concrete keys in the deployment host only. The public project records the capability groups without committing credentials:

- `devnet / yellowstone / grpc`: Devnet Yellowstone gRPC for rehearsal stream comparison and historical Devnet evidence.
- `mainnet / aperture / grpc`: Mainnet Aperture gRPC for production-candidate account and transaction observation after release gates.
- `mainnet / shredstream / grpc`: Mainnet ShredStream gRPC for low-latency data-plane monitoring after custody and audit closure.
- `mainnet / yellowstone / grpc`: Mainnet Yellowstone gRPC for production telemetry and analytics after the mainnet ceremony.

## Required Network Ladder

PrivateDAO should move in this order:

1. `Devnet` for completed rehearsal evidence and historical wallet-runtime proof.
2. `Testnet` for live product execution, public stress rehearsal, streaming validation, endpoint failover, and release-candidate monitoring.
3. `Mainnet-beta` only after custody, audit, monitoring delivery, settlement receipts, and release ceremony evidence are closed.

Testnet is now a required transition stage, not an optional appendix.

## Environment Variables

Use host secrets, not committed credentials:

- `RPC_FAST_TESTNET_RPC`
- `RPC_FAST_TESTNET_WSS`
- `RPC_FAST_DEVNET_YELLOWSTONE_GRPC_ENDPOINT`
- `RPC_FAST_DEVNET_YELLOWSTONE_GRPC_API_KEY`
- `RPC_FAST_TESTNET_YELLOWSTONE_GRPC_ENDPOINT`
- `RPC_FAST_TESTNET_YELLOWSTONE_GRPC_API_KEY`
- `RPC_FAST_MAINNET_APERTURE_GRPC_ENDPOINT`
- `RPC_FAST_MAINNET_APERTURE_GRPC_API_KEY`
- `RPC_FAST_MAINNET_SHREDSTREAM_GRPC_ENDPOINT`
- `RPC_FAST_MAINNET_SHREDSTREAM_GRPC_API_KEY`
- `RPC_FAST_MAINNET_YELLOWSTONE_GRPC_ENDPOINT`
- `RPC_FAST_MAINNET_YELLOWSTONE_GRPC_API_KEY`

## Stage 1 — Devnet Streaming Truth

Goal: attach backend-only Devnet Yellowstone gRPC to PrivateDAO program/account observations.

Outputs:

- stream health snapshot
- slot lag and reconnect report
- dropped-update posture
- comparison against read-node snapshot

## Stage 2 — Testnet Release-Candidate Rehearsal

Goal: run the same read and streaming checks against Testnet before any mainnet execution claim.

Current migration record:

- See `docs/testnet-migration-report-2026-04-18.md`.
- Anchor workspace migration to Testnet has reached deployed-program state.
- Anchor 0.32.1 build has completed.
- Testnet deployment completed with program ID `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx` and deploy signature `4a2gsFSJ6EpgqZjVaMSZx72LVvz2o1XfXBzJ8PHLz5Q8YStNYmdhk6YBDoMe2fjxb6TPrr8s5mydqeFQwPgHnqdy`.
- Testnet lifecycle rehearsal has executable proof and remains the release-candidate network for the public product.

Required checks:

- Testnet RPC connectivity
- Yellowstone stream connectivity if available
- server-side stream relay posture for browser-safe health, slot lag, account updates, and reviewer telemetry
- SSE or WebSocket bridge design for browser-safe telemetry
- proposal/governance read simulation where supported
- endpoint failover drill
- latency and slot-lag baseline
- reviewer-safe report showing what is tested and what remains Devnet-only

## Stage 3 — Mainnet Data-Plane Readiness

Goal: use Mainnet Aperture, ShredStream, and Yellowstone for readiness telemetry only.

Allowed:

- health checks
- subscription smoke tests
- slot/latency telemetry
- mainnet data-plane readiness packet

Not allowed:

- custody closure claims
- private treasury production claims
- real-funds governance claims
- hidden signing or relay claims

## Stage 4 — Packet Refresh

After Devnet and Testnet checks pass, refresh:

- reviewer telemetry packet
- RPC infrastructure packet
- business model packet
- security/trust packets
- read-node backend cutover packet
- monitoring delivery packet

## Strategic Value

This support improves PrivateDAO's track value because it turns the runtime story into a credible infrastructure lane:

- authenticated low-latency reads
- real-time program/account streaming
- stronger analytics and monitoring
- future mainnet data-plane readiness
- measurable Testnet transition before production claims
