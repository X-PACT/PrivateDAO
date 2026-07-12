const crypto = require('crypto');
const argon2 = require('argon2');
const { supabase } = require('../db/supabase');

function legacyHashSip(code, salt) {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${code}`)
    .digest('hex');
}

function validateSip(code) {
  return /^[0-9]{4,10}$/.test(String(code || ''));
}

async function setSip(telegramId, code) {
  if (!validateSip(code)) throw new Error('SIP must be 4 to 10 digits.');
  const salt = crypto.randomBytes(16).toString('hex');
  const sip_hash = await argon2.hash(`${salt}:${code}`, {
    type: argon2.argon2id,
    memoryCost: Number(process.env.SIP_ARGON2_MEMORY || 19456),
    timeCost: Number(process.env.SIP_ARGON2_TIME || 2),
    parallelism: Number(process.env.SIP_ARGON2_PARALLELISM || 1),
  });

  const { error } = await supabase
    .from('users')
    .update({ sip_enabled: true, sip_salt: salt, sip_hash })
    .eq('telegram_id', telegramId);

  if (error) throw new Error(formatSipSchemaError(error));
  return true;
}

async function getSipStatus(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select('sip_enabled,sip_salt,sip_hash')
    .eq('telegram_id', telegramId)
    .single();

  if (error) return { enabled: false };
  return {
    enabled: Boolean(data?.sip_enabled),
    salt: data?.sip_salt,
    hash: data?.sip_hash
  };
}

async function verifySip(telegramId, code) {
  const s = await getSipStatus(telegramId);
  if (!s.enabled) return true;
  if (!validateSip(code)) return false;
  if (String(s.hash || '').startsWith('$argon2')) {
    return argon2.verify(s.hash, `${s.salt}:${code}`);
  }
  return legacyHashSip(code, s.salt) === s.hash;
}

function sipSqlInstructions() {
  return [
    "alter table users add column if not exists sip_enabled boolean default false;",
    "alter table users add column if not exists sip_salt text;",
    "alter table users add column if not exists sip_hash text;",
    "alter table users add column if not exists security_mode text default 'standard';",
    "alter table users add column if not exists custom_strategy text;",
    "alter table users add column if not exists private_trading_enabled boolean default true;",
  ].join('\n');
}

function formatSipSchemaError(error) {
  const message = error?.message || String(error || '');
  if (/sip_|security_mode|custom_strategy|private_trading_enabled|column/i.test(message)) {
    return `Supabase users table is missing security columns. Run:\n${sipSqlInstructions()}`;
  }
  return message;
}

module.exports = {
  setSip,
  verifySip,
  getSipStatus,
  validateSip,
  sipSqlInstructions,
};
