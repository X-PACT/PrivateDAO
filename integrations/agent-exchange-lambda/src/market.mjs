const chainIds = Object.freeze({
  "solana-mainnet-beta": "solana",
  "ethereum-mainnet": "ethereum",
  "base-mainnet": "base",
  "arbitrum-mainnet": "arbitrum",
});
const marketCache = new Map();
const MARKET_TTL_MS = 15000;

export async function marketData(config, network, asset) {
  const chainId = chainIds[network];
  if (!chainId) throw new Error(`market data is not supported on ${network}`);
  const cacheKey = `${network}:${asset}`;
  const cached = marketCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return { ...cached.value, cache: "hit" };
  const url = `${config.marketDataUrl.replace(/\/$/, "")}/tokens/${encodeURIComponent(asset)}`;
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`market data HTTP ${response.status}`);
  const body = await response.json();
  const pairs = Array.isArray(body.pairs)
    ? body.pairs.filter((pair) => pair.chainId === chainId)
    : [];
  const pair = pairs.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0))[0];
  if (!pair) {
    const value = { status: "no_pair", source: "dexscreener", network, asset, observed_at: new Date().toISOString() };
    marketCache.set(cacheKey, { value, expiresAt: Date.now() + MARKET_TTL_MS });
    return { ...value, cache: "miss" };
  }
  const value = {
    status: "source_confirmed",
    source: "dexscreener",
    network,
    asset,
    pair_address: pair.pairAddress || null,
    dex: pair.dexId || null,
    url: pair.url || null,
    base_symbol: pair.baseToken?.symbol || null,
    quote_symbol: pair.quoteToken?.symbol || null,
    price_usd: pair.priceUsd || null,
    liquidity_usd: pair.liquidity?.usd ?? null,
    volume_24h_usd: pair.volume?.h24 ?? null,
    fdv_usd: pair.fdv ?? null,
    market_cap_usd: pair.marketCap ?? null,
    price_change_24h_percent: pair.priceChange?.h24 ?? null,
    observed_at: new Date().toISOString(),
  };
  marketCache.set(cacheKey, { value, expiresAt: Date.now() + MARKET_TTL_MS });
  return { ...value, cache: "miss" };
}
