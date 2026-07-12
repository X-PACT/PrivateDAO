const fetch = require('node-fetch');

const GOLDRUSH_BASE_URL = process.env.GOLDRUSH_BASE_URL || 'https://api.covalenthq.com/v1';

function hasGoldRush() {
  return Boolean(process.env.GOLDRUSH_API_KEY);
}

async function getGoldRushSolanaBalances(walletAddress) {
  if (!hasGoldRush()) return { ok: false, reason: 'GOLDRUSH_API_KEY missing' };
  const url = `${GOLDRUSH_BASE_URL}/solana-mainnet/address/${walletAddress}/balances_v2/`;
  const res = await fetch(url, {
    timeout: 10000,
    headers: { Authorization: `Bearer ${process.env.GOLDRUSH_API_KEY}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error_message || json.error?.message || `GoldRush balances failed: ${res.status}`);
  }
  return {
    ok: true,
    itemCount: Array.isArray(json.data?.items) ? json.data.items.length : 0,
    updatedAt: json.data?.updated_at || null,
  };
}

module.exports = { hasGoldRush, getGoldRushSolanaBalances };
