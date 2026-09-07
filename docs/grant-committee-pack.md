# Grant Committee Pack

## Ideal user

A grants committee that needs to approve funding without exposing intermediate committee direction before the vote closes.

## Best PrivateDAO flow

1. Create a proposal for the grant.
2. Run private voting through commit and reveal.
3. Finalize the proposal after the reveal window.
4. Execute treasury release only after the decision is complete.

## Why this pack is strong

- reduces public signaling before a grant is awarded
- prevents committee members from being pressured by visible early votes
- preserves an auditable treasury path after approval

## Technology fit

- **ZK:** recommended for stronger review framing on high-sensitivity grants
- **REFHE:** optional when the committee needs encrypted scoring or encrypted evaluation artifacts
- **MagicBlock:** optional unless the payout is a confidential token-based grant batch
- **Read node / RPC Fast path:** recommended for judge and operator visibility

## Pilot shape

- 1 committee wallet set
- 1 grant proposal template
- 1 treasury release path
- 1 reviewer packet per approved grant cycle
