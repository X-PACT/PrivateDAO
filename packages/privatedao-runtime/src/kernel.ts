import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
  ProviderRegistry,
  CapabilityId,
  NetworkId,
} from "./index.js";

export type KernelErrorCode =
  | "INVALID_INTENT"
  | "DUPLICATE_IDEMPOTENCY_KEY"
  | "PROVIDER_NOT_FOUND"
  | "CAPABILITY_UNSUPPORTED"
  | "EXECUTION_NOT_FOUND"
  | "INVALID_STATE"
  | "PROVIDER_FAILURE";

export class KernelError extends Error {
  readonly code: KernelErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: KernelErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "KernelError";
    this.code = code;
    this.details = details;
  }
}

export class InMemoryProviderRegistry implements ProviderRegistry {
  private readonly providers = new Map<ProviderId, KernelProvider>();

  register(provider: KernelProvider): void {
    if (this.providers.has(provider.id)) {
      throw new KernelError("PROVIDER_FAILURE", `Provider is already registered: ${provider.id}`);
    }
    this.providers.set(provider.id, provider);
  }

  resolve(network: NetworkId, capability: CapabilityId, preferredProvider?: ProviderId): KernelProvider {
    if (preferredProvider) {
      const preferred = this.providers.get(preferredProvider);
      if (!preferred || !preferred.networks.includes(network)) {
        throw new KernelError("PROVIDER_NOT_FOUND", "The requested provider is not available on this network.", {
          network,
          provider: preferredProvider,
        });
      }
      if (!preferred.supports(capability)) {
        throw new KernelError("CAPABILITY_UNSUPPORTED", "The provider does not support this capability.", {
          capability,
          provider: preferredProvider,
        });
      }
      return preferred;
    }

    for (const provider of this.providers.values()) {
      if (provider.networks.includes(network) && provider.supports(capability)) return provider;
    }
    throw new KernelError("PROVIDER_NOT_FOUND", "No provider supports this network and capability.", { network, capability });
  }
}

type ExecutionRecord<TUnsigned> = {
  provider: KernelProvider;
  prepared: PreparedExecution<TUnsigned>;
  state: ExecutionState;
  receipt?: ExecutionReceipt;
};

export class PrivateDaoKernel {
  private readonly executions = new Map<string, ExecutionRecord<unknown>>();
  private readonly idempotency = new Map<string, string>();

  constructor(private readonly registry: ProviderRegistry) {}

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    this.validateIntent(intent);
    const existingId = this.idempotency.get(this.idempotencyKey(intent));
    if (existingId) {
      const existing = this.executions.get(existingId);
      if (existing) return existing.prepared as PreparedExecution<TUnsigned>;
    }

    const provider = this.registry.resolve(intent.context.network, intent.context.capability, intent.context.provider);
    try {
      const prepared = await provider.prepare<TPayload, TUnsigned>(intent);
      this.executions.set(prepared.executionId, { provider, prepared, state: prepared.state });
      this.idempotency.set(this.idempotencyKey(intent), prepared.executionId);
      return prepared;
    } catch (error) {
      throw this.providerError("Provider preparation failed.", error);
    }
  }

  async submit<TUnsigned>(executionId: string, signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.getRecord(executionId);
    if (record.state !== "prepared" && record.state !== "awaiting_signature") {
      throw new KernelError("INVALID_STATE", `Execution cannot be submitted from state ${record.state}.`);
    }
    try {
      const result = await record.provider.submit(record.prepared, signedPayload);
      record.state = "submitted";
      return result;
    } catch (error) {
      record.state = "failed";
      throw this.providerError("Provider submission failed.", error);
    }
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState; errorCode?: string }> {
    const record = this.getRecord(executionId);
    try {
      const status = await record.provider.status(executionId);
      record.state = status.state;
      return status;
    } catch (error) {
      throw this.providerError("Provider status lookup failed.", error);
    }
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.getRecord(executionId);
    try {
      const receipt = await record.provider.receipt<TResult>(executionId);
      record.receipt = receipt;
      record.state = receipt.state;
      return receipt;
    } catch (error) {
      throw this.providerError("Provider receipt lookup failed.", error);
    }
  }

  private validateIntent<TPayload>(intent: ExecutionIntent<TPayload>): void {
    if (!intent.context.requestId || !intent.context.idempotencyKey || !intent.context.network || !intent.context.capability) {
      throw new KernelError("INVALID_INTENT", "Execution intent is missing required context fields.");
    }
  }

  private idempotencyKey<TPayload>(intent: ExecutionIntent<TPayload>): string {
    return `${intent.context.organizationId || "anonymous"}:${intent.context.idempotencyKey}`;
  }

  private getRecord(executionId: string): ExecutionRecord<unknown> {
    const record = this.executions.get(executionId);
    if (!record) throw new KernelError("EXECUTION_NOT_FOUND", `Execution not found: ${executionId}`);
    return record;
  }

  private providerError(message: string, error: unknown): KernelError {
    return new KernelError("PROVIDER_FAILURE", message, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

export interface ReconciliationLine {
  payoutId: string;
  expectedAtomic: string;
  actualAtomic: string;
  state: "confirmed" | "failed" | "pending";
}

export interface ReconciliationResult {
  ok: boolean;
  expectedCount: number;
  confirmedCount: number;
  failedCount: number;
  pendingCount: number;
  expectedTotalAtomic: string;
  confirmedTotalAtomic: string;
  varianceAtomic: string;
  duplicatePayoutIds: string[];
  failedPayoutIds: string[];
  pendingPayoutIds: string[];
}

export function reconcileSettlements(lines: readonly ReconciliationLine[]): ReconciliationResult {
  const seen = new Set<string>();
  const duplicatePayoutIds: string[] = [];
  let expectedTotal = 0n;
  let confirmedTotal = 0n;
  let confirmedCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  const failedPayoutIds: string[] = [];
  const pendingPayoutIds: string[] = [];

  for (const line of lines) {
    if (seen.has(line.payoutId)) duplicatePayoutIds.push(line.payoutId);
    seen.add(line.payoutId);
    expectedTotal += BigInt(line.expectedAtomic);
    if (line.state === "confirmed") {
      confirmedCount += 1;
      confirmedTotal += BigInt(line.actualAtomic);
    } else if (line.state === "failed") {
      failedCount += 1;
      failedPayoutIds.push(line.payoutId);
    } else {
      pendingCount += 1;
      pendingPayoutIds.push(line.payoutId);
    }
  }

  const variance = expectedTotal - confirmedTotal;
  return {
    ok: duplicatePayoutIds.length === 0 && failedCount === 0 && pendingCount === 0 && variance === 0n,
    expectedCount: lines.length,
    confirmedCount,
    failedCount,
    pendingCount,
    expectedTotalAtomic: expectedTotal.toString(),
    confirmedTotalAtomic: confirmedTotal.toString(),
    varianceAtomic: variance.toString(),
    duplicatePayoutIds,
    failedPayoutIds,
    pendingPayoutIds,
  };
}
