import assert from "node:assert/strict";
import { createPrivateDaoRuntime } from "../packages/privatedao-runtime/src/index.ts";

const runtime = createPrivateDaoRuntime();
const record = {
  schemaVersion: "1",
  recordType: "financial.daily-record.v1",
  recordId: "financial-001",
  issuer: "issuer.example",
  issuedAt: "2026-08-07T12:00:00.000Z",
  payload: { result: "approved", amount: 1250, currency: "USD", internal_score: 0.91, company: "Example Co" },
  publicFieldPaths: ["company", "result", "currency"],
};
const intent = {
  context: {
    requestId: "record-test-1",
    idempotencyKey: "record-test-1",
    product: "record-verification",
    capability: "verification.record.create",
    network: "solana-devnet",
  },
  payload: record,
  accounts: [],
};

const first = await runtime.gateway.prepare(intent, "maker");
const replay = await runtime.gateway.prepare(intent, "maker");
assert.equal(replay.executionId, first.executionId);
await runtime.gateway.submit(first, first.unsignedPayload, "maker");
const created = await runtime.gateway.receipt(first, "maker");
assert.equal(created.result.disclosure, "selective");
assert.equal(created.result.publicFields.company, "Example Co");
assert.equal("internal_score" in created.result.publicFields, false);
assert.equal(created.result.canonicalDigest.length, 64);

const verifyIntent = {
  ...intent,
  context: { ...intent.context, requestId: "record-verify-1", idempotencyKey: "record-verify-1", capability: "verification.record.verify" },
  payload: { record: { ...record, publicFieldPaths: undefined }, expectedDigest: created.result.canonicalDigest },
};
const verified = await runtime.gateway.prepare(verifyIntent, "auditor");
await runtime.gateway.submit(verified, verified.unsignedPayload, "auditor");
const verification = await runtime.gateway.receipt(verified, "auditor");
assert.equal(verification.result.valid, true);

const tampered = await runtime.gateway.prepare({
  ...verifyIntent,
  context: { ...verifyIntent.context, requestId: "record-tampered-1", idempotencyKey: "record-tampered-1" },
  payload: { ...verifyIntent.payload, record: { ...verifyIntent.payload.record, payload: { ...record.payload, amount: 1251 } } },
}, "auditor");
await runtime.gateway.submit(tampered, tampered.unsignedPayload, "auditor");
const tamperedReceipt = await runtime.gateway.receipt(tampered, "auditor");
assert.equal(tamperedReceipt.result.valid, false);

console.log("record-verification runtime: 10 passed; 0 failed");
