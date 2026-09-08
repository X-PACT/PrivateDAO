import type {
  CapabilityId,
  ExecutionContext,
  ExecutionIntent,
  KernelProvider,
  NetworkId,
  PreparedExecution,
  ProductId,
  ProtocolCapability,
  ProviderId,
} from "./index.js";
import type { NetworkDescriptor } from "./networks.js";

/** A connected wallet session. Private keys never cross this boundary. */
export interface WalletSession {
  address: string;
  network: NetworkId;
  provider?: ProviderId;
  connectedAt: string;
}

export interface WalletSigner {
  readonly id: ProviderId;
  readonly networks: readonly NetworkId[];
  session(): Promise<WalletSession>;
  sign<TUnsigned>(payload: TUnsigned, context: ExecutionContext): Promise<TUnsigned>;
}

export interface FeeEstimate {
  network: NetworkId;
  atomicAmount: string;
  asset: string;
  expiresAt?: string;
}

/** Network-specific execution belongs behind this adapter, never in product code. */
export interface NetworkAdapter extends KernelProvider {
  readonly descriptor: NetworkDescriptor;
  estimateFee<TPayload>(intent: ExecutionIntent<TPayload>): Promise<FeeEstimate>;
  explorerUrl(reference: string): string;
}

export type ProtocolRole = "maker" | "checker" | "auditor" | "admin" | "agent";

export type ProtocolPermission =
  | "execution.prepare"
  | "execution.submit"
  | "execution.read"
  | "receipt.read"
  | "proof.create"
  | "proof.verify"
  | "policy.manage";

export interface AuthorizationPolicy {
  roles: readonly ProtocolRole[];
  permissions: readonly ProtocolPermission[];
  requireDistinctApprover?: boolean;
}

export interface ProtocolRegistration {
  capability: ProtocolCapability;
  product: ProductId;
  action: string;
  policy: AuthorizationPolicy;
}

export interface ProtocolRegistry {
  register(registration: ProtocolRegistration): void;
  resolve(capability: CapabilityId, version?: string): ProtocolRegistration;
  list(product?: ProductId): readonly ProtocolRegistration[];
  authorize(capability: CapabilityId, permission: ProtocolPermission, role: ProtocolRole, version?: string): boolean;
}

export class InMemoryProtocolRegistry implements ProtocolRegistry {
  private readonly registrations = new Map<string, ProtocolRegistration>();

  register(registration: ProtocolRegistration): void {
    const key = this.key(registration.capability.id, registration.capability.version);
    if (this.registrations.has(key)) throw new Error(`Protocol capability is already registered: ${key}`);
    this.registrations.set(key, registration);
  }

  resolve(capability: CapabilityId, version?: string): ProtocolRegistration {
    const matches = [...this.registrations.values()].filter((entry) => entry.capability.id === capability);
    const registration = version
      ? matches.find((entry) => entry.capability.version === version)
      : matches[matches.length - 1];
    if (!registration) throw new Error(`Protocol capability is not registered: ${capability}`);
    return registration;
  }

  list(product?: ProductId): readonly ProtocolRegistration[] {
    return [...this.registrations.values()].filter((entry) => !product || entry.product === product);
  }

  authorize(capability: CapabilityId, permission: ProtocolPermission, role: ProtocolRole, version?: string): boolean {
    const registration = this.resolve(capability, version);
    return registration.policy.roles.includes(role) && registration.policy.permissions.includes(permission);
  }

  private key(capability: CapabilityId, version: string): string {
    return `${capability}@${version}`;
  }
}

export interface ApprovalRecord {
  approvalId: string;
  executionId: string;
  actorId: string;
  role: ProtocolRole;
  approvedAt: string;
  policyHash?: string;
}

export interface ApprovalPolicy {
  requiredApprovals: number;
  allowedRoles: readonly ProtocolRole[];
  preventSelfApproval: boolean;
}

export function canApprove(
  policy: ApprovalPolicy,
  actorId: string,
  makerId: string,
  approvals: readonly ApprovalRecord[],
): boolean {
  if (policy.preventSelfApproval && actorId === makerId) return false;
  if (approvals.some((approval) => approval.actorId === actorId)) return false;
  const validApprovals = approvals.filter((approval) => policy.allowedRoles.includes(approval.role));
  return validApprovals.length < policy.requiredApprovals;
}

export function isPreparedExecution(value: unknown): value is PreparedExecution<unknown> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PreparedExecution<unknown>>;
  return typeof candidate.executionId === "string" && (candidate.state === "prepared" || candidate.state === "awaiting_signature");
}
