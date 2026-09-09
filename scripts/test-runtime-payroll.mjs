import assert from "node:assert/strict";

import {
  assertPayrollTransition,
  calculatePayroll,
  canTransitionPayroll,
  createPrivateDaoRuntime,
} from "../packages/privatedao-runtime/src/index.ts";

const policy = {
  network: "solana-devnet",
  jurisdiction: "GENERIC-DEMO",
  taxYear: "2026",
  taxRateBps: 1000,
  deductionRateBps: 200,
  maxTotalCents: 100_000,
  maxEmployeeCents: 80_000,
  allowedAsset: "WSOL",
  rounding: "half-up",
};

const result = calculatePayroll([
  { employeeRef: "employee-a", grossCents: 10_001 },
  { employeeRef: "employee-b", grossCents: 20_000 },
], policy);

assert.deepEqual(result.lines.map((line) => ({ taxCents: line.taxCents, deductionsCents: line.deductionsCents, netCents: line.netCents })), [
  { taxCents: 1000, deductionsCents: 200, netCents: 8801 },
  { taxCents: 2000, deductionsCents: 400, netCents: 17600 },
]);
assert.deepEqual({ grossCents: result.grossCents, taxCents: result.taxCents, deductionsCents: result.deductionsCents, netCents: result.netCents }, {
  grossCents: 30_001,
  taxCents: 3_000,
  deductionsCents: 600,
  netCents: 26_401,
});
assert.equal(canTransitionPayroll("DRAFT", "CALCULATED"), true);
assert.equal(canTransitionPayroll("DRAFT", "SETTLED"), false);
assert.doesNotThrow(() => assertPayrollTransition("RECONCILED", "VERIFIED"));
assert.throws(() => calculatePayroll([{ employeeRef: "employee-a", grossCents: 90_000 }], policy), /employee limit/);
assert.throws(() => calculatePayroll([{ employeeRef: "employee-a", grossCents: 10_000 }, { employeeRef: "employee-a", grossCents: 10_000 }], policy), /unique/);

const runtime = createPrivateDaoRuntime();
const prepared = await runtime.gateway.prepare({
  context: {
    requestId: "runtime-payroll-calculation",
    idempotencyKey: "runtime-payroll-calculation-1",
    product: "payroll",
    capability: "payroll.calculate",
    network: "solana-devnet",
  },
  payload: {
    lines: [{ employeeRef: "employee-a", grossCents: 10_001 }],
    policy,
  },
  accounts: [],
}, "maker");
await runtime.gateway.submit(prepared, prepared.unsignedPayload, "maker");
const receipt = await runtime.gateway.receipt(prepared, "auditor");
assert.equal(receipt.state, "reconciled");
assert.equal(receipt.signatures.length, 0);
assert.equal(receipt.result.netCents, 8_801);

console.log("[runtime-payroll] deterministic calculation and state-machine checks passed");
