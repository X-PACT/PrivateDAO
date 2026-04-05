# Authority Hardening

This note defines the minimum production authority model PrivateDAO should satisfy before any real mainnet cutover.

It is not a claim that production custody is already complete. It is the shortest authority-specific checklist in the repository.

## Why This Matters

The highest-consequence failures in a governance system are not only protocol bugs.

They also include:

- unmanaged upgrade authority
- treasury operations routed through the wrong signer path
- token administration handled from an informal wallet
- unclear emergency ownership during incidents

## Minimum Production Model

Before mainnet, the authority surface should be split into explicit roles.

### 1. Upgrade Authority

- do not leave program upgrade authority on a single personal wallet
- move upgrade authority to an explicit multisig or governance-owned authority path
- record who can propose, approve, and execute an upgrade
- document how authority is revoked or transferred after stabilization

### 2. Treasury Operations

- separate treasury execution signers from general review wallets where possible
- record the signer path used for treasury-sensitive actions
- define who is allowed to approve or broadcast treasury operations
- require post-operation signature retention for auditability

### 3. Token Administration

- document whether mint authority is disabled or retained
- if any token-admin path remains live, document who controls it and why
- ensure token administration is not confused with program-governance authority

### 4. Emergency Authority

- define who can pause, veto, or contain incidents operationally
- define who owns the incident-response decision path
- define how operator communication happens during a live issue

## Multisig Expectations

The repository does not prescribe one specific vendor or custody stack.

It does require the production model to answer these questions clearly:

- what address or control path holds upgrade authority
- how many approvals are required
- who the approvers are by role
- how signer rotation works
- how lost-device or lost-key recovery is handled

## Blocking Conditions

Do not describe PrivateDAO as ready for mainnet cutover if any of the following remain true:

- upgrade authority still sits on an unmanaged personal signer
- treasury and token administration paths are not separated clearly
- no written signer-rotation plan exists
- emergency ownership is still ambiguous

## Repository Links

- [mainnet-go-live-checklist.md](/home/x-pact/PrivateDAO/docs/mainnet-go-live-checklist.md)
- [production-operations.md](/home/x-pact/PrivateDAO/docs/production-operations.md)
- [mainnet-cutover-runbook.md](/home/x-pact/PrivateDAO/docs/mainnet-cutover-runbook.md)
- [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md)
- [operator-checklist.md](/home/x-pact/PrivateDAO/docs/operator-checklist.md)

## Honest Boundary

This repository can define the authority model and make the blocker visible.

It cannot, by itself, complete organizational custody, multisig onboarding, or real-world signer governance.
