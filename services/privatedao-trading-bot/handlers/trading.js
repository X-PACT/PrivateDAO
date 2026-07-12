const { pulse } = require('../ui/ux');
const { startStrategy, stopStrategy, isStrategyActive, getDefaultConfig } = require('../trading/engine');
const { getSolBalance, getTokenBalance, getTokenBalanceAtomic, buyTokenWithQuote, sellTokenForQuote, USDC_MINT } = require('../trading/jupiter');
const { getBotWallet } = require('../db/supabase');
const { saveSession, getSession, setSessionActive, logTrade } = require('../db/supabase');
const { canTrade, getUnsettledFees, CREATOR_WALLET, PNL_FEE_PERCENT, recordFeatureUsageFee, goldrushPriceFor } = require('../billing/fees');
const { PDAO_MINT } = require('../config/tradingPolicy');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createPrivateExecutionPlan, finalizePrivateExecutionReceipt } = require('../privacy/privateExecutionPlan');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { assertWalletBinding } = require('../security/walletBinding');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { broadcastPdaoBuy } = require('./community');

const STRATEGIES = ['dca', 'grid', 'momentum', 'limit', 'sniper'];

function parseBuyArgs(rawArgs) {
  const parts = String(rawArgs || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return {
      error:
        `Send an instant buy command like:\n` +
        `\`/buy 0.1 SOL\`\n` +
        `\`/buy 25 USDC\`\n` +
        `\`/buy 25 USDC <token_mint>\`\n\n` +
        `Default token is PDAO.`,
    };
  }
  const amount = Number(parts[0]);
  const quoteCurrency = String(parts[1] || 'SOL').toUpperCase();
  const modeToken = parts.find((x) => /^private|shield|mev$/i.test(x)) || 'fast';
  const isPrivate = /^private$/i.test(modeToken);
  const isProtected = /^(private|shield|mev)$/i.test(modeToken);
  const tokenMint = parts.find((x, i) => i > 1 && !/^private|shield|mev$/i.test(x)) || PDAO_MINT;
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Invalid amount.' };
  if (!['SOL', 'USDC'].includes(quoteCurrency)) return { error: 'Quote currency must be SOL or USDC.' };
  return { amount, quoteCurrency, tokenMint, isPrivate, isProtected, modeToken };
}

function parseSellArgs(rawArgs) {
  const parts = String(rawArgs || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return {
      error:
        `Send a sell command like:\n` +
        `\`/sell 100% PDAO\`\n` +
        `\`/sell 50% <token_mint> SOL\`\n` +
        `\`/sell <raw_token_amount> <token_mint> USDC\``,
    };
  }
  const amountText = parts[0];
  const tokenMintRaw = parts[1] || 'PDAO';
  const quoteCurrency = String(parts[2] || 'SOL').toUpperCase();
  const modeToken = parts.find((x) => /^private|shield|mev$/i.test(x)) || 'shield';
  const tokenMint = /^pdao$/i.test(tokenMintRaw) ? PDAO_MINT : tokenMintRaw;
  const percentMatch = amountText.match(/^(\d+(?:\.\d+)?)%$/);
  const rawAmount = percentMatch ? null : amountText;
  const percent = percentMatch ? Number(percentMatch[1]) : null;
  if (percent !== null && (!Number.isFinite(percent) || percent <= 0 || percent > 100)) {
    return { error: 'Sell percent must be between 0 and 100.' };
  }
  if (rawAmount !== null && !/^\d+$/.test(rawAmount)) {
    return { error: 'Raw token amount must be an integer, or use a percent like 100%.' };
  }
  if (!['SOL', 'USDC'].includes(quoteCurrency)) return { error: 'Quote currency must be SOL or USDC.' };
  return {
    tokenMint,
    quoteCurrency,
    modeToken,
    isProtected: /^(private|shield|mev)$/i.test(modeToken),
    percent,
    rawAmount,
  };
}

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

function executionModeName(parsed) {
  if (parsed.isPrivate) return 'private';
  if (/^shield$/i.test(parsed.modeToken)) return 'shield';
  if (/^mev$/i.test(parsed.modeToken)) return 'mev';
  return 'fast';
}

