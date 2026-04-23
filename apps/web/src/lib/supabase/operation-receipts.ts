import { createOptionalSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_RECEIPTS_STORAGE_KEY = "pdao.operation_receipts.v1";
const LOCAL_RECEIPTS_MAX = 60;

export type OperationReceiptInsert = {
  operationType: string;
  proposalId: string;
  daoAddress?: string;
  approvalState: string;
  executionReference: string;
  privateSettlementRail: string;
  stablecoinSymbol: string;
  auditMode: string;
  recipientVisibility: string;
  metadata?: Record<string, unknown>;
};

export async function persistOperationReceipt(input: OperationReceiptInsert) {
  persistLocalReceiptRow(input);

  const supabase = createOptionalSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("operation_receipts").insert({
    operation_type: input.operationType,
    proposal_id: input.proposalId,
    dao_address: input.daoAddress ?? null,
    approval_state: input.approvalState,
    execution_reference: input.executionReference,
    private_settlement_rail: input.privateSettlementRail,
    stablecoin_symbol: input.stablecoinSymbol,
    audit_mode: input.auditMode,
    recipient_visibility: input.recipientVisibility,
    metadata: input.metadata ?? {},
  });

  if (error) {
    // Keep on-chain flow non-blocking even when DB schema is not ready.
    console.warn("[operation_receipts] persist failed:", error.message);
  }
}

export type OperationReceiptTimelineRow = {
  id: string;
  created_at: string;
  operation_type: string;
  proposal_id: string;
  approval_state: string;
  execution_reference: string;
  private_settlement_rail: string;
  stablecoin_symbol: string;
  audit_mode: string;
  recipient_visibility: string;
  metadata?: Record<string, unknown>;
};

export type OperationReceiptTimelineResult = {
  rows: OperationReceiptTimelineRow[];
  error: string | null;
  source: "supabase" | "local";
};

function createLocalReceiptRow(input: OperationReceiptInsert): OperationReceiptTimelineRow {
  const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  return {
    id: createId(),
    created_at: new Date().toISOString(),
    operation_type: input.operationType,
    proposal_id: input.proposalId,
    approval_state: input.approvalState,
    execution_reference: input.executionReference,
    private_settlement_rail: input.privateSettlementRail,
    stablecoin_symbol: input.stablecoinSymbol,
    audit_mode: input.auditMode,
    recipient_visibility: input.recipientVisibility,
    metadata: input.metadata ?? {},
  };
}

function readLocalReceiptRows(): OperationReceiptTimelineRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_RECEIPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OperationReceiptTimelineRow[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => typeof entry?.id === "string" && typeof entry?.created_at === "string")
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  } catch {
    return [];
  }
}

function persistLocalReceiptRow(input: OperationReceiptInsert) {
  if (typeof window === "undefined") return;
  const nextRow = createLocalReceiptRow(input);
  const nextRows = [nextRow, ...readLocalReceiptRows()].slice(0, LOCAL_RECEIPTS_MAX);
  try {
    window.localStorage.setItem(LOCAL_RECEIPTS_STORAGE_KEY, JSON.stringify(nextRows));
  } catch {
    // Keep non-blocking path even when storage quota is full.
  }
}

export async function fetchOperationReceiptTimeline(limit = 20): Promise<OperationReceiptTimelineResult> {
  const localRows = readLocalReceiptRows().slice(0, limit);
  const supabase = createOptionalSupabaseBrowserClient();
  if (!supabase) {
    return {
      rows: localRows,
      error:
        localRows.length > 0
          ? "Receipt source: local browser store."
          : "Receipt source: local browser store. Cloud timeline sync is optional.",
      source: "local",
    };
  }

  const { data, error } = await supabase
    .from("operation_receipts")
    .select(
      "id, created_at, operation_type, proposal_id, approval_state, execution_reference, private_settlement_rail, stablecoin_symbol, audit_mode, recipient_visibility, metadata",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      rows: localRows,
      error:
        localRows.length > 0
          ? `Receipt source switched to local browser store.`
          : error.message,
      source: "local",
    };
  }

  const remoteRows = (data ?? []) as OperationReceiptTimelineRow[];
  if (remoteRows.length === 0 && localRows.length > 0) {
    return {
      rows: localRows,
      error: "Cloud timeline is ready. Showing local operation history for this browser.",
      source: "local",
    };
  }

  return {
    rows: remoteRows,
    error: null as string | null,
    source: "supabase",
  };
}

export function getLocalOperationReceiptCount() {
  return readLocalReceiptRows().length;
}
