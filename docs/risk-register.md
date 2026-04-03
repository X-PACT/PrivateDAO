# Risk Register

## Purpose

This register summarizes the most important real risks that remain relevant to PrivateDAO after the current hardening and documentation work.

The intent is to make residual risk explicit rather than implicit.

| Risk | Category | Current Status | Mitigation Surface | Residual Note |
| --- | --- | --- | --- | --- |
| direct commit vs delegation overlap is not fully enforced on-chain | protocol semantics | partially mitigated | frontend and CLI guards, security docs | fixing on-chain would require widening current public account interface |
| mainnet release without external audit | deployment / assurance | open | readiness docs, audit handoff, release gates | no external audit is claimed by the repository |
| production signer misuse or poor custody | operations | open | production operations, cutover runbook, incident response | requires real organizational controls outside the codebase |
| RPC degradation or divergence | infrastructure | open | monitoring docs, RPC health scripts, operator checklist | still depends on provider selection and active monitoring |
| strategy alpha / APY proof not embedded in protocol package | product / competition fit | open | Ranger docs, strategy operations, risk policy | requires the paired strategy stack and live or backtest evidence |
| Android runtime verification outside this shell | product surface | partial | Android native docs and code | full runtime validation needs Android SDK/device environment |
| commit-reveal hides vote content but not timing metadata | privacy boundary | known design limit | protocol docs and threat model | this is documented honestly and not treated as solved privacy |
| CustomCPI is event-only, not arbitrary CPI execution | execution scope | intentional | protocol spec and docs | conservative by design; not a bug |

## Use

Review this register before:

- audit handoff
- mainnet cutover
- grant or competition submission
- production operations planning
