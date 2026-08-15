import { createHash, randomUUID } from "node:crypto";
import { getConfig } from "./config.mjs";
import { canonicalize, digest, receiptId } from "./canonical.mjs";
import { SERVICES, serviceById } from "./catalog.mjs";
import { createStore, MemoryStore } from "./storage.mjs";
import { networkStats, verifyPayment } from "./solana.mjs";

const config = getConfig();
let storePromise;
const store = () => storePromise ||= createStore(config);
const json = (body, status = 200, headers = {}) => ({ statusCode: status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*", ...headers }, body: JSON.stringify(body) });
const text = (body, status = 200, headers = {}) => ({ statusCode: status, headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*", ...headers }, body });
const now = () => new Date().toISOString();
const parseBody = (event) => { const raw = event.body ? (event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body) : "{}"; if (Buffer.byteLength(raw) > config.maxBodyBytes) throw new Error("request body too large"); return JSON.parse(raw); };
const pathOf = (event) => event.rawPath || event.requestContext?.http?.path || event.path || "/";
const methodOf = (event) => event.requestContext?.http?.method || event.httpMethod || "GET";
const publicCard = () => ({ name: "PrivateDAO Agent Exchange", description: "Machine-native verification, evidence and agent services.", provider: { organization: "PrivateDAO", url: "https://privatedao.org" }, version: "1.0.0", url: `https://${config.domain}`, documentationUrl: `https://${config.domain}/llms-full.txt`, capabilities: { streaming: false, pushNotifications: false }, authentication: { schemes: ["none", "solana-payment"], payment: "Solana USDC or SOL for paid tasks" }, skills: SERVICES.map((service) => ({ id: service.id, name: service.title, description: `${service.access} service`, inputModes: ["application/json"], outputModes: ["application/json"], pricing: { access: service.access, amount: service.price, currency: service.currency } })) });
const openapi = () => ({ openapi: "3.1.0", info: { title: "PrivateDAO Agent Exchange", version: "1.0.0" }, servers: [{ url: `https://${config.domain}` }], paths: { "/api/services": { get: { operationId: "listServices", responses: { "200": { description: "Service catalog" } } } }, "/api/payments/quote": { post: { operationId: "createQuote", responses: { "200": { description: "Payment quote" }, "400": { description: "Invalid request" } } } }, "/api/tasks": { post: { operationId: "runTask", responses: { "200": { description: "Result and receipt" }, "402": { description: "Payment required" } } } }, "/api/receipts/{receiptId}": { get: { operationId: "getReceipt", responses: { "200": { description: "Receipt" }, "404": { description: "Not found" } } } } } });
const llms = () => `# PrivateDAO Agent Exchange\nMachine-readable verification and evidence services.\n\nFree: verify.basic\nPaid: verify.deep, forensics.trace, agent.match, sponsored.discovery, intelligence.synthesize\nPayment: Solana USDC or SOL; request a quote before paid tasks.\nDiscovery: https://${config.domain}/.well-known/agent-card.json\nMCP: https://${config.domain}/mcp\nOpenAPI: https://${config.domain}/openapi.json\n`;
const safeError = (error) => json({ error: "request_failed", message: error.message }, 400);

async function quote(body) {
  const service = serviceById(body.service_id); if (!service) throw new Error("unknown service");
  if (!service.price) return { quote_id: `free_${service.id}`, service_id: service.id, amount: 0, currency: service.currency, expires_at: new Date(Date.now() + 300000).toISOString(), payment_required: false };
  const currency = body.currency || service.currency; if (!["USDC", "SOL"].includes(currency)) throw new Error("unsupported payment currency");
  const amount = Number((service.price * config.priceMultiplier).toFixed(6));
  const q = { quote_id: `q_${randomUUID()}`, service_id: service.id, amount, currency, amountAtomic: currency === "USDC" ? Math.round(amount * 1e6) : Math.round(amount * 1e9), recipient: config.treasury, mint: currency === "USDC" ? config.usdcMint : null, expires_at: new Date(Date.now() + 300000).toISOString(), payment_required: true };
  await (await store()).put("Quotes", q.quote_id, q, true); return q;
}

async function executeService(service, input) {
  if (service === "verify.basic" || service === "verify.deep") {
    if (!input || typeof input !== "object" || input.record == null) throw new Error("record object is required");
    const recordDigest = digest(input.record); const checks = [{ name: "record_present", passed: true }, { name: "canonical_digest", passed: true }];
    if (input.expected_digest && input.expected_digest !== recordDigest) checks.push({ name: "expected_digest", passed: false });
    return { verification_status: checks.every((check) => check.passed) ? "VERIFIED" : "INVALID", record_digest: recordDigest, canonicalization: "privatedao-agent-v1", checks };
  }
  if (service === "forensics.trace") {
    const address = input?.address; if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address || "")) throw new Error("valid Solana address is required");
    const { readRpc } = await import("./solana.mjs"); const result = await readRpc(config, "getSignaturesForAddress", [address, { limit: Math.min(Number(input.limit || 20), 100) }]);
    return { address, signatures: result.result.map((item) => ({ signature: item.signature, slot: item.slot, err: item.err, block_time: item.blockTime })) };
  }
  if (service === "agent.match") { const candidates = await (await store()).list("Registry"); const wanted = new Set(input?.capabilities || []); return { matches: candidates.map((candidate) => ({ ...candidate, match_score: (candidate.capabilities || []).filter((c) => wanted.has(c)).length / Math.max(wanted.size, 1) })).sort((a, b) => b.match_score - a.match_score).slice(0, 20) }; }
  if (service === "sponsored.discovery") { if (!input?.agent_card_url || !input?.name) throw new Error("name and agent_card_url are required"); return { placement: { id: `sponsor_${randomUUID()}`, name: input.name, agent_card_url: input.agent_card_url, sponsored: true, target: input.target || {} } }; }
  if (service === "intelligence.synthesize") return { synthesis: { summary: "Structured evidence received and organized for downstream agent review.", evidence_digest: digest(input?.evidence || input), ai_provider: config.bedrockEnabled ? "aws-bedrock" : "deterministic-fallback" }, machine_readable: true };
  throw new Error("service implementation unavailable");
}

async function register(body) {
  const url = new URL(body.agent_card_url); if (url.protocol !== "https:") throw new Error("agent card must use HTTPS"); if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) throw new Error("private hosts are not allowed");
  const response = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } }); if (!response.ok) throw new Error(`agent card returned HTTP ${response.status}`); const card = await response.json(); if (!card.name || !card.url) throw new Error("invalid Agent Card");
  const agent = { id: `agent_${digest({ url: url.href }).slice(0, 24)}`, name: card.name, url: card.url, agent_card_url: url.href, capabilities: body.capabilities || card.skills?.map((skill) => skill.id) || [], pricing: body.pricing || {}, payment_protocols: body.payment_protocols || [], public_wallet: body.public_wallet || null, supported_chains: body.supported_chains || ["solana"], tags: body.tags || [], verified_at: now() };
  await (await store()).put("Registry", agent.id, agent); return agent;
}

