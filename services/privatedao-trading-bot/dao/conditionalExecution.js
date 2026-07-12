function shouldExecuteCondition({ currentPrice, targetPrice, side }) {
  const c = Number(currentPrice);
  const t = Number(targetPrice);
  if (!Number.isFinite(c) || !Number.isFinite(t)) return false;

  if (side === 'buy_at_or_below') return c <= t;
  if (side === 'buy_at_or_above') return c >= t;
  if (side === 'sell_at_or_above') return c >= t;
  if (side === 'sell_at_or_below') return c <= t;

  return false;
}

module.exports = { shouldExecuteCondition };
