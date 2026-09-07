# PrivateDAO

## Confidential Coordination Infrastructure for Onchain Organizations

Version 2.0

## Abstract

Onchain organizations have solved ownership.

They have partially solved governance.

They have not solved coordination.

Critical organizational activity still happens outside governance systems:

- Treasury planning
- Contributor evaluation
- Reviewer assignment
- Payroll workflows
- Sensitive discussions
- Emergency response
- Operational approvals

As organizations grow, an increasing percentage of important decisions migrate into private chats, spreadsheets, informal processes, and trusted operators.

This creates a coordination gap.

Governance becomes visible.

Operations remain invisible.

PrivateDAO is building a confidential coordination platform for organizations that need private workflows and independently verifiable outcomes.

The objective is not simply enabling voting.

The objective is enabling organizations to coordinate, approve, execute, audit, and evolve while preserving confidentiality and maintaining verifiability.

The platform starts with three clear paths: Verify, Govern, and Coordinate.

The Kernel is the shared foundation beneath them, while customers interact with simple product workflows rather than infrastructure machinery.

## The Coordination Problem

Most governance systems focus on a single event: a vote.

But organizations spend most of their time outside voting.

Before a proposal appears:

- Research happens.
- Discussions happen.
- Reviews happen.
- Treasury analysis happens.
- Stakeholder alignment happens.

After a proposal passes:

- Execution happens.
- Resource allocation happens.
- Reporting happens.
- Accountability happens.

These operational processes are frequently disconnected from governance systems.

The result is hidden centralization.

Organizations may appear decentralized while depending on invisible coordination structures.

PrivateDAO is designed to make coordination itself a first-class organizational primitive.

## Why Existing Governance Is Not Enough

Current governance tools generally optimize for:

- Proposal creation
- Voting
- Result publication

These systems rarely address:

- Confidential operations
- Treasury workflows
- Sensitive contributor data
- Internal organizational processes
- Private approvals
- Selective disclosure
- Recovery procedures
- Operational continuity

As treasury sizes increase and organizational complexity grows, these missing layers become critical.

The future challenge is not voting.

The future challenge is confidential coordination.

## The PrivateDAO Thesis

Organizations require infrastructure capable of balancing:

- Privacy
- Accountability
- Verifiability
- Operational efficiency

Historically these objectives conflicted.

Privacy reduced transparency.

Transparency reduced confidentiality.

PrivateDAO introduces a framework where organizations can preserve sensitive operational information while still proving that processes occurred correctly.

The goal is selective disclosure rather than complete secrecy or complete transparency.

## Core Principles

### Privacy by Default

Sensitive information should not become public simply because an organization operates onchain.

### Verifiable Execution

Actions should be provably executed according to organizational rules.

### Selective Disclosure

Organizations should reveal outcomes without exposing unnecessary operational details.

### Operational Continuity

Coordination systems must continue functioning during leadership changes, contributor turnover, and periods of organizational stress.

### Composability

PrivateDAO should integrate naturally with the networks and systems each product genuinely needs.

## Architecture Overview

PrivateDAO consists of several coordination layers.

### Governance Layer

Proposal creation, voting mechanisms, quorum enforcement, and approval logic.

### Treasury Layer

Treasury authorization, delegated execution, and operational accountability.

### Coordination Layer

Confidential approvals, reviewer workflows, and contributor coordination.

### Intelligence Layer

Operational visibility, organizational analytics, and governance intelligence.

### Execution Layer

Integration with treasury systems, evidence storage, and certified network providers.

### Kernel Layer

A frozen lifecycle boundary for product invocations, policy, authorization, replay protection, proofs, and evidence.

## Initial Use Cases

### Confidential Governance

Private organizational decisions with verifiable outcomes.

### Treasury Coordination

Managing treasury operations without exposing sensitive strategy.

### Reviewer Networks

Coordinating reviewers, evaluators, and committees.

### Contributor Operations

Managing contributor activity and accountability workflows.

### Grant Committees

Evaluating applications while preserving reviewer independence.

### Emergency Coordination

Maintaining operational continuity during crises.

## Ecosystem Integration Strategy

PrivateDAO is designed to integrate with existing infrastructure without exposing provider complexity in the customer experience.

Examples include:

- Phantom for wallet onboarding
- Squads and Altitude for treasury coordination
- Arcium for encrypted computation research
- World ID for proof-of-human coordination
- Vanish for privacy-preserving execution
- Helius, Triton, and FluxRPC for infrastructure resilience

PrivateDAO does not attempt to replace ecosystem infrastructure.

It coordinates it.

## Why Now

Several structural shifts are occurring simultaneously.

- Organizations are moving onchain.
- Treasuries are growing.
- Global contributor networks are expanding.
- AI agents are beginning to participate in workflows.
- Privacy requirements are increasing.

Existing governance systems were not designed for this environment.

A new organizational coordination layer is emerging as necessary infrastructure.

PrivateDAO is being built for that future.

## Long-Term Vision

The long-term vision extends beyond governance.

PrivateDAO aims to become the coordination operating layer for onchain organizations.

Future organizations will require infrastructure capable of:

- Coordinating humans
- Coordinating AI agents
- Managing treasury operations
- Preserving confidentiality
- Maintaining accountability
- Producing verifiable outcomes

Governance is only the first step toward that future.

The ultimate objective is enabling organizations to operate efficiently without sacrificing either privacy or trust.

PrivateDAO starts with Solana where the current execution and anchoring paths are strongest. Cross-network expansion is capability-led: a network is presented as supported only after its provider, wallet, finality, and end-to-end behavior are implemented and tested for the relevant product.

## Kernel and Network Roadmap

The frozen PrivateDAO Kernel is the shared foundation for every product. Products request generic capabilities such as identity, policy evaluation, proof generation, evidence storage, signing, execution, and finality. Network-specific providers remain outside product business logic.

### Current release path

- Verify records, claims, proofs, and public receipts.
- Govern private proposals and organizational decisions.
- Coordinate treasury requests, approvals, and evidence.
- Certify each product locally before any production cutover.

### Network expansion path

- Solana: first execution and anchoring path, supported only where the deployed and tested flow applies.
- EVM and Stellar: planned provider tracks for products whose identity, signing, execution, or payment needs fit those networks.
- Bitcoin: evaluate for anchoring or payment use cases rather than copying smart-contract assumptions.
- Starknet and Polkadot: evaluate for L2 execution and interoperability when a real product dependency exists.

No network is marketed as supported because a folder, enum, or mock exists. Support requires implementation, integration, end-to-end evidence, and a release decision.

## Conclusion

The next generation of organizations will not be limited by ownership systems.

They will be limited by coordination systems.

The organizations that coordinate effectively will outperform those that merely govern effectively.

PrivateDAO exists to provide the infrastructure required for that transition.

Not a governance application.

Not a voting interface.

A confidential coordination layer for the future of onchain organizations.
