const TelegramBot = require('node-telegram-bot-api');
const { handleStart, handleHelp, handleBilling, handleSetTier, handleZk, handleSafety, handlePrivacy, handleModes, handleDex, handleLinks } = require('./handlers/general');
const { handleDeposit, handleWithdraw, handleBalance, handleRecoverWallet, handleNewWallet, handleExportWalletEncrypted } = require('./handlers/wallet');
const { handleSetStrategy, handleSetQuoteCurrency, handleStartTrading, handleStopTrading, handleStatus, handleBuyNow, handleSellNow } = require('./handlers/trading');
const { handleConnectWallet } = require('./handlers/walletConnect');
const { handleRescue, handleRecoverKey, handleRescueWithdraw, tryRecoverFromText, handleRecoveryDocument } = require('./handlers/recovery');
const { sessionMiddleware } = require('./middleware/session');
const { startFeeCron } = require('./billing/feeCron');
const db = require('./db/supabase');
const productUi = require('./handlers/productUi');
const { handleStartPayload, handlePromo, handleReferral, handleFreeAccess } = require('./handlers/growth');
const community = require('./handlers/community');
const advancedTrading = require('./handlers/advancedTrading');
const { PDAO_MINT } = require('./config/tradingPolicy');

const { handlePrivateStatus, handlePrivateBuy, handleCustomStrategy } = require('./handlers/privateTrading');

const pendingSipSetup = new Map();
const pendingAdminBroadcast = new Map();


require('dotenv').config();

const BOT_ROLE = String(process.env.BOT_ROLE || process.env.BOT_PROFILE || 'trading').toLowerCase();
const IS_COMMUNITY_BOT = BOT_ROLE === 'community';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Telegram Markdown is fragile when live token metadata or URLs contain special
// characters. Keep rich messages when they work; fall back to plain text so a
// formatting error never stops execution.
const rawSendMessage = bot.sendMessage.bind(bot);
bot.sendMessage = async (chatId, text, options = {}) => {
  const opts = { parse_mode: 'Markdown', ...options };
  try {
    return await rawSendMessage(chatId, text, opts);
  } catch (err) {
    const description = err?.response?.body?.description || err?.message || '';
    if (!/parse entities|can't parse/i.test(description)) {
      throw new Error(`Telegram sendMessage failed: ${description || 'unknown error'}`);
    }
    const plain = String(text)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[`*_]/g, '');
    const fallbackOptions = { ...options };
    delete fallbackOptions.parse_mode;
    return rawSendMessage(chatId, plain, fallbackOptions);
  }
};

// ─── Middleware wrapper ───────────────────────────────────────────────────────
async function withSession(msg, fn) {
  const session = await sessionMiddleware(msg.from.id, msg.from.username);
  await fn(session);
}

async function privateOnly(bot, msg, fn) {
  if (community.isGroupChat(msg.chat)) {
    return community.redirectToPrivate(bot, msg);
  }
  return fn();
}

function resolveCallbackToken(token, telegramId) {
  if (token !== 'disc') return token;
  return advancedTrading.getLastDiscoveredToken(telegramId) || null;
}

function missingDiscoveredTokenMessage(bot, msg) {
  return bot.sendMessage(msg.chat.id, 'Token context expired. Tap Discover Token and paste the token again.');
}

function communityBotRedirect(bot, msg, note = 'Trading and wallet actions stay in the private trading bot.') {
  return bot.sendMessage(msg.chat.id,
    `${note}\n\nOpen the private trading bot to continue securely.`,
    { reply_markup: { inline_keyboard: [[{ text: '🚀 Open Private Chat', url: `https://t.me/${process.env.TELEGRAM_TRADING_BOT_USERNAME || 'PrivateDAO0_bot'}?start=community` }]] } }
  );
}

// ─── Commands ─────────────────────────────────────────────────────────────────
bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  if (community.isGroupChat(msg.chat)) {
    await community.redirectToPrivate(bot, msg, '🚀 Open Private Chat', 'community');
    return;
  }
  if (IS_COMMUNITY_BOT) {
    await productUi.showCommunity(bot, msg);
    return;
  }
  await handleStartPayload(bot, msg, match?.[1] || '').catch((err) => {
    console.error('[Referral Start Error]', err.message);
  });
  return productUi.showIntro(bot, msg);
});