// ─── /buy <amount> <SOL|USDC> [mint] ────────────────────────────────────────
async function handleBuyNow(bot, msg, session, rawArgs = '') {
  const chatId = msg.chat.id;
  const parsed = parseBuyArgs(rawArgs);
  if (parsed.error) {
    return bot.sendMessage(chatId, parsed.error, { reply_markup: {
      inline_keyboard: [
        [
          { text: 'Buy 0.1 SOL PDAO', callback_data: 'buy:0.1:SOL' },
          { text: 'Buy 25 USDC PDAO', callback_data: 'buy:25:USDC' },
        ],
        [
          { text: 'DEX Routes', callback_data: 'cmd_dex' },
          { text: 'Wallet', callback_data: 'menu_wallet' },
        ],
      ],
    } });
  }

  if (!session.botWallet) {
    return bot.sendMessage(chatId, 'Create a bot wallet first with /deposit, then fund it with SOL and/or USDC.');
  }

  const { amount, quoteCurrency, tokenMint } = parsed;
  const botWallet = await getBotWallet(msg.from.id);
  assertWalletBinding(botWallet);
  const solBalance = await getSolBalance(botWallet.public_key);
  if (quoteCurrency === 'SOL' && solBalance < amount + 0.003) {
    return bot.sendMessage(chatId, `SOL balance is too low. Wallet has ${solBalance.toFixed(5)} SOL; keep extra SOL for gas.`);
  }
  if (quoteCurrency === 'USDC') {
    const usdcBalance = await getTokenBalance(botWallet.public_key, USDC_MINT);
    if (usdcBalance < amount) return bot.sendMessage(chatId, `USDC balance is too low. Wallet has ${usdcBalance.toFixed(4)} USDC.`);
    if (solBalance < 0.003) return bot.sendMessage(chatId, `SOL gas reserve is too low (${solBalance.toFixed(5)} SOL). Keep at least 0.003 SOL for USDC trades.`);
  }

  const progressSteps = [
    'Wallet checked',
    'Liquidity checked',
    'Route selected',
    'Smart Shield enabled',
    parsed.isPrivate ? 'Split order prepared' : 'Execution prepared',
    'MEV protection checked',
    'Broadcasting',
    'Confirmed',
    'Receipt generated',
  ];
  const progressMessage = await bot.sendMessage(chatId, `⏳ ${progressSteps[0]}`);

  try {
    const preflightFee = goldrushPriceFor('trade_preflight');
    if (preflightFee > 0) {
      await recordFeatureUsageFee(msg.from.id, 'trade_preflight', preflightFee, {
        tokenMint,
        quoteCurrency,
        executionMode: executionModeName(parsed),
      }).catch(() => null);
    }
    const privateKey = botWallet.encrypted_private_key;
    const { Keypair } = require('@solana/web3.js');
    const { decryptPrivateKey } = require('../trading/wallet');
    const keypair = Keypair.fromSecretKey(decryptPrivateKey(privateKey));

    if (parsed.isPrivate) {
      const privatePlan = createPrivateExecutionPlan({
        telegramId: msg.from.id,
        wallet: botWallet.public_key,
        totalAmount: amount,
        quoteCurrency,
        tokenMint,
        strategy: 'private-buy',
        slippageBps: 1200,
        parts: Number(process.env.PRIVATE_SPLIT_PARTS || 3),
        minDelayMs: Number(process.env.PRIVATE_SPLIT_MIN_DELAY_MS || 15000),
        maxDelayMs: Number(process.env.PRIVATE_SPLIT_MAX_DELAY_MS || 120000),
        market: { priceImpactPct: 0, liquidityUsd: 6690 }
      });

      await updateProgress(bot, chatId, progressMessage, progressSteps, 4);

      const txs = [];
      let lastQuote = null;
      let lastMarket = null;
      let lastZk = null;
      let liveSwap = false;
      let routeProvider = null;

      for (const step of privatePlan.plan) {
        if (step.delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, step.delayMs));
        }

        const r = await buyTokenWithQuote(
          keypair,
          tokenMint,
          step.amount,
          quoteCurrency,
          1200,
          { protectedRoute: true, executionMode: 'private' }
        );

        txs.push({
          index: step.index,
          amount: step.amount,
          delayMs: step.delayMs,
          tx: r.txid
        });

        lastQuote = r.quote;
        lastMarket = r.market;
        lastZk = r.zk;
        liveSwap = r.liveSwap;
        routeProvider = r.routeProvider;
        await updateProgress(bot, chatId, progressMessage, progressSteps, 6);

        await logTrade(msg.from.id, {
          strategy: 'PrivateSplitBuy',
          type: 'buy',
          tokenMint,
          amountSol: quoteCurrency === 'SOL' ? step.amount : null,
          txSignature: r.txid,
          status: 'success',
        });
      }

      await updateProgress(bot, chatId, progressMessage, progressSteps, 7);
      const receipt = await attachOnchainAnchor({
        ...finalizePrivateExecutionReceipt(privatePlan.receiptBase, txs),
        routeProvider,
        proofHash: lastZk?.publicInput?.proofHash,
        publicSignalsHash: lastZk?.publicInput?.publicSignalsHash,
        walletFingerprint: botWallet.wallet_fingerprint,
        localGroth16Verified: Boolean(lastZk?.valid),
        featureMode: 'Private Execution',
      });
      await updateProgress(bot, chatId, progressMessage, progressSteps, 8);

      return bot.sendMessage(chatId,
        `${liveSwap ? '✅ *Private buy completed*' : '⚠️ *Execution disabled in environment*'}\n\n` +
        `Chunks executed: *${txs.length}*\n` +
        `Receipt hash: \`${receipt.receiptHash}\`\n` +
        `Intent hash: \`${receipt.intentHash}\`\n` +
        `Policy hash: \`${receipt.policyHash}\`\n` +
        `Route hash: \`${receipt.routeHash}\`\n` +
        `Anchor: *${receipt.onchainAnchored ? 'on-chain' : 'not anchored'}*\n` +
        (receipt.anchorExplorerUrl ? `Anchor tx: ${receipt.anchorExplorerUrl}\n` : '') +
        `MEV protection: *${receipt.mevProtection ? 'protected route' : 'split protection'}*\n` +
        (lastMarket?.dex ? `Route market: ${lastMarket.dex}\n` : '') +
        (routeProvider ? `Route provider: ${routeProvider}\n` : '') +
        `${formatZkBadge(lastZk)}\n\n` +
        txs.map((x) => `#${x.index + 1}: ${x.amount} ${quoteCurrency} — https://solscan.io/tx/${x.tx}`).join('\n')
      );
    }

    await updateProgress(bot, chatId, progressMessage, progressSteps, 3);
    const { txid, quote, zk, market, liveSwap } = await buyTokenWithQuote(
      keypair,
      tokenMint,
      amount,
      quoteCurrency,
      1200,
      { protectedRoute: parsed.isProtected, executionMode: parsed.modeToken }
    );
    await updateProgress(bot, chatId, progressMessage, progressSteps, 7);
    await logTrade(msg.from.id, {
      strategy: 'InstantBuy',
      type: 'buy',
      tokenMint,
      amountSol: quoteCurrency === 'SOL' ? amount : null,
      txSignature: txid,
      status: 'success',
    });
    const receipt = await attachOnchainAnchor(createTradeReceipt({
      telegramId: msg.from.id,
      wallet: botWallet.public_key,
      mode: executionModeName(parsed),
      tokenMint,
      quoteCurrency,
      amount,
      slippageBps: 1200,
      routeVenue: market?.dex || 'jupiter',
      routeProvider: 'jupiter/fast-lane',
      txs: [{ index: 0, amount, tx: txid }],
      mevProtection: process.env.ENABLE_JITO_FAST_SEND === 'true' || Boolean(process.env.HELIUS_SENDER_URL),
      proofHash: zk?.publicInput?.proofHash,
      publicSignalsHash: zk?.publicInput?.publicSignalsHash,
      walletFingerprint: botWallet.wallet_fingerprint,
      featureMode: parsed.isProtected ? (parsed.modeToken === 'mev' ? 'MEV Shield' : 'Smart Shield') : 'Verified Receipt',
      localGroth16Verified: Boolean(zk?.valid),
    }));
    await updateProgress(bot, chatId, progressMessage, progressSteps, 8);
    return bot.sendMessage(chatId,
      `${liveSwap ? '✅ *Instant buy submitted*' : '⚠️ *Execution disabled in environment*'}\n\n` +
      `Input: ${amount} ${quoteCurrency}\n` +
      `Output estimate: ${quote.outAmount} raw units ${market?.symbol ? `(${market.symbol})` : ''}\n` +
      (market?.dex ? `Route market: ${market.dex}\n` : '') +
      `Receipt hash: \`${receipt.receiptHash}\`\n` +
      `Intent hash: \`${receipt.intentHash}\`\n` +
      `Policy hash: \`${receipt.policyHash}\`\n` +
      `Route hash: \`${receipt.routeHash}\`\n` +
      `Anchor: *${receipt.onchainAnchored ? 'on-chain' : 'not anchored'}*\n` +
      (receipt.anchorExplorerUrl ? `Anchor tx: ${receipt.anchorExplorerUrl}\n` : '') +
      `${formatZkBadge(zk)}\n` +
      `[Tx](https://solscan.io/tx/${txid})`
    );
    if (tokenMint === PDAO_MINT) {
      await broadcastPdaoBuy(bot, {
        amountSol: amount,
        usdValue: market?.priceUsd ? Number(market.priceUsd) * Number(amount) : null,
        tokenReceived: market?.symbol || 'PDAO',
        market,
        txs: [{ tx: txid, amount }],
      }).catch(() => null);
    }
  } catch (err) {
    await logTrade(msg.from.id, {
      strategy: 'InstantBuy',
      type: 'buy',
      tokenMint,
      amountSol: quoteCurrency === 'SOL' ? amount : null,
      status: 'failed',
      error: err.message,
    });
    return bot.sendMessage(chatId, `Instant buy failed: ${err.message}`);
  }
}

