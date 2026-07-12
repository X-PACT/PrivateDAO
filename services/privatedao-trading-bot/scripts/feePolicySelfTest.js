const assert = require('assert');
require('dotenv').config();

const { feePercentForTier } = require('../billing/fees');
const { PDAO_MINT } = require('../config/tradingPolicy');

function feeOwed(pnlSol, percent) {
  return pnlSol > 0 ? pnlSol * (percent / 100) : 0;
}

function assertClose(actual, expected, label) {
  assert(Math.abs(actual - expected) < 1e-12, `${label}: expected ${expected}, got ${actual}`);
}

async function main() {
  const otherMint = 'So11111111111111111111111111111111111111112';
  assert.strictEqual(feePercentForTier('standard', PDAO_MINT), Number(process.env.PDAO_STANDARD_FEE_PERCENT || 5));
  assert.strictEqual(feePercentForTier('standard', otherMint), Number(process.env.MEME_STANDARD_FEE_PERCENT || 8));
  assert.strictEqual(feePercentForTier('encrypted', PDAO_MINT), Number(process.env.ZK_PRIVATE_FEE_PERCENT || 15));
  assertClose(feeOwed(0.1, feePercentForTier('standard', PDAO_MINT)), 0.005, 'PDAO positive PnL fee');
  assert.strictEqual(feeOwed(0, feePercentForTier('standard', otherMint)), 0);
  assert.strictEqual(feeOwed(-0.1, feePercentForTier('encrypted', otherMint)), 0);
  console.log(JSON.stringify({
    ok: true,
    pdaoTradesPercent: feePercentForTier('standard', PDAO_MINT),
    otherTokensPercent: feePercentForTier('standard', otherMint),
    fullPrivateModePercent: feePercentForTier('encrypted', PDAO_MINT),
    noProfitFee: 0,
  }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