bot.onText(/\/help/, async (msg) => {
  if (IS_COMMUNITY_BOT) return productUi.showCommunity(bot, msg);
  await handleHelp(bot, msg);
});


bot.onText(/\/private$/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handlePrivateStatus(bot, msg));
});

bot.onText(/\/private_buy(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, async () => {
    const session = await db.getSession(msg.from.id).catch(() => ({}));
    await handlePrivateBuy(bot, msg, session || {}, match[1] || '');
  });
});

bot.onText(/\/strategy_custom(?:\s+([\s\S]+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleCustomStrategy(bot, msg, match[1] || ''));
});

bot.onText(/\/zk/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handlePrivateStatus(bot, msg));
});

bot.onText(/\/safety/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleSafety(bot, msg));
});

bot.onText(/\/privacy/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handlePrivacy(bot, msg));
});

bot.onText(/\/modes/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleModes(bot, msg));
});

bot.onText(/\/dex/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleDex(bot, msg));
});

bot.onText(/\/links/, async (msg) => {
  await handleLinks(bot, msg);
});

bot.onText(/\/billing/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleBilling(bot, msg));
});

bot.onText(/\/promo(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handlePromo(bot, msg, match?.[1] || ''));
});
bot.onText(/\/redeem(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handlePromo(bot, msg, match?.[1] || ''));
});

bot.onText(/\/referral/, async (msg) => {
  await handleReferral(bot, msg);
});

bot.onText(/\/tier(?:\s+(.+))?/, async (msg, match) => {
  await handleSetTier(bot, msg, match[1]);
});

bot.onText(/\/balance/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleBalance(bot, msg, s)));
});

bot.onText(/\/deposit/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleDeposit(bot, msg, s)));
});

bot.onText(/\/recover_wallet/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleRecoverWallet(bot, msg));
});

bot.onText(/\/export_wallet_encrypted(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleExportWalletEncrypted(bot, msg, match[1] || ''));
});

bot.onText(/\/new_wallet(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleNewWallet(bot, msg, match[1] || ''));
});

bot.onText(/\/newwallet(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleNewWallet(bot, msg, match[1] || ''));
});

bot.onText(/\/withdraw(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  const destination = match[1] ? match[1].trim() : null;
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleWithdraw(bot, msg, s, destination)));
});

bot.onText(/\/connect/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleConnectWallet(bot, msg, s)));
});

bot.onText(/\/strategy(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  const stratName = match[1] || null;
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleSetStrategy(bot, msg, s, stratName)));
});

bot.onText(/\/buy(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleBuyNow(bot, msg, s, match[1] || '')));
});

bot.onText(/\/sell(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleSellNow(bot, msg, s, match[1] || '')));
});

bot.onText(/\/start_trade/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleStartTrading(bot, msg, s)));
});

bot.onText(/\/stop/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleStopTrading(bot, msg, s)));
});

bot.onText(/\/status/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => withSession(msg, (s) => handleStatus(bot, msg, s)));
});

bot.onText(/\/stats/, async (msg) => {
  const isOwner = community.isOwnerTelegramId(msg.from.id);
  if (IS_COMMUNITY_BOT || community.isGroupChat(msg.chat)) {
    const stats = await community.communityStatsSnapshot().catch(() => null);
    return bot.sendMessage(msg.chat.id,
      stats
        ? `📊 Community / Platform Stats\n\nUsers: ${stats.totalUsers}\nActive wallets: ${stats.activeWallets}\nToday buyers: ${stats.todayBuyers}\nToday volume: ${stats.todayVolumeSol.toFixed(4)} SOL\nPDAO buys: ${stats.pdaoBuys}\nCommunity joins: ${stats.communityJoins}\nPromo usage: ${stats.promoUsage}\nReferral usage: ${stats.referralUsage}`
        : 'Stats unavailable right now.'
    );
  }
  if (!isOwner) return bot.sendMessage(msg.chat.id, 'Owner only.');
  return community.showAdminDashboard(bot, msg);
});

