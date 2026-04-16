# Jupiter Treasury Route

PrivateDAO is developing a Jupiter-backed treasury route so a DAO-approved swap, rebalance, or payout-funding move can stay inside the same governed operating flow already used for proposals, voting, and execution.

## Product intention

This route exists to make treasury motion feel operational rather than improvised.

The goal is straightforward:

- let the treasury team or reviewer understand why an asset move is being proposed
- preserve the route context and quote logic beside the governance action
- keep the settlement story visible after execution so the treasury does not become a black box

## What the route is meant to support

1. Treasury rebalance motions
   - move between approved treasury assets under DAO-approved policy
2. Payout funding motions
   - fund a governed payout in the asset required for settlement
3. Reviewer-safe execution interpretation
   - connect route rationale, treasury policy, and settlement evidence in one path

## Why it matters

PrivateDAO already presents treasury intake, governed payouts, settlement evidence, and trust surfaces as one commercial story.

The Jupiter route strengthens that story by adding a clearer asset-movement corridor between:

- governance approval
- treasury execution
- settlement evidence

This makes the product easier to understand for operators, judges, and buyers who need to see how treasury capital can move responsibly without leaving the product shell.

## Current operating direction

The route is being built around:

- wallet-first execution inside the existing govern and services surfaces
- quote-aware treasury requests with route-preview fields attached to the request object
- operator-selected destination asset, quote review mode, execution preference, and slippage band
- a quote-backed review surface that tells the operator what should be reviewed before the request moves into governed delivery
- clear rebalance or payout-funding rationale
- settlement evidence that remains readable after the move

## Next operating milestones

1. preserve swap or rebalance policy thresholds in the govern flow
2. connect the new route-preview controls to a real executable quote lane
3. record settlement evidence beside the same route instead of scattering it across separate screens
4. convert the implementation work into a sponsor-grade developer experience report once the route is used end-to-end

## Best review path

- `/services#jupiter-treasury-route`
- `/services#payout-route-selection`
- `/govern#proposal-review-action`
- `/documents/treasury-reviewer-packet`
- `/documents/settlement-receipt-closure`

## Community support

We are building this route so treasury motion on Solana can become more understandable, more reviewable, and more usable for real teams.

We invite the ecosystem to support that effort through:

- operator feedback on the treasury UX
- reviewer scrutiny on route clarity and settlement evidence
- integration guidance on sponsor-grade Jupiter usage
- introductions, testing, and implementation feedback that help turn this lane into a stronger production corridor
