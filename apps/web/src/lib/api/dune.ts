export type DuneBalanceSnapshot = unknown;
export type DuneTransactionSnapshot = unknown;

async function safeJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export async function fetchBalances(walletAddress: string): Promise<DuneBalanceSnapshot> {
  const response = await fetch(`/api/dune/balances?wallet=${encodeURIComponent(walletAddress)}`);
  const body = await safeJson<DuneBalanceSnapshot & { error?: string }>(response);
  if (!response.ok) {
    throw new Error((body as { error?: string } | null)?.error ?? `Dune balances failed (${response.status}).`);
  }
  return body;
}

export async function fetchTransactions(walletAddress: string): Promise<DuneTransactionSnapshot> {
  const response = await fetch(`/api/dune/transactions?wallet=${encodeURIComponent(walletAddress)}`);
  const body = await safeJson<DuneTransactionSnapshot & { error?: string }>(response);
  if (!response.ok) {
    throw new Error((body as { error?: string } | null)?.error ?? `Dune transactions failed (${response.status}).`);
  }
  return body;
}
