const { getBotWallet, saveSession, setSessionActive, getSession } = require('../db/supabase');
const { canTrade, getUnsettledFees } = require('../billing/fees');
const { assertWalletBinding } = require('../security/walletBinding');
const { getTokenMarketSummary } = require('../providers/marketData');
const { resolveTokenDiscovery, normalizeTokenInput } = require('../providers/tokenDiscovery');
const { getTokenPriceInSol, getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { getDefaultConfig, startStrategy, stopStrategy, isStrategyActive } = require('../trading/engine');
const { LimitOrdersStrategy, defaultLimitConfig } = require('../strategies/limitOrders');
const { SniperStrategy, defaultSniperConfig } = require('../strategies/sniper');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { formatZkBadge } = require('../proof/zkMatrix');
const { logTrade } = require('../db/supabase');
const { walletFingerprint, decryptPrivateKey } = require('../trading/wallet');
const { Keypair } = require('@solana/web3.js');
const { tradingToolsMenu, tokenDiscoveryMenu, limitActionsMenu } = require('../ui/keyboards');
const { recordFeatureUsageFee, goldrushPriceFor } = require('../billing/fees');

const pendingDiscover = new Map();
const lastDiscoveredToken = new Map();

function rememberDiscoveredToken(telegramId, tokenMint) {
  if (!telegramId || !tokenMint) return;
  lastDiscoveredToken.set(String(telegramId), tokenMint);
}

function getLastDiscoveredToken(telegramId) {
  return lastDiscoveredToken.get(String(telegramId));
}

async function sendOrEdit(bot, msg, text, options) {
  if (msg.message_id) {
    try {
      return await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: 'Markdown',
        ...options,
      });
    } catch {
      return bot.sendMessage(msg.chat.id, text, options);
    }
  }
  return bot.sendMessage(msg.chat.id, text, options);
}

async function showTradingTools(bot, msg) {
  return sendOrEdit(bot, msg,
`🧩 *Trading Tools*

Pick a token, then launch the route you want.

Every execution stays in private chat and runs with wallet guards.`, tradingToolsMenu());
}

async function promptTokenDiscovery(bot, msg) {
  pendingDiscover.set(msg.from.id, true);
  return bot.sendMessage(msg.chat.id,
    `🔎 *Discover Token*

Send a mint address, a DexScreener link, a Birdeye link, or a pump.fun link.
I will resolve it and give you live trade buttons right away.`,
    { reply_markup: tokenDiscoveryMenu() }
  );
}

async function handleDiscoveryMessage(bot, msg, text) {
  const raw = String(text || '').trim();
  const armed = pendingDiscover.has(msg.from.id);
  const looksLikeDiscovery = Boolean(
    raw &&
    !raw.startsWith('/') &&
    (
      /https?:\/\/|pump\.fun|dexscreener|birdeye|solscan/i.test(raw) ||
      Boolean(normalizeTokenInput(raw))
    )
  );
  if (!armed && !looksLikeDiscovery) return false;
  if (armed) pendingDiscover.delete(msg.from.id);
  const discovered = await resolveTokenDiscovery(text);
  if (!discovered.ok) {
    return bot.sendMessage(msg.chat.id, `Token discovery failed: ${discovered.reason}`);
  }
  rememberDiscoveredToken(msg.from.id, discovered.tokenMint);
  const discoveryFee = goldrushPriceFor('token_discovery');
  if (discoveryFee > 0) {
    await recordFeatureUsageFee(msg.from.id, 'token_discovery', discoveryFee, {
      tokenMint: discovered.tokenMint,
      source: discovered.source,
    }).catch(() => null);
  }
  const market = discovered.market || {};
  const summary =
`🔎 *Token Found*

Mint: \`${discovered.tokenMint}\`
Symbol: *${market.symbol || 'unknown'}*
Market: *${market.dex || 'unknown'}*
Liquidity: *${market.liquidityUsd ? `$${Number(market.liquidityUsd).toLocaleString('en-US')}` : 'unknown'}*
Bonding curve: *${market.bondingCurve ? 'yes' : 'no/unknown'}*

Choose how you want to trade it.`;
  return bot.sendMessage(msg.chat.id, summary, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🟢 Buy Fast', callback_data: 'trade_review:fast:0.1:SOL:disc' },
          { text: '🛡 Buy Shield', callback_data: 'trade_review:shield:0.1:SOL:disc' },
        ],
        [
          { text: '🥷 Buy Private', callback_data: 'trade_review:private:0.1:SOL:disc' },
          { text: '📈 DCA', callback_data: 'strategy_launch:dca:disc' },
        ],
        [
          { text: '🧱 Grid', callback_data: 'strategy_launch:grid:disc' },
          { text: '🎯 Limit Orders', callback_data: 'limit_menu:disc' },
        ],
        [
          { text: '⚡ Sniper', callback_data: 'strategy_launch:sniper:disc' },
          { text: '← Tools', callback_data: 'menu_tools' },
        ],
      ],
    },
  });
}

