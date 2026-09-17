# Payment Rails Catalog Production Deployment

On 2026-09-17, the verified payment-rail catalog projection was deployed to
the existing EC2 static-site volume. The deployment replaced one static
catalog file only; it did not replace the site or restart the game, bot,
Caddy, or product containers.

- Commit: `045556a`
- Live endpoint: `https://privatedao.org/api/runtime/catalog`
- Deployed file SHA-256: `705986872e860291392067ec4a54e44ae4d682274d42ab96c9cb12e51e965364`
- Live entries: `tempo-testnet-tip20`, `base-sepolia-deposit`
- Post-deploy root and `/game/` checks: HTTP 200
- Rollback copy: `/home/ec2-user/PrivateDAO/deploy/primary-host/volumes/site/api/runtime/catalog.rollback-20260917T015731Z`

This is discovery metadata only. It does not claim confidential Tempo or Base
payments, customer revenue, or mainnet readiness.
