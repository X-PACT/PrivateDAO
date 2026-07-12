const fs = require('fs');
const path = require('path');
const {
  getBotWallet,
  getOrCreateUser,
  listCommunityGroups,
  upsertCommunityGroup,
  setCommunityGroupSettings,
  recordCommunityEvent,
  recordCommunityMute,
  getCommunityMute,
  clearExpiredCommunityMutes,
  supabase,
} = require('../db/supabase');
const { createPromoCode, listPromoCodes } = require('../billing/fees');
const { getTokenMarketSummary } = require('../providers/marketData');
const { PDAO_MINT, CREATOR_WALLET, getLiveTradingStatus } = require('../config/tradingPolicy');
const { GOLDRUSH_PRICING } = require('../config/intelligencePricing');
const { setTradingPaused, readTradingControl } = require('../control/tradingControl');
const { getActiveStrategyCount, stopAllStrategies } = require('../trading/engine');
const DEFAULT_COMMUNITY_HANDLE = String(process.env.COMMUNITY_HANDLE || 'PrivateDAOO').replace(/^@/, '');
const OWNER_TELEGRAM_IDS = new Set(
  String(process.env.ADMIN_TELEGRAM_IDS || process.env.OWNER_TELEGRAM_IDS || process.env.ADMIN_TELEGRAM_ID || '7254012270')
    .split(',')
    .map((value) => String(value || '').trim())
    .filter(Boolean)
);

const FLOOD_WINDOW_MS = Number(process.env.COMMUNITY_FLOOD_WINDOW_MS || 15000);
const FLOOD_LIMIT = Number(process.env.COMMUNITY_FLOOD_LIMIT || 4);
const SPAM_MUTE_MS = Number(process.env.COMMUNITY_SPAM_MUTE_MS || 10 * 60 * 1000);
const BUNDLE_COOLDOWN_MS = Number(process.env.COMMUNITY_BROADCAST_COOLDOWN_MS || 120000);
const PROMO_PACK_ONE_DAY = Number(process.env.PROMO_PACK_ONE_DAY || 100);
const PROMO_PACK_THREE_DAY = Number(process.env.PROMO_PACK_THREE_DAY || 100);

const messageBuckets = new Map();
let cachedUsername = null;
let cachedTradingUsername = null;

function isGroupChat(chat) {
  return Boolean(chat && ['group', 'supergroup'].includes(chat.type));
}

function isPrivateChat(chat) {
  return Boolean(chat && chat.type === 'private');
}

function normalizeUsername(value) {
  return String(value || '').trim().replace(/^@/, '');
}

async function getBotUsername(bot) {
  if (cachedUsername) return cachedUsername;
  const preferred = process.env.BOT_ROLE === 'community'
    ? (process.env.TELEGRAM_COMMUNITY_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME)
    : (process.env.TELEGRAM_COMMUNITY_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME);
  if (preferred) {
    cachedUsername = normalizeUsername(preferred);
    return cachedUsername;
  }
  const me = await bot.getMe();
  cachedUsername = me.username;
  return cachedUsername;
}

async function getTradingBotUsername(bot) {
  if (cachedTradingUsername) return cachedTradingUsername;
  const preferred = process.env.TELEGRAM_TRADING_BOT_USERNAME || process.env.TRADING_BOT_USERNAME;
  if (preferred) {
    cachedTradingUsername = normalizeUsername(preferred);
    return cachedTradingUsername;
  }
  const me = await bot.getMe();
  cachedTradingUsername = me.username;
  return cachedTradingUsername;
}

async function privateChatUrl(bot, payload = 'community') {
  const username = await getTradingBotUsername(bot);
  return `https://t.me/${username}?start=${encodeURIComponent(payload)}`;
}

async function openPrivateKeyboard(bot, label = 'Open Private Chat', payload = 'community') {
  return {
    inline_keyboard: [[
      { text: label, url: await privateChatUrl(bot, payload) },
    ]],
  };
}

function isOwnerTelegramId(telegramId) {
  return OWNER_TELEGRAM_IDS.has(String(telegramId || '').trim());
}

async function canViewAdmin(bot, msg) {
  if (isOwnerTelegramId(msg.from?.id)) return true;
  if (!isGroupChat(msg.chat)) return false;
  return isAdmin(bot, msg.chat.id, msg.from?.id);
}

