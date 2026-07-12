function assertTradeRisk({ amount, slippageBps, priceImpactPct, liquidityUsd }) {
  if (Number(amount) <= 0) throw new Error('Invalid amount');
  if (Number(slippageBps) > 1200) throw new Error('Blocked: slippage above 12%');
  if (Number(priceImpactPct || 0) > 8) throw new Error('Blocked: price impact above 8%');
  if (Number(liquidityUsd || 0) > 0 && Number(liquidityUsd) < 3000) throw new Error('Blocked: liquidity too low');
  return true;
}
module.exports = { assertTradeRisk };
