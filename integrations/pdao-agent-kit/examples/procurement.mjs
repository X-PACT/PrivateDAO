import { PrivateDAOAgentExchange } from "../index.mjs";

const pdao = new PrivateDAOAgentExchange();
const request = await pdao.logistics({
  capability: process.env.CAPABILITY || "verify.basic",
  maxPrice: Number(process.env.MAX_PRICE || 0.1),
  asset: "USDC",
  preferredProtocols: ["A2A", "MCP", "HTTP"],
});
console.log(JSON.stringify({ requestId: request.id, candidates: request.candidates }, null, 2));
