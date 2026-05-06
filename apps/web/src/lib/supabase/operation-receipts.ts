import { createOptionalSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_RECEIPTS_STORAGE_KEY = "pdao.operation_receipts.v1";
const LOCAL_RECEIPTS_MAX = 60;
const REVIEWER_SEED_RECEIPTS: OperationReceiptTimelineRow[] = [
  {
    id: "seed-anchor-1-governance",
    created_at: "2026-04-30T12:00:00.000Z",
    operation_type: "anchor-1-governance-upgrade",
    proposal_id: "ANCHOR-1.0.1",
    approval_state: "evidence-recorded",
    execution_reference: "5Et7K7KP2y4K5SufGex1A8VQbqTSWWz8esetT7Lzo7hAamD3MBMVS7PXin1CdFgDxzMtjL2RyZuHUCuzavHc8vLw",
    private_settlement_rail: "testnet-governance",
    stablecoin_symbol: "SOL",
    audit_mode: "reviewer-visible",
    recipient_visibility: "not-applicable",
    metadata: {
      route: "/documents/anchor-1-migration-evidence-2026-04-30",
      note: "Anchor 1.0.1 Testnet upgrade evidence seed for reviewer timeline continuity.",
    },
  },
  {
    id: "seed-umbra-relayer-readiness",
    created_at: "2026-05-06T00:00:00.000Z",
    operation_type: "umbra-relayer-readiness",
    proposal_id: "UMBRA-DEVNET-RELAYER",
    approval_state: "relayer-health-check",
    execution_reference: "https://api.privatedao.org/api/v1/umbra/relayer/health",
    private_settlement_rail: "umbra",
    stablecoin_symbol: "USDC",
    audit_mode: "confidential-payout",
    recipient_visibility: "recipient-private",
    metadata: {
      relayer: "https://relayer.api-devnet.umbraprivacy.com",
      note: "Live relayer readiness endpoint. Full claim submission still requires SDK-generated proof_account_data.",
    },
  },
  {
    id: "seed-qvac-local-ai",
    created_at: "2026-05-06T00:05:00.000Z",
    operation_type: "qvac-local-ai-brief",
    proposal_id: "QVAC-FABRIC-LOCAL",
    approval_state: "browser-local-inference-ready",
    execution_reference: "qvac/fabric-llm-finetune",
    private_settlement_rail: "qvac",
    stablecoin_symbol: "N/A",
    audit_mode: "zero-cloud-ai",
    recipient_visibility: "device-local",
    metadata: {
      route: "/services/qvac-sovereign-ai",
      note: "QVAC model route uses Transformers.js in-browser execution after first model load.",
    },
  },
];

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

function getReviewerSeedReceipts(limit: number): OperationReceiptTimelineRow[] {
  return REVIEWER_SEED_RECEIPTS.slice(0, limit);
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
  const fallbackRows = localRows.length > 0 ? localRows : getReviewerSeedReceipts(limit);
  const supabase = createOptionalSupabaseBrowserClient();
  if (!supabase) {
    return {
      rows: fallbackRows,
      error:
        localRows.length > 0
          ? "Receipt source: local browser store."
          : "Receipt source: reviewer seed timeline. Cloud timeline sync activates when Supabase env is present.",
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
      rows: fallbackRows,
      error:
        localRows.length > 0
          ? `Receipt source switched to local browser store.`
          : `Cloud timeline note: ${error.message}. Showing reviewer seed receipts until the first live Supabase receipt lands.`,
      source: "local",
    };
  }

  const remoteRows = (data ?? []) as OperationReceiptTimelineRow[];
  if (remoteRows.length === 0) {
    return {
      rows: fallbackRows,
      error:
        localRows.length > 0
          ? "Cloud timeline is ready. Showing local operation history for this browser."
          : "Cloud timeline is ready. Showing reviewer seed receipts until the first signed operation lands.",
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
