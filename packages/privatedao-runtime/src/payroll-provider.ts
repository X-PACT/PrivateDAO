import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";
import { calculatePayroll, type PayrollCalculation, type PayrollLineInput, type PayrollPolicy } from "./payroll.js";

export interface PayrollCalculationPayload {
  lines: readonly PayrollLineInput[];
  policy: PayrollPolicy;
}

type CalculationRecord = {
  intent: ExecutionIntent<PayrollCalculationPayload>;
  calculation: PayrollCalculation;
  state: ExecutionState;
  preparedAt: string;
  submittedAt?: string;
};

/**
 * Kernel-native provider for the deterministic payroll calculation step.
 * It never signs, submits, or represents a settlement transaction.
 */
export class PayrollCalculationProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-payroll-calculation";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, CalculationRecord>();

  supports(capability: string): boolean {
    return capability === "payroll.calculate";
  }

  async prepare<TPayload, TUnsigned>(
    intent: ExecutionIntent<TPayload>,
  ): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Payroll calculation provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const calculation = calculatePayroll(payload.lines, payload.policy);
    const executionId = `payroll-calculate-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<PayrollCalculationPayload>, calculation, state: "prepared", preparedAt });
    return {
      executionId,
      intent,
      unsignedPayload: undefined as TUnsigned,
      requiredSigners: [],
      state: "prepared",
    };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown payroll calculation execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Payroll calculation cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown payroll calculation execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown payroll calculation execution.");
    if (record.state !== "reconciled") throw new Error("Payroll calculation is not reconciled.");
    return {
      executionId,
      requestId: record.intent.context.requestId,
      capability: record.intent.context.capability,
      network: record.intent.context.network,
      provider: this.id,
      state: "reconciled",
      signatures: [],
      result: record.calculation as TResult,
      createdAt: record.submittedAt || record.preparedAt,
    };
  }
}

function parsePayload(value: unknown): PayrollCalculationPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Payroll calculation payload must be an object.");
  const payload = value as Partial<PayrollCalculationPayload>;
  if (!Array.isArray(payload.lines) || !payload.policy || typeof payload.policy !== "object") {
    throw new Error("Payroll calculation payload requires lines and policy.");
  }
  return { lines: payload.lines, policy: payload.policy as PayrollPolicy };
}
