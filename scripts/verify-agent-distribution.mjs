const base = process.env.PDAO_AGENT_URL || "https://agents.privatedao.org";
const checks = [
  ["health", "/api/health"],
  ["agent-card", "/.well-known/agent-card.json"],
  ["services", "/api/services"],
  ["openapi", "/openapi.json"],
  ["llms", "/llms.txt"],
  ["connect", "/connect"],
];
for (const [name, path] of checks) {
  const response = await fetch(base + path);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const text = await response.text();
  if (!text) throw new Error(`${name}: empty response`);
  console.log(`PASS ${name}`);
}
console.log(`PASS ${checks.length} machine-discovery surfaces at ${base}`);
