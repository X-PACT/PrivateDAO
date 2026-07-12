const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { walletFingerprint, createWalletUuid } = require('../trading/wallet');
require('dotenv').config();

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
let realtimeTransport = globalThis.WebSocket;
try {
  realtimeTransport = realtimeTransport || require('ws');
  global.WebSocket = global.WebSocket || realtimeTransport;
  globalThis.WebSocket = globalThis.WebSocket || realtimeTransport;
} catch {
  realtimeTransport = null;
}

const memoryDb = {
  users: [],
  bot_wallets: [],
  archived_bot_wallets: [],
  connected_wallets: [],
  trading_sessions: [],
  trade_logs: [],
  trial_records: [],
  subscriptions: [],
  promo_redemptions: [],
  referral_events: [],
  pnl_records: [],
  community_groups: [],
  community_events: [],
  community_mutes: [],
};

const promoRedemptionCachePath = path.join(__dirname, '..', 'data', 'promo-redemptions-cache.json');

function readPromoRedemptionCache() {
  try {
    if (!fs.existsSync(promoRedemptionCachePath)) return [];
    const raw = fs.readFileSync(promoRedemptionCachePath, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePromoRedemptionCache(rows) {
  try {
    fs.mkdirSync(path.dirname(promoRedemptionCachePath), { recursive: true });
    fs.writeFileSync(promoRedemptionCachePath, JSON.stringify(rows, null, 2));
  } catch {
    // Local fallback should never break trading.
  }
}

function mergePromoRedemptionCache(entry) {
  const rows = readPromoRedemptionCache();
  const next = rows.filter((row) => {
    if (entry.wallet_public_key && row.wallet_public_key && String(row.wallet_public_key) === String(entry.wallet_public_key)) return false;
    return !(String(row.telegram_id) === String(entry.telegram_id) && String(row.code) === String(entry.code));
  });
  next.push(entry);
  writePromoRedemptionCache(next);
  return entry;
}

function match(row, filters) {
  return filters.every((filter) => {
    if (filter.op === 'eq') return String(row[filter.key]) === String(filter.value);
    if (filter.op === 'gt') return Number(row[filter.key] || 0) > Number(filter.value);
    if (filter.op === 'or') {
      return filter.value.split(',').some((expr) => {
        const [key, op, value] = expr.split('.');
        return op === 'eq' && String(row[key]) === String(value);
      });
    }
    return true;
  });
}

class MemoryQuery {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.mode = 'select';
    this.payload = null;
    this.limitCount = null;
    this.orderKey = null;
    this.ascending = true;
  }

  select() { this.mode = this.mode || 'select'; return this; }
  eq(key, value) { this.filters.push({ op: 'eq', key, value }); return this; }
  gt(key, value) { this.filters.push({ op: 'gt', key, value }); return this; }
  or(value) { this.filters.push({ op: 'or', value }); return this; }
  limit(count) { this.limitCount = count; return this; }
  order(key, opts = {}) { this.orderKey = key; this.ascending = opts.ascending !== false; return this; }
  insert(payload) { this.mode = 'insert'; this.payload = payload; return this; }
  upsert(payload) { this.mode = 'upsert'; this.payload = payload; return this; }
  update(payload) { this.mode = 'update'; this.payload = payload; return this; }
  delete() { this.mode = 'delete'; return this; }

  async single() {
    const result = await this._execute();
    if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
      return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
    }
    return { data: Array.isArray(result.data) ? result.data[0] : result.data, error: null };
  }

  async maybeSingle() {
    const result = await this._execute();
    return { data: Array.isArray(result.data) ? (result.data[0] || null) : result.data, error: null };
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    const rows = memoryDb[this.table] || (memoryDb[this.table] = []);

    if (this.mode === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const item of items) rows.push({ ...item });
      return { data: items, error: null };
    }

    if (this.mode === 'upsert') {
      const item = { ...this.payload };
      const key = item.telegram_id !== undefined ? 'telegram_id' : 'id';
      const idx = rows.findIndex((row) => String(row[key]) === String(item[key]));
      if (idx >= 0) rows[idx] = { ...rows[idx], ...item };
      else rows.push(item);
      return { data: item, error: null };
    }

    if (this.mode === 'update') {
      const matched = rows.filter((row) => match(row, this.filters));
      for (const row of matched) Object.assign(row, this.payload);
      return { data: matched, error: null };
    }

    if (this.mode === 'delete') {
      const matched = rows.filter((row) => match(row, this.filters));
      memoryDb[this.table] = rows.filter((row) => !match(row, this.filters));
      return { data: matched, error: null };
    }

    let data = rows.filter((row) => match(row, this.filters));
    if (this.orderKey) {
      data = data.sort((a, b) => {
        const av = a[this.orderKey] || '';
        const bv = b[this.orderKey] || '';
        return this.ascending ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    if (this.limitCount !== null) data = data.slice(0, this.limitCount);
    return { data, error: null };
  }
}

const supabase = hasSupabase
  ? createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    realtimeTransport ? { realtime: { transport: realtimeTransport } } : undefined
  )
  : { from: (table) => new MemoryQuery(table), __memory: true };

// ─── Users ────────────────────────────────────────────────────────────────────
async function getOrCreateUser(telegramId, username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ telegram_id: telegramId, username })
      .select()
      .single();
    return newUser;
  }
  return data;
}

