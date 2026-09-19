# PrivateDAO Enterprise Release Gate

Date: 2026-09-19
Branch: `rebrand/enterprise-white`
Latest audited commit: `e12183d`

## Verified

- `npm run release:verify`: all 12 suites passed.
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

## Explicitly Not Claimed

- A network is not considered supported merely because an RPC or capability entry exists.
- `planned` entries in the capability matrix are not represented as live execution.
- External MCP client interoperability has not been independently certified.
- Historical remote Dependabot branches have not been fetched or made public.
- External social crawler cache refresh cannot be proven from this host.
- The transitive `elliptic` advisory remains open because the available forced fix is breaking.

## Production Safety Gate

The main website cutover was completed as an atomic website-volume swap r24. The
previous site is retained at `/home/ec2-user/PrivateDAO/deploy/primary-host/volumes/site.previous-20260919-r24`.
The game and its separate host/service remained outside the website cutover.

Before a future cutover:

1. Build and run the release verification suites from the canonical commit.
2. Run the desktop/mobile browser pass and inspect the homepage and product pages.
3. Record the active site directory and current container list on EC2.
4. Copy the active site to a versioned rollback directory. Completed for r24.
5. Perform an atomic directory swap only for the website volume. Completed for r24.
6. Restart only the website edge process if the bind mount requires it. Completed for r24.
7. Verify the homepage, commercial routes, Agent Card, EVM links, and `/game/`. Completed for r24 smoke coverage.
8. Keep the rollback directory until the post-release observation window ends.
9. Do not remove containers or game services as part of the website cutover.

If any post-swap check fails, restore the versioned site directory and restart
only the website edge process. Do not restart or replace the game services.
