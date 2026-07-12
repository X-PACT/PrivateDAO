const fs = require('fs');
const path = require('path');
const db = require('../db/supabase');
const { supabase } = db;
const { CREATOR_WALLET, PDAO_MINT } = require('../config/tradingPolicy');
const { getLiveTradingStatus } = require('../config/tradingPolicy');
const getSubscription = db.getSubscription || (async () => null);
const upsertSubscriptionAccess = db.upsertSubscriptionAccess || (async () => null);
const recordPromoRedemption = db.recordPromoRedemption || (async () => null);
const findPromoRedemption = db.findPromoRedemption || (async () => null);
const findPromoRedemptionByCode = db.findPromoRedemptionByCode || (async () => null);
const findPromoRedemptionByWallet = db.findPromoRedemptionByWallet || (async () => null);
const recordReferralEvent = db.recordReferralEvent || (async () => null);
const findReferralEvent = db.findReferralEvent || (async () => null);
const { GOLDRUSH_PRICING, goldrushPriceFor } = require('../config/intelligencePricing');

const TRIAL_HOURS = 24;
const MEME_STANDARD_FEE_PERCENT = Number(process.env.MEME_STANDARD_FEE_PERCENT || 8);
const PDAO_STANDARD_FEE_PERCENT = Number(process.env.PDAO_STANDARD_FEE_PERCENT || Math.max(1, Math.round(MEME_STANDARD_FEE_PERCENT * 0.5)));
const PNL_FEE_PERCENT = PDAO_STANDARD_FEE_PERCENT;
const PNL_FEE_PERCENT_ENCRYPTED = Number(process.env.ZK_PRIVATE_FEE_PERCENT || 15);
const DEFAULT_PROMO_DAYS = Number(process.env.DEFAULT_PROMO_DAYS || 3);
const REFERRAL_REWARD_DAYS = Number(process.env.REFERRAL_REWARD_DAYS || 3);
const REFERRAL_WELCOME_DAYS = Number(process.env.REFERRAL_WELCOME_DAYS || 3);
const DEFAULT_PROMO_CODES = process.env.PROMO_CODES || '';

function loadPromoCodesSource() {
  const file = String(process.env.PROMO_CODES_FILE || '').trim();
  if (file && fs.existsSync(file)) {
    return fs.readFileSync(file, 'utf8');
  }
  const repoFile = path.join(__dirname, '..', 'data', 'promo-codes.txt');
  if (fs.existsSync(repoFile)) {
    return fs.readFileSync(repoFile, 'utf8');
  }
  return DEFAULT_PROMO_CODES;
}

function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function parsePromoCodes(raw = loadPromoCodesSource()) {
  const map = new Map();
  const source = String(raw || '').trim();
  const items = source.includes('\n')
    ? source.split('\n')
    : source.split(',');
  for (const item of items) {
    const [rawCode, rawDays, rawDiscount] = item.split(':');
    const code = normalizePromoCode(rawCode);
    if (!code) continue;
    const freeDays = Math.max(0, Number(rawDays || DEFAULT_PROMO_DAYS));
    const feeDiscountPercent = Math.min(100, Math.max(0, Number(rawDiscount || 0)));
    if (freeDays > 0) map.set(code, { code, freeDays, feeDiscountPercent });
  }
  return map;
}

function createPromoCode({ code, freeDays = DEFAULT_PROMO_DAYS, feeDiscountPercent = 0 }) {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) throw new Error('Promo code is required.');
  const promo = {
    code: normalizedCode,
    freeDays: Math.max(1, Number(freeDays || DEFAULT_PROMO_DAYS)),
    feeDiscountPercent: Math.min(100, Math.max(0, Number(feeDiscountPercent || 0))),
  };
  const existing = parsePromoCodes();
  existing.set(promo.code, promo);
  const rows = [...existing.values()]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((row) => `${row.code}:${row.freeDays}:${row.feeDiscountPercent}`);
  const content = `${rows.join('\n')}\n`;
  const file = String(process.env.PROMO_CODES_FILE || '').trim() || path.join(__dirname, '..', 'data', 'promo-codes.txt');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  return promo;
}

function listPromoCodes() {
  return [...parsePromoCodes().values()];
}

function addDays(baseDate, days) {
  return new Date(baseDate.getTime() + Number(days || 0) * 24 * 60 * 60 * 1000);
}

function laterDate(a, b) {
  const da = a ? new Date(a) : null;
  const db = b ? new Date(b) : null;
  if (!da || Number.isNaN(da.getTime())) return db;
  if (!db || Number.isNaN(db.getTime())) return da;
  return da > db ? da : db;
}

// ─── Get user's chosen tier (standard vs encrypted) ──────────────────────────
async function getUserTier(telegramId) {
  const { data } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('telegram_id', telegramId)
    .single();
  return data?.tier || 'standard';
}

async function setUserTier(telegramId, tier) {
  if (!['standard', 'encrypted'].includes(tier)) throw new Error('Unknown tier');
  await supabase
    .from('subscriptions')
    .upsert({ telegram_id: telegramId, tier, updated_at: new Date().toISOString() });
}

