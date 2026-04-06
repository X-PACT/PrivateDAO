# MagicBlock Runtime Evidence

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-06T16:37:42.040Z`
- network: `devnet`
- status: `pending-magicblock-capture`
- target count: `5`
- completed target count: `0`
- deposit success count: `0`
- private transfer success count: `0`
- settle success count: `0`
- execute success count: `0`
- diagnostics snapshot count: `0`

## Target Matrix

- Phantom (`phantom-desktop-magicblock`) | environment: `desktop-browser` | status: `pending-capture`
- Solflare (`solflare-desktop-magicblock`) | environment: `desktop-browser` | status: `pending-capture`
- Backpack (`backpack-desktop-magicblock`) | environment: `desktop-browser` | status: `pending-capture`
- Glow (`glow-desktop-magicblock`) | environment: `desktop-browser` | status: `pending-capture`
- Android Native / Mobile (`android-runtime-magicblock`) | environment: `android-or-mobile` | status: `pending-capture`

## Pending Targets

- Phantom
- Solflare
- Backpack
- Glow
- Android Native / Mobile

## Captures

No MagicBlock runtime captures have been committed yet. The intake and generated review package now exist so real wallet runs can be attached without changing the reviewer surface.

## Required Docs

- `docs/magicblock-private-payments.md`
- `docs/magicblock-operator-flow.md`
- `docs/magicblock-runtime-evidence.md`
- `docs/magicblock-runtime-captures.json`

## Commands

- `npm run build:magicblock-runtime`
- `npm run verify:magicblock-runtime`
- `npm run record:magicblock-runtime -- <capture-json-path>`
- `npm run configure:magicblock`
- `npm run settle:magicblock`
- `npm run magicblock:payments -- transfer --from <OWNER> --to <SETTLEMENT> --mint <MINT> --amount <RAW> --visibility private --from-balance base --to-balance ephemeral`

## Honest Boundary

This package makes the MagicBlock runtime path reviewable without pretending that every wallet environment has already been captured. It exists to turn future captures into stable evidence, not into ad hoc demo claims.
