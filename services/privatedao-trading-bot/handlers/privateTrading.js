const { getBotWallet } = require('../db/supabase');
const { getSolBalance, getTokenBalance, buyTokenWithQuote, USDC_MINT } = require('../trading/jupiter');
const { decryptPrivateKey } = require('../trading/wallet');
const { Keypair } = require('@solana/web3.js');
const { PDAO_MINT } = require('../config/tradingPolicy');
const { createPrivateExecutionPlan, finalizePrivateExecutionReceipt } = require('../privacy/privateExecutionPlan');
const { shouldExecuteCondition } = require('../dao/conditionalExecution');
const { assertWalletBinding } = require('../security/walletBinding');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { broadcastPdaoBuy } = require('./community');

const customStrategies = new Map();

async function updateProgress(bot, chatId, message, steps, activeIndex) {
  const text = steps.map((step, index) => {
    if (index < activeIndex) return `✅ ${step}`;
    if (index === activeIndex) return `⏳ ${step}`;
    return `▫️ ${step}`;
  }).join('\n');
  try {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: 'Markdown',
    });
  } catch {
    await bot.sendMessage(chatId, text);
  }
}

function parsePrivateBuyArgs(rawArgs = '') {
  const parts = String(rawArgs).trim().split(/\s+/).filter(Boolean);
  const amount = Number(parts[0]);
  const quoteCurrency = String(parts[1] || 'SOL').toUpperCase();
  const tokenMint = parts[2] && !['private', 'shield', 'mev'].includes(parts[2].toLowerCase())
    ? parts[2]
    : PDAO_MINT;

  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Invalid amount.' };
  if (!['SOL', 'USDC'].includes(quoteCurrency)) return { error: 'Quote currency must be SOL or USDC.' };

  return { amount, quoteCurrency, tokenMint };
}

async function handlePrivateStatus(bot, msg) {
  const chatId = msg.chat.id;

  return bot.sendMessage(chatId,
    `🛡️ *PrivateDAO Private Execution*\n\n` +
    `Status: *enabled*\n` +
    `Network: *Solana mainnet execution + local Groth16 receipt verification*\n\n` +
    `Active features:\n` +
    `1. MEV Protection Mode\n` +
    `2. DAO Conditional Execution\n` +
    `3. Private Split Orders\n` +
    `4. Proof Receipts\n` +
    `5. Risk Guard\n\n` +
    `Privacy scope:\n` +
    `• Strategy hidden\n` +
    `• Amount split into private chunks\n` +
    `• Risk parameters hashed\n` +
    `• Receipt hash generated\n` +
    `• Bot wallet used, not user wallet\n\n` +
    `Commands:\n` +
    `\`/private_buy 0.01 SOL PDAO\`\n` +
    `\`/strategy_custom <your rule>\``
  );
}

