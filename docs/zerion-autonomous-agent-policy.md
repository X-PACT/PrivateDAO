# Zerion Autonomous Agent Policy

PrivateDAO uses the Zerion track as a policy-bound execution layer, not as an unrestricted trading bot.

The product path is:

1. DAO policy is created in PrivateDAO.
2. A proposal authorizes a bounded treasury action.
3. The agent receives a scoped execution policy.
4. The wallet execution layer prepares the transaction.
5. The operator approves the final signature.
6. The result is recorded through memo, explorer signature, and reviewer proof routes.

## Agent scope

PrivateDAO agent policies include:

- Solana chain lock
- spend limit
- expiry window
- allowed action list
- blocked action list
- required proposal reference
- required wallet signature
- memo-coded settlement proof

This prevents a god-mode agent from moving treasury funds outside governance policy.

## High-value actions

### Stablecoin payroll agent

The agent prepares PUSD or USDC payroll settlement after DAO approval.

Policy shape:

- chain lock: Solana
- spend limit: 25 PUSD per execution
- expiry: 48 hours
- allowed: SPL stablecoin transfer, memo-coded payroll proof
- blocked: unknown recipients, unbounded swaps, execution without governance approval

### Treasury rebalance agent

The agent prepares a governed rebalance instruction when treasury policy requests it.

Policy shape:

- chain lock: Solana
- spend limit: 5% of route allocation
- expiry: 24 hours
- allowed: quote-aware rebalance, operator review before signing
- blocked: cross-chain bridge without policy, slippage above policy, recurring execution without renewal

### Gaming reward agent

The agent prepares reward distribution after tournament or guild proposal finalization.

Policy shape:

- chain lock: Solana
- spend limit: 100 PUSD reward pool
- expiry: 72 hours
- allowed: reward pool transfer, ranked recipient list, memo-coded reward proof
- blocked: anonymous recipient expansion, post-expiry payout, wallet-draining batch

## Track fit

The Zerion track asks for an autonomous on-chain agent with real transactions and scoped policies.

PrivateDAO's differentiated angle is policy-first execution:

- the user does not trust an autonomous bot with unlimited authority
- the DAO defines the action
- the agent prepares bounded execution
- the wallet signer remains the final cryptographic control

## Product routes

- Agent policy surface: https://privatedao.org/services/zerion-agent-policy/
- Governance route: https://privatedao.org/govern/
- Billing route: https://privatedao.org/services/testnet-billing-rehearsal/
- Judge route: https://privatedao.org/judge/
- Proof route: https://privatedao.org/proof/?judge=1

## Implementation notes

The public site includes the policy payload generator. The next repository-level integration step is to fork Zerion CLI, bind the generated policy object into the fork, and route approved execution through the Zerion API where the selected action requires Zerion-supported transaction routing.