function groupControlKeyboard(bot, group = null) {
  const notify = group?.notify_pdao !== false;
  const welcome = group?.welcome_enabled !== false;
  const antiSpam = group?.anti_spam_enabled !== false;
  return {
    inline_keyboard: [
      [
        { text: `${notify ? '🔔' : '🔕'} PDAO Broadcast`, callback_data: 'community_toggle_notify' },
        { text: `${welcome ? '👋' : '🙈'} Welcome`, callback_data: 'community_toggle_welcome' },
      ],
      [
        { text: `${antiSpam ? '🛡' : '⚪'} Anti-Spam`, callback_data: 'community_toggle_antispam' },
        { text: '🧾 Status', callback_data: 'community_status' },
      ],
      [
        { text: '📝 Welcome Script', callback_data: 'community_announce' },
        { text: '🚀 Open Private Chat', url: privateChatUrl(bot, 'community') },
      ],
    ],
  };
}

function getText(msg) {
  return String(msg?.text || msg?.caption || '').trim();
}

function hasBotMention(botUsername, msg) {
  const text = getText(msg).toLowerCase();
  const username = normalizeUsername(botUsername).toLowerCase();
  const mention = `@${username}`;
  return text.includes(mention) || msg?.reply_to_message?.from?.username === botUsername;
}

function containsSpam(text) {
  const normalized = String(text || '').toLowerCase();
  const linkCount = (normalized.match(/https?:\/\//g) || []).length + (normalized.match(/t\.me\//g) || []).length;
  const scamKeywords = [
    'airdrop',
    'dm me',
    'whatsapp',
    'whats app',
    'seed phrase',
    'private key',
    'wallet connect',
    'guaranteed profit',
    '100x',
    'free money',
    'support admin',
  ];
  return linkCount > 1 || scamKeywords.some((kw) => normalized.includes(kw));
}

function bucketKey(chatId, telegramId) {
  return `${chatId}:${telegramId}`;
}

function recordFlood(msg) {
  const key = bucketKey(msg.chat.id, msg.from.id);
  const now = Date.now();
  const bucket = messageBuckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < FLOOD_WINDOW_MS);
  recent.push(now);
  messageBuckets.set(key, recent);
  return recent.length >= FLOOD_LIMIT;
}

async function muteAndDelete(bot, msg, reason = 'spam') {
  try { await bot.deleteMessage(msg.chat.id, msg.message_id); } catch {}
  const until = new Date(Date.now() + SPAM_MUTE_MS);
  try {
    await bot.restrictChatMember(msg.chat.id, msg.from.id, {
      permissions: {
        can_send_messages: false,
        can_send_audios: false,
        can_send_documents: false,
        can_send_photos: false,
        can_send_videos: false,
        can_send_video_notes: false,
        can_send_voice_notes: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_invite_users: false,
      },
      until_date: Math.floor(until.getTime() / 1000),
    });
  } catch {}
  await recordCommunityMute({
    chat_id: msg.chat.id,
    telegram_id: msg.from.id,
    mute_until: until.toISOString(),
    reason,
  }).catch(() => null);
}

async function redirectToPrivate(bot, msg, label = 'Continue securely in Private Chat', payload = 'community') {
  const keyboard = await openPrivateKeyboard(bot, label, payload);
  const text = `Continue securely in Private Chat. Trading and wallet actions stay private.`;
  if (msg.message_id) {
    try {
      return await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: keyboard,
      });
    } catch {
      return bot.sendMessage(msg.chat.id, text, { reply_markup: keyboard });
    }
  }
  return bot.sendMessage(msg.chat.id, text, { reply_markup: keyboard });
}

async function announceJoin(bot, msg, newMember) {
  const keyboard = await openPrivateKeyboard(bot, '✅ Verify', 'community');
  const name = newMember.first_name || newMember.username || 'trader';
  await bot.sendMessage(msg.chat.id,
    `Welcome to PrivateDAO, ${name}.\n\n` +
    `Trading happens in Private Chat.\n` +
    `Tap Verify to continue securely.`,
    { reply_markup: keyboard }
  );
}

async function registerCommunityGroup(bot, msg, actorId = null) {
  const payload = {
    chat_id: msg.chat.id,
    title: msg.chat.title || null,
    username: msg.chat.username || null,
    created_by: actorId || msg.from?.id || null,
    notify_pdao: true,
    welcome_enabled: true,
    anti_spam_enabled: true,
    status: 'active',
  };
  await upsertCommunityGroup(payload);
  await recordCommunityEvent({
    chat_id: msg.chat.id,
    telegram_id: actorId || msg.from?.id || null,
    event_type: 'group_registered',
    payload: JSON.stringify({
      title: msg.chat.title || null,
      username: msg.chat.username || null,
    }),
  }).catch(() => null);
}