async function launchConfiguredStrategy(bot, msg, session, strategyName, tokenMint) {
  const botWallet = await getBotWallet(msg.from.id);
  if (!botWallet) return bot.sendMessage(msg.chat.id, 'Create a bot wallet first with /deposit.');
  assertWalletBinding(botWallet);
  const access = await canTrade(msg.from.id, msg.from.username, botWallet.public_key);
  if (!access.allowed) {
    const owed = await getUnsettledFees(msg.from.id);
    return bot.sendMessage(msg.chat.id,
      `Promo access expired.\nUnsettled fees: ${owed.toFixed(4)} SOL equivalent.\nUse /redeem or contact support.`
    );
  }
  const config = getDefaultConfig(strategyName, tokenMint);
  if (!config) throw new Error(`Unknown strategy: ${strategyName}`);
  const preflightFee = goldrushPriceFor('trade_preflight');
  if (preflightFee > 0) {
    await recordFeatureUsageFee(msg.from.id, 'trade_preflight', preflightFee, {
      strategyName,
      tokenMint,
    }).catch(() => null);
  }
  await saveSession(msg.from.id, strategyName, config);
  const sendMessage = (text, opts) => bot.sendMessage(msg.chat.id, text, opts);
  await startStrategy(msg.from.id, strategyName, config, botWallet.encrypted_private_key, sendMessage);
  await setSessionActive(msg.from.id, true);
  return bot.sendMessage(msg.chat.id, `Started ${strategyName.toUpperCase()} for ${tokenMint}.`);
}

async function launchLimitStrategy(bot, msg, session, kind, tokenMint) {
  const botWallet = await getBotWallet(msg.from.id);
  if (!botWallet) return bot.sendMessage(msg.chat.id, 'Create a bot wallet first with /deposit.');
  assertWalletBinding(botWallet);
  const access = await canTrade(msg.from.id, msg.from.username, botWallet.public_key);
  if (!access.allowed) {
    const owed = await getUnsettledFees(msg.from.id);
    return bot.sendMessage(msg.chat.id,
      `Promo access expired.\nUnsettled fees: ${owed.toFixed(4)} SOL equivalent.\nUse /redeem or contact support.`
    );
  }
  const currentPrice = await getTokenPriceInSol(tokenMint).catch(() => null);
  if (!currentPrice) return bot.sendMessage(msg.chat.id, 'Could not read a live price for this token yet.');
  const preflightFee = goldrushPriceFor('trade_preflight');
  if (preflightFee > 0) {
    await recordFeatureUsageFee(msg.from.id, 'trade_preflight', preflightFee, {
      strategyName: 'limit',
      kind,
      tokenMint,
    }).catch(() => null);
  }
  const config = defaultLimitConfig(tokenMint, kind, currentPrice);
  if (kind === 'take_profit') config.targetPrice = currentPrice * 1.05;
  if (kind === 'stop_loss') config.targetPrice = currentPrice * 0.95;
  if (kind === 'buy_limit') config.targetPrice = currentPrice * 0.98;
  if (kind === 'trailing_stop') config.trailingPct = 3;
  if (kind === 'take_profit' || kind === 'stop_loss' || kind === 'trailing_stop') {
    const positionBalance = await getTokenBalance(botWallet.public_key, tokenMint).catch(() => 0);
    config.sellPercent = positionBalance > 0 ? 100 : 0;
  }
  const sendMessage = (text, opts) => bot.sendMessage(msg.chat.id, text, opts);
  await saveSession(msg.from.id, 'limit', config);
  await startStrategy(msg.from.id, 'limit', config, botWallet.encrypted_private_key, sendMessage);
  await setSessionActive(msg.from.id, true);
  return bot.sendMessage(msg.chat.id, `Started ${kind.replace(/_/g, ' ').toUpperCase()} for ${tokenMint}.`);
}

async function launchSniperStrategy(bot, msg, session, tokenMint) {
  const botWallet = await getBotWallet(msg.from.id);
  if (!botWallet) return bot.sendMessage(msg.chat.id, 'Create a bot wallet first with /deposit.');
  assertWalletBinding(botWallet);
  const access = await canTrade(msg.from.id, msg.from.username, botWallet.public_key);
  if (!access.allowed) {
    const owed = await getUnsettledFees(msg.from.id);
    return bot.sendMessage(msg.chat.id,
      `Promo access expired.\nUnsettled fees: ${owed.toFixed(4)} SOL equivalent.\nUse /redeem or contact support.`
    );
  }
  const preflightFee = goldrushPriceFor('trade_preflight');
  if (preflightFee > 0) {
    await recordFeatureUsageFee(msg.from.id, 'trade_preflight', preflightFee, {
      strategyName: 'sniper',
      tokenMint,
    }).catch(() => null);
  }
  const config = defaultSniperConfig(tokenMint);
  const sendMessage = (text, opts) => bot.sendMessage(msg.chat.id, text, opts);
  await saveSession(msg.from.id, 'sniper', config);
  await startStrategy(msg.from.id, 'sniper', config, botWallet.encrypted_private_key, sendMessage);
  await setSessionActive(msg.from.id, true);
  return bot.sendMessage(msg.chat.id, `Started SNIPER for ${tokenMint}.`);
}

async function launchDcaStrategy(bot, msg, session, tokenMint) {
  return launchConfiguredStrategy(bot, msg, session, 'dca', tokenMint);
}

async function launchGridStrategy(bot, msg, session, tokenMint) {
  return launchConfiguredStrategy(bot, msg, session, 'grid', tokenMint);
}

async function launchMomentumStrategy(bot, msg, session, tokenMint) {
  return launchConfiguredStrategy(bot, msg, session, 'momentum', tokenMint);
}

async function showLimitActions(bot, msg, tokenMint) {
  return bot.sendMessage(msg.chat.id,
    `🎯 *Limit Orders*

Token: \`${tokenMint}\`

These buttons use the live price as the reference and start a real watcher.`, limitActionsMenu(tokenMint)
  );
}

module.exports = {
  showTradingTools,
  promptTokenDiscovery,
  handleDiscoveryMessage,
  getLastDiscoveredToken,
  launchLimitStrategy,
  launchSniperStrategy,
  launchDcaStrategy,
  launchGridStrategy,
  launchMomentumStrategy,
  showLimitActions,
  pendingDiscover,
};
