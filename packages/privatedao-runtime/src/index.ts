export type ProductId =
  | "blind-verification"
  | "record-verification"
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

export { InMemoryProviderRegistry, KernelError, PrivateDaoKernel, reconcileSettlements } from "./kernel.js";
export type {
  KernelErrorCode,
  KernelEvent,
  KernelEventName,
  KernelOptions,
  KernelTelemetry,
  ReconciliationLine,
  ReconciliationResult,
} from "./kernel.js";
export { PRODUCT_CATALOG, assertProductCatalogValid, findProduct, listProducts, supportsProductCapability, validateProductCatalog } from "./catalog.js";
export type { ProductAvailability, ProductDescriptor } from "./catalog.js";
export { NETWORK_MATRIX, getNetwork, isNetworkAvailable } from "./networks.js";
export type { NetworkDescriptor, NetworkFamily, NetworkStage } from "./networks.js";
export {
  InMemoryProtocolRegistry,
  canApprove,
  isPreparedExecution,
} from "./protocol.js";
export type {
  ApprovalPolicy,
  ApprovalRecord,
  AuthorizationPolicy,
  FeeEstimate,
  NetworkAdapter,
  ProtocolPermission,
  ProtocolRegistration,
  ProtocolRegistry,
  ProtocolRole,
  WalletSession,
  WalletSigner,
} from "./protocol.js";
export { InMemoryAuditLog, InMemoryJobStore, isTerminalJobState, nextRetryState } from "./jobs.js";
export type { AuditEvent, AuditLog, JobState, JobStore, ProtocolJob } from "./jobs.js";
export { TransportBackedNetworkAdapter } from "./adapters.js";
export type { AdapterTransport } from "./adapters.js";
export { HttpExecutionTransport } from "./http-transport.js";
export type { HttpExecutionTransportOptions, HttpExecutionTransportPaths, HttpFetch } from "./http-transport.js";
export { createHttpBackedPrivateDaoRuntime } from "./http-runtime.js";
export type { HttpBackedRuntimeOptions } from "./http-runtime.js";
export {
  assertPayrollTransition,
  calculatePayroll,
  canTransitionPayroll,
} from "./payroll.js";
export type {
  PayrollCalculation,
  PayrollLine,
  PayrollLineInput,
  PayrollPolicy,
  PayrollRounding,
  PayrollState,
} from "./payroll.js";
export { registerCatalogCapabilities } from "./product-registry.js";
export { ProductExecutionGateway } from "./product-gateway.js";
export { createPrivateDaoRuntime } from "./runtime.js";
export type { PrivateDaoRuntime } from "./runtime.js";
export { PayrollCalculationProvider } from "./payroll-provider.js";
export type { PayrollCalculationPayload } from "./payroll-provider.js";
export { buildCapabilityMatrix } from "./capability-matrix.js";
export type { CapabilityMatrixEntry, CapabilityRuntimeStatus } from "./capability-matrix.js";
export {
  APPLICATION_CAPABILITY_BINDINGS,
  assertApplicationBindingsValid,
  findApplicationBinding,
  listApplicationBindings,
  validateApplicationBindings,
} from "./application-bindings.js";
export type { ApplicationBindingMode, ApplicationCapabilityBinding, ApplicationHttpMethod } from "./application-bindings.js";
