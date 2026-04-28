export type GoldRushQueryType =
  | "wallet-history"
  | "stablecoin-flows"
  | "counterparty-screen"
  | "token-holdings";

export type GoldRushQueryRequest = {
  queryType: GoldRushQueryType;
  chainName?: string;
  walletAddress: string;
  include?: string[];
  assets?: string[];
};

export type GoldRushQueryResponse = {
  queryType: GoldRushQueryType;
  chainName: string;
  walletAddress: string;
  sources: {
    goldRush: string;
    duneSim: string;
  };
  summary: {
    assetCount: number;
    stableAssetCount: number;
    totalQuoteUsd: number;
    previewTransactionCount: number;
  };
  riskSignals: string[];
  balances: Array<{
    symbol?: string;
    name?: string;
    quote?: number | null;
    prettyBalance?: string | null;
  }>;
  stablecoinHoldings: Array<{
    symbol?: string;
    quote?: number | null;
    prettyBalance?: string | null;
  }>;
  transactions: unknown[];
  stablecoinFlowPreview: unknown[];
  raw: {
    include: string[];
    assets: string[];
  };
};

export async function runGoldRushQuery(payload: GoldRushQueryRequest): Promise<GoldRushQueryResponse> {
  const response = await fetch("/api/goldrush/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body) {
    throw new Error(typeof body?.error === "string" ? body.error : `GoldRush query failed (${response.status}).`);
  }

  return body as GoldRushQueryResponse;
}
