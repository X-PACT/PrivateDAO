const baseUrl = process.env.PRIVATEDAO_AGENT_EXCHANGE_URL?.replace(/\/$/, "") || "https://agents.privatedao.org";
const surfaces = [
  ["agentCard", "/.well-known/agent-card.json"],
  ["a2a", "/a2a"],
  ["mcp", "/mcp"],
  ["openapi", "/openapi.json"],
  ["services", "/api/services"],
  ["acquisition", "/api/acquisition"],
];

const results = [];
for (const [name, path] of surfaces) {
  const isMcp = name === "mcp";
  const response = await fetch(`${baseUrl}${path}`, isMcp
    ? {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "privatedao-discovery-probe", version: "1.0.0" },
          },
        }),
        signal: AbortSignal.timeout(10_000),
      }
    : { signal: AbortSignal.timeout(10_000) });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(`${name} did not return JSON (HTTP ${response.status})`);
  }
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(`${name} failed HTTP/content-type validation: ${response.status} ${contentType}`);
  }
  results.push({ name, path, status: response.status, contentType, keys: Object.keys(payload).slice(0, 12) });
  if (name === "agentCard") {
    if (payload.protocolVersion !== "0.3.0") throw new Error("Agent Card protocolVersion is not 0.3.0");
    if (payload.name !== "PrivateDAO Agent Exchange") throw new Error("Unexpected Agent Card name");
    if (typeof payload.serviceCatalog !== "string" || payload.serviceCatalog.trim().length === 0) throw new Error("Agent Card has no service catalog description");
  }
  if (name === "mcp") {
    if (payload.jsonrpc !== "2.0" || payload.id !== 1 || payload.error)
      throw new Error("MCP initialize returned an invalid JSON-RPC response");
    if (!payload.result?.protocolVersion || !payload.result?.serverInfo?.name)
      throw new Error("MCP initialize has no protocol or server information");
  }
  if (name === "openapi" && !String(payload.openapi || "").startsWith("3.")) throw new Error("OpenAPI document is missing a 3.x version");
  if (name === "services" && !Array.isArray(payload.services)) throw new Error("Service catalog has no services array");
  if (name === "acquisition" && (!payload.discovery || !payload.payment || !payload.receipts)) throw new Error("Acquisition metadata is missing required machine-readable sections");
}

console.log(JSON.stringify({ baseUrl, authenticated: false, mutatingRequests: false, surfaces: results }, null, 2));
