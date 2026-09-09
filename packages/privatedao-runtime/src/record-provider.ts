import type {
  ExecutionIntent,
  ExecutionReceipt,
  ExecutionState,
  KernelProvider,
  PreparedExecution,
  ProviderId,
} from "./index.js";

export const RECORD_CANONICALIZATION_VERSION = "privatedao-record-v1";

export interface RecordCreationPayload {
  schemaVersion: "1";
  recordType: string;
  recordId: string;
  issuer: string;
  issuedAt: string;
  effectiveAt?: string;
  payload: Record<string, unknown>;
  sourceRefs?: string[];
  publicFieldPaths?: string[];
}

export interface RecordCreationResult {
  canonicalizationVersion: typeof RECORD_CANONICALIZATION_VERSION;
  recordType: string;
  recordId: string;
  issuer: string;
  canonicalDigest: string;
  publicFields: Record<string, unknown>;
  disclosure: "selective";
}

export interface RecordVerificationPayload {
  record: Omit<RecordCreationPayload, "publicFieldPaths">;
  expectedDigest: string;
}

export interface RecordVerificationResult {
  valid: boolean;
  canonicalDigest: string;
  expectedDigest: string;
}

type RecordExecution = {
  intent: ExecutionIntent<RecordCreationPayload>;
  result: RecordCreationResult;
  state: ExecutionState;
  preparedAt: string;
  submittedAt?: string;
};

/**
 * Kernel-native record artifact creation. The receipt contains only the
 * digest and explicitly selected fields; the source payload is never returned.
 * This does not create a public URL or an on-chain anchor.
 */
export class RecordCreationProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-record-creation";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, RecordExecution>();

  supports(capability: string): boolean {
    return capability === "verification.record.create";
  }

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Record provider does not support this capability.");
    const payload = parsePayload(intent.payload);
    const canonicalBytes = canonicalize({
      schema_version: payload.schemaVersion,
      record_type: payload.recordType,
      record_id: payload.recordId,
      issuer: payload.issuer,
      issued_at: payload.issuedAt,
      effective_at: payload.effectiveAt ?? null,
      payload: payload.payload,
      source_refs: payload.sourceRefs ?? [],
    });
    const result: RecordCreationResult = {
      canonicalizationVersion: RECORD_CANONICALIZATION_VERSION,
      recordType: payload.recordType,
      recordId: payload.recordId,
      issuer: payload.issuer,
      canonicalDigest: await sha256Hex(canonicalBytes),
      publicFields: selectPublicFields(payload.payload, payload.publicFieldPaths ?? []),
      disclosure: "selective",
    };
    const executionId = `record-create-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<RecordCreationPayload>, result, state: "prepared", preparedAt });
    return { executionId, intent, unsignedPayload: undefined as TUnsigned, requiredSigners: [], state: "prepared" };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown record creation execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Record creation cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown record creation execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown record creation execution.");
    if (record.state !== "reconciled") throw new Error("Record creation is not reconciled.");
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

/** Verifies a record digest without returning the source record. */
export class RecordVerificationProvider implements KernelProvider {
  readonly id: ProviderId = "privatedao-record-verification";
  readonly networks = ["solana-devnet"] as const;
  private readonly records = new Map<string, { intent: ExecutionIntent<RecordVerificationPayload>; result: RecordVerificationResult; state: ExecutionState; preparedAt: string; submittedAt?: string }>();

  supports(capability: string): boolean {
    return capability === "verification.record.verify";
  }

  async prepare<TPayload, TUnsigned>(intent: ExecutionIntent<TPayload>): Promise<PreparedExecution<TUnsigned>> {
    if (!this.supports(intent.context.capability)) throw new Error("Record verification provider does not support this capability.");
    const payload = parseVerificationPayload(intent.payload);
    const canonicalDigest = await digestRecord(payload.record);
    const result = { valid: canonicalDigest === payload.expectedDigest, canonicalDigest, expectedDigest: payload.expectedDigest };
    const executionId = `record-verify-${intent.context.requestId}`;
    const preparedAt = new Date().toISOString();
    this.records.set(executionId, { intent: intent as ExecutionIntent<RecordVerificationPayload>, result, state: "prepared", preparedAt });
    return { executionId, intent, unsignedPayload: undefined as TUnsigned, requiredSigners: [], state: "prepared" };
  }

  async submit<TUnsigned>(execution: PreparedExecution<TUnsigned>, _signedPayload: TUnsigned): Promise<{ executionId: string; signatures: string[] }> {
    const record = this.records.get(execution.executionId);
    if (!record) throw new Error("Unknown record verification execution.");
    if (record.state === "reconciled") return { executionId: execution.executionId, signatures: [] };
    if (record.state !== "prepared" && record.state !== "awaiting_signature") throw new Error(`Record verification cannot submit from ${record.state}.`);
    record.state = "reconciled";
    record.submittedAt = new Date().toISOString();
    return { executionId: execution.executionId, signatures: [] };
  }

  async status(executionId: string): Promise<{ executionId: string; state: ExecutionState }> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown record verification execution.");
    return { executionId, state: record.state };
  }

  async receipt<TResult = unknown>(executionId: string): Promise<ExecutionReceipt<TResult>> {
    const record = this.records.get(executionId);
    if (!record) throw new Error("Unknown record verification execution.");
    if (record.state !== "reconciled") throw new Error("Record verification is not reconciled.");
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

function parsePayload(value: unknown): RecordCreationPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Record creation payload must be an object.");
  const payload = value as Partial<RecordCreationPayload>;
  if (payload.schemaVersion !== "1" || !payload.recordType || !payload.recordId || !payload.issuer || !payload.issuedAt || !payload.payload || Array.isArray(payload.payload)) {
    throw new Error("Record creation payload is incomplete.");
  }
  if (payload.publicFieldPaths !== undefined && !Array.isArray(payload.publicFieldPaths)) throw new Error("publicFieldPaths must be an array.");
  return payload as RecordCreationPayload;
}

function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value.normalize("NFC"));
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new Error("Record contains an invalid number.");
    return Number.isInteger(value) ? String(value) : String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key.normalize("NFC"))}:${canonicalize(child)}`).join(",")}}`;
  }
  throw new Error(`Unsupported record value type: ${typeof value}`);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digestRecord(payload: Omit<RecordCreationPayload, "publicFieldPaths">): Promise<string> {
  const canonicalBytes = canonicalize({
    schema_version: payload.schemaVersion,
    record_type: payload.recordType,
    record_id: payload.recordId,
    issuer: payload.issuer,
    issued_at: payload.issuedAt,
    effective_at: payload.effectiveAt ?? null,
    payload: payload.payload,
    source_refs: payload.sourceRefs ?? [],
  });
  return sha256Hex(canonicalBytes);
}

function parseVerificationPayload(value: unknown): RecordVerificationPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Record verification payload must be an object.");
  const payload = value as Partial<RecordVerificationPayload>;
  if (!payload.record || typeof payload.record !== "object" || Array.isArray(payload.record) || typeof payload.expectedDigest !== "string" || !/^[0-9a-f]{64}$/.test(payload.expectedDigest)) {
    throw new Error("Record verification payload is incomplete.");
  }
  return payload as RecordVerificationPayload;
}

function selectPublicFields(payload: Record<string, unknown>, paths: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, payload);
    if (value !== undefined) result[path] = value;
  }
  return result;
}
