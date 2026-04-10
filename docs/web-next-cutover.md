# Next.js Mirror Cutover

This note records the safe transition path from the current live `docs/` surface to the new `apps/web` Next.js export.

It is not a claim that cutover has already happened.

## Current Truth

- `docs/index.html` remains the live reviewer-facing surface.
- `apps/web` is now static-export capable and mirror-ready.
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

## Recommended Cutover Order

1. Keep `docs/` as the canonical public surface.
2. Publish `apps/web` as a mirror deployment.
3. Verify:
   - `/`
   - `/command-center/`
   - `/proof/`
   - `/proof/?judge=1`
   - `/documents/`
   - `/viewer/`
   - `/security/`
   - `/diagnostics/`
   - `/services/`
   - `/awards/`
4. Verify that legacy `?page=` entrypoints route correctly into `apps/web`.
5. Verify that live-site links and judge links resolve correctly under the mirror origin.
6. Verify that root-domain export works independently of `/PrivateDAO`.
7. Only then decide whether `docs/` should be replaced or kept as the stable public archive surface.

## Do Not Claim Yet

Do not describe the Next.js app as the canonical live site until:

- mirror deployment is public
- route parity has been manually checked
- reviewer links are confirmed working end-to-end
- any `.xyz` domain mapping is validated

## Related Docs

- [apps/web/README.md](/home/x-pact/PrivateDAO/apps/web/README.md)
- [docs/web-next-handoff.generated.md](/home/x-pact/PrivateDAO/docs/web-next-handoff.generated.md)
- [docs/web-next-cutover-map.generated.md](/home/x-pact/PrivateDAO/docs/web-next-cutover-map.generated.md)
- [docs/web-next-query-strategy.generated.md](/home/x-pact/PrivateDAO/docs/web-next-query-strategy.generated.md)
- [docs/web-next-doc-viewer-plan.generated.md](/home/x-pact/PrivateDAO/docs/web-next-doc-viewer-plan.generated.md)
- [docs/web-next-route-parity.md](/home/x-pact/PrivateDAO/docs/web-next-route-parity.md)
- [docs/domain-mirror.md](/home/x-pact/PrivateDAO/docs/domain-mirror.md)
- [docs/xyz-mirror-cutover-checklist.md](/home/x-pact/PrivateDAO/docs/xyz-mirror-cutover-checklist.md)
