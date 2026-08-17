import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import { handler, resetForTests } from "../src/handler.mjs";

const event = (method, path, body = {}, queryStringParameters) => ({ requestContext: { http: { method, path } }, body: method === "GET" ? undefined : JSON.stringify(body), queryStringParameters });
const body = (response) => JSON.parse(response.body);

beforeEach(() => { process.env.NODE_ENV = "test"; resetForTests(); });

test("machine discovery exposes the catalog and agent card", async () => {
  const card = body(await handler(event("GET", "/.well-known/agent-card.json")));
  assert.equal(card.name, "PrivateDAO Agent Exchange"); assert.ok(card.skills.length >= 15);
  const services = body(await handler(event("GET", "/api/services")));
  assert.equal(services.services.find((s) => s.id === "verify.basic").price, 0);
});

test("developer onboarding page exposes the complete machine flow", async () => {
  const response = await handler(event("GET", "/connect"));
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Discover/);
  assert.match(response.body, /Create job/);
  assert.match(response.body, /Verify receipt/);
  assert.match(response.body, /verify\.basic/);
});

test("acquisition manifest exposes real opt-in distribution channels", async () => {
  const result = body(await handler(event("GET", "/api/acquisition")));
  assert.equal(result.network, "solana:mainnet-beta");
  assert.ok(result.integrations.some((item) => item.id === "mcp-official-registry"));
  assert.match(result.policy, /opt-in/);
});

test("free verification returns a deterministic receipt", async () => {
  const result = body(await handler(event("POST", "/api/tasks", { service_id: "verify.basic", input: { record: { b: 2, a: 1 } } })));
  assert.equal(result.result.verification_status, "VERIFIED"); assert.match(result.receipt.receipt_id, /^rvr_/);
});

test("paid service refuses execution without a real payment", async () => {
  const response = await handler(event("POST", "/api/tasks", { service_id: "verify.deep", input: { record: { a: 1 } } }));
  assert.equal(response.statusCode, 402); assert.equal(body(response).error, "payment_required"); assert.ok(body(response).payment_intent.jobId);
});

test("mcp exposes the same service catalog", async () => {
  const response = body(await handler(event("POST", "/mcp", { jsonrpc: "2.0", id: 1, method: "tools/list" })));
  assert.equal(response.result.tools.length, 11);
});

test("a2a message/send returns a real discovery task", async () => {
  const response = body(await handler(event("POST", "/a2a", {
    jsonrpc: "2.0",
    id: 7,
    method: "message/send",
    params: { message: { role: "user", parts: [{ text: "discover services" }] } },
  })));
  assert.equal(response.result.status.state, "completed");
  assert.equal(response.result.artifacts[0].parts[0].data.service, "discovery");
});

test("registry does not accept non-HTTPS cards", async () => {
  const response = await handler(event("POST", "/api/registry/register", { agent_card_url: "http://localhost/card" }));
  assert.equal(response.statusCode, 400); assert.match(body(response).message, /HTTPS/);
});

test("logistics request returns structured provider options", async () => {
  const response = body(await handler(event("POST", "/api/logistics/request", { capability: "verify.basic", requirements: { mint: "example" }, maxPrice: 1 })));
  assert.match(response.id, /^log_/);
  assert.equal(response.status, "quoted");
  assert.equal(response.candidates[0].provider, "PrivateDAO");
});

test("marketplace requires a verified provider before listing", async () => {
  const response = await handler(event("POST", "/api/marketplace/listings", { agentId: "missing", service: "data.feed", endpoint: "https://example.com" }));
  assert.equal(response.statusCode, 400);
  assert.match(body(response).message, /verified agent/);
});

test("agreements use structured state and input commitments", async () => {
  const result = body(await handler(event("POST", "/api/agreements", { buyerAgent: "buyer", providerAgent: "provider", service: "verify.basic", price: 0 })));
  assert.match(result.agreementId, /^agr_/);
  assert.equal(result.status, "proposed");
  assert.match(result.inputCommitment, /^[a-f0-9]{64}$/);
});

test("marketplace exposes first-party services without fake external agents", async () => {
  const result = body(await handler(event("GET", "/api/marketplace/listings")));
  assert.ok(result.listings.some((listing) => listing.service === "verify.basic" && listing.firstParty === true));
});

test("agreement can move from proposed to accepted", async () => {
  const created = body(await handler(event("POST", "/api/agreements", { buyerAgent: "buyer", providerAgent: "provider", service: "verify.basic", price: 0 })));
  const accepted = body(await handler(event("POST", `/api/agreements/${created.id}/accept`, { buyerAgent: "buyer" })));
  assert.equal(accepted.status, "accepted");
  const fetched = body(await handler(event("GET", `/api/agreements/${created.id}`)));
  assert.equal(fetched.status, "accepted");
});

test("free jobs create a revenue ledger entry without charging the client", async () => {
  await handler(event("POST", "/api/tasks", { service_id: "verify.basic", input: { record: { revenue: true } } }));
  const summary = body(await handler(event("GET", "/api/revenue")));
  assert.ok(summary.jobs >= 1);
  assert.equal(summary.grossAmount, 0);
});