async function onGroupLifecycle(bot, msg) {
  if (!isGroupChat(msg.chat)) return false;
  const newMembers = Array.isArray(msg.new_chat_members) ? msg.new_chat_members : [];
  if (!newMembers.length) return false;

  const group = await ensureCommunityGroup(bot, msg).catch(() => null);
  for (const member of newMembers) {
    if (member.id === (await bot.getMe()).id) {
      await bot.sendMessage(msg.chat.id,
        `🛡️ PrivateDAO is here.\n\n` +
        `Groups stay social. Trading stays private.\n` +
        `Tap the button to open a secure private chat.`,
        { reply_markup: await openPrivateKeyboard(bot, '✅ Verify', 'community') }
      );
      await recordCommunityEvent({
        chat_id: msg.chat.id,
        telegram_id: member.id,
        event_type: 'bot_added_to_group',
        payload: JSON.stringify({ title: msg.chat.title || null }),
      }).catch(() => null);
      continue;
    }
    if (group?.welcome_enabled === false) continue;
    await announceJoin(bot, msg, member);
    await recordCommunityEvent({
      chat_id: msg.chat.id,
      telegram_id: member.id,
      event_type: 'member_joined',
      payload: JSON.stringify({
        first_name: member.first_name || null,
        username: member.username || null,
      }),
    }).catch(() => null);
  }
  return true;
}

async function onGroupMessage(bot, msg) {
  if (!isGroupChat(msg.chat)) return false;
  if (msg.new_chat_members?.length) {
    await onGroupLifecycle(bot, msg);
    return true;
  }
  const text = getText(msg);
  if (!text || text.startsWith('/')) return false;
  const group = await ensureCommunityGroup(bot, msg).catch(() => null);

  const botUsername = await getBotUsername(bot);
  if (hasBotMention(botUsername, msg) || /(^|\s)(trade|buy|sell|wallet|verify)\b/i.test(text)) {
    await recordCommunityEvent({
      chat_id: msg.chat.id,
      telegram_id: msg.from?.id || null,
      event_type: 'mention_or_help',
      payload: JSON.stringify({ text }),
    }).catch(() => null);
    await bot.sendMessage(msg.chat.id,
      `How do I buy or sell?\n\n` +
      `Open Private Chat to trade securely.`,
      { reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community') }
    );
    return true;
  }

  if (group?.anti_spam_enabled === false) return false;
  const flood = recordFlood(msg);
  if (containsSpam(text) || flood) {
    await recordCommunityEvent({
      chat_id: msg.chat.id,
      telegram_id: msg.from.id,
      event_type: 'spam_blocked',
      payload: JSON.stringify({ flood, text }),
    }).catch(() => null);
    await muteAndDelete(bot, msg, flood ? 'flood' : 'spam');
    return true;
  }

  return false;
}

async function isAdmin(bot, chatId, telegramId) {
  try {
    const member = await bot.getChatMember(chatId, telegramId);
    return ['administrator', 'creator'].includes(member.status);
  } catch {
    return false;
  }
}

async function commandRequiresPrivate(bot, msg) {
  if (!isGroupChat(msg.chat)) return false;
  await redirectToPrivate(bot, msg);
  return true;
}

function shouldBlockSensitiveCallback(data) {
  return /^(menu_(wallet|buy|sell|private_buy|shield|mev|receipts|portfolio|settings|pdao|fees|free_access|referral|community|tour|admin|zk|tools|discover|limit_orders|sniper)|wallet_|buy_|trade_|sell_|strategy:|strategy_launch:|quote:|limit_)/.test(String(data || ''));
}

function botOpsSnapshot() {
  const live = getLiveTradingStatus();
  const control = readTradingControl();
  return {
    paused: Boolean(control.paused),
    pauseReason: control.reason || null,
    liveEnabled: live.enabled,
    liveReasons: live.reasons || [],
    activeStrategies: getActiveStrategyCount(),
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
  };
}

async function toggleCommunitySetting(bot, msg, key) {
  const group = await ensureCommunityGroup(bot, msg).catch(() => null);
  if (!group) {
    return bot.sendMessage(msg.chat.id, 'Community settings are available only for a registered group.');
  }
  const current = group[key] !== false;
  const updates = {};
  updates[key] = !current;
  if (key === 'notify_pdao') updates.status = updates[key] ? 'active' : 'paused';
  const updated = await setCommunityGroupSettings(msg.chat.id, updates).catch(() => null);
  await recordCommunityEvent({
    chat_id: msg.chat.id,
    telegram_id: msg.from?.id || null,
    event_type: `community_toggle_${key}`,
    payload: JSON.stringify({ enabled: updates[key] }),
  }).catch(() => null);
  return updated;
}

async function showCommunityControlCenter(bot, msg) {
  if (!isGroupChat(msg.chat)) {
    const text =
`⚙️ PrivateDAO Community Control Center

Community controls run inside the live group.

Open the community group and add the bot as admin, then use:
- Broadcast toggle
- Welcome toggle
- Anti-spam toggle

Current community: @${DEFAULT_COMMUNITY_HANDLE}`;
    return bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 Open Community', url: `https://t.me/${DEFAULT_COMMUNITY_HANDLE}` }],
          [{ text: '🚀 Open Private Chat', url: await privateChatUrl(bot, 'community') }],
          [{ text: '← Main Menu', callback_data: 'menu_home' }],
        ],
      },
    });
  }

  const group = await ensureCommunityGroup(bot, msg).catch(() => null);
  const title = group?.title || msg.chat?.title || `@${DEFAULT_COMMUNITY_HANDLE}`;
  const username = group?.username ? `@${group.username}` : `@${DEFAULT_COMMUNITY_HANDLE}`;
  const text =
