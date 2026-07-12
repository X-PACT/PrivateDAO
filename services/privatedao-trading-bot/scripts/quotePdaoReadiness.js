const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const {
  getQuote,
  getRouteVenue,
  SOL_MINT,
  USDC_MINT,
} = require('../trading/jupiter');
const { PDAO_MINT, LAMPORTS_PER_SOL, USDC_DECIMALS, DEFAULT_SLIPPAGE_BPS } = require('../config/tradingPolicy');

async function check(label, inputMint, amountAtomic) {
  try {
    const started = Date.now();
    const quote = await getQuote(inputMint, PDAO_MINT, amountAtomic, DEFAULT_SLIPPAGE_BPS);
    const ms = Date.now() - started;
    console.log(`PASS ${label}: venue=${getRouteVenue(quote)} in=${quote.inAmount} out=${quote.outAmount} impact=${quote.priceImpactPct || 'n/a'} latencyMs=${ms}`);
  } catch (err) {
    console.log(`WARN ${label}: ${err.message}`);
    process.exitCode = 2;
  }
}

(async () => {
  await check('SOL->PDAO quote', SOL_MINT, Math.floor(0.005 * LAMPORTS_PER_SOL));
  await check('USDC->PDAO quote', USDC_MINT, Math.floor(1 * USDC_DECIMALS));
})();