async function handleSellNow(bot, msg, session, rawArgs = '') {
  const chatId = msg.chat.id;
  const parsed = parseSellArgs(rawArgs);
  if (parsed.error) return bot.sendMessage(chatId, parsed.error);

  if (!session.botWallet) {
    return bot.sendMessage(chatId, 'Create a bot wallet first with /deposit, then fund it with the token you want to sell.');
  }

  const botWallet = await getBotWallet(msg.from.id);
  assertWalletBinding(botWallet);
  const solBalance = await getSolBalance(botWallet.public_key);
  if (solBalance < 0.003) {
    return bot.sendMessage(chatId, `SOL gas reserve is too low (${solBalance.toFixed(5)} SOL). Keep at least 0.003 SOL.`);
  }

  const tokenBalance = await getTokenBalanceAtomic(botWallet.public_key, parsed.tokenMint);
  const amountAtomic = parsed.percent !== null
    ? ((BigInt(tokenBalance.amountAtomic) * BigInt(Math.round(parsed.percent * 100))) / 10000n).toString()
    : parsed.rawAmount;

  if (!amountAtomic || BigInt(amountAtomic) <= 0n) {
    return bot.sendMessage(chatId, 'No sellable token balance found in this execution wallet.');
  }

  const progressSteps = [
    'Wallet checked',
    'Token balance checked',
    'Route selected',
    'Smart Shield enabled',
    'MEV protection checked',
    'Broadcasting',
    'Confirmed',
    'Receipt generated',
  ];
  const progressMessage = await bot.sendMessage(chatId, `⏳ ${progressSteps[0]}`);

  try {
    const preflightFee = goldrushPriceFor('trade_preflight');
    if (preflightFee > 0) {
      await recordFeatureUsageFee(msg.from.id, 'trade_preflight', preflightFee, {
        tokenMint: parsed.tokenMint,
        quoteCurrency: parsed.quoteCurrency,
        executionMode: parsed.modeToken,
      }).catch(() => null);
    }
    const { Keypair } = require('@solana/web3.js');
    const { decryptPrivateKey } = require('../trading/wallet');
    const keypair = Keypair.fromSecretKey(decryptPrivateKey(botWallet.encrypted_private_key));

    await updateProgress(bot, chatId, progressMessage, progressSteps, 3);
    const { txid, quote, zk, market, liveSwap, routeProvider } = await sellTokenForQuote(
      keypair,
      parsed.tokenMint,
      amountAtomic,
      parsed.quoteCurrency,
      1200,
      { protectedRoute: parsed.isProtected, executionMode: parsed.modeToken }
    );
    await updateProgress(bot, chatId, progressMessage, progressSteps, 6);
    await logTrade(msg.from.id, {
      strategy: 'InstantSell',
      type: 'sell',
      tokenMint: parsed.tokenMint,
      amountSol: null,
      txSignature: txid,
      status: 'success',
    });
    const receipt = await attachOnchainAnchor(createTradeReceipt({
      telegramId: msg.from.id,
      wallet: botWallet.public_key,
      mode: executionModeName({ isPrivate: false, modeToken: parsed.modeToken }),
      tokenMint: parsed.tokenMint,
      quoteCurrency: parsed.quoteCurrency,
      amount: amountAtomic,
      slippageBps: 1200,
      routeVenue: market?.dex || 'jupiter',
      routeProvider: routeProvider || 'jupiter/fast-lane',
      txs: [{ index: 0, amount: amountAtomic, tx: txid }],
      mevProtection: process.env.ENABLE_JITO_FAST_SEND === 'true' || Boolean(process.env.HELIUS_SENDER_URL),
      proofHash: zk?.publicInput?.proofHash,
      publicSignalsHash: zk?.publicInput?.publicSignalsHash,
      walletFingerprint: botWallet.wallet_fingerprint,
      featureMode: parsed.modeToken === 'mev' ? 'MEV Shield' : 'Smart Shield',
      localGroth16Verified: Boolean(zk?.valid),
    }));
    await updateProgress(bot, chatId, progressMessage, progressSteps, 7);
    return bot.sendMessage(chatId,
      `${liveSwap ? '✅ *Sell submitted*' : '⚠️ *Execution disabled in environment*'}\n\n` +
      `Sold: ${parsed.percent !== null ? `${parsed.percent}%` : amountAtomic} ${parsed.tokenMint === PDAO_MINT ? 'PDAO' : 'raw units'}\n` +
      `Output estimate: ${quote.outAmount} raw ${parsed.quoteCurrency} units\n` +
      `Receipt hash: \`${receipt.receiptHash}\`\n` +
      `Anchor: *${receipt.onchainAnchored ? 'on-chain' : 'not anchored'}*\n` +
      (receipt.anchorExplorerUrl ? `Anchor tx: ${receipt.anchorExplorerUrl}\n` : '') +
      `${formatZkBadge(zk)}\n` +
      `[Tx](https://solscan.io/tx/${txid})`
    );
  } catch (err) {
    await logTrade(msg.from.id, {
      strategy: 'InstantSell',
      type: 'sell',
      tokenMint: parsed.tokenMint,
      status: 'failed',
      error: err.message,
    });
    return bot.sendMessage(chatId, `Sell failed: ${err.message}`);
  }
}

