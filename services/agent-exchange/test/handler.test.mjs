import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { handler, resetForTests } from "../src/handler.mjs";

const event = (method, path, body = {}, queryStringParameters) => ({ requestContext: { http: { method, path } }, body: method === "GET" ? undefined : JSON.stringify(body), queryStringParameters });
const body = (response) => JSON.parse(response.body);

beforeEach(() => { process.env.NODE_ENV = "test"; resetForTests(); });

test("machine discovery exposes the catalog and agent card", async () => {
  const card = body(await handler(event("GET", "/.well-known/agent-card.json")));
  assert.equal(card.name, "PrivateDAO Agent Exchange"); assert.equal(card.skills.length, 6);
  const services = body(await handler(event("GET", "/api/services")));
  assert.equal(services.services.find((s) => s.id === "verify.basic").price, 0);
});

test("free verification returns a deterministic receipt", async () => {
  const result = body(await handler(event("POST", "/api/tasks", { service_id: "verify.basic", input: { record: { b: 2, a: 1 } } })));
  assert.equal(result.result.verification_status, "VERIFIED"); assert.match(result.receipt.receipt_id, /^rvr_/);
});

test("paid service refuses execution without a real payment", async () => {
  const response = await handler(event("POST", "/api/tasks", { service_id: "verify.deep", input: { record: { a: 1 } } }));
  assert.equal(response.statusCode, 402); assert.equal(body(response).error, "payment_required"); assert.ok(body(response).quote.quote_id);
});

test("mcp exposes the same service catalog", async () => {
  const response = body(await handler(event("POST", "/mcp", { jsonrpc: "2.0", id: 1, method: "tools/list" })));
  assert.equal(response.result.tools.length, 6);
});

test("registry does not accept non-HTTPS cards", async () => {
  const response = await handler(event("POST", "/api/registry/register", { agent_card_url: "http://localhost/card" }));
  assert.equal(response.statusCode, 400); assert.match(body(response).message, /HTTPS/);
});
