const { GOLDRUSH_PRICING } = require('../config/intelligencePricing');
const { recordFeatureUsageFee, goldrushPriceFor } = require('../billing/fees');

async function handleStart(bot, msg, session) {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'builder';

  await bot.sendMessage(chatId,
    `*Welcome ${name}.*\n\n` +
    `PrivateDAO Bot is the official Solana trading bot for PDAO and meme-token routes.\n\n` +
      `*Live stack:* Jupiter all-DEX routing, Helius mainnet RPC, Solana Tracker + DexScreener market checks, GoldRush intelligence where it adds value, Jito fast-lane ready, and PrivateDAO Groth16 trade receipts.\n\n` +
    `*Quick start:*\n` +
    `1. /deposit - create or view your bot wallet\n` +
    `2. /buy 0.1 SOL - instant PDAO buy route\n` +
    `3. /strategy - choose an automated strategy\n` +
    `4. /dex - check live routes\n` +
    `5. /redeem - redeem your personal access code\n\n` +
      `The bot creates a dedicated execution wallet, routes through supported Solana DEX liquidity automatically, and applies the discounted fee tier for PDAO trading.\n\n` +
      `*Available strategies:*\n` +
    `*DCA* - recurring buys\n` +
    `*Grid* - range trading\n` +
    `*Momentum* - trend entry with stop loss\n\n` +
    `Use /help for the full command list.`,
    { reply_markup: projectButtons() }
  );
}

async function handleHelp(bot, msg) {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `*Available commands:*\n\n` +
    `*Wallet:*\n` +
    `/deposit - create or view the bot wallet\n` +
    `/connect - connect an external wallet for read-only status\n` +
    `/balance - show balances\n` +
    `/withdraw <address> - withdraw all custodial wallet funds\n\n` +
    `*Trading:*\n` +
    `/buy <amount> <SOL|USDC> [mint] - instant buy, default PDAO\n` +
    `/strategy - choose and configure a strategy\n` +
    `/start_trade - start trading\n` +
    `/stop - stop trading\n` +
    `/status - show current status\n` +
    `/dex [mint] - check live SOL/USDC routes for PDAO or any token mint\n` +
    `/zk - show Groth16 receipt proof status\n` +
    `/safety - show live execution and safety limits\n\n` +
    `*Project:*\n` +
    `/links - official links, token page, X, community, and support wallet\n` +
    `/community - community hub with private chat redirect\n` +
    `/redeem - redeem a promo code\n` +
    `/tour - guided tour for new users\n` +
    `/admin - Telegram admin dashboard\n\n` +
    `*Safety:*\n` +
    `The bot never asks for your private key.\n` +
    `/withdraw is always available for custodial wallets.\n` +
    `Trades are logged in Supabase and reported back to you.`,
    { reply_markup: projectButtons() }
  );
}

async function handleLinks(bot, msg) {
  const { PDAO_MINT, CREATOR_WALLET } = require('../config/tradingPolicy');
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `🔗 *PrivateDAO Official Links*\n\n` +
    `Token page: https://privatedao.org/token/\n` +
    `Website: https://privatedao.org/\n` +
    `X: https://x.com/privateDAOOS\n` +
    `Telegram: https://t.me/PrivateDAOO\n` +
    `Discord: https://discord.gg/PRcD9nFeVf\n\n` +
    `PDAO mint:\n\`${PDAO_MINT}\`\n\n` +
    `Creator / support wallet:\n\`${CREATOR_WALLET}\`\n\n` +
    `Jupiter buy link:\nhttps://jup.ag/swap/SOL-${PDAO_MINT}`,
    { reply_markup: projectButtons() }
  );
}

async function handleModes(bot, msg) {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `🎛️ *PrivateDAO Trading Modes*\n\n` +
    `1. *PDAO Accumulate* - DCA buys with SOL or USDC and the discounted PDAO fee tier.\n` +
    `2. *Meme Token Router* - trade any valid Solana token mint, including early liquidity and migrated pools.\n` +
    `3. *Grid Trading* - range-based buy/sell levels for changing liquidity.\n` +
    `4. *Momentum* - trend entry with take profit and stop loss.\n` +
    `5. *Private Mode* - execution wallet isolation plus hashed strategy intent, verified receipts, and encrypted keys at rest.\n` +
    `6. *All-DEX Routing* - Jupiter selects the best supported route at trade time.\n` +
    `7. *GoldRush Intelligence* - market context, discovery and preflight risk views with separate feature pricing.\n\n` +
    `Start with /strategy, choose SOL or USDC, then enter PDAO or another token mint.`,
    { reply_markup: projectButtons() }
  );
}

