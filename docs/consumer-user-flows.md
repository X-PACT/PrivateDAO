# Consumer User Flows

This document describes PrivateDAO from the end-user perspective rather than the protocol perspective.

## 1. Join The Community

User flow:

1. Connect a Solana wallet on Devnet from the live web surface.
2. Hold the governance token used by the DAO.
3. Load the active proposal list and current phase data directly from on-chain state.

What the user experiences:

- no separate account registration flow
- no custom custody layer
- wallet-based identity
- proposal access tied to community token ownership

## 2. Discover A Proposal

User flow:

1. Open the proposal list.
2. Inspect title, treasury action, timing windows, and execution conditions.
3. Decide whether to participate.

What the user experiences:

- familiar card-based proposal browsing
- visible lifecycle phases
- explicit treasury context
- no need to parse raw chain data manually

## 3. Commit A Vote

User flow:

1. Select the proposal.
2. Choose a vote direction.
3. Generate the commitment.
4. Sign the transaction.
5. Save the reveal material when prompted.

What the user experiences:

- privacy during the active voting window
- a clear action boundary
- no public live tally disclosure at commit time

## 4. Reveal A Vote

User flow:

1. Return during the reveal phase.
2. Re-open the proposal.
3. Submit the reveal material.
4. Verify that the vote is accepted and counted.

What the user experiences:

- a second simple action rather than a complex cryptographic flow
- deterministic rejection if the reveal is invalid or late
- clear lifecycle progression toward finalization

## 5. Observe Finalization

User flow:

1. Wait for the reveal window to close.
2. Inspect the final status.
3. Confirm whether the proposal passed or failed.

What the user experiences:

- transparent status transitions
- explicit outcome visibility
- no ambiguous moderator-controlled state changes

## 6. Observe Treasury Execution

User flow:

1. Wait for the timelock window.
2. Confirm the proposal becomes executable.
3. Verify the execute transaction and treasury result.

What the user experiences:

- confidence that passed proposals do not execute instantly
- inspectable treasury actions
- clear transaction evidence rather than hidden admin behavior

## 7. Mobile-Native Path

PrivateDAO also exposes an Android-native path through Solana Mobile Wallet Adapter.

That matters for consumer usage because:

- communities increasingly coordinate on mobile-first surfaces
- wallet-native mobile flows reduce product friction
- governance participation does not need to stay desktop-only

See:

- `docs/android-native.md`

## 8. Token Utility In The User Flow

In user terms, `PDAO` is not just metadata.

It affects:

- who can participate
- who can create proposals
- who can influence treasury decisions
- how community weighting enters the lifecycle

That makes the token feel like part of the product flow rather than an external badge.
