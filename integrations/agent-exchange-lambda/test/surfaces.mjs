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
  for (const language of ["en", "ar", "ru", "uk", "pl", "hi", "ko", "es", "it"]) {
    assert.match(root.body, new RegExp(`value="${language}"`));
  }
  const marketplace = await request("/marketplace");
  assert.match(marketplace.body, /https:\/\/privatedao\.org\/\?lang=en/);
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