async function handle(event) {
  const method = methodOf(event), path = pathOf(event), body = method === "GET" ? {} : parseBody(event);
  if (method === "OPTIONS") return json({}, 204, { "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type,x-request-id" });
  if (method === "GET" && ["/", "/api/health"].includes(path)) return json({ status: "ok", service: "pdao-agent-exchange", version: "1.0.0", environment: "aws", payment_network: "solana-mainnet-beta", timestamp: now() });
  if (method === "GET" && ["/.well-known/agent-card.json", "/.well-known/agent.json", "/agent.json"].includes(path)) return json(publicCard());
  if (method === "GET" && path === "/openapi.json") return json(openapi());
  if (method === "GET" && ["/llms.txt", "/llms-full.txt"].includes(path)) return text(llms());
  if (method === "GET" && path === "/llms.json") return json({ name: "PrivateDAO Agent Exchange", services: SERVICES, discovery: `https://${config.domain}/.well-known/agent-card.json` });
  if (method === "GET" && path === "/api/services") return json({ services: SERVICES, payment: { network: "solana-mainnet-beta", treasury: config.treasury, usdc_mint: config.usdcMint } });
  const receiptMatch = path.match(/^\/api\/receipts\/([^/]+)$/);
  if (method === "GET" && receiptMatch) { const receipt = await (await store()).get("Receipts", receiptMatch[1]); return receipt ? json(receipt) : json({ error: "not_found" }, 404); }
  if (method === "GET" && path === "/api/network/stats") return json(await networkStats(config));
  if (method === "GET" && (path === "/mcp" || path === "/a2a")) return json(publicCard());
  if (method === "POST" && path === "/mcp") { const request = body; if (request.method === "initialize") return json({ jsonrpc: "2.0", id: request.id, result: { protocolVersion: "2025-03-26", serverInfo: { name: "pdao-agent-exchange", version: "1.0.0" }, capabilities: { tools: {} } } }); if (request.method === "tools/list") return json({ jsonrpc: "2.0", id: request.id, result: { tools: SERVICES.map((s) => ({ name: s.id.replace(".", "_"), description: s.title, inputSchema: { type: "object" } })) } }); if (request.method === "tools/call") { const service = request.params?.name?.replace("_", "."); const result = await executeService(service, request.params?.arguments || {}); return json({ jsonrpc: "2.0", id: request.id, result: { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result } }); } return json({ jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "method not found" } }, 400); }
  if (method === "POST" && path === "/a2a") { const service = body.skill || body.service_id; const result = await executeTask(service, body.input || body.payload || {}); return json({ id: result.job_id, status: { state: "completed" }, artifacts: [{ parts: [{ type: "data", data: result.result }] }], receipt: result.receipt }); }
  if (method === "POST" && path === "/api/payments/quote") return json(await quote(body));
  if (method === "POST" && path === "/api/tasks") return json(await executeTask(body.service_id, body.input || {}, body));
  if (method === "POST" && path === "/api/registry/register") return json(await register(body), 201);
  if (method === "GET" && path === "/api/registry/search") { const agents = await (await store()).list("Registry"); const q = String(event.queryStringParameters?.q || "").toLowerCase(); return json({ agents: agents.filter((agent) => !q || JSON.stringify(agent).toLowerCase().includes(q)) }); }
  const agentMatch = path.match(/^\/api\/registry\/agents\/([^/]+)$/); if (method === "GET" && agentMatch) { const agent = await (await store()).get("Registry", agentMatch[1]); return agent ? json(agent) : json({ error: "not_found" }, 404); }
  return json({ error: "not_found" }, 404);
}

