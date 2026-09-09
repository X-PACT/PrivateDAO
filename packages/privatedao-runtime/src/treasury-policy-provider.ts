import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";

export interface TreasuryPolicyCheckPayload {
  amountCents: number;
  budgetCents: number;
  maxTransactionCents?: number;
  recipientCount?: number;
  maxRecipientCount?: number;
  requestedAsset?: string;
  allowedAsset?: string;
}

export interface TreasuryPolicyCheckResult {
  passed: boolean;
  checks: ReadonlyArray<{ name: string; passed: boolean; reason?: string }>;
  amountCents: number;
  budgetCents: number;
  policyDigestInput: string;
}

type PolicyRecord = {
  intent: ExecutionIntent<TreasuryPolicyCheckPayload>;
  result: TreasuryPolicyCheckResult;
  state: ExecutionState;
  preparedAt: string;
  submittedAt?: string;
};

/**
 * Kernel-native policy evaluation. It only evaluates a bounded request; it
 * never signs, submits, or moves treasury funds.
 */
export class TreasuryPolicyProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-treasury-policy";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, PolicyRecord>();

  supports(capability: string): boolean {
    return capability === "treasury.policy.check";
  }

  async prepare<TPayload, TUnsigned>(
    intent: ExecutionIntent<TPayload>,
  ): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Treasury provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const result = evaluatePolicy(payload);
    const executionId = `treasury-policy-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<TreasuryPolicyCheckPayload>, result, state: "prepared", preparedAt });
    return { executionId, intent, unsignedPayload: undefined as TUnsigned, requiredSigners: [], state: "prepared" };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown treasury policy execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Treasury policy cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown treasury policy execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown treasury policy execution.");
    if (record.state !== "reconciled") throw new Error("Treasury policy is not reconciled.");
    return {
      executionId,
      requestId: record.intent.context.requestId,
      capability: record.intent.context.capability,
      network: record.intent.context.network,
      provider: this.id,
      state: "reconciled",
      signatures: [],
      result: record.result as TResult,
      createdAt: record.submittedAt || record.preparedAt,
    };
  }
}

function parsePayload(value: unknown): TreasuryPolicyCheckPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Treasury policy payload must be an object.");
  const payload = value as Partial<TreasuryPolicyCheckPayload>;
  for (const field of ["amountCents", "budgetCents"] as const) {
    if (typeof payload[field] !== "number" || !Number.isSafeInteger(payload[field]) || payload[field] < 0) throw new Error(`${field} must be a non-negative integer.`);
  }
  return payload as TreasuryPolicyCheckPayload;
}

function evaluatePolicy(payload: TreasuryPolicyCheckPayload): TreasuryPolicyCheckResult {
  const checks: Array<{ name: string; passed: boolean; reason?: string }> = [];
  checks.push({ name: "budget", passed: payload.amountCents <= payload.budgetCents, reason: payload.amountCents <= payload.budgetCents ? undefined : "amount exceeds budget" });
  if (payload.maxTransactionCents !== undefined) checks.push({ name: "transaction_limit", passed: payload.amountCents <= payload.maxTransactionCents, reason: payload.amountCents <= payload.maxTransactionCents ? undefined : "amount exceeds transaction limit" });
  if (payload.recipientCount !== undefined && payload.maxRecipientCount !== undefined) checks.push({ name: "recipient_limit", passed: payload.recipientCount <= payload.maxRecipientCount, reason: payload.recipientCount <= payload.maxRecipientCount ? undefined : "recipient count exceeds limit" });
  if (payload.requestedAsset !== undefined && payload.allowedAsset !== undefined) checks.push({ name: "asset", passed: payload.requestedAsset === payload.allowedAsset, reason: payload.requestedAsset === payload.allowedAsset ? undefined : "asset is not allowed" });
  return { passed: checks.every((check) => check.passed), checks, amountCents: payload.amountCents, budgetCents: payload.budgetCents, policyDigestInput: JSON.stringify(payload, Object.keys(payload).sort()) };
}
