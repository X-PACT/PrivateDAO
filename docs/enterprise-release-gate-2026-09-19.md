# PrivateDAO Enterprise Release Gate

Date: 2026-09-19
Branch: `rebrand/enterprise-white`
Latest audited commit: `d30f707`

## Verified

- `npm run release:verify`: all 13 suites passed.
- Commercial browser pass: 12 routes x 2 viewports = 24 cases.
- Desktop and mobile routes returned HTTP 200.
- No Console errors or HTTP 5xx responses in the release-gate pass.
- Treasury was rechecked after one transient `ERR_NETWORK_CHANGED` and passed.
- Homepage was visually inspected at desktop size.
- `https://agents.privatedao.org/marketplace` and `/connect` passed desktop/mobile browser checks.
- Agent Card, `/api/services`, `/a2a`, `/mcp`, and `/openapi.json` returned 200.
- MCP JSON-RPC `initialize` and `tools/list` passed; 11 tools were returned.
- `https://privatedao.org/`, `/game/`, and `https://game.privatedao.org/game/godot/index.html` returned 200 after the Agents-only deployment.
- Tempo Testnet Phase 2 evidence was published and its Record and Blind verification links returned 200 and `Status VALID` in an independent browser session.
- `/documents/` is a small commercial resource index; r31 passed live checks with no reviewer/grant/testnet-evidence language, no console errors, and HTTP 200.
- Website release r27 was deployed atomically with the prior site retained for rollback.
- The separate Mini App service received only the missing `privatedao_logo.jpg` and `privatedao_icon.png` assets; no game code or game service was restarted.
- A fresh Chromium desktop pass returned HTTP 200 with no console errors or failed requests for `/`, `/documents/`, and `/game/`.
- The r28 correction replaced only `/documents/index.html` after the full bundle was rejected by the server's full disk; the active site directory was verified intact before the narrow replacement.
- The live `/documents/` body was checked for stale grant text and returned none; the rollback copy is retained beside the active file.
- A read-only high-confidence scan of all 23 remote branch heads found no credential signatures; historical commit scanning remains intentionally unclaimed.
- Metadata smoke test passed for 12 primary routes: all returned HTTP 200 with title, description, canonical, page-specific OG image, and OG image HTTP 200.
- `commercial-claims` is now a release suite; it checks five commercial source surfaces for required Web2/Web3 and privacy language, rejects unverified commercial claims, and protects the documents index from retired packet copy. The complete release gate passed 13/13 suites.
- r29 was deployed atomically after the claim gate passed; live Chromium verified `/`, `/documents/`, and `/game/` with HTTP 200 and no console or failed-request errors.
- r30 added RFC 9116 security contact files at `/security.txt` and `/.well-known/security.txt`.
- r31 replaced the documents index with the simplified commercial resource page. The active site, homepage, and game route returned HTTP 200 after the swap; only the website edge container was restarted.
- To recover deployment headroom, only obsolete website rollback directories r19-r25 were removed from EC2. The active site and rollback directories r26/r27 were retained, and home/documents/game returned HTTP 200 afterward.

## Explicitly Not Claimed

- A network is not considered supported merely because an RPC or capability entry exists.
- `planned` entries in the capability matrix are not represented as live execution.
- External MCP client interoperability has not been independently certified.
- Historical remote Dependabot branches have not been fetched or made public.
- External social crawler cache refresh cannot be proven from this host.
- The transitive `elliptic` advisory remains open because the available forced fix is breaking.

## Production Safety Gate

The main website cutover was completed as an atomic website-volume swap r24, and
the `/documents/` correction was deployed as r26. The previous r26 site is
retained at `/home/ec2-user/PrivateDAO/deploy/primary-host/volumes/site.previous-20260919-r26`.
The game and its separate host/service remained outside the website cutover.

Before a future cutover:

1. Build and run the release verification suites from the canonical commit.
2. Run the desktop/mobile browser pass and inspect the homepage and product pages.
3. Record the active site directory and current container list on EC2.
4. Copy the active site to a versioned rollback directory. Completed for r24 and r26.
5. Perform an atomic directory swap only for the website volume. Completed for r24 and r26.
6. Restart only the website edge process if the bind mount requires it. Completed for r24 and r26.
7. Verify the homepage, commercial routes, Agent Card, EVM links, `/documents/`, and `/game/`. Completed for r26 smoke coverage.
8. Keep the rollback directory until the post-release observation window ends.
9. Do not remove containers or game services as part of the website cutover.

If any post-swap check fails, restore the versioned site directory and restart
only the website edge process. Do not restart or replace the game services.
