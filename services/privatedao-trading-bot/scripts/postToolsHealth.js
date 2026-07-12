const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getLiveTradingStatus, PDAO_MINT, MIN_TRADE_USD, ALLOW_ANY_TOKEN } = require('../config/tradingPolicy');
const { validateZkMatrix } = require('../proof/zkMatrix');
const { hasSupabase } = require('../db/supabase');
const { getTokenMarketSummary, hasSolanaTracker } = require('../providers/marketData');

async function main() {
  const checks = [];
  const live = getLiveTradingStatus();
  checks.push(['live-trading-gate', live.enabled, live.enabled ? 'enabled' : live.reasons.join(', ')]);
  checks.push(['supabase', hasSupabase, hasSupabase ? 'persistent' : 'memory fallback']);
  checks.push(['helius-rpc', Boolean(process.env.HELIUS_RPC_URL), process.env.HELIUS_RPC_URL ? 'configured' : 'missing']);
  checks.push(['jupiter-api-key', Boolean(process.env.JUPITER_API_KEY), process.env.JUPITER_API_KEY ? 'configured' : 'missing']);
  checks.push(['jito-endpoint', Boolean(process.env.JITO_SEND_TRANSACTION_URL), process.env.JITO_SEND_TRANSACTION_URL ? 'configured' : 'missing']);
  checks.push(['solana-tracker', hasSolanaTracker(), hasSolanaTracker() ? 'configured' : 'missing']);
  checks.push(['any-token-mode', ALLOW_ANY_TOKEN, ALLOW_ANY_TOKEN ? 'enabled' : 'disabled']);
  checks.push(['minimum-trade-usd', MIN_TRADE_USD > 0, String(MIN_TRADE_USD)]);

  const zk = validateZkMatrix();
  checks.push(['zk-matrix', zk.ok, `${zk.matrix.summary.verifiedCount}/${zk.matrix.summary.entryCount} proofs`]);

  const market = await getTokenMarketSummary(PDAO_MINT);
  checks.push(['pdao-market-data', Boolean(market?.symbol || market?.dex || market?.priceUsd), `${market?.symbol || 'unknown'} ${market?.dex || ''}`.trim()]);

  let failed = 0;
  for (const [name, ok, detail] of checks) {
    const line = `${ok ? 'PASS' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`;
    if (ok) console.log(line);
    else {
      console.error(line);
      failed++;
    }
  }

  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(`FAIL post-tools-health: ${err.message}`);
  process.exit(1);
});
