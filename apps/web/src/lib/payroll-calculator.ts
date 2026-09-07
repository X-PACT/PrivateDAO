export type PayrollRow = { employeeRef: string; grossCents: number; taxBps: number; deductionsCents: number; payoutKey: string };
export type PayrollPolicy = { policyId: string; budgetCents: number; maxTaxBps: number; allowZeroDeductions: boolean };
export type PayrollCalculation = { grossCents: number; taxCents: number; deductionsCents: number; netCents: number; employeeCount: number; duplicatePayouts: number; budgetSatisfied: boolean; policySatisfied: boolean; arithmeticSatisfied: boolean; payoutDigestInput: string };
function assertCents(value: number, label: string) { if (!Number.isSafeInteger(value) || value < 0) throw new Error(label + " must be a non-negative integer number of cents."); }
export function calculatePayroll(rows: PayrollRow[], policy: PayrollPolicy): PayrollCalculation {
  if (!rows.length || rows.length > 500) throw new Error("Payroll must contain between 1 and 500 employees.");
  assertCents(policy.budgetCents, "Budget");
  if (!Number.isSafeInteger(policy.maxTaxBps) || policy.maxTaxBps < 0 || policy.maxTaxBps > 10000) throw new Error("Tax policy must be between 0 and 100%.");
  const seen = new Set<string>(); let grossCents = 0; let taxCents = 0; let deductionsCents = 0; let duplicatePayouts = 0; const digestParts: string[] = [];
  for (const row of rows) {
    if (!row.employeeRef.trim() || !row.payoutKey.trim()) throw new Error("Employee and payout references are required.");
    assertCents(row.grossCents, "Gross salary"); assertCents(row.deductionsCents, "Deductions");
    if (!Number.isSafeInteger(row.taxBps) || row.taxBps < 0 || row.taxBps > policy.maxTaxBps) throw new Error("A payroll row exceeds the approved tax policy.");
    if (row.deductionsCents > row.grossCents) throw new Error("Deductions cannot exceed gross salary.");
    if (!policy.allowZeroDeductions && row.deductionsCents === 0) throw new Error("Zero deductions are not allowed by this policy.");
    if (seen.has(row.payoutKey)) duplicatePayouts += 1; seen.add(row.payoutKey);
    const rowTax = Math.floor((row.grossCents * row.taxBps) / 10000); grossCents += row.grossCents; taxCents += rowTax; deductionsCents += row.deductionsCents; digestParts.push(row.payoutKey + ":" + row.grossCents + ":" + rowTax + ":" + row.deductionsCents);
  }
  const netCents = grossCents - taxCents - deductionsCents;
  return { grossCents, taxCents, deductionsCents, netCents, employeeCount: rows.length, duplicatePayouts, budgetSatisfied: netCents <= policy.budgetCents, policySatisfied: duplicatePayouts === 0, arithmeticSatisfied: grossCents - taxCents - deductionsCents === netCents, payoutDigestInput: digestParts.sort().join("|") || "empty" };
}
export function centsToAmount(cents: number, currency = "USD") { return (cents / 100).toFixed(2) + " " + currency; }