async function updateUser(telegramId, updates) {
  const { data } = await supabase
    .from('users')
    .update(updates)
    .eq('telegram_id', telegramId)
    .select()
    .single();
  return data;
}

// ─── Bot Wallets (custodial) ──────────────────────────────────────────────────
async function saveBotWallet(telegramId, publicKey, encryptedPrivateKey, options = {}) {
  const existing = await getBotWallet(telegramId);
  const allowReplace = options.allowReplace === true;
  const replacementReason = String(options.replacementReason || '').trim();
  const isSameWallet = existing && existing.public_key === publicKey;
  const wallet_uuid = isSameWallet
    ? (existing.wallet_uuid || options.walletUuid || createWalletUuid())
    : (options.walletUuid || createWalletUuid());
  const wallet_fingerprint = isSameWallet
    ? (existing.wallet_fingerprint || walletFingerprint(publicKey))
    : walletFingerprint(publicKey);

  if (existing && existing.public_key !== publicKey && !allowReplace) {
    throw new Error(
      `Refusing to replace existing bot wallet for telegram_id=${telegramId}. ` +
      `Existing public key: ${existing.public_key}. Requested public key: ${publicKey}.`
    );
  }

  if (existing && existing.public_key !== publicKey && allowReplace && !replacementReason) {
    throw new Error('Bot wallet replacement requires an explicit replacementReason');
  }

  if (existing && existing.public_key !== publicKey && allowReplace) {
    await archiveBotWallet(telegramId, replacementReason);
  }

  const { data, error } = await supabase
    .from('bot_wallets')
    .upsert(
      {
        telegram_id: telegramId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        wallet_uuid,
        wallet_fingerprint,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id' }
    )
    .select('*')
    .single();
  if (error) throw new Error(formatWalletSchemaError(error, 'Could not persist bot wallet'));
  if (!data || data.public_key !== publicKey) {
    throw new Error('Could not verify persisted bot wallet');
  }
  return data;
}

async function getBotWallet(telegramId) {
  const { data, error } = await supabase
    .from('bot_wallets')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(`Could not load bot wallet: ${error.message}`);
  return data;
}

async function archiveBotWallet(telegramId, reason = 'wallet_rotation') {
  const existing = await getBotWallet(telegramId);
  if (!existing) return null;
  const archived = {
    telegram_id: telegramId,
    public_key: existing.public_key,
    encrypted_private_key: existing.encrypted_private_key,
    wallet_uuid: existing.wallet_uuid || createWalletUuid(),
    wallet_fingerprint: existing.wallet_fingerprint || walletFingerprint(existing.public_key),
    archived_at: new Date().toISOString(),
    archive_reason: reason,
  };
  const { error } = await supabase.from('archived_bot_wallets').insert(archived);
  if (error) throw new Error(formatWalletSchemaError(error, 'Could not archive bot wallet'));
  return archived;
}

async function listArchivedBotWallets(telegramId) {
  const { data, error } = await supabase
    .from('archived_bot_wallets')
    .select('*')
    .eq('telegram_id', telegramId)
    .order('archived_at', { ascending: false })
    .limit(20);
  if (error) throw new Error(formatWalletSchemaError(error, 'Could not load archived bot wallets'));
  return data || [];
}

function walletSchemaSqlInstructions() {
  return [
    "alter table bot_wallets add column if not exists wallet_uuid uuid default gen_random_uuid();",
    "alter table bot_wallets add column if not exists wallet_fingerprint text;",
    "alter table bot_wallets add column if not exists status text default 'active';",
    "alter table bot_wallets add column if not exists updated_at timestamptz default now();",
    "create table if not exists archived_bot_wallets (",
    "  id bigserial primary key,",
    "  telegram_id bigint not null references users(telegram_id),",
    "  public_key text not null,",
    "  encrypted_private_key text not null,",
    "  wallet_uuid uuid,",
    "  wallet_fingerprint text,",
    "  archived_at timestamptz default now(),",
    "  archive_reason text",
    ");",
    "create index if not exists idx_archived_bot_wallets_telegram on archived_bot_wallets(telegram_id);",
  ].join('\n');
}

function formatWalletSchemaError(error, prefix) {
  const message = error?.message || String(error || '');
  if (/wallet_uuid|wallet_fingerprint|status|updated_at|archived_bot_wallets|column|relation/i.test(message)) {
    return `${prefix}: Supabase wallet schema is missing required columns/table. Run:\n${walletSchemaSqlInstructions()}`;
  }
  return `${prefix}: ${message}`;
}

// ─── Connected Wallets (non-custodial) ───────────────────────────────────────
async function saveConnectedWallet(telegramId, publicKey) {
  await supabase
    .from('connected_wallets')
    .upsert({ telegram_id: telegramId, public_key: publicKey, connected_at: new Date().toISOString() });
}

async function getConnectedWallet(telegramId) {
  const { data } = await supabase
    .from('connected_wallets')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  return data;
}

// ─── Trading Sessions ─────────────────────────────────────────────────────────
async function saveSession(telegramId, strategyName, config) {
  await supabase
    .from('trading_sessions')
    .upsert({
      telegram_id: telegramId,
      strategy: strategyName,
      config,
      is_active: false,
      created_at: new Date().toISOString(),
    });
}

async function getSession(telegramId) {
  const { data } = await supabase
    .from('trading_sessions')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  return data;
}

async function setSessionActive(telegramId, isActive) {
  await supabase
    .from('trading_sessions')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('telegram_id', telegramId);
}

// ─── Growth Access: Promo Codes & Referrals ──────────────────────────────────
async function getSubscription(telegramId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(`Could not load subscription: ${error.message}`);
  return data;
}

async function upsertSubscriptionAccess(telegramId, updates) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      telegram_id: telegramId,
      updated_at: new Date().toISOString(),
      ...updates,
    }, { onConflict: 'telegram_id' })
    .select('*')
    .single();
  if (error) throw new Error(formatGrowthSchemaError(error, 'Could not update access'));
  return data;
}

