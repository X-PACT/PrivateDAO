require('dotenv').config();
const assert = require('assert');

const { supabase } = require('../db/supabase');
const {
  redeemPromoCode,
  applyReferralStart,
  referralCodeForTelegramId,
  parseReferralPayload,
  canTrade,
  createPromoCode,
  DEFAULT_PROMO_DAYS,
  REFERRAL_REWARD_DAYS,
  REFERRAL_WELCOME_DAYS,
} = require('../billing/fees');

async function cleanup(...telegramIds) {
  for (const id of telegramIds) {
    await supabase.from('referral_events').delete().eq('inviter_telegram_id', id);
    await supabase.from('referral_events').delete().eq('invited_telegram_id', id);
    await supabase.from('promo_redemptions').delete().eq('telegram_id', id);
    await supabase.from('subscriptions').delete().eq('telegram_id', id);
    await supabase.from('trial_records').delete().eq('telegram_id', id);
    await supabase.from('users').delete().eq('telegram_id', id);
  }
}

async function main() {
  const base = 9200000000000 + Math.floor(Date.now() % 100000000);
  const inviterId = base;
  const invitedId = base + 1;

  await cleanup(inviterId, invitedId);
  await supabase.from('users').upsert({ telegram_id: inviterId, username: 'growth-inviter' });
  await supabase.from('users').upsert({ telegram_id: invitedId, username: 'growth-invited' });

  const promoCode = createPromoCode({ code: `TEST-${Date.now().toString(36).toUpperCase()}`, freeDays: DEFAULT_PROMO_DAYS, feeDiscountPercent: 0 });
  const promo = await redeemPromoCode(invitedId, 'growth-invited', promoCode.code);
  assert.strictEqual(promo.code, promoCode.code);
  assert(promo.freeDays >= DEFAULT_PROMO_DAYS);

  const code = referralCodeForTelegramId(inviterId);
  assert.strictEqual(parseReferralPayload(code), inviterId);

  const referral = await applyReferralStart(invitedId, inviterId);
  assert.strictEqual(referral.applied, true);

  const access = await canTrade(invitedId, 'growth-invited', '11111111111111111111111111111111');
  assert.strictEqual(access.allowed, true);

  await cleanup(inviterId, invitedId);

  console.log(JSON.stringify({
    ok: true,
    promoCodeRedeemed: promo.code,
    defaultPromoDays: DEFAULT_PROMO_DAYS,
    referralRewardDays: REFERRAL_REWARD_DAYS,
    referralWelcomeDays: REFERRAL_WELCOME_DAYS,
    invitedCanTrade: access.allowed,
  }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
