const GOLDRUSH_PRICING = Object.freeze({
  market_intel: Number(process.env.GOLDRUSH_MARKET_INTEL_FEE_SOL || 0.02),
  token_discovery: Number(process.env.GOLDRUSH_TOKEN_DISCOVERY_FEE_SOL || 0.015),
  trade_preflight: Number(process.env.GOLDRUSH_TRADE_PREFLIGHT_FEE_SOL || 0.01),
  admin_stats: 0,
});

function goldrushPriceFor(featureKey) {
  return Number(GOLDRUSH_PRICING[String(featureKey || '').trim()] || 0);
}

module.exports = { GOLDRUSH_PRICING, goldrushPriceFor };
