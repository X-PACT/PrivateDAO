# Mainnet Cutover Runbook

## Purpose

This runbook describes the controlled sequence expected before any real mainnet deployment or upgrade event for PrivateDAO.

It is a release discipline document, not a claim that cutover has already occurred.

## Preconditions

Do not begin a cutover unless all of the following are true:

- [mainnet-readiness.md](/home/x-pact/PrivateDAO/docs/mainnet-readiness.md) is reviewed
- [production-operations.md](/home/x-pact/PrivateDAO/docs/production-operations.md) is reviewed
- [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md) is reviewed
- [risk-register.md](/home/x-pact/PrivateDAO/docs/risk-register.md) is reviewed
- internal review gates pass
- external review requirements are satisfied for the chosen release bar

## Cutover Sequence

1. freeze the exact commit under release
2. record expected program id and environment
3. run:
   - `anchor build`
   - Rust unit tests
   - `npm run verify:live-proof`
   - `npm run verify:release-manifest`
   - `npm run verify:review-links`
   - `npm run verify:review-surface`
   - `npm run check:mainnet`
4. confirm wallet custody and authority handling
5. confirm RPC primary and fallback endpoints
6. record the deployment operator
7. deploy or upgrade
8. record transaction signature and explorer link
9. verify post-deploy state
10. archive logs and release notes

## Post-Cutover Checks

After deployment:

- verify program id and authority state
- verify account reads from the chosen RPC stack
- verify explorer visibility
- verify operator scripts resolve against the intended environment
- verify monitoring and alerting are active

## Rollback / Abort Conditions

Abort the cutover if:

- build artifact differs from the reviewed commit
- required gates fail
- RPC reads are unstable
- operator signer handling is unclear
- deployment metadata cannot be recorded cleanly

## Evidence To Retain

- commit hash
- deployment transaction
- release timestamp
- operator identity
- RPC endpoints used
- post-deploy verification output

## Honest Boundary

This runbook helps enforce discipline around a mainnet release.

It does not replace:

- formal release management outside the repo
- external audit sign-off
- organization-specific custody approvals
