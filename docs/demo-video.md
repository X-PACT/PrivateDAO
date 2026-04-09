# Real Demo Video

This is the canonical **single demo video** for PrivateDAO.

It is intentionally different from the investor reel.

The investor reel is a pitch surface.

This demo video is a **product and operator flow** surface.

## Required narrative

The video must visibly communicate:

1. **Create DAO**
2. **Submit proposal**
3. **Private vote**
4. **Execute treasury**

## Product framing

The demo should show PrivateDAO as a real operating stack:

- governance product
- treasury control system
- confidential payout boundary
- evidence-rich review surface

## Technology framing

The video should also make the advanced layers understandable:

- `ZK` strengthens the proof and review path
- `REFHE` can gate encrypted evaluation flows
- `MagicBlock` can gate confidential token settlement
- `RPC Fast / backend-indexer` improves operator and reviewer visibility

## Honest boundary

The demo may show:

- Devnet operation
- live product surface
- real lifecycle steps
- runtime evidence

The demo must not imply:

- completed external audit
- unrestricted real-funds mainnet clearance
- source-verifiable external receipts beyond what is currently documented

## Repo-native asset targets

- MP4: `docs/assets/private-dao-demo-flow.mp4`
- Poster: `docs/assets/private-dao-demo-flow-poster.png`
- Render script: `scripts/render-demo-video.sh`

## Desktop upload copy

The render script also copies an upload-ready version to:

- `/home/x-pact/Desktop/PrivateDAO-Demo-Video`

## Slide order

1. private governance problem and product identity
2. create DAO
3. submit proposal
4. private vote through commit and reveal
5. execute treasury
6. advanced layer explanation: ZK, REFHE, MagicBlock, RPC Fast
7. closing with live app and repo links

## Zerion variant

For the Zerion bounty variant, keep the same first four visible steps:

1. **Create DAO**
2. **Submit proposal**
3. **Private vote**
4. **Execute treasury / execution agent**

Then clarify the execution handoff:

- `PrivateDAO` is the governance brain
- the `Zerion CLI fork` is the wallet and execution engine
- the transaction must be real and routed through Zerion API
- the policy must stay scoped, not god-mode
- the first execution envelope should stay narrow: `Base only`, `25 USDC`, `30 minute expiry`, `swap only`
- the proof packet should show what is already live in the repo versus what the Zerion fork still needs to complete

The video should frame this as:

**PrivateDAO Autonomous Executor**

not as a generic trading bot.
