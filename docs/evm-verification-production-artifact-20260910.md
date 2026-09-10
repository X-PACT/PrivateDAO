# EVM Verification Production Artifact

## Verified deployment

- Date: 2026-09-10
- Artifact: `evm-verification/phase-2-e2e-ethereum-sepolia.json`
- Production URL: `https://privatedao.org/evm-verification/phase-2-e2e-ethereum-sepolia.json`
- EC2 deployment root: `/home/ec2-user/PrivateDAO/deploy/primary-host/volumes/site`
- Content type: `application/json`
- Content length: `2750`
- SHA-256: `117b6c57471f551f76ec0712ba08c9040267c98c5ad0845879f3172aa5ac9c30`
- Artifact status: `testnet_verified`
- Scope: `ethereum-sepolia`

## Boundary

The artifact was uploaded atomically to the existing primary-host site volume.
No Caddy restart, DNS change, game deployment, or main-site cutover was
performed. The public verification page remains an application route and must
be tested separately from the machine-readable artifact.

## Production checks

- Artifact returned HTTP 200.
- Artifact returned `application/json`.
- Artifact parsed successfully and contained both record and blind entries.
- `https://privatedao.org/` returned HTTP 200.
- `https://privatedao.org/game/` returned HTTP 200.
- The EVM verification application route returned HTTP 200.
