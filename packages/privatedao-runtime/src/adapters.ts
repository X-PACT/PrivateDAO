import type {
  CapabilityId,
  ExecutionIntent,
  ExecutionState,
  ExecutionReceipt,
  NetworkAdapter,
  NetworkId,
  PreparedExecution,
  ProviderId,
  ProtocolCapability,
} from "./index.js";
import { getNetwork } from "./networks.js";
import type { NetworkDescriptor } from "./networks.js";
import type { FeeEstimate } from "./protocol.js";

export interface AdapterTransport {
  prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>>;
  submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }>;
  status(executionId: string): Promise<{ executionId: string; state: ExecutionState; errorCode?: string }>;
  receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>>;
  estimateFee<TPayload>(intent: ExecutionIntent<TPayload>): Promise<FeeEstimate>;
}

/**
 * Adapter boundary for a real provider transport. This class intentionally has
 * no RPC client, wallet key, or fallback success path; the transport owns those
 * environment-specific concerns and must return observed network results.
 */
export class TransportBackedNetworkAdapter implements NetworkAdapter {
  readonly id: ProviderId;
  readonly networks: readonly NetworkId[];
  readonly descriptor: NetworkDescriptor;
  private readonly capabilities: ReadonlySet<CapabilityId>;

  constructor(input: {
    id: ProviderId;
    network: NetworkId;
    capabilities: readonly ProtocolCapability[];
    transport: AdapterTransport;
  }) {
    const descriptor = getNetwork(input.network);
    if (descriptor.stage !== "available") {
      throw new Error(`Cannot create an adapter for unavailable network: ${input.network}`);
    }
    this.id = input.id;
    this.networks = [input.network];
    this.descriptor = descriptor;
    this.capabilities = new Set(input.capabilities.filter((capability) => capability.networks.includes(input.network)).map((capability) => capability.id));
    if (this.capabilities.size === 0) throw new Error(`Adapter has no capabilities for network: ${input.network}`);
    this.transport = input.transport;
  }

  private readonly transport: AdapterTransport;

  supports(capability: CapabilityId): boolean {
    return this.capabilities.has(capability);
  }

  prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    this.assertNetwork(intent.context.network);
    this.assertCapability(intent.context.capability);
    return this.transport.prepare(intent);
  }

  submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    this.assertNetwork(execution.intent.context.network);
    this.assertCapability(execution.intent.context.capability);
    return this.transport.submit(execution, signedPayload);
  }

  status(executionId: string): Promise<{ executionId: string; state: ExecutionState; errorCode?: string }> {
    return this.transport.status(executionId);
  }

  receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    return this.transport.receipt<TResult>(executionId);
  }

  estimateFee<TPayload>(intent: ExecutionIntent<TPayload>): Promise<FeeEstimate> {
    this.assertNetwork(intent.context.network);
    this.assertCapability(intent.context.capability);
    return this.transport.estimateFee(intent);
  }

  explorerUrl(reference: string): string {
    const base = this.descriptor.explorerBaseUrl;
    return base ? `${base}${base.includes("?") ? "&" : "?"}tx=${encodeURIComponent(reference)}` : reference;
  }

  private assertNetwork(network: NetworkId): void {
    if (!this.networks.includes(network)) throw new Error(`Adapter ${this.id} does not support network: ${network}`);
  }

  private assertCapability(capability: CapabilityId): void {
    if (!this.supports(capability)) throw new Error(`Adapter ${this.id} does not support capability: ${capability}`);
  }
}
