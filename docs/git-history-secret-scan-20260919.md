# Git History Secret Scan

Observed: `2026-09-19`

This read-only scan covered every object reachable from the three local
canonical refs: `main`, `canonical-live`, and `rebrand/enterprise-white`.

## Coverage

- Unique reachable objects: `7,531`
- Blob objects: `4,742`
- Blobs scanned under 4 MiB: `4,740`
- Large blobs scanned separately: `2`
  - the Android debug APK
  - the Groth16 PTAU artifact
- Total text/binary bytes scanned: `225,733,740`

The scan checked high-confidence signatures for AWS access keys, private-key
blocks, GitHub tokens, Telegram bot tokens, and common secret assignments.
It emitted counts only and never printed a candidate value.

## Result

All signature counts were zero, including the two large artifacts.

## Boundary

This proves the scan result for the reachable objects in the three refs above.
It is not a certification of every historical commit in remote branches that
are not present locally. GitHub Secret Scanning remains disabled for the
private repository, so the archived-branch/IP audit remains a separate
boundary.
