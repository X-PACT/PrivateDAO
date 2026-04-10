# Next.js Live Cutover

This note records the completed transition from the old `docs/` entry surface to the new `apps/web` Next.js export at the repo root.

## Current Truth

- The repo root now serves the `apps/web` static export as the live reviewer-facing surface.
- `docs/` remains available as the archive and raw-reference surface.
- `apps/web` now includes:
  - legacy `?page=` compatibility at the root route
  - curated `/documents/` routes for reviewer and trust packets
  - broad `/viewer/` routes for repository markdown parity
- The Next.js app supports:
  - `/PrivateDAO` base path for GitHub Pages
  - root-domain export for a future `.xyz` deployment

## Export Commands

From repo root:

```bash
npm run web:build
npm run web:build:github
npm run web:build:root
npm run web:bundle:github
npm run web:bundle:root
```

Generated artifacts:

- `dist/web-mirror-github/`
- `dist/web-mirror-github.tar.gz`
- `dist/web-mirror-root/`
- `dist/web-mirror-root.tar.gz`

## Completed Cutover Checks

The root publication now verifies:

1. `/`
2. `/command-center/`
3. `/proof/`
4. `/proof/?judge=1`
5. `/documents/`
6. `/viewer/`
7. `/security/`
8. `/diagnostics/`
9. `/services/`
10. `/awards/`
11. legacy `?page=` entrypoints routing through the Next root surface
12. reviewer and judge links resolving under the GitHub Pages base path

## Remaining Boundary

Do not interpret this completed cutover as a `.xyz` domain cutover.

What is complete now:

- GitHub Pages root publication from `apps/web`
- legacy query compatibility through the new root
- curated `/documents` routes
- broad `/viewer` parity for repository markdown

What remains optional and external:

- `.xyz` DNS and HTTPS mapping
- deciding whether `.xyz` becomes the primary production hostname

## Related Docs

- [apps/web/README.md](/home/x-pact/PrivateDAO/apps/web/README.md)
- [docs/web-next-handoff.generated.md](/home/x-pact/PrivateDAO/docs/web-next-handoff.generated.md)
- [docs/web-next-cutover-map.generated.md](/home/x-pact/PrivateDAO/docs/web-next-cutover-map.generated.md)
- [docs/web-next-query-strategy.generated.md](/home/x-pact/PrivateDAO/docs/web-next-query-strategy.generated.md)
- [docs/web-next-doc-viewer-plan.generated.md](/home/x-pact/PrivateDAO/docs/web-next-doc-viewer-plan.generated.md)
- [docs/web-next-route-parity.md](/home/x-pact/PrivateDAO/docs/web-next-route-parity.md)
- [docs/domain-mirror.md](/home/x-pact/PrivateDAO/docs/domain-mirror.md)
- [docs/xyz-mirror-cutover-checklist.md](/home/x-pact/PrivateDAO/docs/xyz-mirror-cutover-checklist.md)
