<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# MagicBlock Runtime Evidence

PrivateDAO now treats MagicBlock as a first-class runtime track, not just a feature note.

This evidence package exists to capture real wallet runs for the proposal-bound MagicBlock confidential payout corridor across desktop and mobile wallet environments.

## Why this package exists

The Anchor program, frontend, CLI, and backend read node already support:

- confidential token payout plans
- proposal-bound MagicBlock corridor configuration
- wallet-side MagicBlock deposit, private transfer, and withdraw flow
- on-chain corridor settlement with validator, queue, and transaction evidence
- execution gating until settlement is visible on-chain

What still matters for judges and operators is runtime proof that this path behaves correctly across real wallet environments.

## Runtime checkpoints

Each capture should prove the following sequence on Devnet:

1. A confidential token payout proposal exists.
2. The proposal has a configured MagicBlock corridor.
3. The operator wallet runs the MagicBlock route:
   - optional mint initialization
   - deposit
   - private transfer
   - withdraw
4. The corridor is settled on-chain.
5. The payout proposal executes successfully through the MagicBlock-bound path.
6. A diagnostics snapshot is captured from the live frontend.

## Source of truth

- source registry: `docs/magicblock-runtime-captures.json`
- generated package: `docs/magicblock-runtime.generated.json`
- generated review note: `docs/magicblock-runtime.generated.md`

## Templates

- `docs/magicblock-runtime-templates/README.md`
- `docs/magicblock-runtime-templates/phantom-desktop-magicblock.json`
- `docs/magicblock-runtime-templates/solflare-desktop-magicblock.json`
- `docs/magicblock-runtime-templates/backpack-desktop-magicblock.json`
- `docs/magicblock-runtime-templates/glow-desktop-magicblock.json`
- `docs/magicblock-runtime-templates/android-runtime-magicblock.json`

## Commands

```bash
npm run capture:magicblock-runtime -- phantom-desktop-magicblock --template-only
npm run record:magicblock-runtime -- /path/to/capture.json
npm run build:magicblock-runtime
npm run verify:magicblock-runtime
```

## Honest boundary

This package does not claim that MagicBlock runtime evidence already exists for every wallet environment. It creates a stable, machine-readable review surface so real captures can be added without changing the surrounding reviewer story.
