import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { canonicalize, normalizeRecord } from "../services/private-engine/src/record-verification.mjs";

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const dataDir = await mkdtemp(join(tmpdir(), "privatedao-records-"));
const port = Number(process.env.RECORD_TEST_PORT || 18780 + Math.floor(Math.random() * 1000));
const env = { ...process.env, PORT: String(port), PRIVATEDAO_ALLOW_DEV_LICENSE: "true", PRIVADAO_AUTH_MODE: "development", PRIVATEDAO_DATABASE_MODE: "json", PRIVATEDAO_DATA_DIR: dataDir, PRIVATEDAO_DATABASE_FILE: join(dataDir, "records.json"), PRIVATEDAO_RECORD_ANCHOR_URL: "" };

function start() {
  const child = spawn(process.env.CODEX_NODE_PATH || process.execPath, ["src/server.mjs"], { cwd: join(root, "services/private-engine"), env, stdio: ["ignore", "pipe", "pipe"] });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(child), 4000);
    child.stdout.on("data", (chunk) => { if (String(chunk).includes("listening")) { clearTimeout(timer); resolve(child); } });
    child.once("error", reject);
  });
}

async function stop(child) {
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
}

async function request(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  return { status: response.status, body: await response.json() };
}

const record = {
  schema_version: "1",
  record_type: "financial.daily-record.v1",
  record_id: "financial-001",
  issuer: "issuer.example",
  issued_at: "2026-08-07T12:00:00.000Z",
  payload: { result: "approved", amount: 1250, currency: "USD", internal_score: 0.91, company: "Example Co" },
};
const schema = { type: "object", additionalProperties: false, required: ["result", "amount", "currency", "internal_score", "company"], properties: { result: { type: "string", enum: ["approved", "rejected"] }, amount: { type: "number", minimum: 0 }, currency: { type: "string", const: "USD" }, internal_score: { type: "number", minimum: 0, maximum: 1 }, company: { type: "string" } } };

assert.equal(canonicalize({ b: 2, a: 1 }), canonicalize({ a: 1, b: 2 }));
assert.notEqual(normalizeRecord({ ...record, payload: { ...record.payload, amount: 1251 } }).canonical_digest, normalizeRecord(record).canonical_digest);

let server = process.env.RECORD_TEST_EXTERNAL === "1" ? { external: true, killed: false } : await start();
try {
  const created = await request("/v1/records/verify", { method: "POST", headers: { "Idempotency-Key": "record-test-1" }, body: JSON.stringify({ organizationId: "local-development", record, schema, public_fields: ["company", "result", "currency"] }) });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.equal(created.body.receipt.verification_status, "VERIFIED");
  assert.equal(created.body.receipt.anchor_network, "pending");
  assert.equal(created.body.receipt.public_fields.company, "Example Co");
  assert.equal(Object.hasOwn(created.body.receipt.public_fields, "internal_score"), false);
  assert.equal(Object.hasOwn(created.body.receipt, "privatePayload"), false);
  assert.equal(Object.hasOwn(created.body.receipt, "payload"), false);

  const receiptId = created.body.receipt.receipt_id;
  const replay = await request("/v1/records/verify", { method: "POST", headers: { "Idempotency-Key": "record-test-1" }, body: JSON.stringify({ organizationId: "local-development", record, schema, public_fields: ["company"] }) });
  assert.equal(replay.body.status, "idempotent-replay");
  assert.equal(replay.body.receipt.receipt_id, receiptId);

  const tampered = await request(`/v1/receipts/${receiptId}/reverify`, { method: "POST", body: JSON.stringify({ record: { ...record, payload: { ...record.payload, amount: 1251 } } }) });
  assert.equal(tampered.status, 200);
  assert.equal(tampered.body.status, "INVALID");

  const publicReceipt = await request(`/v1/receipts/${receiptId}`);
  assert.equal(publicReceipt.status, 200);
  assert.equal(Object.hasOwn(publicReceipt.body.receipt, "internal_score"), false);

  if (!server.external) {
    await stop(server);
    server = await start();
  }
  const afterRestart = await request(`/v1/records/${record.record_id}/receipt`);
  assert.equal(afterRestart.status, 200);
  assert.equal(afterRestart.body.receipt.receipt_id, receiptId);
} finally {
  if (server && !server.external && !server.killed) await stop(server);
  await rm(dataDir, { recursive: true, force: true });
}

console.log("record-verification tests: 10 passed; 0 failed");
