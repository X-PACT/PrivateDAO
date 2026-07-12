const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { encryptPrivateKey, decryptPrivateKey } = require('../trading/wallet');
const { validateZkMatrix } = require('../proof/zkMatrix');
const { hasSupabase } = require('../db/supabase');
const {
  PDAO_MINT,
  CREATOR_WALLET,
  MIN_GAS_SOL,
  MAX_TRADE_SOL,
  MAX_TRADE_USDC,
  MIN_TRADE_USD,
  ALLOW_ANY_TOKEN,
  USER_DEFINED_TRADE_LIMIT,
  getLiveTradingStatus,
  assertPublicKey,
} = require('../config/tradingPolicy');

function pass(label, detail = '') {
  console.log(`PASS ${label}${detail ? `: ${detail}` : ''}`);
}

function fail(label, detail = '') {
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ''}`);
  process.exitCode = 1;
}

function assert(condition, label, detail = '') {
  if (condition) pass(label, detail);
  else fail(label, detail);
}

const envPath = path.join(__dirname, '..', '.env');
const mode = (fs.statSync(envPath).mode & 0o777).toString(8);
assert(mode === '600', '.env permissions', mode);

assert(Boolean(process.env.TELEGRAM_BOT_TOKEN), 'Telegram token present');
assert(Boolean(process.env.HELIUS_RPC_URL || process.env.QUICKNODE_RPC_URL), 'Solana RPC configured', process.env.HELIUS_RPC_URL ? 'Helius primary' : 'QuickNode primary');
assert(hasSupabase, 'Supabase configured', hasSupabase ? 'persistent storage' : 'memory fallback');
assert(/^[0-9a-fA-F]{64}$/.test(process.env.WALLET_ENCRYPTION_KEY || ''), 'wallet encryption key shape');

try {
  assertPublicKey(PDAO_MINT, 'PDAO mint');
  assertPublicKey(CREATOR_WALLET, 'creator wallet');
  pass('public keys valid');
} catch (err) {
  fail('public keys valid', err.message);
}

try {
  const kp = Keypair.generate();
  const encrypted = encryptPrivateKey(Buffer.from(kp.secretKey));
  const decrypted = decryptPrivateKey(encrypted);
  assert(Buffer.compare(Buffer.from(kp.secretKey), Buffer.from(decrypted)) === 0, 'wallet encryption roundtrip');
} catch (err) {
  fail('wallet encryption roundtrip', err.message);
}

try {
  const zk = validateZkMatrix();
  assert(zk.ok, 'Groth16 receipt proof verified', `${zk.matrix.summary.verifiedCount}/${zk.matrix.summary.entryCount}`);
} catch (err) {
  fail('Groth16 receipt proof verified', err.message);
}

const live = getLiveTradingStatus();
assert(live.enabled, 'live trading gate', live.enabled ? 'enabled' : live.reasons.join(', '));
assert(MIN_TRADE_USD > 0, 'minimum trade size', `${MIN_TRADE_USD} USD`);
assert(ALLOW_ANY_TOKEN, 'any-token trading policy', ALLOW_ANY_TOKEN ? 'enabled' : 'disabled');
pass('trade sizing', USER_DEFINED_TRADE_LIMIT ? `user-defined, configured caps ${MAX_TRADE_SOL} SOL/${MAX_TRADE_USDC} USDC available` : `capped ${MAX_TRADE_SOL} SOL/${MAX_TRADE_USDC} USDC`);
pass('gas reserve', `${MIN_GAS_SOL} SOL`);
