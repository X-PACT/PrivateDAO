const { buildSplitPlan } = require('./amountSplitter');
const { sha256, createProofReceipt } = require('../proof/proofReceipt');
const { assertTradeRisk } = require('../risk/riskGuard');

function createPrivateExecutionPlan({
  telegramId,
  wallet,
  totalAmount,
  quoteCurrency,
  tokenMint,
  strategy = 'private',
  slippageBps = 1200,
  parts = 3,
  minDelayMs = 15000,
  maxDelayMs = 120000,
  market = {}
}) {
  assertTradeRisk({
    amount: totalAmount,
    slippageBps,
    priceImpactPct: market.priceImpactPct,
    liquidityUsd: market.liquidityUsd
  });

  const policy = {
    strategy,
    quoteCurrency,
    slippageBps,
    parts,
    risk: 'guarded'
  };

  const plan = buildSplitPlan({ totalAmount, parts, minDelayMs, maxDelayMs });

  const intentHash = sha256({
    telegramId,
    wallet,
    totalAmount,
    quoteCurrency,
    tokenMint,
    strategy,
    slippageBps,
    salt: Date.now()
  });

  const policyHash = sha256(policy);
  const routeHash = sha256({ tokenMint, quoteCurrency, parts, mode: 'split-private' });
  const encryptedIntentHash = sha256({
    intentHash,
    policyHash,
    routeHash,
    scope: 'private-execution-intent',
  });

  return {
    plan,
    intentHash,
    policyHash,
    routeHash,
    encryptedIntentHash,
    receiptBase: {
      telegramId,
      wallet,
      tokenMint,
      quoteCurrency,
      featureMode: 'Private Execution',
      intentHash,
      policyHash,
      routeHash,
      encryptedIntentHash,
      splitCount: plan.length,
      mevProtection: process.env.ENABLE_JITO_FAST_SEND === 'true'
    }
  };
}

function finalizePrivateExecutionReceipt(base, txs) {
  return createProofReceipt({ ...base, txs });
}

module.exports = {
  createPrivateExecutionPlan,
  finalizePrivateExecutionReceipt
};