`⚙️ PrivateDAO Community Control Center

Group: ${title}
Handle: ${username}
Broadcasts: ${group?.notify_pdao ? 'on' : 'off'}
Welcome: ${group?.welcome_enabled ? 'on' : 'off'}
Anti-spam: ${group?.anti_spam_enabled ? 'on' : 'off'}

Use this panel to run the community cleanly while all trading stays in private chat.`;
  return bot.sendMessage(msg.chat.id, text, { reply_markup: groupControlKeyboard(bot, group) });
}

async function handleGroupCallback(bot, query) {
  const msg = query.message;
  if (!msg || !isGroupChat(msg.chat)) return false;
  if (String(query.data || '') === 'community_admin_panel') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only group admins can change community settings.', show_alert: false }).catch(() => null);
      return true;
    }
    await showCommunityControlCenter(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'admin_dashboard') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0)) && !isOwnerTelegramId(query.from?.id)) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can view the dashboard.', show_alert: false }).catch(() => null);
      return true;
    }
    await showAdminDashboard(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'admin_promos_generate_1d') {
    if (!(await canViewAdmin(bot, msg))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can generate promo codes.', show_alert: false }).catch(() => null);
      return true;
    }
    await generatePromoPack({ oneDay: PROMO_PACK_ONE_DAY, threeDay: 0 });
    await bot.sendMessage(msg.chat.id, `Generated ${PROMO_PACK_ONE_DAY} one-day promo codes.`);
    await showAdminPromos(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'admin_promos_generate_3d') {
    if (!(await canViewAdmin(bot, msg))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can generate promo codes.', show_alert: false }).catch(() => null);
      return true;
    }
    await generatePromoPack({ oneDay: 0, threeDay: PROMO_PACK_THREE_DAY });
    await bot.sendMessage(msg.chat.id, `Generated ${PROMO_PACK_THREE_DAY} three-day promo codes.`);
    await showAdminPromos(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'admin_emergency_stop') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0)) && !isOwnerTelegramId(query.from?.id)) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can pause trading.', show_alert: false }).catch(() => null);
      return true;
    }
    await pauseAllTrading(bot, msg, 'group_admin_emergency_stop');
    return true;
  }
  if (String(query.data || '') === 'admin_emergency_resume') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0)) && !isOwnerTelegramId(query.from?.id)) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can resume trading.', show_alert: false }).catch(() => null);
      return true;
    }
    await resumeAllTrading(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'admin_stop_all') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0)) && !isOwnerTelegramId(query.from?.id)) {
      await bot.answerCallbackQuery(query.id, { text: 'Only the owner or a group admin can stop strategies.', show_alert: false }).catch(() => null);
      return true;
    }
    await stopAllTradingNow(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'community_status') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only group admins can view controls.', show_alert: false }).catch(() => null);
      return true;
    }
    await handleCommunityStatus(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'community_toggle_notify') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only group admins can change broadcasts.', show_alert: false }).catch(() => null);
      return true;
    }
    await toggleCommunitySetting(bot, msg, 'notify_pdao');
    await showCommunityControlCenter(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'community_toggle_welcome') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only group admins can change welcomes.', show_alert: false }).catch(() => null);
      return true;
    }
    await toggleCommunitySetting(bot, msg, 'welcome_enabled');
    await showCommunityControlCenter(bot, msg);
    return true;
  }
  if (String(query.data || '') === 'community_toggle_antispam') {
    if (!(await isAdmin(bot, msg.chat.id, query.from?.id || 0))) {
      await bot.answerCallbackQuery(query.id, { text: 'Only group admins can change anti-spam.', show_alert: false }).catch(() => null);
      return true;
    }
    await toggleCommunitySetting(bot, msg, 'anti_spam_enabled');
    await showCommunityControlCenter(bot, msg);
    return true;
  }
  if (!shouldBlockSensitiveCallback(query.data)) return false;
  await redirectToPrivate(bot, msg, 'Continue securely in Private Chat', 'community');
  await recordCommunityEvent({
    chat_id: msg.chat.id,
    telegram_id: query.from?.id || null,
    event_type: 'group_callback_redirect',
    payload: JSON.stringify({ data: query.data }),
  }).catch(() => null);
  return true;
}

