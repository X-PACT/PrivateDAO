const rpcCall = async (url, method, params = []) => {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`Solana RPC ${body.error.code}: ${body.error.message}`);
  return body.result;
};

export function rpcUrls(config) { return [config.rpcPrimary, config.rpcSecondary, config.rpcFallback].filter(Boolean).filter((url, i, all) => all.indexOf(url) === i); }

export async function readRpc(config, method, params = []) {
  let last;
  for (const url of rpcUrls(config)) { try { return { url, result: await rpcCall(url, method, params) }; } catch (error) { last = error; } }
  throw last || new Error("no Solana RPC configured");
}

export async function verifyPayment(config, payment, quote) {
  if (!payment?.signature || !quote) return { ok: false, reason: "signature and quote are required" };
  const { result: tx } = await readRpc(config, "getTransaction", [payment.signature, { commitment: "finalized", maxSupportedTransactionVersion: 0, encoding: "jsonParsed" }]);
  if (!tx) return { ok: false, reason: "transaction is not finalized or was not found" };
  const instructions = tx.transaction?.message?.instructions || [];
  const expected = Number(quote.amountAtomic);
  const match = instructions.some((instruction) => {
    const info = instruction.parsed?.info;
    if (!info) return false;
    if (quote.currency === "SOL") return instruction.program === "system" && info.destination === quote.recipient && Number(info.lamports) === expected;
    return instruction.program === "spl-token" && ["transfer", "transferChecked"].includes(instruction.parsed?.type) && info.destination === quote.recipientTokenAccount && Number(info.amount ?? info.tokenAmount?.amount) === expected && (!quote.mint || info.mint === quote.mint);
  });
  return { ok: match && tx.meta?.err == null, slot: tx.slot, blockTime: tx.blockTime, reason: match ? (tx.meta?.err ? "transaction failed" : "confirmed") : "payment instruction does not match quote" };
}

export async function networkStats(config) {
  const { url, result } = await readRpc(config, "getEpochInfo");
  return { provider: url, epoch: result.epoch, slotIndex: result.slotIndex, absoluteSlot: result.absoluteSlot };
}
