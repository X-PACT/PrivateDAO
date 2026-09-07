export type ProductId =
  | "verification"
  | "payroll"
  | "treasury"
  | "governance"
  | "auction"
  | "agent";

export type CapabilityId =
  | "verification.record.create"
  | "verification.record.verify"
  | "verification.blind.prove"
  | "payroll.calculate"
  | "payroll.approve"
  | "payroll.settle"
  | "treasury.policy.check"
  | "governance.proposal.execute"
  | "auction.bid.commit"
  | "auction.settle"
  | "agent.discover"
  | "agent.invoke";

export type NetworkId = "solana-devnet" | "solana-mainnet-beta" | (string & {});
export type ProviderId = string & {};

export type ExecutionState =
  | "created"
  | "prepared"
  | "awaiting_signature"
  | "signed"
  | "submitted"
  | "confirmed"
  | "finalized"
  | "reconciled"
  | "failed"
  | "cancelled";

export interface ExecutionContext {
  requestId: string;
  idempotencyKey: string;
  product: ProductId;
  capability: CapabilityId;
  organizationId?: string;
  actorId?: string;
  network: NetworkId;
  provider?: ProviderId;
  policyHash?: string;
}

export interface AccountReference {
  role: "authority" | "payer" | "recipient" | "program" | "treasury" | "other";
  address: string;
  network: NetworkId;
}

export interface ExecutionIntent<TPayload = unknown> {
  context: ExecutionContext;
  payload: TPayload;
  accounts: AccountReference[];
  expiresAt?: string;
}

export interface PreparedExecution<TUnsigned = unknown> {
  executionId: string;
  intent: ExecutionIntent;
  unsignedPayload: TUnsigned;
  requiredSigners: AccountReference[];
  state: "prepared" | "awaiting_signature";
}

export interface ExecutionReceipt<TResult = unknown> {
  executionId: string;
  requestId: string;
  capability: CapabilityId;
  network: NetworkId;
  provider?: ProviderId;
  state: Extract<ExecutionState, "confirmed" | "finalized" | "reconciled">;
  signatures: string[];
  result?: TResult;
  reconciliationId?: string;
  proofId?: string;
  createdAt: string;
}

export interface KernelProvider {
  readonly id: ProviderId;
  readonly networks: readonly NetworkId[];
  supports(capability: CapabilityId): boolean;
  prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>>;
  submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }>;
  status(executionId: string): Promise<{ executionId: string; state: ExecutionState; errorCode?: string }>;
  receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>>;
}

export interface ProviderRegistry {
  register(provider: KernelProvider): void;
  resolve(network: NetworkId, capability: CapabilityId, preferredProvider?: ProviderId): KernelProvider;
}

export interface ProtocolCapability {
  id: CapabilityId;
  version: string;
  product: ProductId;
  networks: readonly NetworkId[];
  requiresSignature: boolean;
  supportsAsync: boolean;
  receiptSchema: string;
}

export interface ProtocolAction<TInput = unknown, TOutput = unknown> {
  capability: ProtocolCapability;
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
}

export interface ProofReference {
  proofId: string;
  verificationUrl?: string;
  scope: "public" | "auditor" | "custom";
  claims: readonly string[];
  expiresAt?: string;
  revokedAt?: string;
}

export interface ProtocolReceipt<TResult = unknown> extends ExecutionReceipt<TResult> {
  proof?: ProofReference;
}