async function ensureCommunityGroup(bot, msg) {
  if (!isGroupChat(msg.chat)) return null;
  const group = await getCommunityGroup(msg.chat.id).catch(() => null);
  if (group) return group;
  return upsertCommunityGroup({
    chat_id: msg.chat.id,
    title: msg.chat.title || null,
    username: msg.chat.username || null,
    created_by: msg.from?.id || null,
  }).catch(() => null);
}

async function communityStatsSnapshot() {
  const users = await supabase.from('users').select('telegram_id').catch(() => ({ data: [] }));
  const wallets = await supabase.from('bot_wallets').select('telegram_id, public_key').catch(() => ({ data: [] }));
  const logs = await supabase.from('trade_logs').select('telegram_id, token_mint, type, status, amount_sol, created_at').catch(() => ({ data: [] }));
  const promos = await supabase.from('promo_redemptions').select('telegram_id, code, free_days, redeemed_at').catch(() => ({ data: [] }));
  const referrals = await supabase.from('referral_events').select('inviter_telegram_id, invited_telegram_id, created_at').catch(() => ({ data: [] }));
  const communityEvents = await supabase.from('community_events').select('event_type, created_at').catch(() => ({ data: [] }));
  const groups = await listCommunityGroups().catch(() => []);
  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const startTs = startOfDay.toISOString();
  const buyers = (logs.data || []).filter((row) => row.type === 'buy' && row.status === 'success' && String(row.created_at || '') >= startTs);
  const pdaoBuys = buyers.filter((row) => row.token_mint === PDAO_MINT);
  const volume = buyers.reduce((sum, row) => sum + Number(row.amount_sol || 0), 0);
  return {
    totalUsers: (users.data || []).length,
    activeWallets: (wallets.data || []).length,
    todayBuyers: new Set(buyers.map((row) => row.telegram_id)).size,
    todayVolumeSol: volume,
    pdaoBuys: pdaoBuys.length,
    communityJoins: (communityEvents.data || []).filter((row) => row.event_type === 'member_joined').length,
    referralUsage: (referrals.data || []).length,
    promoUsage: (promos.data || []).length,
    communityGroups: (groups || []).length,
  };
}

async function showAdminDashboard(bot, msg) {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id,
      `👀 PrivateDAO Admin\n\n` +
      `This area is for the owner or a group administrator.\n` +
      `If you manage the community, open the group where the bot is admin and try again.`,
      { reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community') }
    );
  }
  const stats = await communityStatsSnapshot().catch(() => null);
  const ops = botOpsSnapshot();
  const ownerBadge = isOwnerTelegramId(msg.from?.id) ? 'Owner access: on' : 'Owner access: off';
  const text =
