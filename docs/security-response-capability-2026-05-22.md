# Security Response Capability 2026-05-22

This packet records how PrivateDAO handled a concrete security finding during judging-stage hardening: identify the failure mode, fix the vulnerable boundary, add a repeatable gate, and keep public claims aligned with evidence.

## Finding

The browser commit/reveal voting lane could persist the reveal preimage field `saltHex` inside the `privatedao-governance-session` `localStorage` entry.

Security invariant: a browser vote preimage must not be stored in long-lived browser storage before reveal. If an injected script, malicious extension, or page-level XSS can read browser storage during the commit window, it should not be able to recover the vote salt from the application state.

Affected surface:

- `apps/web/src/components/governance-session.tsx`
- `apps/web/src/components/governance-action-workbench.tsx`

## Remediation

Fix commit:

- commit: `27e979c072cacc5661e856fdba4310a387a93335`
- committed at: `2026-05-22T22:50:53+03:00`
- subject: `Harden vote salt privacy boundaries`

Implemented controls:

- Browser-persisted governance state is redacted before writing to `localStorage`.
- `saltHex` is optional in runtime state and is intentionally absent from persisted state.
- Pre-reveal `voteChoice` is redacted from persisted state.
- The governance workbench no longer renders reveal salts in the DOM.
- Reloading a tab before reveal discards the in-memory preimage instead of weakening the privacy boundary.

The UX tradeoff is intentional: the web flow is now less forgiving but safer. A user who closes or reloads the tab before reveal must recommit or use an operator path that manages the reveal preimage outside browser storage.

## Verification Gate

Repeatable command:

```bash
npm run verify:security-boundaries:2026-05-22
```

The gate checks that:

- source code no longer persists raw governance state with `JSON.stringify(state)`;
- persisted governance state redacts `saltHex`;
- the workbench no longer renders a `Reveal salt:` disclosure;
- the homepage does not market an unqualified `ZK privacy` claim;
- monitoring remains truth-bounded unless delivery evidence is closed.

Supporting remediation packet:

- `docs/security-remediation-2026-05-22.md`

## Public Claim Boundary

What is now safe to say:

- PrivateDAO detected a vote-preimage persistence weakness.
- The browser storage boundary was fixed in code.
- A repo gate now prevents regression of the same class of claim and storage drift.
- The ZK lane is presented as commit/reveal plus off-chain proof review today, not as a shipped on-chain verifier CPI.
- A standalone Testnet ZK verifier program now emits a live BN254 pairing receipt, while full circuit verification-key enforcement remains a separate production gate.

What is not claimed by this packet:

- external audit completion;
- production monitoring delivery closure;
- mainnet real-funds readiness;
- production multisig authority transfer completion.

## Custody Follow-Up

The Testnet program-upgrade authority has now moved from the single deployer key to a Squads vault PDA.

Observed readout after transfer on `2026-05-22`:

```text
Program Id: EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva
ProgramData Address: FKyt5DcmRQcCF8kzMGjCvfGb3ZPHMQnH1SqiG9Mi8xEc
Authority: CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv
Last Deployed In Slot: 405189011
```

Transfer evidence:

- Squads multisig: `thHmF7VYNtxE1MaDzYXbfPCiq13RF6JwuWnjvDZuSmF`
- Squads vault authority: `CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv`
- threshold: `2-of-3`
- timelock: `48 hours`
- creation signature: `67S63JAUNvvCED3hE9h6bCXW9iJ3EYzJLARvj8Lki5x2dJEgLnrfES9mp6bAxfsH6vfmor2ocqNaEd68uVN68DNJ`
- upgrade transfer signature: `EzwLLrAchBpj3eLTUFuv1uo9rSLKgKNbQgp1DkCevJycT31Eou9TSJsJsEfMjLt4q87pKwXaZUTqCZ1NduNc1vy`

This closes the Testnet program-upgrade single-key authority gap. DAO authority, treasury-operator authority, external audit, and mainnet real-funds readiness remain separate gated items.

## Follow-On Response Evidence

After the browser privacy remediation, PrivateDAO added two further reviewer-visible hardening signals:

- Squads upgrade proposal `1` reached `2-of-3` approval with second approval signature `2wpJ27Mkb5CffngRx9U6upPjB8jbzWHoFrDLnxhB5NSCiiXCFGt5HVDYU8U7FtwYusynRCcWhy1T6av22VzCC7MY`.
- Standalone Testnet ZK verifier program `5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j` emitted receipt signature `zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67`.

These do not remove the remaining timelock and full-circuit verifier-key gates. They do show the operating pattern expected from a security-capable founder-built infrastructure project: disclose the boundary, close what can be closed immediately, and convert every serious claim into a transaction, gate, or receipt.
