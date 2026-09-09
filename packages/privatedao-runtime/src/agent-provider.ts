import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";

export interface AgentDiscoveryPayload {
  url?: string;
}

export interface AgentDiscoveryResult {
  url: string;
  status: number;
  agentCard: Record<string, unknown>;
  fetchedAt: string;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
type DiscoveryExecution = {
  intent: ExecutionIntent<AgentDiscoveryPayload>;
  result: AgentDiscoveryResult;
  state: ExecutionState;
  preparedAt: string;
  submittedAt?: string;
};

const DEFAULT_AGENT_CARD_URL = "https://agents.privatedao.org/.well-known/agent-card.json";

/** Read-only discovery provider. It never invents an Agent Card or activity. */
export class AgentDiscoveryProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-agent-discovery";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, DiscoveryExecution>();

  constructor(private readonly fetchImpl: FetchLike = fetch) {}

  supports(capability: string): boolean {
    return capability === "agent.discover";
  }

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Agent discovery provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const url = payload.url || DEFAULT_AGENT_CARD_URL;
    if (!url.startsWith("https://")) throw new Error("Agent Card URL must use HTTPS.");
    const response = await this.fetchImpl(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Agent Card discovery failed with HTTP ${response.status}.`);
    const card = await response.json() as unknown;
    if (!card || typeof card !== "object" || Array.isArray(card)) throw new Error("Agent Card response must be a JSON object.");
    const result = { url, status: response.status, agentCard: card as Record<string, unknown>, fetchedAt: new Date().toISOString() };
    const executionId = `agent-discover-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<AgentDiscoveryPayload>, result, state: "prepared", preparedAt });
    return { executionId, intent, unsignedPayload: undefined as TUnsigned, requiredSigners: [], state: "prepared" };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown Agent discovery execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Agent discovery cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown Agent discovery execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown Agent discovery execution.");
    if (record.state !== "reconciled") throw new Error("Agent discovery is not reconciled.");
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

function parsePayload(value: unknown): AgentDiscoveryPayload {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("Agent discovery payload must be an object.");
  const payload = value as AgentDiscoveryPayload;
  if (payload.url !== undefined && typeof payload.url !== "string") throw new Error("Agent discovery URL must be a string.");
  return payload;
}
