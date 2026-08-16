import { PrivateDAOAgentExchange } from "../typescript/index.mjs";

const client = new PrivateDAOAgentExchange(process.env.PDAO_AGENT_EXCHANGE_URL);
const card = await client.discover();
const services = await client.services();
const verification = await client.verifyBasic({ record: { source: "external-agent" } });

console.log(JSON.stringify({
  agent: card.name,
  serviceCount: services.services.length,
  verificationStatus: verification.result?.verification_status,
  receiptId: verification.receipt?.receipt_id,
}, null, 2));