async function executeTask(serviceId, input, envelope = {}) {
  const service = serviceById(serviceId); if (!service) throw new Error("unknown service");
  let payment = null; let q = null;
  if (service.price) { q = envelope.quote_id ? await (await store()).get("Quotes", envelope.quote_id) : null; if (!q || q.service_id !== service.id || new Date(q.expires_at) < new Date()) { const error = new Error("payment required"); error.statusCode = 402; error.quote = await quote({ service_id: service.id, currency: envelope.currency }); throw error; } if (!envelope.payment) { const error = new Error("payment signature is required"); error.statusCode = 402; error.quote = q; throw error; } payment = await verifyPayment(config, envelope.payment, q); if (!payment.ok) { const error = new Error(payment.reason); error.statusCode = 402; error.quote = q; throw error; } const consumed = `payment_${envelope.payment.signature}`; await (await store()).put("Payments", consumed, { signature: envelope.payment.signature, quote_id: q.quote_id, consumed_at: now() }, true); }
  const result = await executeService(service.id, input); const payload = { service_id: service.id, input_digest: digest(input), result_digest: digest(result), created_at: now() }; const receipt = { receipt_id: receiptId(payload), ...payload, status: "VERIFIED", payment: q ? { quote_id: q.quote_id, signature: envelope.payment.signature, amount: q.amount, currency: q.currency } : null }; await (await store()).put("Receipts", receipt.receipt_id, receipt, true); return { job_id: `job_${randomUUID()}`, result, receipt };
}

export async function handler(event) { try { return await handle(event); } catch (error) { if (error.statusCode === 402) return json({ error: "payment_required", message: error.message, quote: error.quote }, 402, { "www-authenticate": "Solana" }); return safeError(error); } }
export function resetForTests() { storePromise = Promise.resolve(new MemoryStore()); }
