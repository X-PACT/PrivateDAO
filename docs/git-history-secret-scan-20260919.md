# Git History Secret Scan

Observed: `2026-09-19`

This read-only scan covered every object reachable from the 23 local refs,
including the canonical branches and fetched remote/dependabot branches.

## Coverage

- Reachable Git objects: `238,650`
- Blob objects: `190,894`
- Blobs scanned under 4 MiB: `190,842`
- Large blobs scanned separately: `52`
- Total text/binary bytes scanned: `7,035,720,136`

The scan checked high-confidence signatures for AWS access keys, private-key
blocks, GitHub tokens, Telegram bot tokens, and common secret assignments.
It emitted counts only and never printed a candidate value.

## Result

All high-confidence credential signature counts were zero, including the
large artifacts. A secondary assignment-pattern pass found only documented
environment variable names in example configuration and public values such as
wallet addresses or file paths; it found no secret value.

## Boundary

This proves the scan result for all refs currently present in the local clone,
including the fetched remote branches. It is not a certification of an
unfetched or server-side dangling object. GitHub Secret Scanning remains
disabled for the private repository, so this report is the repository-level
evidence boundary.
