# Operator Guide

This guide is the shortest professional path for an operator running PrivateDAO as a real product surface.

## Canonical operator sequence

1. Connect a Devnet wallet.
2. Create DAO.
3. Deposit treasury.
4. Submit proposal.
5. Commit vote.
6. Reveal vote.
7. Finalize.
8. Execute treasury.
9. Export evidence and runtime links.

## Operator responsibilities

- confirm DAO PDA before creating proposals
- verify proposal phase before acting
- keep commit salt safe outside the browser
- use confidential fields only when the proposal actually needs them
- review REFHE and MagicBlock boundaries before execution
- confirm explorer links for finalize and execute

## Operator surfaces

- live proposals
- selected proposal panel
- Confidential Treasury Command Center
- Frontier Builder Advisor
- diagnostics page
- proof center

## When to use advanced layers

### Use ZK when

- proposal sensitivity is high
- reviewer scrutiny is high
- the stronger proof-oriented path adds value

### Use REFHE when

- encrypted evaluation should gate execution
- payroll or bonus logic depends on encrypted policy inputs

### Use MagicBlock when

- confidential token settlement must be visible as a corridor boundary before execution

### Use direct treasury only when

- the proposal is simple
- confidentiality is not required

## What the operator must not assume

- browser state is not authority
- docs are not execution
- audit-readiness is not mainnet production clearance

The protocol, wallet signature, timing windows, and evidence boundaries remain the final source of truth.
