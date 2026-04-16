# PrivateDAO Guide

## What PrivateDAO is

PrivateDAO is a privacy-first governance and treasury product on Solana.

The simple explanation is:

- a team connects a Devnet wallet
- creates or joins a DAO
- creates a proposal
- commits and reveals a vote
- executes a treasury or governance decision
- then verifies what happened through proof, telemetry, analytics, hashes, and runtime logs

The product is designed so a normal user can understand the path first, while the deeper cryptography and infrastructure stay available for reviewers, operators, and technical users.

## What problem it solves

Many governance and treasury tools force users to choose between:

- privacy without clarity
- clarity without privacy
- speed without discipline
- or complexity that only protocol experts can navigate

PrivateDAO exists to close that gap.

It turns private governance, treasury coordination, and confidential operations into one product path that can be used from the browser and inspected after the fact.

## Where it is useful

### Private governance

Use PrivateDAO when a DAO, committee, protocol, or working group wants to vote privately without turning execution into a black box.

### Payments and treasury operations

Use it when grants, contributor payouts, vendor payments, or internal treasury motions need governance, proof, and operating discipline together.

### Gaming and live communities

Use it when a gaming community, guild, reward council, or live economy needs faster approvals and stronger trust around rewards or operational spending.

### API and RPC-aware products

Use it when a team wants the governance surface to stay readable and observable, with analytics, telemetry, runtime logs, and read-node context exposed to reviewers and operators.

## How the product stays simple

PrivateDAO keeps the visible user path narrow:

1. connect a Devnet wallet
2. open the guided governance flow
3. create a DAO or proposal
4. commit and reveal
5. verify the result

The complexity sits behind that path:

- proposal state handling
- privacy modes
- treasury routing
- telemetry
- runtime proof
- transaction capture
- reviewer packets

This is the point of the product design: advanced governance and encryption should feel usable, not theatrical.

## How the main technologies fit into the product

### Solana Devnet

Devnet is the environment where the product is exercised with real wallets and real signatures while remaining safe for iteration and public review.

### Wallet-first execution

Solflare, Phantom, Backpack, and similar wallets are used to sign the actual product actions. This matters because the visitor can experience the real flow instead of only reading about it.

### ZK voting

Zero-knowledge rails help PrivateDAO preserve vote privacy while keeping the product verifiable after the action is recorded.

### MagicBlock and REFHE settlement

These help explain and structure confidential settlement corridors so treasury movement can stay private, readable, and productized.

### Jupiter treasury routing

Jupiter is used to shape governed treasury routing, payout funding, and rebalance planning inside the product’s treasury path.

### Kamino capital coordination

Kamino helps frame how treasury policy can extend into disciplined capital allocation rather than static treasury storage.

### API, read node, and RPC visibility

PrivateDAO keeps proposal state, telemetry, proof freshness, and service visibility accessible so users and reviewers do not have to trust hidden infrastructure.

## What a visitor can verify on Devnet

A visitor can:

- connect a real Devnet wallet
- run a real governance path
- inspect proposal and settlement signatures
- open proof and telemetry packets
- inspect analytics and diagnostics
- follow runtime evidence after each action

That is the practical threshold:

the visitor should feel that the product is real, coherent, private, fast, and inspectable without needing to become a Solana protocol engineer first.

## The easiest route to test PrivateDAO

Use this order:

1. `/start/`
2. `/govern/`
3. `/proof/`
4. `/analytics/`
5. `/documents/reviewer-fast-path/`

If you want the shortest explanation of the product itself, use:

- `/learn/`
- `/story/`
- `/services/`

## How the ecosystem benefits

PrivateDAO is meant to serve as public-good governance and treasury infrastructure.

The value to the ecosystem is not only a private voting demo.

It is a product direction that brings together:

- private governance
- treasury discipline
- reviewer-visible proof
- wallet-first execution
- runtime transparency
- educational clarity for non-experts

The stronger this gets, the easier it becomes for DAOs, operators, community programs, games, and treasury teams to adopt serious governance without accepting opaque tooling.

## Community collaboration

PrivateDAO welcomes community testing, review, and external security collaboration.

The right posture is not to hide the product from scrutiny.

It is to make the product easy to test, easy to inspect, and increasingly easier to trust as more real usage, feedback, and review are added around it.