// ─── /strategy ────────────────────────────────────────────────────────────────
async function handleSetStrategy(bot, msg, session, stratName, fromCallback = false) {
  const chatId = msg.chat.id;

  if (!stratName) {
    return bot.sendMessage(chatId,
      `*Choose a strategy:*`, { reply_markup: {
          inline_keyboard: [
            [{ text: 'DCA recurring buys', callback_data: 'strategy:dca'  }],
            [{ text: 'Grid Trading', callback_data: 'strategy:grid' }],
            [{ text: 'Momentum/Trend', callback_data: 'strategy:momentum' }],
            [{ text: 'Limit Orders', callback_data: 'strategy:limit' }],
            [{ text: 'Sniper', callback_data: 'strategy:sniper' }],
          ],
        },
      }
    );
    return;
  }

  const name = stratName.toLowerCase();
  if (!STRATEGIES.includes(name)) {
    return bot.sendMessage(chatId, `Unknown strategy. Choose one of: ${STRATEGIES.join(', ')}`);
  }

  // Ask for quote currency first
  await bot.sendMessage(chatId,
    `Selected *${name.toUpperCase()}*.\n\nChoose the quote currency:`, { reply_markup: {
        inline_keyboard: [[
          { text: '◎ SOL', callback_data: `quote:SOL:${name }` },
          { text: '$ USDC', callback_data: `quote:USDC:${name}` },
        ]],
      },
    }
  );
}

