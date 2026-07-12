const path = require('path');
const { Connection } = require('@solana/web3.js');
const fetch = require('node-fetch');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PDAO_MINT, SOL_MINT, LAMPORTS_PER_SOL, DEFAULT_SLIPPAGE_BPS } = require('../config/tradingPolicy');
const { getQuote } = require('../trading/jupiter');
const { getQuickNodeX402Status } = require('../providers/quicknodeX402');
const { hasPumpPortalApiKey } = require('../providers/pumpPortal');
const { hasGoldRush, getGoldRushSolanaBalances } = require('../providers/goldrush');
const { supabase: sharedSupabase } = require('../db/supabase');

const WATCHED_ENV = [
  'HELIUS_RPC_URL',
  'HELIUS_BETA_RPC_URL',
  'HELIUS_SENDER_URL',
  'HELIUS_WS_URL',
  'JITO_SEND_TRANSACTION_URL',
  'JITO_BUNDLE_URL',
  'JITO_TIP_ACCOUNTS',
  'QUICKNODE_RPC_URL',
  'QUICKNODE_X402_ENABLED',
  'QUICKNODE_X402_ENDPOINT',
  'QUICKNODE_X402_WALLET',
  'GETBLOCK_RPC_URL',
  'SOLANA_TRACKER_API_KEY',
  'SOLANA_TRACKER_BASE_URL',
  'DEXSCREENER_BASE_URL',
  'JUPITER_API_KEY',
  'JUPITER_ORDER_ENDPOINT',
  'JUPITER_EXECUTE_ENDPOINT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'PRIVATEDAO_API_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_REGION',
  'AWS_SECRET_ACCESS_KEY',
  'PUMP_PORTAL_API_KEY',
  'GOLDRUSH_API_KEY',
];

function envPresence() {
  return Object.fromEntries(WATCHED_ENV.map((key) => [key, process.env[key] ? 'SET' : 'EMPTY']));
}

async function rpcCheck(name, url) {
  if (!url) return { name, ok: false, reason: 'missing' };
  const connection = new Connection(url, 'confirmed');
  const started = Date.now();
  try {
    const [health, blockhash] = await Promise.all([
      fetch(url, {
        method: 'POST',
        timeout: 8000,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
      })
        .then((res) => res.json())
        .then((json) => json.result || `error:${json.error?.message || 'unknown'}`)
        .catch((error) => `error:${error.message}`),
      connection.getLatestBlockhash(),
    ]);
    return { name, ok: !String(health).startsWith('error:'), health, latestBlockhash: Boolean(blockhash?.blockhash), ms: Date.now() - started };
  } catch (error) {
    return { name, ok: false, reason: error.message, ms: Date.now() - started };
  }
}

async function urlCheck(name, url, opts = {}) {
  if (!url) return { name, ok: false, reason: 'missing' };
  const started = Date.now();
  try {
    const res = await fetch(url, { method: opts.method || 'GET', timeout: opts.timeout || 8000, headers: opts.headers || undefined });
    return { name, ok: res.status < 500, status: res.status, ms: Date.now() - started };
  } catch (error) {
    return { name, ok: false, reason: error.message, ms: Date.now() - started };
  }
}

async function supabaseCheck() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return { ok: false, reason: 'missing' };
  }
  try {
    const { error } = await sharedSupabase.from('users').select('telegram_id').limit(1);
    return { ok: !error, read: !error, write: 'not-run-safe-read-only', error: error?.message || null };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

async function jupiterQuoteCheck() {
  const started = Date.now();
  try {
    const quote = await getQuote(SOL_MINT, PDAO_MINT, Math.floor(0.005 * LAMPORTS_PER_SOL), DEFAULT_SLIPPAGE_BPS, 1);
    return {
      ok: Boolean(quote?.outAmount),
      outAmount: quote?.outAmount || null,
      priceImpactPct: quote?.priceImpactPct || null,
      routePlan: Array.isArray(quote?.routePlan) ? quote.routePlan.length : 0,
      ms: Date.now() - started,
    };
  } catch (error) {
    return { ok: false, reason: error.message, ms: Date.now() - started };
  }
}

async function main() {
  const rpc = [
    await rpcCheck('helius', process.env.HELIUS_RPC_URL),
    await rpcCheck('helius_beta', process.env.HELIUS_BETA_RPC_URL),
    await rpcCheck('quicknode', process.env.QUICKNODE_RPC_URL),
    await rpcCheck('getblock', process.env.GETBLOCK_RPC_URL),
  ];
  const apis = {
    jupiterQuote: await jupiterQuoteCheck(),
    solanaTracker: await urlCheck('solana_tracker', `${process.env.SOLANA_TRACKER_BASE_URL || 'https://data.solanatracker.io'}/tokens/${PDAO_MINT}`, {
      headers: process.env.SOLANA_TRACKER_API_KEY ? { 'x-api-key': process.env.SOLANA_TRACKER_API_KEY } : undefined,
    }),
    dexScreener: await urlCheck('dexscreener', `${process.env.DEXSCREENER_BASE_URL || 'https://api.dexscreener.com/latest/dex'}/tokens/${PDAO_MINT}`),
    privateDaoApi: await urlCheck('privatedao_api', `${(process.env.PRIVATEDAO_API_URL || 'https://api.privatedao.org').replace(/\/$/, '')}/health`),
    quicknodeX402: {
      ...getQuickNodeX402Status(),
    },
    heliusSender: {
      configured: Boolean(process.env.HELIUS_SENDER_URL),
      wsConfigured: Boolean(process.env.HELIUS_WS_URL),
    },
    jito: {
      sendConfigured: Boolean(process.env.JITO_SEND_TRANSACTION_URL),
      bundleConfigured: Boolean(process.env.JITO_BUNDLE_URL),
      tipAccountsConfigured: Boolean(process.env.JITO_TIP_ACCOUNTS),
      codePathActive: true,
      liveTxVerified: false,
    },
    pumpPortal: {
      configured: hasPumpPortalApiKey(),
      codePathActive: true,
      liveTxVerified: false,
    },
    goldRush: {
      configured: hasGoldRush(),
      codePathActive: true,
      liveCheck: await getGoldRushSolanaBalances(process.env.CREATOR_WALLET || '11111111111111111111111111111111').catch((error) => ({ ok: false, reason: error.message })),
    },
  };
  const supabase = await supabaseCheck();
  const healthyRpc = rpc.filter((item) => item.ok);
  const recommendation = healthyRpc.length >= 2
    ? 'Use primary Helius/QuickNode with failover to the next healthy RPC.'
    : 'Configure at least two healthy paid RPC providers before heavy public launch.';

  const report = {
    generatedAt: new Date().toISOString(),
    env: envPresence(),
    rpc,
    apis,
    supabase,
    failoverRecommendation: recommendation,
    ok: healthyRpc.length >= 1 && apis.jupiterQuote.ok && supabase.ok,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