bot.onText(/\/rescue/, async (msg) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await handleRescue(bot, msg);
});

bot.onText(/\/recover_key(?:\s+([\s\S]+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleRecoverKey(bot, msg, match[1] || ''));
});

bot.onText(/\/rescue_withdraw(?:\s+(.+))?/, async (msg, match) => {
  if (IS_COMMUNITY_BOT) return communityBotRedirect(bot, msg);
  await privateOnly(bot, msg, () => handleRescueWithdraw(bot, msg, match[1] ? match[1].trim() : null));
});

// ─── Callback Queries (inline buttons) ───────────────────────────────────────
bot.on('callback_query', async (query) => {
  const msg = query.message;
  const data = query.data || '';
  const userMsg = { ...msg, from: query.from };
  const isOwner = community.isOwnerTelegramId(query.from?.id);

  await bot.answerCallbackQuery(query.id).catch(() => {});

  if (await community.handleGroupCallback(bot, query)) return;

  if (IS_COMMUNITY_BOT && !String(data).startsWith('menu_community') && !String(data).startsWith('community_') && !String(data).startsWith('admin_')) {
    return communityBotRedirect(bot, userMsg);
  }
  if (data === 'menu_home') return productUi.showHome(bot, userMsg);
  if (data === 'menu_wallet') return productUi.showWallet(bot, userMsg);
  if (data === 'menu_buy') return productUi.showBuy(bot, userMsg);
  if (data === 'menu_sell') return productUi.showSell(bot, userMsg);
  if (data === 'menu_private_buy') return productUi.showPrivateBuy(bot, userMsg);
  if (data === 'menu_shield') return productUi.showFeature(bot, userMsg, 'shield');
  if (data === 'menu_mev') return productUi.showFeature(bot, userMsg, 'mev');
  if (data === 'menu_receipts') return productUi.showReceipts(bot, userMsg);
  if (data === 'menu_portfolio') return productUi.showPortfolio(bot, userMsg);
  if (data === 'menu_stealth') return productUi.showFeature(bot, userMsg, 'stealth');
  if (data === 'menu_auto') return productUi.showFeature(bot, userMsg, 'auto');
  if (data === 'menu_receipt') return productUi.showFeature(bot, userMsg, 'receipt');
  if (data === 'menu_settings') return productUi.showSettings(bot, userMsg);
  if (data === 'menu_community') return productUi.showCommunity(bot, userMsg);
  if (data === 'menu_tour') return productUi.showTour(bot, userMsg);
  if (data === 'menu_admin') return isOwner ? community.showAdminDashboard(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'community_admin_panel') return isOwner ? community.showCommunityControlCenter(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'community_status') return isOwner ? community.showCommunityControlCenter(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'menu_tools') return advancedTrading.showTradingTools(bot, userMsg);
  if (data === 'menu_discover') return advancedTrading.promptTokenDiscovery(bot, userMsg);
  if (data === 'menu_limit_orders') return advancedTrading.showLimitActions(bot, userMsg, PDAO_MINT);
  if (data === 'menu_sniper') return advancedTrading.promptTokenDiscovery(bot, userMsg);
  if (data === 'menu_zk') return handleZk(bot, userMsg);
  if (data === 'feature_shield') return productUi.showFeature(bot, userMsg, 'shield');
  if (data === 'feature_stealth') return productUi.showFeature(bot, userMsg, 'stealth');
  if (data === 'feature_mev') return productUi.showFeature(bot, userMsg, 'mev');
  if (data === 'feature_auto') return productUi.showFeature(bot, userMsg, 'auto');
  if (data === 'feature_receipt') return productUi.showFeature(bot, userMsg, 'receipt');
  if (data === 'menu_pdao' || data === 'menu_pdao_perks') return productUi.showPdao(bot, userMsg);
  if (data === 'menu_fees') return productUi.showFees(bot, userMsg);
  if (data === 'menu_free_access') return handleFreeAccess(bot, userMsg);
  if (data === 'menu_referral') return handleReferral(bot, userMsg);
  if (data === 'menu_links') return productUi.showLinks(bot, userMsg);
  if (data === 'menu_why') return productUi.showWhy(bot, userMsg);
  if (data === 'wallet_protection') return productUi.askSip(bot, userMsg);
  if (data === 'sip_help') return productUi.showSipHelp(bot, userMsg);

  const session = await sessionMiddleware(query.from.id, query.from.username);

  if (data === 'wallet_deposit') return handleDeposit(bot, userMsg, session);
  if (data === 'wallet_balance') return handleBalance(bot, userMsg, session);
  if (data === 'wallet_withdraw') return handleWithdraw(bot, userMsg, session, null);
  if (data === 'wallet_send') return handleWithdraw(bot, userMsg, session, null);
  if (data === 'wallet_recover') return handleRecoverWallet(bot, userMsg);
  if (data === 'wallet_set_sip') {
    pendingSipSetup.set(query.from.id, true);
    return bot.sendMessage(msg.chat.id,
      `🔐 *Set SIP Protection*\n\n` +
      `Send your SIP code directly in the next message.\n` +
      `Use 4 to 10 digits and keep it safe.`,
      { reply_markup: { inline_keyboard: [[
        { text: '← Wallet', callback_data: 'menu_wallet' },
      ]] } }
    );
  }
  if (data === 'wallet_export_help') return productUi.showWalletExportHelp(bot, userMsg);
  if (data === 'buy_pdao' || data === 'buy_asset_pdao') return productUi.showAmount(bot, userMsg, 'PDAO');
  if (data === 'buy_other' || data === 'buy_asset_custom') return productUi.showPasteToken(bot, userMsg, 'buy');
  if (data.startsWith('buy_amount:') || data.startsWith('private_buy:')) {
    const [, amount, quote, token] = data.split(':');
    const tokenMint = resolveCallbackToken(token, query.from.id);
    if (!tokenMint) return missingDiscoveredTokenMessage(bot, msg);
    return productUi.showMode(bot, userMsg, amount, quote, tokenMint);
  }
  if (data.startsWith('trade_mode:')) {
    const [, mode, amount, quote, token] = data.split(':');
    const tokenMint = resolveCallbackToken(token, query.from.id);
    if (!tokenMint) return missingDiscoveredTokenMessage(bot, msg);
    return productUi.showReview(bot, userMsg, mode, amount, quote, tokenMint);
  }
  if (data.startsWith('trade_review:')) {
    const [, mode, amount, quote, token] = data.split(':');
    const tokenMint = resolveCallbackToken(token, query.from.id);
    if (!tokenMint) return missingDiscoveredTokenMessage(bot, msg);
    return productUi.showReview(bot, userMsg, mode, amount, quote, tokenMint);
  }
  if (data.startsWith('trade_execute:')) {
    const [, mode, amount, quote, token] = data.split(':');
    const tokenMint = resolveCallbackToken(token, query.from.id);
    if (!tokenMint) return missingDiscoveredTokenMessage(bot, msg);
    const suffix = mode === 'shield' ? ' shield' : '';
    if (mode === 'private') return handlePrivateBuy(bot, userMsg, session, `${amount} ${quote} ${tokenMint}`);
    return handleBuyNow(bot, userMsg, session, `${amount} ${quote} ${tokenMint}${suffix}`);
  }
  if (data === 'trade_mode_fast') return productUi.showReview(bot, userMsg, 'fast', '0.01', 'SOL', 'PDAO');
  if (data === 'trade_mode_shield') return productUi.showReview(bot, userMsg, 'shield', '0.01', 'SOL', 'PDAO');
  if (data === 'trade_mode_private') return productUi.showReview(bot, userMsg, 'private', '0.01', 'SOL', 'PDAO');
  if (data === 'trade_review') return productUi.showReview(bot, userMsg, 'private', '0.01', 'SOL', 'PDAO');
  if (data === 'trade_execute_pdao') return handlePrivateBuy(bot, userMsg, session, '0.01 SOL PDAO');
  if (data === 'sell_pdao_review') return productUi.showSellReview(bot, userMsg);
  if (data === 'sell_pdao_all') return handleSellNow(bot, userMsg, session, '100% PDAO SOL shield');
  if (data === 'sell_other') return productUi.showPasteToken(bot, userMsg, 'sell');

  if (data.startsWith('strategy:')) {
    const stratName = data.split(':')[1];
    return handleSetStrategy(bot, userMsg, session, stratName, true);
  }
  if (data.startsWith('strategy_launch:')) {
    const [, stratName, tokenMint] = data.split(':');
    const resolvedToken = resolveCallbackToken(tokenMint, query.from.id);
    if (!resolvedToken) return missingDiscoveredTokenMessage(bot, msg);
    if (stratName === 'dca') return advancedTrading.launchDcaStrategy(bot, userMsg, session, resolvedToken);
    if (stratName === 'grid') return advancedTrading.launchGridStrategy(bot, userMsg, session, resolvedToken);
    if (stratName === 'momentum') return advancedTrading.launchMomentumStrategy(bot, userMsg, session, resolvedToken);
    if (stratName === 'sniper') return advancedTrading.launchSniperStrategy(bot, userMsg, session, resolvedToken);
  }
  if (data.startsWith('limit_launch:')) {
    const [, kind, tokenMint] = data.split(':');
    const resolvedToken = resolveCallbackToken(tokenMint, query.from.id);
    if (!resolvedToken) return missingDiscoveredTokenMessage(bot, msg);
    return advancedTrading.launchLimitStrategy(bot, userMsg, session, kind, resolvedToken);
  }
  if (data.startsWith('limit_menu:')) {
    const [, tokenMint] = data.split(':');
    const resolvedToken = resolveCallbackToken(tokenMint, query.from.id);
    if (!resolvedToken) return missingDiscoveredTokenMessage(bot, msg);
    return advancedTrading.showLimitActions(bot, userMsg, resolvedToken);
  }
  if (data.startsWith('quote:')) {
    const [, quoteCurrency, stratName] = data.split(':');
    return handleSetQuoteCurrency(bot, userMsg, session, quoteCurrency, stratName);
  }
  if (data.startsWith('buy:')) {
    const [, amount, quoteCurrency] = data.split(':');
    return handleBuyNow(bot, userMsg, session, `${amount} ${quoteCurrency}`);
  }
  if (data === 'menu_trading' || data === 'cmd_buy') return handleSetStrategy(bot, userMsg, session, null, true);
  if (data === 'cmd_dex') return handleDex(bot, { ...userMsg, text: '/dex' });
  if (data === 'cmd_zk') return handlePrivateStatus(bot, userMsg);
  if (data === 'cmd_safety') return handleSafety(bot, userMsg);
  if (data === 'cmd_modes') return handleModes(bot, userMsg);
  if (data === 'cmd_links') return productUi.showLinks(bot, userMsg);
  if (data === 'admin_dashboard') return isOwner ? community.showAdminDashboard(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'admin_groups') return isOwner ? community.showCommunityControlCenter(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'admin_promos') return isOwner ? community.showAdminPromos(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'admin_announce') return isOwner ? productUi.showTour(bot, userMsg) : bot.answerCallbackQuery(query.id, { text: 'Owner only.', show_alert: false }).catch(() => null);
  if (data === 'admin_broadcast') {
    pendingAdminBroadcast.set(query.from.id, true);
    return bot.sendMessage(msg.chat.id,
      `📣 *Broadcast Update*\n\n` +
      `Send the update text in the next message.\n` +
      `It will go to every user who has opened the bot before.`,
      { reply_markup: { inline_keyboard: [[
        { text: 'Cancel', callback_data: 'cancel_broadcast' },
        { text: 'Dashboard', callback_data: 'admin_dashboard' },
      ]] } }
    );
  }
  if (data === 'admin_emergency_stop') return community.pauseAllTrading(bot, userMsg, 'owner_dashboard_pause');
  if (data === 'admin_emergency_resume') return community.resumeAllTrading(bot, userMsg);
  if (data === 'admin_stop_all') return community.stopAllTradingNow(bot, userMsg);
  if (data === 'cancel_broadcast') {
    pendingAdminBroadcast.delete(query.from.id);
    return bot.sendMessage(msg.chat.id, 'Broadcast cancelled.');
  }
  if (data === 'confirm_withdraw' || data.startsWith('confirm_withdraw:')) {
    const destination = data.includes(':') ? data.split(':')[1] : null;
    return handleWithdraw(bot, userMsg, session, destination, true);
  }
  if (data === 'cancel') return bot.sendMessage(msg.chat.id, 'Cancelled.');
});

