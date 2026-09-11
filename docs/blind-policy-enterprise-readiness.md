# Blind Policy Enterprise Readiness

Date: 2026-09-11

## Product Boundary

Blind Policy Verification lets an operator prove that a private policy was
satisfied without publishing the source records, thresholds, reviewer notes,
or private inputs. The public result is a verification artifact, not a copy of
the underlying business data.

This document describes the current readiness boundary. It does not claim
Mainnet approval, an external security audit, or support for a network without
independent execution evidence.

## Verified Today

- Groth16 proof generation and local verification use the committed circuit
  package and verification key.
- Ethereum Sepolia has an independent on-chain verifier and blind registry
  E2E artifact with altered-proof, wrong-chain, expiry, and revocation checks.
- Tempo Testnet has an independent on-chain verifier and blind registry E2E
  artifact with the same negative-path checks.
- The runtime exposes Blind Verification only through the shared Kernel and
  records network, provider, receipt, and proof references.
- Public verification links expose claims and status, not the private source
  payload.

## Customer Flow

1. Choose a policy and provide the private inputs locally or through the
   configured execution service.
2. Generate a proof package.
3. Verify the proof and inspect the receipt.
4. Share the public verification link with an auditor, partner, or reviewer.
5. Revoke or expire the artifact according to its configured policy.

## Evidence Boundary

The current verified network lanes are Ethereum Sepolia and Tempo Testnet for
Blind/Record Verification. Solana Devnet has implementation and runtime
evidence for its declared lanes, but this document does not promote it to an
independent production claim. Arbitrum, BNB, Base, Robinhood, and Mainnet
remain planned or pending their own funded contract-write and verification
evidence.

## Required Enterprise Gates

- Independent security review of the circuit, verifier, registry, and key
  lifecycle.
- Production custody and upgrade-authority closure.
- HSM/KMS-backed proving and signing operations where required by the buyer.
- Real-device wallet and browser verification for the supported customer lane.
- Additional circuits and SDKs only after each has its own test vectors and
  tamper tests.

## Non-Claims

Blind Policy Verification does not by itself certify legal compliance, tax
compliance, or a customer's business policy. Those claims require the policy
owner's rules, jurisdictional review, and an appropriate audit process.
