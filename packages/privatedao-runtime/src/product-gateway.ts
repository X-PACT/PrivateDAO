import type {
  CapabilityId,
  ExecutionContext,
  ExecutionIntent,
  ExecutionReceipt,
  PreparedExecution,
} from "./index.js";
import { KernelError, PrivateDaoKernel } from "./kernel.js";
import type { ProtocolPermission, ProtocolRegistry, ProtocolRole } from "./protocol.js";

/**
 * Product-facing execution boundary. Authorization is checked before the
 * provider-neutral Kernel is allowed to prepare, submit, or read an action.
 */
export class ProductExecutionGateway {
  constructor(
    private readonly kernel: PrivateDaoKernel,
    private readonly protocols: ProtocolRegistry,
  ) {}

  prepare<TPayload, TUnsigned>(
    intent: ExecutionIntent<TPayload>,
    role: ProtocolRole,
  ): Promise<PreparedExecution<TUnsigned>> {
    this.authorize(intent.context, "execution.prepare", role);
    return this.kernel.prepare<TPayload, TUnsigned>(intent);
  }

  submit<TUnsigned>(prepared: PreparedExecution<TUnsigned>, signedPayload: TUnsigned, role: ProtocolRole): Promise<{ executionId: string; signatures: string[] }> {
    this.authorize(prepared.intent.context, "execution.submit", role);
    return this.kernel.submit(prepared.executionId, signedPayload);
  }

  status(execution: Pick<PreparedExecution<unknown>, "intent"> & { executionId: string }, role: ProtocolRole) {
    this.authorize(execution.intent.context, "execution.read", role);
    return this.kernel.status(execution.executionId);
  }

  receipt<TResult = unknown>(execution: Pick<PreparedExecution<unknown>, "intent"> & { executionId: string }, role: ProtocolRole): Promise<ExecutionReceipt<TResult>> {
    this.authorize(execution.intent.context, "receipt.read", role);
    return this.kernel.receipt<TResult>(execution.executionId);
  }

  private authorize(context: ExecutionContext, permission: ProtocolPermission, role: ProtocolRole): void {
    const registration = this.protocols.resolve(context.capability);
    if (registration.product !== context.product) {
      throw new KernelError("INVALID_INTENT", "The protocol capability does not belong to the requested product.");
    }
    if (!this.protocols.authorize(context.capability, permission, role, registration.capability.version)) {
      throw new KernelError("INVALID_INTENT", `Role ${role} is not authorized for ${permission}.`, {
        capability: context.capability,
        product: context.product,
      });
    }
  }
}
