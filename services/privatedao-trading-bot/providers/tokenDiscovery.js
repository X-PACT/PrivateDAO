const { URL } = require('url');
const { assertPublicKey } = require('../config/tradingPolicy');
const { getTokenMarketSummary } = require('./marketData');

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function extractBase58Candidates(text) {
  const raw = String(text || '');
  const candidates = new Set();
  for (const part of raw.split(/[\s"'`(){}\[\],<>]+/)) {
    if (BASE58_RE.test(part)) candidates.add(part);
  }
  return [...candidates];
}

function extractFromUrl(input) {
  let url;
  try {
    url = new URL(String(input).trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const segments = url.pathname.split('/').filter(Boolean);
  const candidates = [];

  if (host.includes('pump.fun')) {
    candidates.push(...extractBase58Candidates(url.pathname), ...extractBase58Candidates(url.search));
  } else if (host.includes('dexscreener.com')) {
    candidates.push(...extractBase58Candidates(url.pathname), ...extractBase58Candidates(url.search));
  } else if (host.includes('birdeye.so')) {
    candidates.push(...extractBase58Candidates(url.pathname), ...extractBase58Candidates(url.search));
  } else {
    candidates.push(...extractBase58Candidates(url.pathname), ...extractBase58Candidates(url.search));
  }

  if (!candidates.length && segments.length) {
    candidates.push(...extractBase58Candidates(segments.join(' ')));
  }
  return candidates[0] || null;
}

function normalizeTokenInput(input) {
  const text = String(input || '').trim();
  if (!text) return null;
  if (BASE58_RE.test(text)) return text;
  const fromUrl = extractFromUrl(text);
  if (fromUrl) return fromUrl;
  const fromText = extractBase58Candidates(text)[0] || null;
  return fromText;
}

async function resolveTokenDiscovery(input) {
  const tokenMint = normalizeTokenInput(input);
  if (!tokenMint) {
    return { ok: false, reason: 'No Solana mint or token link found.' };
  }

  try {
    assertPublicKey(tokenMint, 'Token mint');
  } catch (err) {
    return { ok: false, reason: err.message };
  }

  const market = await getTokenMarketSummary(tokenMint).catch(() => null);
  return {
    ok: true,
    tokenMint,
    market,
    source: market?.source || 'token-discovery',
  };
}

module.exports = {
  resolveTokenDiscovery,
  normalizeTokenInput,
  extractFromUrl,
};
