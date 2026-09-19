const baseUrl = (process.env.PRIVATEDAO_AGENT_EXCHANGE_URL || "https://agents.privatedao.org").replace(/\/$/, "");

async function call(id, method, params = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    signal: AbortSignal.timeout(15_000),
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = await response.json();
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(`${method} failed HTTP/content-type validation: ${response.status} ${contentType}`);
  }
  if (payload.jsonrpc !== "2.0" || payload.id !== id || payload.error) {
    throw new Error(`${method} returned an invalid JSON-RPC response`);
  }
  return payload.result;
}

const initialize = await call(1, "initialize", {
  protocolVersion: "2025-03-26",
  capabilities: {},
  clientInfo: { name: "privatedao-independent-mcp-smoke", version: "1.0.0" },
});
if (!initialize?.protocolVersion || !initialize?.serverInfo?.name) {
  throw new Error("initialize did not return protocol and server information");
}

const listed = await call(2, "tools/list");
const toolNames = Array.isArray(listed?.tools) ? listed.tools.map((tool) => tool.name) : [];
const requiredTools = ["pdao_services", "verify_basic", "network_stats"];
for (const name of requiredTools) {
  if (!toolNames.includes(name)) throw new Error(`tools/list is missing ${name}`);
}

const serviceResult = await call(3, "tools/call", {
  name: "pdao_services",
  arguments: {},
});
if (!Array.isArray(serviceResult?.structuredContent?.services)) {
  throw new Error("pdao_services did not return structured service data");
}

console.log(JSON.stringify({
  baseUrl,
  client: "privatedao-independent-mcp-smoke",
  protocolVersion: initialize.protocolVersion,
  server: initialize.serverInfo,
  tools: toolNames.length,
  requiredTools,
  serviceCount: serviceResult.structuredContent.services.length,
  mutatingRequests: false,
}, null, 2));
