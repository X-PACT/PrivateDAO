import { readFile } from "node:fs/promises";

const root = new URL("../docs/agent-exchange-distribution/", import.meta.url);
const mcp = JSON.parse(await readFile(new URL("mcp-server.json", root), "utf8"));
const card = JSON.parse(await (await fetch("https://agents.privatedao.org/.well-known/agent-card.json")).text());
const payload = {
  generatedAt: new Date().toISOString(),
  mcpRegistry: {
    registry: "https://registry.modelcontextprotocol.io",
    server: mcp,
    action: "mcp-publisher login github && mcp-publisher publish",
    status: "requires_namespace_authentication",
  },
  a2aRegistry: {
    registry: "https://a2a-registry.dev",
    endpoint: "/agents",
    body: { agent_card: card },
    status: "requires_registry_policy_or_credentials",
  },
  solanaAgentRegistry: {
    discovery: "https://solana.com/agent-registry",
    agentCard: "https://agents.privatedao.org/.well-known/agent-card.json",
    status: "submission-ready",
  },
  scan8004: {
    api: "https://8004scan.io/api/v1/public/agents",
    status: "discovery-only-unlisted",
  },
};
console.log(JSON.stringify(payload, null, 2));