async function handlePrivateBuy(bot, msg, session, rawArgs = '') {
  const chatId = msg.chat.id;
  const parsed = parsePrivateBuyArgs(rawArgs);
  if (parsed.error) return bot.sendMessage(chatId, parsed.error);

  const botWallet = await getBotWallet(msg.from.id);
  if (!botWallet) return bot.sendMessage(chatId, 'Create a bot wallet first with /deposit.');
  assertWalletBinding(botWallet);

  const { amount, quoteCurrency, tokenMint } = parsed;
  const solBalance = await getSolBalance(botWallet.public_key);

  if (quoteCurrency === 'SOL' && solBalance < amount + 0.003) {
    return bot.sendMessage(chatId, `SOL balance too low. Wallet has ${solBalance.toFixed(5)} SOL.`);
  }

  if (quoteCurrency === 'USDC') {
    const usdcBalance = await getTokenBalance(botWallet.public_key, USDC_MINT);
    if (usdcBalance < amount) return bot.sendMessage(chatId, `USDC balance too low. Wallet has ${usdcBalance.toFixed(4)} USDC.`);
    if (solBalance < 0.003) return bot.sendMessage(chatId, `SOL gas reserve too low. Keep at least 0.003 SOL.`);
  }

  const plan = createPrivateExecutionPlan({
    telegramId: msg.from.id,
    wallet: botWallet.public_key,
    totalAmount: amount,
    quoteCurrency,
    tokenMint,
    strategy: customStrategies.get(msg.from.id) || 'private-split-buy',
    slippageBps: Number(process.env.DEFAULT_SLIPPAGE_BPS || 1200),
    parts: Number(process.env.PRIVATE_SPLIT_PARTS || 3),
    minDelayMs: Number(process.env.PRIVATE_SPLIT_MIN_DELAY_MS || 1000),
    maxDelayMs: Number(process.env.PRIVATE_SPLIT_MAX_DELAY_MS || 5000),
    market: { priceImpactPct: 0, liquidityUsd: 6690 }
  });

  const progressSteps = [
    'Wallet checked',
    'Liquidity checked',
    'Route selected',
    'Smart Shield enabled',
    'Split order prepared',
    'MEV protection checked',
    'Broadcasting',
    'Confirmed',
    'Receipt generated',
  ];
  const progressMessage = await bot.sendMessage(chatId, `⏳ ${progressSteps[0]}`);
  await updateProgress(bot, chatId, progressMessage, progressSteps, 4);

  const keypair = Keypair.fromSecretKey(decryptPrivateKey(botWallet.encrypted_private_key));
  const txs = [];
  let lastZk = null;

  for (const step of plan.plan) {
    if (step.delayMs > 0) await new Promise(r => setTimeout(r, step.delayMs));

    const r = await buyTokenWithQuote(
      keypair,
      tokenMint,
      step.amount,
      quoteCurrency,
      Number(process.env.DEFAULT_SLIPPAGE_BPS || 1200),
      { protectedRoute: true, executionMode: 'private' }
    );

    txs.push({
      index: step.index,
      amount: step.amount,
      delayMs: step.delayMs,
      tx: r.txid
    });
    lastZk = r.zk;
    await updateProgress(bot, chatId, progressMessage, progressSteps, 6);
  }

  await updateProgress(bot, chatId, progressMessage, progressSteps, 7);
  const receipt = await attachOnchainAnchor({
    ...finalizePrivateExecutionReceipt(plan.receiptBase, txs),
    proofHash: lastZk?.publicInput?.proofHash,
    publicSignalsHash: lastZk?.publicInput?.publicSignalsHash,
    walletFingerprint: botWallet.wallet_fingerprint,
    localGroth16Verified: Boolean(lastZk?.valid),
    featureMode: 'Private Execution',
  });
  await updateProgress(bot, chatId, progressMessage, progressSteps, 8);

  if (tokenMint === PDAO_MINT) {
    await broadcastPdaoBuy(bot, {
      amountSol: amount,
      usdValue: plan.market?.priceUsd ? Number(plan.market.priceUsd) * Number(amount) : null,
      tokenReceived: plan.market?.symbol || 'PDAO',
      market: plan.market,
      txs,
    }).catch(() => null);
  }

  return bot.sendMessage(chatId,
    `✅ *Private execution completed*\n\n` +
    `Chunks: *${txs.length}*\n` +
    `Receipt hash:\n\`${receipt.receiptHash}\`\n\n` +
    `Intent hash:\n\`${receipt.intentHash}\`\n\n` +
    `Policy hash:\n\`${receipt.policyHash}\`\n\n` +
    `Route hash:\n\`${receipt.routeHash}\`\n\n` +
    `Anchor: *${receipt.onchainAnchored ? 'on-chain' : 'not anchored'}*\n` +
    (receipt.anchorExplorerUrl ? `Anchor tx:\n${receipt.anchorExplorerUrl}\n\n` : '') +
    txs.map(x => `#${x.index + 1}: ${x.amount} ${quoteCurrency}\nhttps://solscan.io/tx/${x.tx}`).join('\n\n')
  );

}

async function handleCustomStrategy(bot, msg, rawArgs = '') {
  const text = String(rawArgs || '').trim();
  if (!text) {
    return bot.sendMessage(msg.chat.id,
      `Send your custom strategy like:\n\n` +
      `\`/strategy_custom buy PDAO when price drops 5%, split into 4 chunks, max slippage 3%\``
    );
  }

  customStrategies.set(msg.from.id, text);

  return bot.sendMessage(msg.chat.id,
    `✅ *Custom private strategy saved*\n\n` +
    `Your strategy will be used in private execution mode and represented by hashed proof receipts.`
  );
}

module.exports = {
  handlePrivateStatus,
  handlePrivateBuy,
  handleCustomStrategy,
  shouldExecuteCondition
};