async function handleDex(bot, msg) {
  const { getQuote, getRouteVenue, SOL_MINT, USDC_MINT } = require('../trading/jupiter');
  const { PDAO_MINT, LAMPORTS_PER_SOL, USDC_DECIMALS, DEFAULT_SLIPPAGE_BPS, assertPublicKey } = require('../config/tradingPolicy');
  const { getTokenMarketSummary } = require('../providers/marketData');
  const chatId = msg.chat.id;
  const parts = String(msg.text || '').trim().split(/\s+/);
  let tokenMint = parts[1] || PDAO_MINT;
  try {
    tokenMint = assertPublicKey(tokenMint, 'Token mint');
  } catch (err) {
    return bot.sendMessage(chatId, `Invalid token mint: ${err.message}`);
  }

  const checks = [
    ['SOL route', SOL_MINT, Math.floor(0.005 * LAMPORTS_PER_SOL)],
    ['USDC route', USDC_MINT, Math.floor(1 * USDC_DECIMALS)],
  ];

  const lines = [];
  const market = await getTokenMarketSummary(tokenMint).catch(() => null);
  const marketIntelFee = goldrushPriceFor('market_intel');
  if (marketIntelFee > 0) {
    await recordFeatureUsageFee(msg.from.id, 'market_intel', marketIntelFee, { tokenMint, source: 'dex' }).catch(() => null);
  }
  for (const [label, inputMint, amount] of checks) {
    try {
      const started = Date.now();
      const quote = await getQuote(inputMint, tokenMint, amount, DEFAULT_SLIPPAGE_BPS);
      lines.push(`✅ *${label}* — ${getRouteVenue(quote)} / ${Date.now() - started}ms`);
    } catch (err) {
      lines.push(`⚠️ *${label}* - ${err.message}`);
    }
  }

  await bot.sendMessage(chatId,
    `🧭 *All-DEX Route Check*\n\n` +
    `Token: \`${tokenMint}\`\n` +
    (market ? `Symbol: *${market.symbol || 'unknown'}* | DEX: *${market.dex || 'unknown'}* | Liquidity: *${market.liquidityUsd ? `$${Number(market.liquidityUsd).toLocaleString('en-US')}` : 'unknown'}*\n` : '') +
    (market?.pairAddress ? `Pair: \`${market.pairAddress}\`\n` : '') +
    (market ? `Risk: *${market.riskLevel || market.riskScore || 'not reported'}* | Bonding curve: *${market.bondingCurve ? 'yes' : 'no/unknown'}*\n\n` : '\n') +
    (market?.safetySignals ? `Safety signals: *${market.safetyScore || 0}/4* — ${market.safetySignals.map((s) => `${s.ok ? 'OK' : 'NA'} ${s.name}`).join(', ')}\n\n` : '') +
    `${lines.join('\n')}\n\n` +
    `Execution uses Jupiter aggregator, so users do not need to pick a DEX manually.\n\n` +
    `GoldRush feature pricing:\n` +
    `• Market intel: ${GOLDRUSH_PRICING.market_intel} SOL\n` +
    `• Token discovery: ${GOLDRUSH_PRICING.token_discovery} SOL\n` +
    `• Trade preflight: ${GOLDRUSH_PRICING.trade_preflight} SOL\n\n` +
    `PDAO trades use the discounted fee tier; other tokens use the general meme-token tier.`,
    { reply_markup: projectButtons() }
  );
}

