# Real-Device Runtime Evidence

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-06T11:13:03.520Z`
- network: `devnet`
- status: `pending-real-device-capture`
- target count: `5`
- completed target count: `0`
- successful connect count: `0`
- successful submission count: `0`
- diagnostics snapshot count: `0`

## Target Matrix

- Phantom (`phantom-desktop`) | environment: `desktop-browser` | status: `pending-capture`
- Solflare (`solflare-desktop`) | environment: `desktop-browser` | status: `pending-capture`
- Backpack (`backpack-desktop`) | environment: `desktop-browser` | status: `pending-capture`
- Glow (`glow-desktop`) | environment: `desktop-browser` | status: `pending-capture`
- Android Native / Mobile (`android-runtime`) | environment: `android-or-mobile` | status: `pending-capture`

## Pending Targets

- Phantom
- Solflare
- Backpack
- Glow
- Android Native / Mobile

## Captures

No real-device captures have been committed yet. The intake and verification path is now in place so these runs can be added without changing the reviewer surface.

## Required Docs

- `docs/real-device-runtime.md`
- `docs/real-device-runtime-captures.json`
- `docs/runtime-attestation.generated.json`
- `docs/external-readiness-intake.md`

## Commands

- `npm run build:real-device-runtime`
- `npm run verify:real-device-runtime`
- `npm run verify:runtime-surface`
- `npm run verify:all`

## Honest Boundary

This package makes real-device wallet QA reviewer-visible and reproducible as an intake process. It does not treat browser-side diagnostics as a substitute for actual wallet, device, and client captures.
