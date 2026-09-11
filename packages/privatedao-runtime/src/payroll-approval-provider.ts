import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";

export interface PayrollApprovalPolicy {
  requiredApprovals: number;
  allowedRoles: readonly ("checker" | "admin")[];
  preventSelfApproval: boolean;
}

export interface PayrollApprovalPayload {
  batchId: string;
  makerId: string;
  policyHash: string;
  policy: PayrollApprovalPolicy;
}

export interface PayrollApprovalSignature {
  actorId: string;
  role: "checker" | "admin";
  signature: string;
}

type ApprovalRecord = {
  intent: ExecutionIntent<PayrollApprovalPayload>;
  payload: PayrollApprovalPayload;
  state: ExecutionState;
  preparedAt: string;
  signature?: PayrollApprovalSignature;
  submittedAt?: string;
};

/**
 * Kernel policy gate for a payroll approval. The wallet/network adapter owns
 * cryptographic signature verification; this provider owns the business rule
 * that the submitted signer is the distinct checker named by the intent.
 */
export class PayrollApprovalProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-payroll-approval";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, ApprovalRecord>();

  supports(capability: string): boolean {
    return capability === "payroll.approve";
  }

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Payroll approval provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const checker = intent.accounts.find((account) => account.role === "authority" && account.network === intent.context.network);
    if (!checker) throw new Error("Payroll approval requires a network-matched checker authority account.");
    if (payload.policy.requiredApprovals !== 1) throw new Error("Kernel payroll approval currently requires exactly one checker approval.");
    if (!payload.policy.allowedRoles.includes("checker") && !payload.policy.allowedRoles.includes("admin")) {
      throw new Error("Payroll approval policy must allow checker or admin approval.");
    }
    if (payload.policy.preventSelfApproval && checker.address === payload.makerId) {
      throw new Error("Payroll maker cannot be the checker authority.");
    }

    const executionId = `payroll-approve-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<PayrollApprovalPayload>, payload, state: "awaiting_signature", preparedAt });
    return {
      executionId,
      intent,
      unsignedPayload: { batchId: payload.batchId, policyHash: payload.policyHash } as TUnsigned,
      requiredSigners: [checker],
      state: "awaiting_signature",
    };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown payroll approval execution.");
    if (record.state === "reconciled" && record.signature) return { executionId: execution.executionId, signatures: [record.signature.signature] };
    if (record.state !== "awaiting_signature") throw new Error(`Payroll approval cannot submit from ${record.state}.`);
    const approval = parseSignature(signedPayload);
    const checker = execution.requiredSigners[0];
    if (!checker || approval.actorId !== checker.address) throw new Error("Payroll approval signer does not match the checker authority.");
    if (!record.payload.policy.allowedRoles.includes(approval.role)) throw new Error("Payroll approval signer role is not allowed by policy.");
    if (record.payload.policy.preventSelfApproval && approval.actorId === record.payload.makerId) throw new Error("Payroll maker cannot self-approve.");

    record.signature = approval;
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [approval.signature] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown payroll approval execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record || !record.signature) throw new Error("Payroll approval is not reconciled.");
    return {
      executionId,
      requestId: record.intent.context.requestId,
      capability: record.intent.context.capability,
      network: record.intent.context.network,
      provider: this.id,
      state: "reconciled",
      signatures: [record.signature.signature],
      result: {
        batchId: record.payload.batchId,
        policyHash: record.payload.policyHash,
        approvedBy: record.signature.actorId,
        approvedRole: record.signature.role,
      } as TResult,
      createdAt: record.submittedAt || record.preparedAt,
    };
  }
}

function parsePayload(value: unknown): PayrollApprovalPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Payroll approval payload must be an object.");
  const payload = value as Partial<PayrollApprovalPayload>;
  const policy = payload.policy;
  if (typeof payload.batchId !== "string" || payload.batchId.length === 0 || typeof payload.makerId !== "string" || payload.makerId.length === 0 || typeof payload.policyHash !== "string" || payload.policyHash.length === 0 || !policy) {
    throw new Error("Payroll approval payload requires batchId, makerId, policyHash, and policy.");
  }
  if (!Number.isSafeInteger(policy.requiredApprovals) || policy.requiredApprovals < 1) throw new Error("Payroll approval policy requires a positive approval count.");
  if (!Array.isArray(policy.allowedRoles) || !policy.allowedRoles.every((role) => role === "checker" || role === "admin")) throw new Error("Payroll approval policy roles are invalid.");
  return { batchId: payload.batchId, makerId: payload.makerId, policyHash: payload.policyHash, policy };
}

function parseSignature<TUnsigned>(value: TUnsigned): PayrollApprovalSignature {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Payroll approval requires a signed payload.");
  const signature = value as Partial<PayrollApprovalSignature>;
  if (typeof signature.actorId !== "string" || typeof signature.role !== "string" || typeof signature.signature !== "string" || signature.signature.length === 0) {
    throw new Error("Payroll approval signed payload is incomplete.");
  }
  if (signature.role !== "checker" && signature.role !== "admin") throw new Error("Payroll approval signer role is invalid.");
  return { actorId: signature.actorId, role: signature.role, signature: signature.signature };
}
