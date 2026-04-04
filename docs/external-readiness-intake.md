# External Readiness Intake

This note defines the evidence that must be collected outside the repository before PrivateDAO should be described as mainnet-ready in the strong operational sense.

## Required External Evidence

- external audit report or auditor-issued closing memo
- production custody and multisig policy confirmation
- real-device wallet QA evidence
- live monitoring and alert routing proof
- mainnet deployment approval and rollback ownership

## Real-Device Wallet QA Intake

Capture at minimum:

- wallet name and version
- device or browser environment
- connect result
- signing result
- transaction submission result
- error text if any
- screenshots or screen recordings when relevant

Supported runtime targets should include:

- Phantom
- Solflare
- Backpack
- Glow
- mobile browser or Android-native path when available

## Production Custody Intake

Record:

- upgrade authority holder or multisig
- treasury custody owner
- release approvers
- rollback approvers
- emergency contact path

## Monitoring Intake

Record:

- primary RPC
- fallback RPC
- alerting destination
- who acknowledges incidents
- expected response windows

## Honest Boundary

This repository can prove that these surfaces are required.
It cannot fabricate the external approvals, device runs, or audit sign-offs themselves.
