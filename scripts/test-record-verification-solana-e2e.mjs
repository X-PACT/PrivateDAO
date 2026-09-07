import assert from "node:assert/strict";
import { Connection } from "@solana/web3.js";

const port = Number(process.env.RECORD_TEST_PORT || 18891);
const cluster = String(process.env.RECORD_TEST_CLUSTER || process.env.BLIND_POLICY_ONCHAIN_CLUSTER || "testnet").trim();
if (!["devnet", "testnet"].includes(cluster)) throw new Error("Solana E2E allows only Devnet or Testnet.");
const anchorUrl = String(process.env.PRIVATEDAO_RECORD_ANCHOR_URL || "").trim();
if (!anchorUrl) throw new Error("PRIVATEDAO_RECORD_ANCHOR_URL is required for the real Solana E2E test.");
const parsedAnchor = new URL(anchorUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(parsedAnchor.hostname)) throw new Error("Solana E2E refuses a non-local anchor service URL.");
const rpcUrl = String(cluster === "devnet" ? (process.env.SOLANA_DEVNET_RPC_URL || process.env.BLIND_POLICY_ONCHAIN_RPC_URL || "https://api.devnet.solana.com") : (process.env.SOLANA_TESTNET_RPC_URL || process.env.BLIND_POLICY_ONCHAIN_RPC_URL || "https://api.testnet.solana.com")).trim();
const rpc = new URL(rpcUrl);
if (cluster === "devnet" && rpc.hostname !== "api.devnet.solana.com" && !rpc.hostname.includes("devnet")) throw new Error("Solana E2E requires a Devnet RPC URL.");
if (cluster === "testnet" && !rpc.hostname.includes("testnet") && rpc.hostname !== "api.testnet.solana.com") throw new Error("Solana E2E requires a Testnet RPC URL.");

async function request(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  return { status: response.status, body: await response.json() };
}

const record = {
  schema_version: "1",
  record_type: "financial.daily-record.v1",
  record_id: `financial-solana-e2e-${Date.now()}`,
  issuer: "privatedao.local",
  issued_at: "2026-08-07T12:00:00.000Z",
  payload: { result: "approved", amount: 1250, currency: "USD", internal_score: 0.91, company: "Example Co" },
};
const schema = { type: "object", additionalProperties: false, required: ["result", "amount", "currency", "internal_score", "company"], properties: { result: { type: "string", enum: ["approved", "rejected"] }, amount: { type: "number", minimum: 0 }, currency: { type: "string", const: "USD" }, internal_score: { type: "number", minimum: 0, maximum: 1 }, company: { type: "string" } } };
const created = await request("/v1/records/verify", { method: "POST", headers: { "Idempotency-Key": `record-solana-e2e-${Date.now()}` }, body: JSON.stringify({ organizationId: "local-development", record, schema, public_fields: ["company", "result", "currency"] }) });
assert.equal(created.status, 201, JSON.stringify(created.body));
const receipt = created.body.receipt;
assert.equal(receipt.verification_status, "VERIFIED");
assert.equal(receipt.anchor_network, "solana");
assert.equal(receipt.anchor_status, "confirmed");
assert.equal(receipt.anchor_cluster, cluster);
assert.equal(typeof receipt.anchor_signature, "string");
assert.equal(typeof receipt.anchor_slot, "number");
assert.equal(Object.hasOwn(receipt, "privatePayload"), false);
assert.equal(Object.hasOwn(receipt, "payload"), false);

const connection = new Connection(rpcUrl, "confirmed");
const status = await connection.getSignatureStatuses([receipt.anchor_signature]);
assert.equal(status.value[0]?.err, null, JSON.stringify(status.value[0]));
assert.ok(["confirmed", "finalized"].includes(status.value[0]?.confirmationStatus), JSON.stringify(status.value[0]));
const transaction = await connection.getParsedTransaction(receipt.anchor_signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
assert.ok(transaction, "The confirmed receipt signature was not readable from Devnet RPC.");
assert.equal(transaction.slot, receipt.anchor_slot);

const publicReceipt = await request(`/v1/receipts/${receipt.receipt_id}`);
assert.equal(publicReceipt.status, 200);
assert.equal(publicReceipt.body.receipt.anchor_signature, receipt.anchor_signature);
assert.equal(publicReceipt.body.receipt.public_fields.internal_score, undefined);

const tampered = await request(`/v1/receipts/${receipt.receipt_id}/reverify`, { method: "POST", body: JSON.stringify({ record: { ...record, payload: { ...record.payload, amount: 1251 } } }) });
assert.equal(tampered.status, 200);
assert.equal(tampered.body.status, "INVALID");

console.log("record-verification Solana E2E: PASS");
console.log(`receipt=${receipt.receipt_id} signature=${receipt.anchor_signature} slot=${receipt.anchor_slot} cluster=${cluster}`);
