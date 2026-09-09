import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";

export interface BlindPolicyProofPayload {
  workflowId?: string;
  privateInputs: Record<string, unknown>;
}

export interface BlindPolicyProofResult {
  ok: true;
  status: string;
  workflowId?: string;
  publicOutcome?: string;
  decision?: string;
  proofHash: string;
  publicProofPackage: Record<string, unknown>;
  verification?: Record<string, unknown>;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
type ProofExecution = {
  intent: ExecutionIntent<BlindPolicyProofPayload>;
  result: BlindPolicyProofResult;
  state: ExecutionState;
  preparedAt: string;
  submittedAt?: string;
};

const DEFAULT_PROVE_ENDPOINT = "https://api.privatedao.org/api/v1/proof-workflows/blind-policy/prove";

/**
 * Kernel adapter for the real blind-policy proof service. The service owns
 * witness generation and Groth16 verification; this adapter only accepts an
 * observed successful public proof package and never fabricates one.
 */
export class BlindPolicyProofProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-blind-policy-proof";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, ProofExecution>();

  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly endpoint = DEFAULT_PROVE_ENDPOINT,
  ) {
    if (!endpoint.startsWith("https://")) throw new Error("Blind policy endpoint must use HTTPS.");
  }

  supports(capability: string): boolean {
    return capability === "verification.blind.prove";
  }

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Blind policy provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Blind policy proof service failed with HTTP ${response.status}.`);
    const result = parseResult(await response.json());
    const executionId = `blind-policy-prove-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<BlindPolicyProofPayload>, result, state: "prepared", preparedAt });
    return { executionId, intent, unsignedPayload: undefined as TUnsigned, requiredSigners: [], state: "prepared" };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown blind policy proof execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Blind policy proof cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown blind policy proof execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown blind policy proof execution.");
    if (record.state !== "reconciled") throw new Error("Blind policy proof is not reconciled.");
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

function parsePayload(value: unknown): BlindPolicyProofPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Blind policy payload must be an object.");
  const payload = value as Partial<BlindPolicyProofPayload>;
  if (!payload.privateInputs || typeof payload.privateInputs !== "object" || Array.isArray(payload.privateInputs)) {
    throw new Error("Blind policy payload requires privateInputs.");
  }
  if (payload.workflowId !== undefined && typeof payload.workflowId !== "string") throw new Error("workflowId must be a string.");
  return { workflowId: payload.workflowId, privateInputs: payload.privateInputs as Record<string, unknown> };
}

function parseResult(value: unknown): BlindPolicyProofResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Blind policy proof response must be an object.");
  const result = value as Partial<BlindPolicyProofResult>;
  if (result.ok !== true || typeof result.proofHash !== "string" || !result.publicProofPackage || typeof result.publicProofPackage !== "object" || Array.isArray(result.publicProofPackage)) {
    throw new Error("Blind policy proof response is not a successful public proof package.");
  }
  return result as BlindPolicyProofResult;
}