`💡 PrivateDAO Admin Dashboard

${ownerBadge}
Bot status: ${ops.paused ? 'PAUSED' : 'RUNNING'}
Live gate: ${ops.liveEnabled ? 'ON' : 'OFF'}
Paused reason: ${ops.pauseReason || 'none'}
Active strategies: ${ops.activeStrategies}
PID: ${ops.pid}
Uptime: ${ops.uptimeSeconds}s
Node: ${ops.nodeVersion}

${stats ? `Total users: ${stats.totalUsers}
Active wallets: ${stats.activeWallets}
Today buyers: ${stats.todayBuyers}
Today volume: ${stats.todayVolumeSol.toFixed(4)} SOL
PDAO buys: ${stats.pdaoBuys}
Community joins: ${stats.communityJoins}
Referral usage: ${stats.referralUsage}
Promo usage: ${stats.promoUsage}
Community groups: ${stats.communityGroups}` : 'Stats unavailable right now.'}

GoldRush pricing: intel ${GOLDRUSH_PRICING.market_intel} SOL | discovery ${GOLDRUSH_PRICING.token_discovery} SOL | preflight ${GOLDRUSH_PRICING.trade_preflight} SOL

Emergency actions remain private and wallet-safe.`;
  return bot.sendMessage(msg.chat.id, text, { reply_markup: { inline_keyboard: [
    [{ text: '⏸ Pause Trading', callback_data: 'admin_emergency_stop' }, { text: '▶ Resume Trading', callback_data: 'admin_emergency_resume' }],
    [{ text: '🧹 Stop All Strategies', callback_data: 'admin_stop_all' }, { text: '📊 Refresh', callback_data: 'admin_dashboard' }],
    [{ text: '📣 Broadcast Update', callback_data: 'admin_broadcast' }, { text: '👥 Community Groups', callback_data: 'admin_groups' }],
    [{ text: '🎯 Promo Codes', callback_data: 'admin_promos' }, { text: '🎥 Welcome Script', callback_data: 'admin_announce' }],
    [{ text: '🚀 Open Private Chat', url: await privateChatUrl(bot, 'community') }],
  ] }});
}