// ─── Error handling ───────────────────────────────────────────────────────────
bot.on('polling_error', (error) => {
  console.error('[Polling Error]', error.message);
});

process.on('unhandledRejection', (reason) => {
  const message = reason?.message || String(reason);
  console.error('[Unhandled Rejection]', message);
});

console.log('PrivateDAO Trading Bot is running...');
startFeeCron(bot);

// Reply keyboard shortcuts
bot.on('message', async (msg) => {
  const t=(msg.text||'').trim();
  if (await community.onGroupMessage(bot, msg)) return;
  if (await handleRecoveryDocument(bot, msg)) return;
  if (!t.startsWith('/') && await tryRecoverFromText(bot, msg, t)) return;
  if (!community.isGroupChat(msg.chat) && await advancedTrading.handleDiscoveryMessage(bot, msg, t)) return;
  if (pendingAdminBroadcast.has(msg.from.id)) {
    if (!t || t.startsWith('/')) return;
    if (/^cancel$/i.test(t)) {
      pendingAdminBroadcast.delete(msg.from.id);
      return bot.sendMessage(msg.chat.id, 'Broadcast cancelled.');
    }
    if (!community.isOwnerTelegramId(msg.from.id)) {
      pendingAdminBroadcast.delete(msg.from.id);
      return bot.sendMessage(msg.chat.id, 'Only the owner can send broadcast updates.');
    }
    pendingAdminBroadcast.delete(msg.from.id);
    const result = await community.broadcastCommunityUpdate(bot, t).catch((err) => ({ sent: 0, failed: 0, error: err.message }));
    return bot.sendMessage(msg.chat.id,
      `📣 Broadcast sent.\n\n` +
      `Delivered: ${result.sent || 0}\n` +
      `Failed: ${result.failed || 0}${result.error ? `\nError: ${result.error}` : ''}`
    );
  }
  if (pendingSipSetup.has(msg.from.id) && !t.startsWith('/')) {
    try {
      await productUi.handleSetSip(bot, msg, t);
      pendingSipSetup.delete(msg.from.id);
    } catch (err) {
      await bot.sendMessage(msg.chat.id, `SIP setup failed: ${err.message}`);
    }
    return;
  }

  if(t==='🟢 Buy') return productUi.showBuy(bot, msg);
  if(t==='🔴 Sell') return productUi.showSell(bot, msg);
  if(t==='🥷 Private Buy') return productUi.showPrivateBuy(bot, msg);
  if(t==='🛡 Shield Mode') return productUi.showFeature(bot, msg, 'shield');
  if(t==='⚡ MEV Mode') return productUi.showFeature(bot, msg, 'mev');
  if(t==='📜 Receipts') return productUi.showReceipts(bot, msg);
  if(t==='💼 Wallet') return productUi.showWallet(bot, msg);
  if(t==='🪙 $PDAO') return productUi.showPdao(bot, msg);
  if(t==='📊 Portfolio') return productUi.showPortfolio(bot, msg);
  if(t==='⚙ Settings') return productUi.showSettings(bot, msg);
  if(t==='🎁 Free Access' || t==='🎁 Promo' || t==='🎁 Promo Access' || t==='🔓 Redeem') return handleFreeAccess(bot, msg);
  if(t==='🔗 Invite') return handleReferral(bot, msg);
  if(t==='📈 Trading') return productUi.showBuy(bot, msg);
  if(t==='🎯 Buy PDAO') return bot.emit('text',{...msg,text:'/buy 0.01 SOL PDAO'});
  if(t==='🧭 DEX Routes') return bot.emit('text',{...msg,text:'/dex'});
  if(t==='🧾 ZK Status') return bot.emit('text',{...msg,text:'/zk'});
  if(t==='🛡️ Safety') return bot.emit('text',{...msg,text:'/safety'});
  if(t==='⚙️ Modes') return bot.emit('text',{...msg,text:'/modes'});
  if(t==='🔗 Links') return bot.emit('text',{...msg,text:'/links'});
  if(t==='👥 Community') return productUi.showCommunity(bot, msg);
  if(t==='🧭 Tour') return productUi.showTour(bot, msg);
  if(t==='💡 Admin Dashboard') return community.isOwnerTelegramId(msg.from.id) ? community.showAdminDashboard(bot, msg) : bot.sendMessage(msg.chat.id, 'Owner only.');
  if(t==='🔬 ZK Status') return bot.emit('text',{...msg,text:'/zk'});
});


