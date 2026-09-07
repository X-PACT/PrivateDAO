import Ajv, { type ValidateFunction } from "ajv";

export const RECORD_CANONICALIZATION_VERSION = "privatedao-record-v1";

export type RecordVerificationRequest = {
  schema_version: string;
  record_type: string;
  record_id: string;
  issuer: string;
  issued_at: string;
  effective_at?: string;
  payload: Record<string, unknown>;
  source_refs?: string[];
  policy?: RecordPolicy;
  metadata?: Record<string, unknown>;
};

export type RecordPolicyRule =
  | { type: "required"; path: string }
  | { type: "equals"; path: string; value: unknown }
  | { type: "number_range"; path: string; minimum?: number; maximum?: number }
  | { type: "timestamp_between"; path: string; notBefore?: string; notAfter?: string }
  | { type: "enum"; path: string; values: unknown[] }
  | { type: "digest_match"; path: string; digest: string };

export type RecordPolicy = {
  policy_id: string;
  policy_version: string;
  rules: RecordPolicyRule[];
};

export type CanonicalRecord = {
  canonicalization_version: typeof RECORD_CANONICALIZATION_VERSION;
  normalized_payload: Record<string, unknown>;
  canonical_bytes: string;
  canonical_digest: string;
};

export type PolicyEvaluation = {
  policy_id?: string;
  policy_version?: string;
  passed: boolean;
  checks: Array<{ rule: RecordPolicyRule; passed: boolean; reason?: string }>;
  policy_digest?: string;
};

export type PublicRecordReceipt = {
  receipt_id: string;
  record_type: string;
  record_id: string;
  issuer: string;
  canonicalization_version: string;
  canonical_record_digest: string;
  schema_id: string;
  schema_version: string;
  schema_digest: string;
  policy_id?: string;
  policy_version?: string;
  policy_digest?: string;
  verification_status: "VERIFIED" | "INVALID";
  proof_profile?: string;
  proof_digest?: string;
  evidence_digest: string;
  created_at: string;
  anchor_network: "solana" | "pending";
  anchor_reference: string | null;
  anchor_status?: "pending" | "submitted" | "confirmed" | "failed";
  anchor_signature?: string | null;
  anchor_slot?: number | null;
  anchor_program_id?: string | null;
  anchor_cluster?: string | null;
  anchor_confirmed_at?: string | null;
  anchor_payload_digest?: string | null;
  public_fields: Record<string, unknown>;
};

const ajv = new Ajv({ allErrors: true });

export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value.normalize("NFC"));
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Object.is(value, -0)) return value === 0 ? "0" : (() => { throw new Error("Non-finite or ambiguous number"); })();
    if (!Number.isSafeInteger(value) && /e/i.test(String(value))) throw new Error("Exponent numeric representation is not supported");
    return Number.isInteger(value) ? String(value) : String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => {
      const left = a.normalize("NFC");
      const right = b.normalize("NFC");
      return left < right ? -1 : left > right ? 1 : 0;
    });
    return `{${entries.map(([key, child]) => `${JSON.stringify(key.normalize("NFC"))}:${canonicalize(child)}`).join(",")}}`;
  }
  throw new Error(`Unsupported record value type: ${typeof value}`);
  return "";
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function canonicalizeRecord(request: RecordVerificationRequest): Promise<CanonicalRecord> {
  if (!request || request.schema_version !== "1" || !request.record_type || !request.record_id || !request.issuer || !request.issued_at || !request.payload || Array.isArray(request.payload)) {
    throw new Error("Record envelope is incomplete or invalid");
  }
  const normalized_payload = JSON.parse(canonicalize(request.payload)) as Record<string, unknown>;
  const canonical_bytes = canonicalize({
    schema_version: request.schema_version,
    record_type: request.record_type,
    record_id: request.record_id,
    issuer: request.issuer,
    issued_at: request.issued_at,
    effective_at: request.effective_at ?? null,
    payload: normalized_payload,
    source_refs: request.source_refs ?? [],
  });
  return { canonicalization_version: RECORD_CANONICALIZATION_VERSION, normalized_payload, canonical_bytes, canonical_digest: await sha256Hex(canonical_bytes) };
}

export function compileSchema(schema: object): ValidateFunction {
  return ajv.compile(schema);
}

export function evaluatePolicy(policy: RecordPolicy | undefined, payload: Record<string, unknown>, digest: string): PolicyEvaluation {
  if (!policy) return { passed: true, checks: [] };
  const checks = policy.rules.map((rule) => {
    const value = readPath(payload, rule.path);
    if (rule.type === "required") return { rule, passed: value !== undefined && value !== null, reason: value == null ? "required field is missing" : undefined };
    if (rule.type === "equals") return { rule, passed: value !== undefined && canonicalize(value) === canonicalize(rule.value), reason: "value does not match" };
    if (rule.type === "number_range") return { rule, passed: typeof value === "number" && Number.isFinite(value) && (rule.minimum === undefined || value >= rule.minimum) && (rule.maximum === undefined || value <= rule.maximum), reason: "number is outside the permitted range" };
    if (rule.type === "timestamp_between") { const time = Date.parse(String(value)); return { rule, passed: Number.isFinite(time) && (rule.notBefore === undefined || time >= Date.parse(rule.notBefore)) && (rule.notAfter === undefined || time <= Date.parse(rule.notAfter)), reason: "timestamp is outside the permitted range" }; }
    if (rule.type === "enum") return { rule, passed: value !== undefined && rule.values.some((candidate) => canonicalize(candidate) === canonicalize(value)), reason: "value is not an allowed enum member" };
    return { rule, passed: value === digest, reason: "digest does not match" };
  });
  return { policy_id: policy.policy_id, policy_version: policy.policy_version, passed: checks.every((check) => check.passed), checks, policy_digest: undefined };
}

export async function digestObject(value: unknown): Promise<string> {
  return sha256Hex(canonicalize(value));
}

export async function digestSchema(schema: object): Promise<string> {
  return digestObject(schema);
}

export async function digestPolicy(policy: RecordPolicy | undefined): Promise<string | undefined> {
  return policy ? digestObject(policy) : undefined;
}

function readPath(value: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, value);
}

export function selectPublicFields(payload: Record<string, unknown>, paths: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const path of paths) { const value = readPath(payload, path); if (value !== undefined) result[path] = value; }
  return result;
}
