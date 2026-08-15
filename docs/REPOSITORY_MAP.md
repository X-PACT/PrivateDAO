# Repository Map And Cleanup Boundary

Updated: 2026-08-15

## Source Of Truth

The canonical implementation is the source tree, not the generated route
folders at the repository root and not a deployed HTML snapshot.

| Area | Canonical source | Generated or evidence copies |
| --- | --- | --- |
| Web product | `apps/web/src/` | Root route folders, `apps/web/out/`, `dist/web-mirror-*` |
| Solana programs | `programs/` | `target/`, `.so` files, deployment keypairs |
| Client contracts | `idl/` | Build output under `target/idl/` |
| Operational scripts | `scripts/` | Generated reports under `docs/` and `dist/` |
| Product evidence | `docs/` | Reviewer bundles and compressed archives under `dist/` |

## Current Product Boundary

The public product narrative should lead with Verify, Govern, Treasury, and
Workflows. Confidential Auctions is a specialist Devnet product until its
MagicBlock runtime and Solana settlement evidence pass the documented gates.

The following are not primary commercial products merely because historical
routes or scripts exist. They require an owner-approved disposition before
removal or public relabeling:

- historical judging and competition pages;
- generated route snapshots;
- old provider/payment corridors;
- reviewer packets and generated evidence;
- deprecated integration demos.

## Cleanup Categories

### Keep

- `apps/web/src/`
- `programs/`
- `idl/`
- `scripts/`
- tests and security controls;
- current product and deployment documentation;
- required CI reviewer artifacts.

### Keep Until Cutover

- root static mirror folders;
- `dist/reviewer-bundle*`;
- deployment manifests and rollback evidence;
- historical runtime reports referenced by verification scripts.

### Archive Before Removal

- old MagicBlock private-payments material;
- judging, track, and competition-only pages;
- duplicate generated reports;
- obsolete provider demonstrations;
- stale static site snapshots.

### Never Copy Or Commit

- wallet keypairs;
- PEM files;
- `.env` files;
- production credentials;
- database exports;
- `target/` and build caches;
- private receipts or proving secrets.

## Safe Cleanup Sequence

1. Build the web mirror from `apps/web/` and verify required routes.
2. Record hashes and locations of any snapshot being retired.
3. Move historical material into a dated archive or release tag.
4. Run source, secret, dependency, and artifact-freshness checks.
5. Remove generated snapshots only after rollback and CI checks pass.
6. Rebuild the mirror and perform a visual check before any production
   deployment.

No production cleanup is implied by this map. Amazon, the live website, and
the current production database require a separate approved change.
