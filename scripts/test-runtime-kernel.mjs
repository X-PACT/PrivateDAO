import assert from "node:assert/strict";

import {
  InMemoryProviderRegistry,
  createPrivateDaoRuntime,
  buildCapabilityMatrix,
  listApplicationBindings,
  validateApplicationBindings,
  PrivateDaoKernel,
  listProducts,
} from "../packages/privatedao-runtime/src/index.ts";

const network = "solana-devnet";
const capability = "treasury.policy.check";
let prepareCalls = 0;
let submitCalls = 0;

const provider = {
  id: "runtime-test-provider",
  networks: [network],
  supports: (candidate) => candidate === capability,
  async prepare(intent) {
    prepareCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return {
      executionId: "runtime-test-execution",
      intent,
      unsignedPayload: { test: true },
      requiredSigners: [],
      state: "prepared",
    };
  },
  async submit(execution) {
    submitCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { executionId: execution.executionId, signatures: ["runtime-test-signature"] };
  },
  async status(executionId) {
    return { executionId, state: "submitted" };
  },
  async receipt(executionId) {
    return {
      executionId,
      requestId: "runtime-test-request",
      capability,
      network,
      state: "finalized",
      signatures: ["runtime-test-signature"],
      createdAt: new Date(0).toISOString(),
    };
  },
};

const registry = new InMemoryProviderRegistry();
registry.register(provider);
const kernel = new PrivateDaoKernel(registry);
const intent = {
  context: {
    requestId: "runtime-test-request",
    idempotencyKey: "runtime-test-idempotency",
    product: "treasury",
    capability,
    network,
  },
  payload: { policy: "budget-check" },
  accounts: [],
};

const [first, second] = await Promise.all([kernel.prepare(intent), kernel.prepare(intent)]);
assert.equal(prepareCalls, 1);
assert.equal(first.executionId, second.executionId);

const [submittedFirst, submittedSecond] = await Promise.all([
  kernel.submit(first.executionId, first.unsignedPayload),
  kernel.submit(first.executionId, first.unsignedPayload),
]);
assert.equal(submitCalls, 1);
assert.deepEqual(submittedFirst, submittedSecond);

const products = listProducts();
assert.equal(products.find((product) => product.id === "blind-verification")?.name, "Blind Verification");
assert.equal(products.find((product) => product.id === "record-verification")?.name, "Record Verification");

const runtime = createPrivateDaoRuntime(registry);
const protocolRegistry = runtime.protocols;
const registrations = protocolRegistry.list();
const expectedRegistrationCount = products.reduce((count, product) => count + product.capabilities.length, 0);
assert.equal(registrations.length, expectedRegistrationCount);
assert.equal(protocolRegistry.list("payroll").length, 3);
assert.equal(protocolRegistry.authorize("payroll.approve", "execution.submit", "checker"), true);
assert.equal(protocolRegistry.authorize("payroll.approve", "execution.submit", "auditor"), false);

const policyRuntime = createPrivateDaoRuntime();
const policyIntent = {
  context: {
    requestId: "treasury-policy-test",
    idempotencyKey: "treasury-policy-test-key",
    product: "treasury",
    capability: "treasury.policy.check",
    network,
  },
  payload: { amountCents: 7500, budgetCents: 10000, maxTransactionCents: 8000, requestedAsset: "USDC", allowedAsset: "USDC" },
  accounts: [],
};
const policyPrepared = await policyRuntime.gateway.prepare(policyIntent, "maker");
await policyRuntime.gateway.submit(policyPrepared, policyPrepared.unsignedPayload, "maker");
const policyReceipt = await policyRuntime.gateway.receipt(policyPrepared, "maker");
assert.equal(policyReceipt.state, "reconciled");
assert.equal(policyReceipt.result.passed, true);

const recordIntent = {
  context: {
    requestId: "record-create-test",
    idempotencyKey: "record-create-test-key",
    product: "record-verification",
    capability: "verification.record.create",
    network,
  },
  payload: {
    schemaVersion: "1",
    recordType: "payroll-summary",
    recordId: "payroll-001",
    issuer: "demo-company",
    issuedAt: "2026-09-09T00:00:00.000Z",
    payload: { total: 3000, employeeSecret: "must-not-appear" },
    publicFieldPaths: ["total"],
  },
  accounts: [],
};
const recordPrepared = await policyRuntime.gateway.prepare(recordIntent, "maker");
await policyRuntime.gateway.submit(recordPrepared, recordPrepared.unsignedPayload, "maker");
const recordReceipt = await policyRuntime.gateway.receipt(recordPrepared, "maker");
assert.equal(recordReceipt.result.publicFields.total, 3000);
assert.equal("employeeSecret" in recordReceipt.result, false);
assert.equal(recordReceipt.result.canonicalDigest.length, 64);