async function handleZk(bot, msg) {
  const { validateZkMatrix } = require('../proof/zkMatrix');
  const chatId = msg.chat.id;

  try {
    const { ok, issues, matrix } = validateZkMatrix();
    await bot.sendMessage(chatId,
      `🧾 *PrivateDAO Groth16 Receipts*\n\n` +
      `Status: *${ok ? 'ready' : 'warning'}*\n` +
      `Network: \`${matrix.summary.network}\`\n` +
      `Mode: \`${matrix.summary.verificationMode}\`\n` +
      `Proof entries: *${matrix.summary.verifiedCount}/${matrix.summary.entryCount}*\n` +
      `Proof hash: \`${matrix.summary.proofHash || 'missing'}\`\n` +
      `VKey hash: \`${matrix.summary.verificationKeyHash || 'missing'}\`\n` +
      `Program ID: \`${matrix.summary.programId || process.env.ZK_VERIFIER_PROGRAM_ID || process.env.PRIVATEDAO_ZK_VERIFIER_PROGRAM_ID || 'not configured'}\`\n` +
      `On-chain verifier: \`${process.env.ENABLE_ONCHAIN_ZK_VERIFIER === 'true' ? 'enabled' : 'configured only'}\`\n` +
      `\nScope: dedicated execution wallet, encrypted keys at rest, hashed strategy intent, policy hash, route hash, and proof-linked receipt settlement. The user's original wallet is not used as the trading signer.\n` +
      (issues.length ? `\nIssues: ${issues.join('; ')}` : ''),
      {}
    );
  } catch (err) {
    await bot.sendMessage(chatId, `❌ Groth16 proof error: ${err.message}`);
  }
}

async function handleSafety(bot, msg) {
  const { getLiveTradingStatus, PDAO_MINT, CREATOR_WALLET, MIN_GAS_SOL, MAX_TRADE_SOL, MAX_TRADE_USDC, DEFAULT_SLIPPAGE_BPS, MIN_TRADE_USD, USER_DEFINED_TRADE_LIMIT, ALLOW_ANY_TOKEN } = require('../config/tradingPolicy');
  const { PDAO_STANDARD_FEE_PERCENT, MEME_STANDARD_FEE_PERCENT, PNL_FEE_PERCENT_ENCRYPTED } = require('../billing/fees');
  const chatId = msg.chat.id;
  const live = getLiveTradingStatus();
  await bot.sendMessage(chatId,
    `🛡️ *PrivateDAO Bot Safety*\n\n` +
    `Live swaps: *${live.enabled ? 'ON' : 'OFF / execution disabled by env'}*\n` +
    `Groth16 receipts required: *${process.env.PRIVATEDAO_ZK_REQUIRED === 'false' ? 'NO' : 'YES'}*\n\n` +
    `PDAO mint: \`${PDAO_MINT}\`\n` +
    `Creator wallet: \`${CREATOR_WALLET}\`\n` +
    `Minimum trade: ${MIN_TRADE_USD} USD equivalent\n` +
    `Trade sizing: ${USER_DEFINED_TRADE_LIMIT ? 'user-defined' : `${MAX_TRADE_SOL} SOL / ${MAX_TRADE_USDC} USDC max`}\n` +
    `Any token mode: *${ALLOW_ANY_TOKEN ? 'ON' : 'OFF'}*\n` +
    `Fees: PDAO ${PDAO_STANDARD_FEE_PERCENT}% (50% off) | Other tokens ${MEME_STANDARD_FEE_PERCENT}% | Private ${PNL_FEE_PERCENT_ENCRYPTED}%\n` +
    `USDC gas reserve: ${MIN_GAS_SOL} SOL\n` +
    `Slippage: ${DEFAULT_SLIPPAGE_BPS} bps\n` +
    (!live.enabled ? `\nLive gate blockers: \`${live.reasons.join(', ')}\`` : ''),
    { reply_markup: projectButtons() }
  );
}

async function handlePrivacy(bot, msg) {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `🔐 *PrivateDAO Privacy Mode*\n\n` +
    `*Wallet isolation:* the bot creates a dedicated execution wallet, so the user's original wallet is not the trading signer.\n` +
    `*Strategy privacy:* trade intent is committed as a hash and linked to a verified receipt.\n` +
    `*Key safety:* private keys are encrypted at rest and never requested from the user.\n` +
    `*Settlement:* realized positive PnL fees are settled automatically to the creator wallet with proof metadata for the private tier.\n\n` +
    `Private mode fee: *15%* of realized positive PnL.`,
    { reply_markup: projectButtons() }
  );
}

