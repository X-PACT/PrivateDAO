# PDAO Agent Kit

Drop-in discovery and verification for autonomous agents.

Production endpoint: `https://agents.privatedao.org`

```js
import { PrivateDAOAgentExchange } from "../../sdk/agent-exchange/typescript/index.mjs";

const pdao = new PrivateDAOAgentExchange();
const card = await pdao.discover();
const result = await pdao.verifyBasic({ mint: process.env.SOLANA_MINT });
console.log({ agent: card.name, result });
```

The kit is non-custodial. It never receives a private key and never signs a transaction. Paid jobs return a payment intent; the calling agent signs with its own wallet and submits the signature.

## Supported paths

- discovery through Agent Card, OpenAPI, MCP, and A2A
- free `verify.basic`
- paid jobs and payment intents
- walletless receipts
- agent registry and logistics matching
- TypeScript and Python clients

See the live [developer guide](https://agents.privatedao.org/connect).