const verifyIntent = {
  context: { ...recordIntent.context, requestId: "record-verify-test", idempotencyKey: "record-verify-test-key", capability: "verification.record.verify" },
  payload: { record: recordIntent.payload, expectedDigest: recordReceipt.result.canonicalDigest },
  accounts: [],
};
const verifyPrepared = await policyRuntime.gateway.prepare(verifyIntent, "auditor");
await policyRuntime.gateway.submit(verifyPrepared, verifyPrepared.unsignedPayload, "auditor");
const verifyReceipt = await policyRuntime.gateway.receipt(verifyPrepared, "auditor");
assert.equal(verifyReceipt.result.valid, true);
const tamperedPrepared = await policyRuntime.gateway.prepare({ ...verifyIntent, context: { ...verifyIntent.context, requestId: "record-verify-tampered", idempotencyKey: "record-verify-tampered-key" }, payload: { ...verifyIntent.payload, record: { ...verifyIntent.payload.record, payload: { total: 3001 } } } }, "auditor");
await policyRuntime.gateway.submit(tamperedPrepared, tamperedPrepared.unsignedPayload, "auditor");
const tamperedReceipt = await policyRuntime.gateway.receipt(tamperedPrepared, "auditor");
assert.equal(tamperedReceipt.result.valid, false);

const gateway = runtime.gateway;
const gatewayPrepared = await gateway.prepare(intent, "maker");
assert.equal(gatewayPrepared.executionId, first.executionId);
assert.throws(
  () => gateway.prepare({ ...intent, context: { ...intent.context, product: "payroll", capability: "payroll.approve" } }, "auditor"),
  (error) => error?.code === "INVALID_INTENT",
);

const emptyRuntime = createPrivateDaoRuntime(new InMemoryProviderRegistry());
await assert.rejects(
  () => emptyRuntime.gateway.prepare(intent, "maker"),
  (error) => error?.code === "PROVIDER_NOT_FOUND",
);

const emptyMatrix = buildCapabilityMatrix(emptyRuntime.providers);
assert.equal(emptyMatrix.find((entry) => entry.capability === "treasury.policy.check" && entry.network === network)?.status, "contract-only");
assert.equal(emptyMatrix.find((entry) => entry.capability === "treasury.policy.check" && entry.network === "ethereum-sepolia")?.status, "planned");
const verifiedMatrix = buildCapabilityMatrix(registry);
assert.equal(verifiedMatrix.find((entry) => entry.capability === capability && entry.network === network)?.status, "verified");

assert.equal(validateApplicationBindings().length, 0);
assert.equal(listApplicationBindings().length, products.reduce((count, product) => count + product.capabilities.length, 0));
assert.equal(listApplicationBindings().find((entry) => entry.capability === "payroll.calculate")?.mode, "kernel-gateway");
assert.equal(listApplicationBindings().find((entry) => entry.capability === "treasury.policy.check")?.mode, "kernel-gateway");
assert.equal(listApplicationBindings().find((entry) => entry.capability === "verification.record.create")?.mode, "kernel-gateway");
assert.equal(listApplicationBindings().find((entry) => entry.capability === "verification.record.verify")?.mode, "kernel-gateway");
assert.equal(listApplicationBindings().find((entry) => entry.capability === "verification.blind.prove")?.mode, "legacy-provider");

let currentTime = "2026-09-09T00:00:00.000Z";
const expiredKernel = new PrivateDaoKernel(registry, { now: () => currentTime });
await assert.rejects(
  () => expiredKernel.prepare({ ...intent, expiresAt: "2026-09-08T23:59:59.000Z" }),
  (error) => error?.code === "INTENT_EXPIRED",
);

const expiringIntent = { ...intent, context: { ...intent.context, idempotencyKey: "runtime-expiring-idempotency" }, expiresAt: "2026-09-09T00:01:00.000Z" };
const expiringExecution = await expiredKernel.prepare(expiringIntent);
currentTime = "2026-09-09T00:02:00.000Z";
await assert.rejects(
  () => expiredKernel.submit(expiringExecution.executionId, expiringExecution.unsignedPayload),
  (error) => error?.code === "INTENT_EXPIRED",
);

console.log("[runtime-kernel] idempotent execution, product registration, and verification catalog checks passed");