function randomPromoCode(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function generatePromoPack(options = {}) {
  const oneDay = Number(options.oneDay || 0);
  const threeDay = Number(options.threeDay || 0);
  const codes = [];
  for (let i = 0; i < oneDay; i += 1) {
    codes.push(createPromoCode({ code: randomPromoCode('PDAO1'), freeDays: 1, feeDiscountPercent: 0 }));
  }
  for (let i = 0; i < threeDay; i += 1) {
    codes.push(createPromoCode({ code: randomPromoCode('PDAO3'), freeDays: 3, feeDiscountPercent: 0 }));
  }
  return { oneDay, threeDay, total: codes.length, codes };
}

async function showAdminPromos(bot, msg) {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id, 'Only the owner or a group admin can manage promo codes.', {
      reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community'),
    });
  }
  const codes = listPromoCodes().slice(-20);
  return bot.sendMessage(msg.chat.id,
    `🎟 Promo Code Center\n\n` +
    `Generate one-time codes from the admin side only.\n` +
    `Use them for free access or a short private invite window.\n\n` +
    `Recent codes:\n` +
    `${codes.length ? codes.map((row) => `• ${row.code} (${row.freeDays}d, ${row.feeDiscountPercent}% off)`).join('\n') : 'No promo codes generated yet.'}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Generate 1-Day Pack', callback_data: 'admin_promos_generate_1d' }],
          [{ text: '➕ Generate 3-Day Pack', callback_data: 'admin_promos_generate_3d' }],
          [{ text: '📊 Dashboard', callback_data: 'admin_dashboard' }],
          [{ text: '🚀 Open Private Chat', url: await privateChatUrl(bot, 'community') }],
        ],
      },
    }
  );
}

async function pauseAllTrading(bot, msg, reason = 'owner_emergency_stop') {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id, 'Only the owner or a group admin can change trading state.');
  }
  setTradingPaused(true, reason, msg.from?.id || null);
  await stopAllStrategies((text, opts) => bot.sendMessage(msg.chat.id, text, opts), true).catch(() => null);
  return showAdminDashboard(bot, msg);
}

async function resumeAllTrading(bot, msg) {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id, 'Only the owner or a group admin can change trading state.');
  }
  setTradingPaused(false, null, msg.from?.id || null);
  return showAdminDashboard(bot, msg);
}

async function stopAllTradingNow(bot, msg) {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id, 'Only the owner or a group admin can stop strategies.');
  }
  await stopAllStrategies((text, opts) => bot.sendMessage(msg.chat.id, text, opts), true).catch(() => null);
  return showAdminDashboard(bot, msg);
}

async function broadcastCommunityUpdate(bot, text, options = {}) {
  const users = await supabase
    .from('users')
    .select('telegram_id, username')
    .order('telegram_id', { ascending: true })
    .catch(() => ({ data: [] }));
  const audience = Array.isArray(users?.data) ? users.data : [];
  let sent = 0;
  let failed = 0;
  for (const user of audience) {
    if (!user?.telegram_id) continue;
    try {
      await bot.sendMessage(
        user.telegram_id,
        `📣 PrivateDAO Update\n\n${text}`,
        {
          reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community'),
          disable_web_page_preview: true,
          ...options,
        }
      );
      sent += 1;
      if (sent % 25 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch {
      failed += 1;
    }
  }
  await recordCommunityEvent({
    chat_id: null,
    telegram_id: null,
    event_type: 'admin_broadcast',
    payload: JSON.stringify({ sent, failed, text: String(text || '').slice(0, 400) }),
  }).catch(() => null);
  return { sent, failed };
}

async function toggleCommunityGroup(bot, chatId, enabled) {
  const group = await getCommunityGroup(chatId).catch(() => null);
  if (!group) return null;
  return setCommunityGroupSettings(chatId, { notify_pdao: enabled, status: enabled ? 'active' : 'paused' });
}

async function syncCommunityGroup(bot, msg) {
  if (!isGroupChat(msg.chat)) return null;
  return ensureCommunityGroup(bot, msg);
}

async function handleCommunityToggle(bot, msg, enabled) {
  if (!isGroupChat(msg.chat)) {
    return bot.sendMessage(msg.chat.id, 'Community controls are for groups only.');
  }
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id, 'Only group admins can change community settings.');
  }
  await syncCommunityGroup(bot, msg);
  await toggleCommunityGroup(bot, msg.chat.id, enabled);
  await recordCommunityEvent({
    chat_id: msg.chat.id,
    telegram_id: msg.from.id,
    event_type: enabled ? 'community_enabled' : 'community_disabled',
    payload: JSON.stringify({ title: msg.chat.title || null }),
  }).catch(() => null);
  return bot.sendMessage(msg.chat.id,
    enabled
      ? 'Community PDAO notifications are now on.'
      : 'Community PDAO notifications are now off.'
  );
}

async function handleCommunityStatus(bot, msg) {
  if (!(await canViewAdmin(bot, msg))) {
    return bot.sendMessage(msg.chat.id,
      `👥 Community status\n\n` +
      `This view is available to the owner or group admins only.`,
      { reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community') }
    );
  }
  const group = await getCommunityGroup(msg.chat.id).catch(() => null);
  const stats = await communityStatsSnapshot().catch(() => null);
  return bot.sendMessage(msg.chat.id,
    `👥 Community status\n\n` +
    `Group: ${group?.title || msg.chat.title || 'unknown'}\n` +
    `Broadcasts: ${group?.notify_pdao ? 'on' : 'off'}\n` +
    `Anti-spam: ${group?.anti_spam_enabled ? 'on' : 'off'}\n` +
    `Welcome: ${group?.welcome_enabled ? 'on' : 'off'}\n\n` +
    (stats ? `Today buyers: ${stats.todayBuyers}\nCommunity groups: ${stats.communityGroups}` : 'Stats unavailable.'),
    { reply_markup: await openPrivateKeyboard(bot, 'Open Private Chat', 'community') }
  );
}

async function broadcastPdaoBuy(bot, payload) {
  const groups = await listCommunityGroups().catch(() => []);
  if (!groups.length) return { sent: 0, skipped: 0 };

  const market = payload.market || await getTokenMarketSummary(PDAO_MINT).catch(() => null);
  const amount = payload.amountSol || payload.amount || 0;
  const usdValue = payload.usdValue || payload.valueUsd || null;
  const tokenReceived = payload.tokenReceived || payload.receivedAmount || null;
  const txs = Array.isArray(payload.txs) ? payload.txs : [];
  const now = Date.now();
  let sent = 0;
  let skipped = 0;
  const heroImage = [
    path.join(__dirname, '..', 'artifacts', 'marketing', 'pdao-logo.png'),
    path.join(__dirname, '..', 'artifacts', 'marketing', 'scene-01.png'),
    path.join(__dirname, '..', 'artifacts', 'marketing', 'scene-04.png'),
    path.join(__dirname, '..', 'artifacts', 'marketing', 'scene-05.png'),
  ].find((candidate) => fs.existsSync(candidate));

  for (const group of groups) {
    if (!group.notify_pdao) {
      skipped += 1;
      continue;
    }
    const last = group.last_notified_at ? new Date(group.last_notified_at).getTime() : 0;
    if (last && now - last < BUNDLE_COOLDOWN_MS) {
      skipped += 1;
      continue;
    }
    const tokenPage = 'https://privatedao.org/token/';
    const website = 'https://privatedao.org';
    const xUrl = 'https://x.com/PrivateDAOOS';
    const privateTradeUrl = await privateChatUrl(bot, 'community');
    const dexUrl = `https://jup.ag/swap/SOL-${PDAO_MINT}`;
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🟢 Buy', url: privateTradeUrl },
          { text: '🌐 Website', url: website },
          { text: '🪙 PDAO DEX', url: dexUrl },
        ],
        [
          { text: '🧾 Token Page', url: tokenPage },
          { text: '𝕏 @PrivateDAOOS', url: xUrl },
        ],
        [
          { text: '🚀 Open Private Chat', url: privateTradeUrl },
        ],
      ],
    };
    const marketCap = market?.marketCap ? `$${Number(market.marketCap).toLocaleString('en-US')}` : 'n/a';
    const holders = market?.holders || market?.holderCount || 'n/a';
    const curveHealthPct = Array.isArray(market?.safetySignals) && market.safetySignals.length
      ? `${Math.round((market.safetyScore / market.safetySignals.length) * 100)}%`
      : market?.bondingCurve
        ? 'live'
        : 'unknown';
    const bondingCurve = Array.isArray(market?.safetySignals)
      ? `${market.safetyScore || 0}/${market.safetySignals.length}`
      : market?.bondingCurve
        ? 'active'
        : 'unknown';
    const tokenName = market?.symbol || 'PDAO';
    const tokenLabel = market?.name || 'PrivateDAO';
    const fillPct = market?.bondingCurveFill != null
      ? Math.max(0, Math.min(100, Number(market.bondingCurveFill)))
      : market?.bondingCurveProgress != null
        ? Math.max(0, Math.min(100, Number(market.bondingCurveProgress)))
        : null;
    const barFilled = fillPct == null ? '██████████' : '█'.repeat(Math.max(1, Math.round(fillPct / 10))).padEnd(10, '░');
    const nowLabel = new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const text =
