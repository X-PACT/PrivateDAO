# PrivateDAO Commercial Readiness Implementation

Date: 2026-06-17

## Objective

PrivateDAO should be commercially purchasable without requiring mainnet governance deployment.

The commercial product is:

- Private Governance
- Treasury Coordination
- Reviews & Approvals
- Organizational Intelligence
- Verifiable Outcomes

Crypto payment support activates subscriptions and pilot programs. PrivateDAO is not positioned as a payment platform or payroll platform.

## Supported Payment Assets

Primary:

- USDC on Solana
- USDC on Ethereum
- SOL
- ETH

Secondary:

- BTC
- WBTC
- ZEC
- USDT
- DAI

## Treasury Wallet Configuration

Treasury addresses are configurable from environment variables:

- `PD_SOLANA_TREASURY`
- `PD_ETHEREUM_TREASURY`
- `PD_BITCOIN_TREASURY`
- `PD_ZCASH_TREASURY`

The current implementation provides default configured Solana and Ethereum treasury addresses for checkout preparation. Bitcoin and Zcash remain configurable and disabled until the relevant treasury address is supplied.

## Checkout Flow

1. Customer selects a plan.
2. Customer selects a payment asset.
3. The system displays the configured treasury address.
4. Customer submits a transaction hash.
5. The system validates the hash format and returns a verification state.
6. The system issues:
   - Payment receipt
   - Organization license record
   - Subscription activation state
7. The receipt object is returned with the organization record fields needed for persistence.

## License Model

License types:

- `TRIAL`
- `COMMUNITY`
- `PROFESSIONAL`
- `ORGANIZATION`
- `ENTERPRISE`

Organization license record fields:

- `licenseType`
- `licenseStart`
- `licenseEnd`
- `paymentAsset`
- `paymentHash`
- `organizationId`
- `paymentReceiptId`
- `subscriptionActivation`

## Trial Model

All plans receive a 14-day trial.

Trial restrictions:

- Limited rooms
- Limited proposals
- Limited reviewers
- Limited proof records
- No custom branding
- No advanced intelligence

## Pricing

### Community

Price: Free

Includes:

- 1 organization
- 3 rooms
- 25 members
- 10 proposals
- Basic governance
- Basic proof records

### Professional

Price: $99/month

Includes:

- 1 organization
- 100 members
- Unlimited rooms
- Governance
- Treasury workflows
- Review workflows
- Proof center
- Intelligence summaries

### Organization

Price: $499/month

Includes:

- Unlimited members
- Governance
- Treasury
- Reviews
- Approvals
- Audit trails
- Intelligence layer
- Workflow builder
- Advanced proofs

### Enterprise

Price: Custom

Includes:

- Dedicated deployment
- SLA
- White-label
- Custom integrations
- Advanced compliance workflows
- Custom proof systems

## API Surfaces

- `GET /api/commercial/checkout/status`
- `POST /api/commercial/checkout/prepare`
- `POST /api/commercial/checkout/verify`

## Product Boundary

Financial modules remain extensions:

- Confidential Payroll
- Confidential Payments
- Vesting
- Compensation

They are grouped as Advanced Financial Modules and should not define the primary product narrative.
