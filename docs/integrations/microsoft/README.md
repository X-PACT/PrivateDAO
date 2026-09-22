# Microsoft Integration Audit and Design

Status: Phase 2 local integration boundary implemented. No Azure resources have been created and no production infrastructure has been changed.

## Current architecture

The current execution boundary is:

```text
Product
  -> ProductExecutionGateway
  -> ProtocolRegistry
  -> PrivateDaoKernel
  -> ProviderRegistry
  -> Provider or NetworkAdapter
  -> Transport and wallet/provider
  -> Network
  -> Receipt
  -> Reconciliation and evidence
```

The relevant implementation is in `packages/privatedao-runtime/src/`:

- `product-gateway.ts` authorizes product actions before Kernel access.
- `protocol.ts` stores versioned capabilities and role/permission policy.
- `kernel.ts` handles provider resolution, idempotency, lifecycle, receipts, and telemetry hooks.
- `runtime.ts` composes the gateway, protocol registry, Kernel, and providers.
- `evm-network.ts` and `evm-viem-transport.ts` provide the shared EVM path.
- `zcash-network.ts` provides a separate UTXO boundary.

Microsoft integration must enter before the product gateway and must never bypass the Kernel.

The local implementation is now available through:

- `packages/privatedao-runtime/src/identity/entra.ts` for Entra JWT validation, tenant membership lookup, and role authorization.
- `packages/privatedao-runtime/src/azure/secrets.ts` for environment fallback and managed-identity Key Vault access.
- `packages/privatedao-runtime/src/azure/monitor.ts` for optional Azure Monitor OpenTelemetry initialization and privacy-safe Kernel lifecycle spans.

These modules fail closed when identity configuration, tenant mapping, or required roles are missing. They do not create a wallet, sign a transaction, or grant execution authority from authentication alone.

## Identity and authorization audit

The repository does not currently contain Entra ID, OIDC, OAuth, or an enterprise session issuer.
The web application primarily uses Solana wallet adapters and wallet signatures. Backend routes also contain scoped operator, stream, and service-token checks. Supabase REST is used for selected operational records and telemetry; it is not currently the organization identity system.

Payroll has a real tenant-shaped domain model in `scripts/lib/payroll-domain.ts`, including tenants, members, policies, employees, batches, and audit events. However, the current actor and tenant references are not yet bound to a verified enterprise identity. A caller-supplied `tenantId` must not be treated as sufficient tenant isolation for an Azure B2B release.

## Backend and deployment audit

The production topology is AWS/EC2:

```text
Caddy edge
  -> static commercial site
  -> read-node container
       -> chain-watcher container
```

The source of this topology is `deploy/primary-host/docker-compose.yml`, `deploy/primary-host/Caddyfile`, and `scripts/run-read-node.ts`. Static website hosting and backend execution are separate. The current deployment can support an isolated Azure workload without migrating the main website or game.

## Configuration and secret audit

Current configuration is environment-based. The primary host loads an environment file and mounts a read-only secrets directory. The read node can use AWS Secrets Manager and external provider credentials. No Azure Key Vault provider is present.

No secret values are included in this document. Blockchain keys, RPC credentials, service tokens, and deployment credentials remain outside source control.

## Telemetry and persistence audit

The Kernel exposes a telemetry interface. The runtime also contains in-memory job/audit implementations, while Payroll persists its domain state in SQLite. The read node exposes health and metrics endpoints and records selected Supabase/QuickNode operational telemetry. There is no unified Application Insights or OpenTelemetry exporter today.

## Recommended first Microsoft workload

The safest first workload is an isolated **Confidential Payroll** B2B pilot on Testnet/Devnet:

```text
Microsoft Entra login
  -> PrivateDAO tenant session
  -> server-side role and policy authorization
  -> Payroll workflow
  -> ProductExecutionGateway
  -> PrivateDaoKernel
  -> existing testnet provider/network adapter
  -> finality and receipt
  -> reconciliation
  -> verification evidence
```

Entra authentication proves organizational identity only. It must not grant blockchain execution authority by itself. PrivateDAO policy, maker/checker controls, wallet signing, and Kernel authorization remain authoritative.

## Minimum Azure services

1. **Microsoft Entra ID** for enterprise login and organization/user claims.
2. **Azure Container Apps** for one isolated Payroll API workload.
3. **Azure Container Registry** for the private application image.
4. **Azure Key Vault** behind a provider interface, only after an explicit secret-migration decision.
5. **Azure Monitor/Application Insights** for request and execution telemetry without payroll plaintext, proof witnesses, keys, or raw secrets.

The main AWS website, game, existing products, and blockchain services remain unchanged.

## E2E acceptance test

The first Microsoft E2E must use a real Testnet/Devnet path and record:

- test timestamp;
- Azure service and environment;
- Entra authentication and tenant result;
- PrivateDAO product and role;
- target network and network ID;
- transaction or proof identifier where applicable;
- finality;
- receipt;
- reconciliation result;
- evidence artifact path.

The test must fail closed. A successful login, mocked receipt, or provider health response is not execution evidence.

## Marketplace readiness gaps

The following are not currently evidenced and must not be claimed:

- Microsoft Partner Center or publisher verification;
- Microsoft Marketplace SaaS offer;
- SaaS Fulfillment API integration;
- subscription webhooks and plan mapping;
- tenant provisioning lifecycle;
- Microsoft certification or partner badges;
- Azure production deployment;
- external security or compliance certification.

## Required approval before implementation

Fahd must approve the Azure subscription/region and cost boundary, Entra tenant mode and redirect URLs, the first Testnet/Devnet product/network, Key Vault ownership and rotation policy, telemetry retention, and any future Marketplace commercial/legal claims.

The local identity boundary test is `npm run test:azure:identity`. It uses no network, Azure account, or secret. The Azure deployment template is `deploy/azure/payroll-container-app.bicep`; it is reviewable infrastructure code only and has not been applied.

The remaining external gates are Entra App Registration, a durable tenant-membership store wired to the Payroll database, a built/scanned image, Azure subscription/resource-group approval, and a real Testnet E2E run. Until those gates are completed, no Microsoft integration or Marketplace readiness claim is made.