function feePercentForTier(tier, tokenMint = PDAO_MINT) {
  if (tier === 'encrypted') return PNL_FEE_PERCENT_ENCRYPTED;
  return tokenMint === PDAO_MINT ? PDAO_STANDARD_FEE_PERCENT : MEME_STANDARD_FEE_PERCENT;
}

// ─── Check / Start Trial ─────────────────────────────────────────────────────
// Trial is keyed on BOTH telegram handle AND wallet address — using either
// a new handle or a previously-used wallet does not grant a second trial.
async function checkTrialStatus(telegramId, username, walletPublicKey) {
  const { data: existing } = await supabase
    .from('trial_records')
    .select('*')
    .or(`telegram_username.eq.${username},wallet_address.eq.${walletPublicKey}`)
    .order('started_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const startedAt = new Date(existing.started_at);
    const expiresAt = new Date(startedAt.getTime() + TRIAL_HOURS * 60 * 60 * 1000);
    const now = new Date();
    return {
      isActive: now < expiresAt,
      expiresAt,
      alreadyUsed: true,
    };
  }

  // First time seeing this handle+wallet combo — start trial now
  const startedAt = new Date();
  await supabase.from('trial_records').insert({
    telegram_id: telegramId,
    telegram_username: username,
    wallet_address: walletPublicKey,
    started_at: startedAt.toISOString(),
  });

  return {
    isActive: true,
    expiresAt: new Date(startedAt.getTime() + TRIAL_HOURS * 60 * 60 * 1000),
    alreadyUsed: false,
  };
}

// ─── Check if user has active paid subscription ──────────────────────────────
async function hasActiveSubscription(telegramId) {
  const data = await getSubscription(telegramId);
  if (!data?.is_active) return false;
  if (!data.promo_expires_at) return true;
  return new Date(data.promo_expires_at) > new Date();
}

// ─── Determine if user can trade right now ───────────────────────────────────
async function canTrade(telegramId, username, walletPublicKey) {
  const live = getLiveTradingStatus();
  if (!live.enabled) {
    return { allowed: false, reason: 'bot_paused', paused: true, liveReasons: live.reasons };
  }
  const trial = await checkTrialStatus(telegramId, username, walletPublicKey);
  if (trial.isActive) return { allowed: true, reason: 'trial', expiresAt: trial.expiresAt };

  const subscription = await getSubscription(telegramId);
  if (subscription?.is_active) {
    if (!subscription.promo_expires_at) return { allowed: true, reason: 'subscription' };
    const promoExpiresAt = new Date(subscription.promo_expires_at);
    if (promoExpiresAt > new Date()) {
      return {
        allowed: true,
        reason: subscription.access_reason || 'promo',
        expiresAt: promoExpiresAt,
        promoCode: subscription.promo_code || null,
      };
    }
  }

  return { allowed: false, reason: 'expired', expiresAt: trial.expiresAt };
}

async function redeemPromoCode(telegramId, username, rawCode, walletPublicKey = null) {
  const code = normalizePromoCode(rawCode);
  const promo = parsePromoCodes().get(code);
  if (!promo) throw new Error('Promo code is not active.');
  const walletKey = String(walletPublicKey || '').trim() || null;
  const existing = await findPromoRedemption(telegramId, code);
  const existingByCode = existing || await findPromoRedemptionByCode(code);
  const existingByWallet = walletKey ? await findPromoRedemptionByWallet(walletKey) : null;
  if (existingByCode || existingByWallet) {
    return {
      alreadyRedeemed: true,
      code,
      expiresAt: new Date((existingByCode || existingByWallet).expires_at),
      freeDays: Number((existingByCode || existingByWallet).free_days || 0),
      feeDiscountPercent: Number((existingByCode || existingByWallet).fee_discount_percent || 0),
    };
  }

  const current = await getSubscription(telegramId).catch(() => null);
  const start = laterDate(current?.promo_expires_at, new Date());
  const expiresAt = addDays(start, promo.freeDays);
  await upsertSubscriptionAccess(telegramId, {
    is_active: true,
    tier: current?.tier || 'standard',
    activated_at: current?.activated_at || new Date().toISOString(),
    promo_code: code,
    promo_expires_at: expiresAt.toISOString(),
    access_reason: 'promo',
  });
  await recordPromoRedemption({
    telegram_id: telegramId,
    wallet_public_key: walletKey,
    code,
    free_days: promo.freeDays,
    fee_discount_percent: promo.feeDiscountPercent,
    expires_at: expiresAt.toISOString(),
  });
  return {
    alreadyRedeemed: false,
    code,
    expiresAt,
    freeDays: promo.freeDays,
    feeDiscountPercent: promo.feeDiscountPercent,
    username: username || null,
  };
}

function referralCodeForTelegramId(telegramId) {
  return `ref_${String(telegramId).replace(/[^0-9]/g, '')}`;
}

function parseReferralPayload(payload) {
  const value = String(payload || '').trim();
  const match = value.match(/^ref_(\d{5,})$/i);
  return match ? Number(match[1]) : null;
}

