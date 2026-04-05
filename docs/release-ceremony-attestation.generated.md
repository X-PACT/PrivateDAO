# Release Ceremony Attestation

## Overview

- Generated at: `2026-04-05T14:37:52+02:00`
- Release commit: `9116378b1811d400d5f4d2e3142553891cfa1af7`
- Release branch: `main`
- Program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Deploy transaction: `2FTRdNt2e1AXqPBwYReDiaNHjRZF2N7VtQeF17Ue56S7UoJPqZQxZ5gi32fRvAgE7ToE636EaDkanEoZvvcin9pD`

## Anchors

- dao: `FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx`
- governanceMint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- treasury: `AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c`
- proposal: `AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP`

## Ceremony Documents

- `docs/release-ceremony.md`
- `docs/mainnet-cutover-runbook.md`
- `docs/operator-checklist.md`
- `docs/mainnet-readiness.generated.md`
- `docs/deployment-attestation.generated.json`
- `docs/go-live-attestation.generated.json`

## Mandatory Gates

- `npm run verify:live-proof`
- `npm run verify:release-manifest`
- `npm run verify:review-links`
- `npm run verify:review-surface`
- `npm run check:mainnet`

## Ceremony Status

- Observed gate count: `57`
- Deployment gate count: `57`
- Go-live decision: `blocked-pending-external-steps`

## Unresolved Blockers

- strategyEngine: `not-in-repo`
- livePerformance: `not-in-repo`
- externalAudit: `pending`
- mainnetRollout: `pending`

## Notes

- This attestation records release discipline, not a claim that mainnet cutover has already happened.
- External audit and organizational custody approvals remain out-of-repo blockers.
- The ceremony surface is reviewer-visible so release rigor can be inspected rather than asserted.
