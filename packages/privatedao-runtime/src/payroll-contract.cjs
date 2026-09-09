const transitions = {
  DRAFT: ["CALCULATED", "CANCELLED", "EXPIRED"],
  CALCULATED: ["POLICY_CHECKED", "FAILED", "CANCELLED"],
  POLICY_CHECKED: ["PENDING_APPROVAL", "FAILED", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "FAILED", "CANCELLED", "EXPIRED"],
  APPROVED: ["SIGNING", "CANCELLED", "EXPIRED"],
  SIGNING: ["SETTLING", "FAILED", "CANCELLED", "EXPIRED"],
  SETTLING: ["PARTIALLY_SETTLED", "SETTLED", "FAILED", "EXPIRED"],
  PARTIALLY_SETTLED: ["SETTLING", "SETTLED", "FAILED", "EXPIRED"],
  SETTLED: ["RECONCILED", "FAILED"],
  RECONCILED: ["VERIFIED", "FAILED"],
  VERIFIED: [],
  FAILED: [],
  CANCELLED: [],
  EXPIRED: [],
};

function canTransitionPayroll(from, to) {
  return Array.isArray(transitions[from]) && transitions[from].includes(to);
}

function assertPayrollTransition(from, to) {
  if (!canTransitionPayroll(from, to)) throw new Error(`Invalid payroll transition: ${from} -> ${to}`);
}

module.exports = { assertPayrollTransition, canTransitionPayroll };
