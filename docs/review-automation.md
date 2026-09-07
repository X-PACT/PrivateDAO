# Review Automation

PrivateDAO treats its reviewer surface as an operational system, not a static folder of notes.

## Automation Layers

- CI runs the unified verification gate on pushes and pull requests
- Devnet canary runs on a schedule and verifies runtime anchors
- reviewer artifacts are rebuilt deterministically from repository builders
- artifact freshness checks ensure the deterministic generated files match current builders
- real-device runtime intake is rebuilt and verified from a canonical capture registry
- packaged review bundles can be rebuilt for handoff without manual curation

## Core Commands

```bash
npm run verify:all
npm run verify:artifact-freshness
npm run build:review-bundle
npm run verify:review-bundle
```

## What This Proves

- reviewer-visible evidence is generated, not hand-maintained
- release-facing documentation is coupled to verification gates
- the packaged reviewer bundle is verified to include both canonical baseline proof and additive V3 proof surfaces
- operational evidence remains reproducible across CI and local review runs

## Limits

- scheduled automation does not replace external audit
- repository automation does not replace live device QA
- mainnet release approval still depends on external custody and organizational controls