async function applyReferralStart(invitedTelegramId, inviterTelegramId) {
  if (!inviterTelegramId || Number(inviterTelegramId) === Number(invitedTelegramId)) {
    return { applied: false, reason: 'invalid_referral' };
  }
  const existing = await findReferralEvent(inviterTelegramId, invitedTelegramId);
  if (existing) return { applied: false, reason: 'already_applied' };

  const now = new Date();
  const inviterSub = await getSubscription(inviterTelegramId).catch(() => null);
  const invitedSub = await getSubscription(invitedTelegramId).catch(() => null);
  const inviterExpires = addDays(laterDate(inviterSub?.promo_expires_at, now), REFERRAL_REWARD_DAYS);
  const invitedExpires = addDays(laterDate(invitedSub?.promo_expires_at, now), REFERRAL_WELCOME_DAYS);

  await upsertSubscriptionAccess(inviterTelegramId, {
    is_active: true,
    tier: inviterSub?.tier || 'standard',
    activated_at: inviterSub?.activated_at || now.toISOString(),
    referral_code: referralCodeForTelegramId(inviterTelegramId),
    promo_expires_at: inviterExpires.toISOString(),
    access_reason: 'referral_reward',
  });
  await upsertSubscriptionAccess(invitedTelegramId, {
    is_active: true,
    tier: invitedSub?.tier || 'standard',
    activated_at: invitedSub?.activated_at || now.toISOString(),
    promo_expires_at: invitedExpires.toISOString(),
    access_reason: 'referral_welcome',
  });
  await recordReferralEvent({
    inviter_telegram_id: inviterTelegramId,
    invited_telegram_id: invitedTelegramId,
    reward_days: REFERRAL_REWARD_DAYS,
    welcome_days: REFERRAL_WELCOME_DAYS,
  });
  return { applied: true, inviterExpires, invitedExpires };
}

// ─── Record realized PnL and calculate fee owed (tier-aware) ─────────────────
async function recordRealizedPnl(telegramId, tokenMint, pnlSol) {
  const tier = await getUserTier(telegramId);
  const feePercent = feePercentForTier(tier, tokenMint);

  await supabase.from('pnl_records').insert({
    telegram_id: telegramId,
    token_mint: tokenMint,
    pnl_sol: pnlSol,
    fee_owed_sol: pnlSol > 0 ? pnlSol * (feePercent / 100) : 0,
    fee_percent_applied: feePercent,
    tier,
    settled: false,
    created_at: new Date().toISOString(),
  });
}

async function recordFeatureUsageFee(telegramId, featureKey, feeSol, metadata = {}) {
  const amount = Number(feeSol || 0);
  if (!amount || amount <= 0) return null;
  const feePercent = 100;
  await supabase.from('pnl_records').insert({
    telegram_id: telegramId,
    token_mint: metadata.tokenMint || metadata.marketMint || featureKey || 'goldrush',
    pnl_sol: amount,
    fee_owed_sol: amount,
    fee_percent_applied: feePercent,
    tier: `feature:${featureKey}`,
    settled: false,
    service_name: `GoldRush:${featureKey}`,
    service_price_sol: amount,
    service_meta: JSON.stringify({
      featureKey,
      goldrushPricing: GOLDRUSH_PRICING,
      ...metadata,
    }),
    created_at: new Date().toISOString(),
  });
  return { featureKey, feeSol: amount };
}

// ─── Get total unsettled fee owed by user ────────────────────────────────────
async function getUnsettledFees(telegramId) {
  const { data } = await supabase
    .from('pnl_records')
    .select('fee_owed_sol')
    .eq('telegram_id', telegramId)
    .eq('settled', false);

  if (!data) return 0;
  return data.reduce((sum, r) => sum + parseFloat(r.fee_owed_sol || 0), 0);
}

// ─── Mark fees as settled after transfer to creator wallet ───────────────────
async function markFeesSettled(telegramId, txSignature) {
  await supabase
    .from('pnl_records')
    .update({ settled: true, settlement_tx: txSignature })
    .eq('telegram_id', telegramId)
    .eq('settled', false);
}

module.exports = {
  CREATOR_WALLET,
  TRIAL_HOURS,
  PNL_FEE_PERCENT,
  PNL_FEE_PERCENT_ENCRYPTED,
  PDAO_STANDARD_FEE_PERCENT,
  MEME_STANDARD_FEE_PERCENT,
  checkTrialStatus,
  hasActiveSubscription,
  canTrade,
  recordRealizedPnl,
  getUnsettledFees,
  markFeesSettled,
  getUserTier,
  setUserTier,
  feePercentForTier,
  DEFAULT_PROMO_DAYS,
  REFERRAL_REWARD_DAYS,
  REFERRAL_WELCOME_DAYS,
  normalizePromoCode,
  parsePromoCodes,
  createPromoCode,
  listPromoCodes,
  redeemPromoCode,
  referralCodeForTelegramId,
  parseReferralPayload,
  applyReferralStart,
  goldrushPriceFor,
  GOLDRUSH_PRICING,
  recordFeatureUsageFee,
};
