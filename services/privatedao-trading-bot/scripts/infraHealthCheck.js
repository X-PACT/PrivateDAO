require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

function mask(v) {
  if (!v) return 'EMPTY';
  return 'SET';
}

async function rpcCheck(name, url) {
  if (!url) return { name, ok: false, reason: 'missing' };
  try {
    const t = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' })
    });
    const json = await res.json().catch(() => ({}));
    return { name, ok: res.ok && !json.error, ms: Date.now() - t, status: res.status, result: json.result || json.error?.message };
  } catch (e) {
    return { name, ok: false, reason: e.message };
  }
}

async function urlCheck(name, url) {
  if (!url) return { name, ok: false, reason: 'missing' };
  try {
    const t = Date.now();
    const res = await fetch(url, { method: 'GET' });
    return { name, ok: res.status < 500, status: res.status, ms: Date.now() - t };
  } catch (e) {
    return { name, ok: false, reason: e.message };
  }
}

(async () => {
  const env = {};
  for (const k of Object.keys(process.env).sort()) {
    if (/HELIUS|QUICKNODE|JITO|JUPITER|TRACKER|DEXSCREENER|SUPABASE|PRIVATEDAO|AWS|WALLET|FEE|SLIPPAGE|TRADE|PDAO|CREATOR/i.test(k)) {
      env[k] = mask(process.env[k]);
    }
  }

  const rpc = [
    await rpcCheck('helius', process.env.HELIUS_RPC_URL),
    await rpcCheck('helius_beta', process.env.HELIUS_BETA_RPC_URL),
    await rpcCheck('quicknode', process.env.QUICKNODE_RPC_URL),
    await rpcCheck('getblock', process.env.GETBLOCK_RPC_URL)
  ];

  const apis = [
    await urlCheck('jupiter_base', process.env.JUPITER_BASE_URL),
    await urlCheck('solana_tracker', process.env.SOLANA_TRACKER_BASE_URL),
    await urlCheck('dexscreener', process.env.DEXSCREENER_BASE_URL),
    await urlCheck('privatedao_api', process.env.PRIVATEDAO_API_URL)
  ];

  let supabase = { ok: false };
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await sb.from('bot_wallets').select('telegram_id, public_key, created_at').limit(1);
    supabase = { ok: !error, rowsReadable: Array.isArray(data), error: error?.message || null };
  } catch (e) {
    supabase = { ok: false, error: e.message };
  }

  const fees = {
    pdaoFeePercent: Number(process.env.PDAO_STANDARD_FEE_PERCENT || 5),
    memeFeePercent: Number(process.env.MEME_STANDARD_FEE_PERCENT || 8),
    zkPrivateFeePercent: Number(process.env.ZK_PRIVATE_FEE_PERCENT || 15),
    minSettlementSol: Number(process.env.MIN_SETTLEMENT_SOL || 0.002),
    creatorWalletSet: Boolean(process.env.CREATOR_WALLET),
    creatorPrivateKeySet: Boolean(process.env.CREATOR_WALLET_PRIVATE_KEY)
  };

  const warnings = [];
  if (process.env.QUICKNODE_RPC_URL === 'https://api.mainnet-beta.solana.com') warnings.push('QUICKNODE_RPC_URL is public Solana RPC, not QuickNode/x402.');
  if (process.env.CREATOR_WALLET_PRIVATE_KEY) warnings.push('CREATOR_WALLET_PRIVATE_KEY should not be inside the trading bot env.');
  if (!process.env.TRADE_INTENT_ENCRYPTION_KEY) warnings.push('TRADE_INTENT_ENCRYPTION_KEY missing.');
  if (process.env.TRADE_INTENT_ENCRYPTION_KEY === process.env.WALLET_ENCRYPTION_KEY) warnings.push('Trade intent key must not equal wallet encryption key.');
  if (process.env.ENABLE_JITO_FAST_SEND !== 'true') warnings.push('Jito fast send is disabled.');
  if (!process.env.JITO_BUNDLE_URL) warnings.push('JITO_BUNDLE_URL missing.');

  const report = { generatedAt: new Date().toISOString(), env, rpc, apis, supabase, fees, warnings };
  console.log(JSON.stringify(report, null, 2));
})();