// ─── Step 2: after quote currency chosen, ask for token mint ────────────────
async function handleSetQuoteCurrency(bot, msg, session, quoteCurrency, stratName) {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId,
      `Quote currency: *${quoteCurrency}*\n\nSend the token mint address.\nSend *PDAO* or *default* for the discounted PrivateDAO token route.\nDefault PDAO: \`9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump\``
  );

  const listener = async (nextMsg) => {
    if (nextMsg.from.id !== msg.from.id) return;
    const rawText = nextMsg.text?.trim();
    const tokenMint = (!rawText || /^default|pdao$/i.test(rawText)) ? PDAO_MINT : rawText;

    if (!tokenMint || tokenMint.length < 32) {
      await bot.sendMessage(chatId, 'Invalid mint address. Try again.');
      bot.removeListener('message', listener);
      return;
    }

    const config = getDefaultConfig(stratName, tokenMint);
    config.quoteCurrency = quoteCurrency;
    await saveSession(msg.from.id, stratName, config);

    await bot.sendMessage(chatId,
      `*Strategy configured*\n\n` +
      `Type: *${stratName.toUpperCase()}*\n` +
      `Pair: *${quoteCurrency}/${tokenMint === PDAO_MINT ? 'PDAO' : 'CUSTOM'}*\n` +
      `Token: \`${tokenMint}\`\n\n` +
      `Default config:\n\`\`\`\n${JSON.stringify(config, null, 2)}\`\`\`\n\n` +
      `Send /start_trade to begin.`
    );

    bot.removeListener('message', listener);
  };

  bot.on('message', listener);
}