async function handleBilling(bot, msg) {
  const { canTrade, getUnsettledFees, CREATOR_WALLET, PDAO_STANDARD_FEE_PERCENT, MEME_STANDARD_FEE_PERCENT, PNL_FEE_PERCENT_ENCRYPTED, TRIAL_HOURS } = require('../billing/fees');
  const { getBotWallet } = require('../db/supabase');
  const chatId = msg.chat.id;

  const botWallet = await getBotWallet(msg.from.id);
  if (!botWallet) {
    return bot.sendMessage(chatId, 'Create a bot wallet first with /deposit.');
  }

  const access = await canTrade(msg.from.id, msg.from.username, botWallet.public_key);
  const owed = await getUnsettledFees(msg.from.id);

  let statusLine;
  if (access.reason === 'trial') {
    const hoursLeft = ((access.expiresAt - new Date()) / 3600000).toFixed(1);
    statusLine = `Promo access active - ${hoursLeft} hours left`;
  } else if (access.reason === 'subscription') {
    statusLine = `Paid subscription active`;
  } else {
    statusLine = `Trial expired - subscription required`;
  }

  await bot.sendMessage(chatId,
    `*Billing*\n\n` +
    `${statusLine}\n\n` +
    `Fee model: PDAO ${PDAO_STANDARD_FEE_PERCENT}% | Other tokens ${MEME_STANDARD_FEE_PERCENT}% | Private ${PNL_FEE_PERCENT_ENCRYPTED}% of realized positive PnL\n` +
    `Unsettled fees: ${owed.toFixed(4)} SOL equivalent\n` +
`Creator wallet: \`${CREATOR_WALLET}\`\n\n` +
      `Promo access lasts ${TRIAL_HOURS} hours and is linked to both Telegram handle and wallet address.\n` +
      `GoldRush is charged separately for market intel, token discovery and preflight context.`,
    {}
  );
}

async function handleSetTier(bot, msg, tierName) {
  const { setUserTier, PDAO_STANDARD_FEE_PERCENT, MEME_STANDARD_FEE_PERCENT, PNL_FEE_PERCENT_ENCRYPTED } = require('../billing/fees');
  const chatId = msg.chat.id;

  if (!tierName) {
    return bot.sendMessage(chatId,
      `*Choose your service tier:*\n\n` +
      `*Standard* - ${PDAO_STANDARD_FEE_PERCENT}% on PDAO and ${MEME_STANDARD_FEE_PERCENT}% on other tokens\n` +
      `*Encrypted* - ${PNL_FEE_PERCENT_ENCRYPTED}% of realized positive PnL with Groth16 receipt settlement\n\nSend: \`/tier standard\` or \`/tier encrypted\``,
      {}
    );
  }

  const tier = tierName.toLowerCase();
  if (!['standard', 'encrypted'].includes(tier)) {
    return bot.sendMessage(chatId, 'Choose either standard or encrypted.');
  }

  await setUserTier(msg.from.id, tier);
  await bot.sendMessage(chatId,
    `Tier changed to *${tier}*.\n` +
    (tier === 'encrypted'
      ? `Encrypted fee settlement will generate a proof automatically.`
      : `Standard fee settlement is active.`),
    {}
  );
}

function projectButtons() {
  return {
    inline_keyboard: [
      [
        { text: '🎯 Buy 0.1 SOL', callback_data: 'buy:0.1:SOL' },
        { text: '🎯 Buy 25 USDC', callback_data: 'buy:25:USDC' },
      ],
      [
        { text: '💼 Wallet', callback_data: 'menu_wallet' },
        { text: '📈 Strategies', callback_data: 'menu_trading' },
      ],
      [
        { text: '🧭 DEX Routes', callback_data: 'cmd_dex' },
        { text: '🧾 Proof Status', callback_data: 'cmd_zk' },
      ],
      [
        { text: '🛡 Safety', callback_data: 'cmd_safety' },
        { text: '🎛 Modes', callback_data: 'cmd_modes' },
      ],
      [
        { text: 'Buy PDAO', url: 'https://jup.ag/swap/SOL-9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump' },
        { text: 'Token', url: 'https://privatedao.org/token/' },
      ],
      [
        { text: 'X', url: 'https://x.com/privateDAOOS' },
        { text: 'Links', callback_data: 'cmd_links' },
      ],
    ],
  };
}
module.exports = { handleStart, handleHelp, handleBilling, handleSetTier, handleZk, handleSafety, handlePrivacy, handleModes, handleDex, handleLinks, projectButtons };
