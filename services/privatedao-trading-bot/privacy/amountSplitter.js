const crypto = require('crypto');

function randInt(min, max) {
  return crypto.randomInt(min, max + 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitAmount(totalAmount, parts = 3, minPercent = 15) {
  const total = Number(totalAmount);
  if (!Number.isFinite(total) || total <= 0) throw new Error('Invalid total amount');
  if (!Number.isInteger(parts) || parts < 2 || parts > 12) throw new Error('parts must be 2..12');

  const minUnit = total * (minPercent / 100);
  const weights = Array.from({ length: parts }, () => randInt(10, 100));
  const sum = weights.reduce((a, b) => a + b, 0);

  let chunks = weights.map((w) => total * (w / sum));

  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] < minUnit) chunks[i] = minUnit;
  }

  const adjustedSum = chunks.reduce((a, b) => a + b, 0);
  chunks = chunks.map((x) => x * total / adjustedSum);

  const rounded = chunks.map((x) => Number(x.toFixed(9)));
  const diff = Number((total - rounded.reduce((a, b) => a + b, 0)).toFixed(9));
  rounded[rounded.length - 1] = Number((rounded[rounded.length - 1] + diff).toFixed(9));

  return rounded;
}

function buildSplitPlan({
  totalAmount,
  parts = 3,
  minDelayMs = 15_000,
  maxDelayMs = 120_000,
  minPercent = 15
}) {
  const chunks = splitAmount(totalAmount, parts, minPercent);

  return chunks.map((amount, index) => ({
    index,
    amount,
    delayMs: index === 0 ? 0 : randInt(minDelayMs, maxDelayMs)
  }));
}

async function executeSplitPlan(plan, executor) {
  const results = [];

  for (const step of plan) {
    if (step.delayMs > 0) await sleep(step.delayMs);
    const result = await executor(step.amount, step);
    results.push({ ...step, result });
  }

  return results;
}

module.exports = {
  splitAmount,
  buildSplitPlan,
  executeSplitPlan,
  sleep
};