bot.onText(/\/why/, async (msg) => productUi.showWhy(bot, msg));
bot.onText(/\/wallet/, async (msg) => productUi.showWallet(bot, msg));
bot.onText(/\/buy_menu/, async (msg) => productUi.showBuy(bot, msg));
bot.onText(/\/shield/, async (msg) => productUi.showFeature(bot, msg, 'shield'));
bot.onText(/\/stealth/, async (msg) => productUi.showFeature(bot, msg, 'stealth'));
bot.onText(/\/mev/, async (msg) => productUi.showFeature(bot, msg, 'mev'));
bot.onText(/\/auto/, async (msg) => productUi.showFeature(bot, msg, 'auto'));
bot.onText(/\/receipt/, async (msg) => productUi.showFeature(bot, msg, 'receipt'));
bot.onText(/\/pdao/, async (msg) => productUi.showPdao(bot, msg));
bot.onText(/\/fees/, async (msg) => productUi.showFees(bot, msg));
bot.onText(/\/protection/, async (msg) => productUi.askSip(bot, msg));
bot.onText(/\/community/, async (msg) => productUi.showCommunity(bot, msg));
bot.onText(/\/tour/, async (msg) => productUi.showTour(bot, msg));
bot.onText(/\/admin/, async (msg) => (community.isOwnerTelegramId(msg.from.id) ? community.showAdminDashboard(bot, msg) : bot.sendMessage(msg.chat.id, 'Owner only.')));
bot.onText(/\/verify/, async (msg) => {
  if (community.isGroupChat(msg.chat)) {
    return community.redirectToPrivate(bot, msg, '✅ Verify', 'community');
  }
  return bot.sendMessage(msg.chat.id,
    `✅ *Verified*\n\n` +
    `Official bot: https://t.me/PrivateDAO0_bot\n` +
    `Website: https://privatedao.org\n` +
    `X: https://x.com/PrivateDAOOS\n` +
    `GitHub: https://github.com/PrivateDAO`
  );
});
bot.onText(/\/community_on/, async (msg) => community.handleCommunityToggle(bot, msg, true));
bot.onText(/\/community_off/, async (msg) => community.handleCommunityToggle(bot, msg, false));
bot.onText(/\/community_status/, async (msg) => community.handleCommunityStatus(bot, msg));
bot.onText(/\/set_sip(?:\s+(.+))?/, async (msg, match) => {
  const raw = match[1] || '';
  if (!raw.trim()) {
    pendingSipSetup.set(msg.from.id, true);
    return bot.sendMessage(msg.chat.id,
      `🔐 *Set SIP Protection*\n\n` +
      `Send your SIP code directly in the next message.\n` +
      `Use 4 to 10 digits and keep it safe.`,
      { reply_markup: { inline_keyboard: [[
        { text: '✍️ Set SIP Now', callback_data: 'wallet_set_sip' },
        { text: '← Wallet', callback_data: 'menu_wallet' },
      ]] } }
    );
  }
  return productUi.handleSetSip(bot, msg, raw);
});
