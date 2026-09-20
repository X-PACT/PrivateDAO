import assert from "node:assert/strict";
import test from "node:test";
import { handler, resetForTests } from "../src/handler.mjs";

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