`🚀 *NEW BUY!*  ${tokenLabel} (${tokenName})

*PrivateDAO* [${PDAO_MINT.slice(0, 4)}...]

*Bonding Curve Fill:* ${fillPct == null ? 'n/a' : `${fillPct.toFixed(1)}%`}
\`${barFilled}\`

*${Number(amount || 0).toFixed(4)} SOL*  ${usdValue ? `($${Number(usdValue).toLocaleString('en-US')})` : ''}
*Got:* ${tokenReceived || tokenName}
*Holders:* ${holders}
*Market Cap:* ${marketCap}
*Curve:* ${bondingCurve}
*Live:* ${curveHealthPct}
*Time:* ${nowLabel}

*Token:* \`${PDAO_MINT}\`
*Links:* Website | X | Token Page | DEX

PrivateDAO execution stayed private. Alerts are community-only.`;
    try {
      if (heroImage) {
        await bot.sendPhoto(group.chat_id, heroImage, {
          caption: text,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } else {
        await bot.sendMessage(group.chat_id, text, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      }
      await setCommunityGroupSettings(group.chat_id, { last_notified_at: new Date().toISOString() }).catch(() => null);
      sent += 1;
    } catch {
      skipped += 1;
    }
  }
  return { sent, skipped };
}

async function communityGroupEnabled(chatId) {
  const group = await getCommunityGroup(chatId).catch(() => null);
  return Boolean(group?.notify_pdao && group?.status === 'active');
}

async function shouldShowCommunityPrivateLink(bot, msg) {
  return redirectToPrivate(bot, msg);
}

module.exports = {
  isGroupChat,
  isPrivateChat,
  isOwnerTelegramId,
  getBotUsername,
  privateChatUrl,
  openPrivateKeyboard,
  onGroupMessage,
  onGroupLifecycle,
  redirectToPrivate,
  commandRequiresPrivate,
  handleGroupCallback,
  ensureCommunityGroup,
  isAdmin,
  communityStatsSnapshot,
  broadcastPdaoBuy,
  communityGroupEnabled,
  shouldShowCommunityPrivateLink,
  showAdminDashboard,
  showAdminPromos,
  showCommunityControlCenter,
  toggleCommunityGroup,
  syncCommunityGroup,
  handleCommunityToggle,
  handleCommunityStatus,
  pauseAllTrading,
  resumeAllTrading,
  stopAllTradingNow,
  broadcastCommunityUpdate,
  generatePromoPack,
};
