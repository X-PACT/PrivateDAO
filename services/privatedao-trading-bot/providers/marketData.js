const fetch = require('node-fetch');
require('dotenv').config();

const SOLANA_TRACKER_BASE = process.env.SOLANA_TRACKER_BASE_URL || 'https://data.solanatracker.io';
const DEXSCREENER_BASE = process.env.DEXSCREENER_BASE_URL || 'https://api.dexscreener.com/latest/dex';
const { getGoldRushSolanaBalances } = require('./goldrush');

function hasSolanaTracker() {
  return Boolean(process.env.SOLANA_TRACKER_API_KEY);
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { timeout: 6000, ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function getSolanaTrackerToken(mint) {
  if (!hasSolanaTracker()) return null;
  return fetchJson(`${SOLANA_TRACKER_BASE}/tokens/${mint}`, {
    headers: { 'x-api-key': process.env.SOLANA_TRACKER_API_KEY },
  });
}

async function getSolanaTrackerRisk(mint) {
  if (!hasSolanaTracker()) return null;
  try {
    return await fetchJson(`${SOLANA_TRACKER_BASE}/risk/${mint}`, {
      headers: { 'x-api-key': process.env.SOLANA_TRACKER_API_KEY },
    });
  } catch {
    return null;
  }
}

async function getDexScreenerToken(mint) {
  const data = await fetchJson(`${DEXSCREENER_BASE}/tokens/${mint}`);
  return data?.pairs || [];
}

function summarizeMarket({ mint, trackerToken, trackerRisk, dexPairs }) {
  const firstPair = Array.isArray(dexPairs) ? dexPairs[0] : null;
  const token = trackerToken?.token || trackerToken?.data?.token || trackerToken;
  const pools = trackerToken?.pools || trackerToken?.data?.pools || [];
  const risk = trackerRisk?.risk || trackerRisk?.data || trackerRisk || null;
  const lpLocked = Boolean(risk?.lpLocked || risk?.liquidityLocked || token?.lpLocked);
  const developerAllocationLocked = Boolean(risk?.developerAllocationLocked || risk?.devAllocationLocked || token?.developerAllocationLocked);
  const mintAuthorityNull = risk?.mintAuthority === null || token?.mintAuthority === null || risk?.mintAuthorityDisabled === true;
  const freezeAuthorityNull = risk?.freezeAuthority === null || token?.freezeAuthority === null || risk?.freezeAuthorityDisabled === true;
  const safetySignals = [
    ['lpLock', lpLocked],
    ['developerAllocationLocked', developerAllocationLocked],
    ['mintAuthorityNull', mintAuthorityNull],
    ['freezeAuthorityNull', freezeAuthorityNull],
  ].map(([name, ok]) => ({ name, ok, points: ok ? 1 : 0 }));

  return {
    mint,
    name: token?.name || firstPair?.baseToken?.name || null,
    symbol: token?.symbol || firstPair?.baseToken?.symbol || null,
    priceUsd: token?.price || token?.priceUsd || firstPair?.priceUsd || null,
    liquidityUsd: firstPair?.liquidity?.usd || pools?.[0]?.liquidity?.usd || null,
    marketCap: token?.marketCap || firstPair?.marketCap || firstPair?.fdv || null,
    dex: firstPair?.dexId || pools?.[0]?.market || null,
    pairAddress: firstPair?.pairAddress || pools?.[0]?.poolId || null,
    riskScore: risk?.score || risk?.riskScore || null,
    riskLevel: risk?.level || risk?.risk || null,
    bondingCurve: Boolean(token?.bondingCurve || token?.pump || firstPair?.labels?.includes?.('pump')),
    safetyScore: safetySignals.reduce((sum, signal) => sum + signal.points, 0),
    safetySignals,
    source: trackerToken ? 'solana-tracker+dexscreener' : 'dexscreener',
  };
}

async function getTokenMarketSummary(mint) {
  const [trackerToken, trackerRisk, dexPairs] = await Promise.all([
    getSolanaTrackerToken(mint).catch(() => null),
    getSolanaTrackerRisk(mint).catch(() => null),
    getDexScreenerToken(mint).catch(() => []),
  ]);
  return summarizeMarket({ mint, trackerToken, trackerRisk, dexPairs });
}

async function getWalletBalanceSummary(wallet) {
  return getGoldRushSolanaBalances(wallet).catch((error) => ({ ok: false, reason: error.message }));
}

module.exports = {
  hasSolanaTracker,
  getTokenMarketSummary,
  getWalletBalanceSummary,
};
