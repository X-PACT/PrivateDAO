# PrivateDAO Token Architecture

## Purpose

The PrivateDAO token exists to make governance participation structured, accountable, and economically aligned.

Within the system, the token functions as:

- a governance coordination mechanism
- a participation accountability layer
- an anti-spam protection primitive
- a lifecycle participation control layer
- a long-term ecosystem component

Private governance alone is not enough. A governance system also needs a clear mechanism for determining who can participate, who can create proposals, and who is economically aligned with the consequences of execution. The token provides that coordination surface.

## Core Roles of the Token

### 1. Governance Participation

Token holders may:

- submit proposals
- participate in voting
- interact with the governance lifecycle

Token presence creates structured participation instead of open-ended noise. That matters for a protocol built around proposal state transitions, voting accountability, and treasury execution discipline.

### 2. Proposal Creation Responsibility

Token ownership or stake helps:

- prevent spam proposals
- create cost-backed intent
- improve governance signal quality

Proposal creation is more meaningful when it is tied to economic participation. That discourages low-quality governance churn and keeps lifecycle resources focused on proposals with real backing.

### 3. Voting Authority Layer

Token ownership defines voting eligibility or voting weight at the governance surface.

This makes governance accountable. Instead of anonymous participation detached from consequences, the token ties governance influence to a recognizable participation layer that can be reasoned about, verified, and enforced through the lifecycle.

### 4. Treasury Safety Alignment

Treasury actions are among the highest-stakes operations in the protocol.

Token-governed participation supports treasury safety by:

- limiting who can shape treasury proposals
- aligning governance power with economic exposure
- reinforcing the commit -> reveal -> finalize -> execute lifecycle
- making execution decisions part of an accountable governance process

This strengthens execution safety without changing the underlying contract interfaces.

### 5. Long-Term Ecosystem Role

Over time, the token serves as:

- a governance identity anchor
- a participation registry mechanism
- a future DAO evolution component

That does not require speculative tokenomics. It simply means the token is part of the governance architecture, not an external add-on.

## Token Characteristics

- Token Name: `PrivateDAO Governance Token`
- Symbol: `PDAO`
- Network: `Devnet` (initial)
- Launch Platform: `DeAura`

The initial Devnet launch is intentional. It allows the token surface, metadata, verification path, and governance documentation to be exercised in a live Solana environment before any future production cutover.

## Security Considerations

Token misuse risks are reduced through the same governance safety model already documented elsewhere in the repository:

- proposal lifecycle gating
- replay protection
- signer verification
- governance structure enforcement

The token does not replace protocol security. It works with it by making participation more accountable and governance flow more structured.

For the broader security reasoning layer, see:

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`

## Governance Access Layer

The token should be read as a governance access layer in the broader PrivateDAO architecture:

```text
User
  -> Token Ownership
  -> Proposal Eligibility
  -> Governance Lifecycle
  -> Treasury Outcome
```

This flow clarifies the role of the token:

- token ownership gates participation
- participation enters the lifecycle
- lifecycle discipline protects execution
- execution remains accountable to token-governed process