// ─── /start_trade ─────────────────────────────────────────────────────────────
async function handleStartTrading(bot, msg, session) {
  const chatId = msg.chat.id;

  if (!session.botWallet) {
    return bot.sendMessage(chatId, 'Create a custodial bot wallet first with /deposit.');
  }

  // Trial / subscription gate
  const access = await canTrade(msg.from.id, msg.from.username, session.botWallet.public_key);
  if (!access.allowed) {
    const owed = await getUnsettledFees(msg.from.id);
    return bot.sendMessage(chatId,
      `*Promo access expired*\n\n` +
      `Your 24-hour trial ended at:\n${access.expiresAt.toLocaleString('en-US')}\n\n` +
      `Subscription fee: ${PNL_FEE_PERCENT}% of realized positive PnL to the creator wallet.\n` +
      (owed > 0 ? `\nUnsettled fees: ${owed.toFixed(4)} SOL equivalent\n` : '') +
      `\nContact support to activate a subscription.`
    );
  }

  if (access.reason === 'trial') {
    const hoursLeft = ((access.expiresAt - new Date()) / 3600000).toFixed(1);
    await bot.sendMessage(chatId, `Promo access active - ${hoursLeft} hours left.`);
  }

  const dbSession = await getSession(msg.from.id);
  if (!dbSession) {
    return bot.sendMessage(chatId, 'Choose a strategy first with /strategy.');
  }

  if (isStrategyActive(msg.from.id)) {
    return bot.sendMessage(chatId, 'A strategy is already running. Use /stop first.');
  }

  const balance = await getSolBalance(session.botWallet.public_key);
  if (balance < 0.01) {
    return bot.sendMessage(chatId, `SOL balance is too low (${balance.toFixed(4)} SOL). Fund the wallet from /deposit first.`);
  }

  const botWallet = await getBotWallet(msg.from.id);
  assertWalletBinding(botWallet);
  const sendMessage = (text, opts) => bot.sendMessage(chatId, text, opts);

  try {
    await startStrategy(
      msg.from.id,
      dbSession.strategy,
      dbSession.config,
      botWallet.encrypted_private_key,
      sendMessage
    );
    await setSessionActive(msg.from.id, true);
  } catch (err) {
    await bot.sendMessage(chatId, `Start failed: ${err.message}`);
  }
}

// ─── /stop ────────────────────────────────────────────────────────────────────
async function handleStopTrading(bot, msg, session) {
  const chatId = msg.chat.id;
  const sendMessage = (text, opts) => bot.sendMessage(chatId, text, opts);
  await stopStrategy(msg.from.id, sendMessage);
  await setSessionActive(msg.from.id, false);
}

// ─── /status ──────────────────────────────────────────────────────────────────
async function handleStatus(bot, msg, session) {
  const chatId = msg.chat.id;

  const dbSession = await getSession(msg.from.id);
  const active = isStrategyActive(msg.from.id);
  const balance = session.walletPublicKey
    ? await getSolBalance(session.walletPublicKey)
    : null;

  const walletLine = session.walletPublicKey
    ? `💳 \`${session.walletPublicKey.slice(0, 8)}...${session.walletPublicKey.slice(-6)}\``
    : 'No wallet';

  const stratLine = dbSession
    ? `${dbSession.strategy.toUpperCase()} - ${active ? 'running' : 'stopped'}`
    : 'No strategy';

  const balanceLine = balance !== null ? `💰 ${balance.toFixed(4)} SOL` : '';

  await bot.sendMessage(chatId,
    `📈 *Status*\n\n${walletLine}\n${balanceLine}\n${stratLine}`
  );
}

module.exports = { handleSetStrategy, handleSetQuoteCurrency, handleStartTrading, handleStopTrading, handleStatus, handleBuyNow, handleSellNow };
