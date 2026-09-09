import type { NetworkId } from "./index.js";
import { assertPayrollTransition, canTransitionPayroll } from "./payroll-contract.cjs";
export { assertPayrollTransition, canTransitionPayroll };

export type PayrollState =
  | "DRAFT"
  | "CALCULATED"
  | "POLICY_CHECKED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SIGNING"
  | "SETTLING"
  | "PARTIALLY_SETTLED"
  | "SETTLED"
  | "RECONCILED"
  | "VERIFIED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type PayrollRounding = "half-up";

export interface PayrollPolicy {
  network: NetworkId;
  jurisdiction: string;
  taxYear: string;
  taxRateBps: number;
  deductionRateBps: number;
  maxTotalCents: number;
  maxEmployeeCents: number;
  allowedAsset: string;
  rounding: PayrollRounding;
}

export interface PayrollLineInput {
  employeeRef: string;
  grossCents: number;
}

export interface PayrollLine {
  employeeRef: string;
  grossCents: number;
  taxCents: number;
  deductionsCents: number;
  netCents: number;
}

export interface PayrollCalculation {
  lines: readonly PayrollLine[];
  grossCents: number;
  taxCents: number;
  deductionsCents: number;
  netCents: number;
  policy: PayrollPolicy;
}

export function calculatePayroll(lines: readonly PayrollLineInput[], policy: PayrollPolicy): PayrollCalculation {
  validatePolicy(policy);
  if (lines.length === 0 || lines.length > 500) throw new Error("Payroll must contain between 1 and 500 lines.");
  const seen = new Set<string>();
  const calculated = lines.map((line) => {
    if (!line.employeeRef || seen.has(line.employeeRef)) throw new Error("Payroll employee references must be present and unique.");
    seen.add(line.employeeRef);
    assertCents(line.grossCents, "grossCents");
    if (line.grossCents > policy.maxEmployeeCents) throw new Error("Payroll line exceeds the approved employee limit.");
    const taxCents = roundBps(line.grossCents, policy.taxRateBps, policy.rounding);
    const deductionsCents = roundBps(line.grossCents, policy.deductionRateBps, policy.rounding);
    return {
      employeeRef: line.employeeRef,
      grossCents: line.grossCents,
      taxCents,
      deductionsCents,
      netCents: line.grossCents - taxCents - deductionsCents,
    };
  });
  const totals = calculated.reduce((sum, line) => ({
    grossCents: sum.grossCents + line.grossCents,
    taxCents: sum.taxCents + line.taxCents,
    deductionsCents: sum.deductionsCents + line.deductionsCents,
    netCents: sum.netCents + line.netCents,
  }), { grossCents: 0, taxCents: 0, deductionsCents: 0, netCents: 0 });
  if (totals.netCents > policy.maxTotalCents) throw new Error("Payroll exceeds the approved total budget.");
  return { lines: calculated, ...totals, policy };
}

function roundBps(cents: number, basisPoints: number, rounding: PayrollRounding): number {
  const numerator = cents * basisPoints;
  if (rounding === "half-up") return Math.floor((numerator + 5000) / 10000);
  throw new Error(`Unsupported payroll rounding policy: ${rounding}`);
}

function validatePolicy(policy: PayrollPolicy): void {
  if (!policy.network || !policy.jurisdiction || !policy.taxYear || !policy.allowedAsset) throw new Error("Payroll policy is incomplete.");
  if (!Number.isInteger(policy.taxRateBps) || policy.taxRateBps < 0 || policy.taxRateBps > 10000) throw new Error("taxRateBps must be between 0 and 10000.");
  if (!Number.isInteger(policy.deductionRateBps) || policy.deductionRateBps < 0 || policy.deductionRateBps > 10000) throw new Error("deductionRateBps must be between 0 and 10000.");
  assertCents(policy.maxTotalCents, "maxTotalCents");
  assertCents(policy.maxEmployeeCents, "maxEmployeeCents");
}

function assertCents(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer.`);
}
