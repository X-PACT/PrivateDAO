import assert from "node:assert/strict";
import test from "node:test";
import { handler, resetForTests } from "../src/handler.mjs";
import { SERVICES } from "../src/catalog.mjs";

const request = (path, method = "GET", body) =>
  handler({
    requestContext: { http: { method, path } },
    body: body ? JSON.stringify(body) : undefined,
  });

test("human root is HTML while machine surfaces remain available", async () => {
  resetForTests();
  const root = await request("/");
  assert.equal(root.statusCode, 200);
  assert.match(root.headers["content-type"], /^text\/html/);
  assert.match(root.body, /PrivateDAO Agents/);
  assert.match(root.body, /Evidence for/);
  assert.match(root.body, /pdao-language-picker/);
  assert.match(root.body, /href="https:\/\/privatedao\.org\/\?lang=en"/);
  const head = await request("/", "HEAD");
  assert.equal(head.statusCode, 200);
  assert.equal(head.body, "");
  assert.match(head.headers["content-type"], /^text\/html/);
  for (const language of ["en", "ar", "ru", "uk", "pl", "hi", "ko", "es", "it"]) {
    assert.match(root.body, new RegExp(`value="${language}"`));
  }
  const marketplace = await request("/marketplace");
  assert.match(marketplace.body, /https:\/\/privatedao\.org\/\?lang=en/);
  const catalog = JSON.parse((await request("/api/services")).body);
  const tokenService = catalog.services.find((service) => service.id === "token.intelligence");
  assert.equal(tokenService.payment_network, "solana-mainnet-beta");
  assert.deepEqual(tokenService.supported_target_networks, ["solana-mainnet-beta", "ethereum-mainnet", "base-mainnet", "arbitrum-mainnet"]);
  assert.equal(tokenService.input_schema.type, "object");
  assert.equal(tokenService.output_schema.type, "object");
  assert.deepEqual(tokenService.input_schema.required, ["network"]);
  assert.ok(tokenService.input_schema.anyOf.some((branch) => branch.required.includes("asset")));
  const walletService = catalog.services.find((service) => service.id === "wallet.intelligence");
  assert.deepEqual(walletService.input_schema.required, ["network"]);
  assert.ok(walletService.input_schema.anyOf.some((branch) => branch.required.includes("wallet")));
  const portfolioService = catalog.services.find((service) => service.id === "portfolio.intelligence");
  assert.deepEqual(portfolioService.input_schema.properties.assets.minItems, 1);
  const simulationService = catalog.services.find((service) => service.id === "transaction.simulate");
  assert.ok(simulationService.input_schema.anyOf.some((branch) => branch.required.includes("transaction")));
  for (const serviceId of [
    "token.intelligence",
    "wallet.intelligence",
    "risk.score",
    "transaction.simulate",
    "swap.quote",
    "market.snapshot",
  ]) {
    const service = catalog.services.find((candidate) => candidate.id === serviceId);
    assert.ok(service, `${serviceId} must be discoverable`);
    assert.equal(service.payment_network, "solana-mainnet-beta", `${serviceId} payment rail`);
    assert.ok(Array.isArray(service.supported_target_networks), `${serviceId} target network metadata`);
    assert.equal(service.input_schema.type, "object", `${serviceId} input schema`);
    assert.equal(service.output_schema.type, "object", `${serviceId} output schema`);
    assert.match(service.estimated_completion_behavior, /read_only/);
  }
  const partners = await request("/partners");
  assert.equal(partners.statusCode, 200);
  assert.match(partners.body, /Featured Partners/);
  const partnerApi = await request("/api/marketplace/partners");
  assert.equal(partnerApi.statusCode, 200);
  assert.deepEqual(JSON.parse(partnerApi.body).partners, []);
  for (const path of ["/agent-registry/register", "/pay/surface-test"]) {
    const response = await request(path);
    assert.equal(response.statusCode, 200, path);
    assert.match(response.body, /pdao-language-picker/, path);
  }
  assert.doesNotMatch(root.body, /\"status\":\"ok\"/);

  for (const path of [
    "/api/health",
    "/.well-known/agent-card.json",
    "/openapi.json",
    "/api/services",
    "/api/acquisition",
  ]) {
    const response = await request(path);
    assert.equal(response.statusCode, 200, path);
    assert.match(response.headers["content-type"], /^application\/json/, path);
  }
});

test("a free job resolves to a public human receipt and verification page", async () => {
  resetForTests();
  const created = await request("/api/jobs", "POST", {
    service_id: "verify.basic",
    input: { record: { claim: "surface-test" } },
  });
  assert.equal(created.statusCode, 200);
  const payload = JSON.parse(created.body);
  assert.equal(payload.status, "completed");
  assert.match(payload.receipt.public_url, /\/receipts\//);
  assert.match(payload.receipt.verification_url, /\/verify\/receipt\//);
  for (const path of [
    new URL(payload.receipt.public_url).pathname,
    new URL(payload.receipt.verification_url).pathname,
    new URL(payload.receipt.job_url).pathname,
  ]) {
    const response = await request(path);
    assert.equal(response.statusCode, 200, path);
    assert.match(response.headers["content-type"], /^text\/html/);
    assert.match(response.body, /Receipt/);
  }
});

test("paid jobs validate before quoting and separate payment from target network", async () => {
  resetForTests();
  const quote = await request("/api/jobs", "POST", {
    service_id: "agent.research.report",
    input: { network: "ethereum-mainnet", asset: "0x0000000000000000000000000000000000000001" },
  });
  assert.equal(quote.statusCode, 402);
  const quoteBody = JSON.parse(quote.body);
  assert.equal(quoteBody.payment_intent.network, "solana-mainnet-beta");
  assert.equal(quoteBody.payment_intent.target_network, "ethereum-mainnet");

  const invalidNetwork = await request("/api/jobs", "POST", {
    service_id: "agent.research.report",
    input: { network: "unsupported-mainnet", asset: "0x0000000000000000000000000000000000000001" },
  });
  assert.equal(invalidNetwork.statusCode, 400);
  assert.doesNotMatch(invalidNetwork.body, /payment_intent/);

  const invalidAsset = await request("/api/jobs", "POST", {
    service_id: "agent.research.report",
    input: { network: "ethereum-mainnet", asset: "not-an-address" },
  });
  assert.equal(invalidAsset.statusCode, 400);
  assert.doesNotMatch(invalidAsset.body, /payment_intent/);
});

test("every catalog capability has a stable detail page", async () => {
  resetForTests();
  for (const service of SERVICES) {
    const response = await request(`/services/${service.id.replaceAll(".", "-")}`);
    assert.equal(response.statusCode, 200, service.id);
    assert.match(response.headers["content-type"], /^text\/html/, service.id);
    assert.match(response.body, new RegExp(service.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), service.id);
  }
});

test("crawler files expose the intended public surfaces", async () => {
  resetForTests();
  const robots = await request("/robots.txt");
  assert.match(robots.body, /Sitemap: https:\/\/agents\.privatedao\.org\/sitemap\.xml/);
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.statusCode, 200);
  assert.match(sitemap.headers["content-type"], /^application\/xml/);
  assert.match(sitemap.body, /<loc>https:\/\/agents\.privatedao\.org\/<\/loc>/);
});

test("MCP and A2A machine entrypoints remain callable", async () => {
  resetForTests();
  const a2a = await request("/a2a", "POST", { jsonrpc: "2.0", id: 1, method: "message/send", params: { message: { parts: [{ text: "discover" }] } } });
  assert.equal(a2a.statusCode, 200);
  assert.match(a2a.headers["content-type"], /^application\/json/);
  const mcp = await request("/mcp", "POST", { jsonrpc: "2.0", id: 1, method: "tools/list" });
  assert.equal(mcp.statusCode, 200);
  assert.match(mcp.body, /pdao_services/);
});

test("MCP lifecycle, schemas, errors, and network aliases are protocol-safe", async () => {
  resetForTests();
  const initialize = await request("/mcp", "POST", { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test-client", version: "1" } } });
  assert.equal(initialize.statusCode, 200);
  assert.equal(JSON.parse(initialize.body).result.protocolVersion, "2025-06-18");

  const initialized = await request("/mcp", "POST", { jsonrpc: "2.0", method: "notifications/initialized", params: {} });
  assert.equal(initialized.statusCode, 202);
  assert.equal(initialized.body, "");

  const listed = JSON.parse((await request("/mcp", "POST", { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })).body).result.tools;
  assert.equal(listed.length, 11);
  for (const tool of listed) {
    assert.equal(tool.inputSchema.type, "object", tool.name);
    assert.ok(tool.inputSchema.properties, tool.name);
  }
  const byName = Object.fromEntries(listed.map((tool) => [tool.name, tool.inputSchema]));
  assert.deepEqual(byName.submit_payment.required, ["job_id", "signature"]);
  assert.deepEqual(byName.register_agent.anyOf, [{ required: ["mcpUrl"] }, { required: ["mcp_url"] }, { required: ["endpoint"] }]);
  assert.deepEqual(byName.logistics_request.required, ["capability"]);

  const safe = JSON.parse((await request("/mcp", "POST", { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "verify_basic", arguments: { record: { test: "mcp" } } } })).body);
  assert.equal(safe.result.isError, undefined);
  assert.match(safe.result.content[0].text, /VERIFIED/);

  const failed = JSON.parse((await request("/mcp", "POST", { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "verify_basic", arguments: {} } })).body);
  assert.equal(failed.result.isError, true);
  assert.match(failed.result.content[0].text, /mint or record is required/);

  const match = JSON.parse((await request("/mcp", "POST", { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "agent_match", arguments: { capabilities: ["chains"], network: "solana:mainnet-beta" } } })).body);
  assert.equal(match.result.isError, undefined);
});
