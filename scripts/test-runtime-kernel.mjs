import assert from "node:assert/strict";

import {
  InMemoryProviderRegistry,
  createPrivateDaoRuntime,
  buildCapabilityMatrix,
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

const gateway = runtime.gateway;
const gatewayPrepared = await gateway.prepare(intent, "maker");
assert.equal(gatewayPrepared.executionId, first.executionId);
assert.throws(
  () => gateway.submit(gatewayPrepared, gatewayPrepared.unsignedPayload, "auditor"),
  (error) => error?.code === "INVALID_INTENT",
);

const emptyRuntime = createPrivateDaoRuntime();
await assert.rejects(
  () => emptyRuntime.gateway.prepare(intent, "maker"),
  (error) => error?.code === "PROVIDER_NOT_FOUND",
);

const emptyMatrix = buildCapabilityMatrix(emptyRuntime.providers);
assert.equal(emptyMatrix.find((entry) => entry.capability === "treasury.policy.check" && entry.network === network)?.status, "contract-only");
assert.equal(emptyMatrix.find((entry) => entry.capability === "treasury.policy.check" && entry.network === "ethereum-sepolia")?.status, "planned");
const verifiedMatrix = buildCapabilityMatrix(registry);
assert.equal(verifiedMatrix.find((entry) => entry.capability === capability && entry.network === network)?.status, "verified");

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