async function recordPromoRedemption(redemption) {
  const payload = {
    ...redemption,
    redeemed_at: redemption.redeemed_at || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('promo_redemptions')
    .insert(payload)
    .select('*')
    .single();
  if (!error) return data;
  if (/promo_redemptions|wallet_public_key|column|relation/i.test(error?.message || '')) {
    return mergePromoRedemptionCache(payload);
  }
  throw new Error(formatGrowthSchemaError(error, 'Could not record promo redemption'));
}

async function findPromoRedemption(telegramId, code) {
  const { data, error } = await supabase
    .from('promo_redemptions')
    .select('*')
    .eq('telegram_id', telegramId)
    .eq('code', code)
    .maybeSingle();
  if (!error && data) return data;
  if (error && !/promo_redemptions|wallet_public_key|column|relation/i.test(error?.message || '')) {
    throw new Error(formatGrowthSchemaError(error, 'Could not read promo redemption'));
  }
  return readPromoRedemptionCache().find((row) => String(row.telegram_id) === String(telegramId) && String(row.code) === String(code)) || null;
}

async function findPromoRedemptionByCode(code) {
  const { data, error } = await supabase
    .from('promo_redemptions')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  if (!error && data) return data;
  if (error && !/promo_redemptions|wallet_public_key|column|relation/i.test(error?.message || '')) {
    throw new Error(formatGrowthSchemaError(error, 'Could not read promo redemption by code'));
  }
  return readPromoRedemptionCache().find((row) => String(row.code) === String(code)) || null;
}

async function findPromoRedemptionByWallet(walletPublicKey) {
  const { data, error } = await supabase
    .from('promo_redemptions')
    .select('*')
    .eq('wallet_public_key', walletPublicKey)
    .maybeSingle();
  if (!error && data) return data;
  if (error && !/promo_redemptions|wallet_public_key|column|relation/i.test(error?.message || '')) {
    throw new Error(formatGrowthSchemaError(error, 'Could not read promo redemption by wallet'));
  }
  return readPromoRedemptionCache().find((row) => String(row.wallet_public_key || '') === String(walletPublicKey)) || null;
}

async function recordReferralEvent(event) {
  const { data, error } = await supabase
    .from('referral_events')
    .insert({
      ...event,
      created_at: event.created_at || new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(formatGrowthSchemaError(error, 'Could not record referral'));
  return data;
}

async function findReferralEvent(inviterTelegramId, invitedTelegramId) {
  const { data, error } = await supabase
    .from('referral_events')
    .select('*')
    .eq('inviter_telegram_id', inviterTelegramId)
    .eq('invited_telegram_id', invitedTelegramId)
    .maybeSingle();
  if (error) throw new Error(formatGrowthSchemaError(error, 'Could not read referral'));
  return data;
}

// ─── Community Groups, Broadcasts, and Moderation ───────────────────────────
async function upsertCommunityGroup(group) {
  const payload = {
    chat_id: group.chat_id,
    title: group.title || null,
    username: group.username || null,
    created_by: group.created_by || null,
    status: group.status || 'active',
    notify_pdao: group.notify_pdao !== false,
    welcome_enabled: group.welcome_enabled !== false,
    anti_spam_enabled: group.anti_spam_enabled !== false,
    raid_template: group.raid_template || null,
    last_notified_at: group.last_notified_at || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('community_groups')
    .upsert(payload, { onConflict: 'chat_id' })
    .select('*')
    .single();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not update community group'));
  return data;
}

async function getCommunityGroup(chatId) {
  const { data, error } = await supabase
    .from('community_groups')
    .select('*')
    .eq('chat_id', chatId)
    .maybeSingle();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not load community group'));
  return data;
}

async function listCommunityGroups() {
  const { data, error } = await supabase
    .from('community_groups')
    .select('*')
    .eq('status', 'active');
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not list community groups'));
  return data || [];
}

async function setCommunityGroupSettings(chatId, updates) {
  const { data, error } = await supabase
    .from('community_groups')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('chat_id', chatId)
    .select('*')
    .single();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not update community group settings'));
  return data;
}

async function recordCommunityEvent(event) {
  const { data, error } = await supabase
    .from('community_events')
    .insert({
      ...event,
      created_at: event.created_at || new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not record community event'));
  return data;
}

async function recordCommunityMute(mute) {
  const { data, error } = await supabase
    .from('community_mutes')
    .upsert({
      ...mute,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'chat_id,telegram_id' })
    .select('*')
    .single();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not record community mute'));
  return data;
}

async function getCommunityMute(chatId, telegramId) {
  const { data, error } = await supabase
    .from('community_mutes')
    .select('*')
    .eq('chat_id', chatId)
    .eq('telegram_id', telegramId)
    .maybeSingle();
  if (error) throw new Error(formatCommunitySchemaError(error, 'Could not load community mute'));
  return data;
}

async function clearExpiredCommunityMutes(chatId, telegramId) {
  const mute = await getCommunityMute(chatId, telegramId);
  if (!mute) return null;
  const until = mute.mute_until ? new Date(mute.mute_until) : null;
  if (until && until < new Date()) {
    await supabase.from('community_mutes').delete().eq('chat_id', chatId).eq('telegram_id', telegramId);
    return null;
  }
  return mute;
}

function communitySqlInstructions() {
  return [
    "create table if not exists community_groups (",
    "  chat_id bigint primary key,",
    "  title text,",
    "  username text,",
    "  created_by bigint,",
    "  status text not null default 'active',",
    "  notify_pdao boolean not null default true,",
    "  welcome_enabled boolean not null default true,",
    "  anti_spam_enabled boolean not null default true,",
    "  raid_template text,",
    "  last_notified_at timestamptz,",
    "  updated_at timestamptz default now(),",
    "  created_at timestamptz default now()",
    ");",
    "create table if not exists community_events (",
    "  id bigserial primary key,",
    "  chat_id bigint not null,",
    "  telegram_id bigint,",
    "  event_type text not null,",
    "  payload jsonb not null default '{}'::jsonb,",
    "  created_at timestamptz default now()",
    ");",
    "create index if not exists idx_community_events_chat on community_events(chat_id, created_at desc);",
    "create index if not exists idx_community_events_type on community_events(event_type, created_at desc);",
    "create table if not exists community_mutes (",
    "  chat_id bigint not null,",
    "  telegram_id bigint not null,",
    "  mute_until timestamptz not null,",
    "  reason text,",
    "  created_at timestamptz default now(),",
    "  updated_at timestamptz default now(),",
    "  unique (chat_id, telegram_id)",
    ");",
  ].join('\n');
}

function formatCommunitySchemaError(error, prefix) {
  const message = error?.message || String(error || '');
  if (/community_groups|community_events|community_mutes|column|relation/i.test(message)) {
    return `${prefix}: Supabase community schema is missing required columns/table. Run:\n${communitySqlInstructions()}`;
  }
  return `${prefix}: ${message}`;
}

function growthSqlInstructions() {
  return [
    "alter table subscriptions add column if not exists promo_code text;",
    "alter table subscriptions add column if not exists promo_expires_at timestamptz;",
    "alter table subscriptions add column if not exists referral_code text;",
    "alter table subscriptions add column if not exists access_reason text;",
    "create table if not exists promo_redemptions (",
    "  id bigserial primary key,",
    "  telegram_id bigint not null references users(telegram_id),",
    "  wallet_public_key text,",
    "  code text not null,",
    "  free_days integer not null default 0,",
    "  fee_discount_percent numeric not null default 0,",
    "  expires_at timestamptz not null,",
    "  redeemed_at timestamptz default now(),",
    "  unique (telegram_id, code)",
    ");",
    "create index if not exists idx_promo_redemptions_telegram on promo_redemptions(telegram_id);",
    "create index if not exists idx_promo_redemptions_code on promo_redemptions(code);",
    "create table if not exists referral_events (",
    "  id bigserial primary key,",
    "  inviter_telegram_id bigint not null references users(telegram_id),",
    "  invited_telegram_id bigint not null references users(telegram_id),",
    "  reward_days integer not null default 0,",
    "  welcome_days integer not null default 0,",
    "  created_at timestamptz default now(),",
    "  unique (inviter_telegram_id, invited_telegram_id)",
    ");",
    "create index if not exists idx_referral_events_inviter on referral_events(inviter_telegram_id);",
  ].join('\n');
}

function formatGrowthSchemaError(error, prefix) {
  const message = error?.message || String(error || '');
  if (/promo_|referral_|access_reason|subscriptions|promo_redemptions|referral_events|column|relation/i.test(message)) {
    return `${prefix}: Supabase growth access schema is missing required columns/table. Run:\n${growthSqlInstructions()}`;
  }
  return `${prefix}: ${message}`;
}

// ─── Trade Logs ───────────────────────────────────────────────────────────────
async function logTrade(telegramId, { strategy, type, tokenMint, amountSol, txSignature, status, error }) {
  await supabase.from('trade_logs').insert({
    telegram_id: telegramId,
    strategy,
    type,
    token_mint: tokenMint,
    amount_sol: amountSol,
    tx_signature: txSignature,
    status,
    error: error || null,
    created_at: new Date().toISOString(),
  });
}

module.exports = {
  supabase,
  hasSupabase,
  getOrCreateUser,
  updateUser,
  saveBotWallet,
  getBotWallet,
  archiveBotWallet,
  listArchivedBotWallets,
  walletSchemaSqlInstructions,
  growthSqlInstructions,
  saveConnectedWallet,
  getConnectedWallet,
  saveSession,
  getSession,
  setSessionActive,
  getSubscription,
  upsertSubscriptionAccess,
  recordPromoRedemption,
  findPromoRedemption,
  findPromoRedemptionByCode,
  findPromoRedemptionByWallet,
  recordReferralEvent,
  findReferralEvent,
  upsertCommunityGroup,
  getCommunityGroup,
  listCommunityGroups,
  setCommunityGroupSettings,
  recordCommunityEvent,
  recordCommunityMute,
  getCommunityMute,
  clearExpiredCommunityMutes,
  communitySqlInstructions,
  logTrade,
};
