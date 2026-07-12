require('dotenv').config();

const { getBotWallet } = require('../db/supabase');
const { getSolBalance } = require('../trading/jupiter');
const { getKeypairFromEncrypted } = require('../trading/wallet');
const { feePercentForTier } = require('../billing/fees');
const { createPrivateExecutionPlan, finalizePrivateExecutionReceipt } = require('../privacy/privateExecutionPlan');
const { verifySip, getSipStatus } = require('../security/sip');

const TELEGRAM_ID = Number(process.env.TEST_TELEGRAM_ID || 7254012270);

(async () => {
  const started = Date.now();
  const report = {
    user: TELEGRAM_ID,
    generatedAt: new Date().toISOString(),
    walletSecurity: {},
    executionSpeed: {},
    feeSettlement: {},
    withdrawSafety: {},
    readiness: []
  };

  const wallet = await getBotWallet(TELEGRAM_ID);
  if (!wallet) throw new Error('No bot wallet found');

  const signer = getKeypairFromEncrypted(wallet.encrypted_private_key);
  const balance = await getSolBalance(wallet.public_key);

  report.walletSecurity = {
    walletExists: true,
    publicKey: wallet.public_key,
    encryptedPrivateKeyStored: Boolean(wallet.encrypted_private_key),
    signerMatchesPublicKey: signer.publicKey.toString() === wallet.public_key,
    solBalance: balance,
    privateKeyPrinted: false
  };

  const t0 = Date.now();
  const plan = createPrivateExecutionPlan({
    telegramId: TELEGRAM_ID,
    wallet: wallet.public_key,
    totalAmount: 0.01,
    quoteCurrency: 'SOL',
    tokenMint: process.env.PDAO_MINT,
    strategy: 'readiness-test',
    slippageBps: Number(process.env.DEFAULT_SLIPPAGE_BPS || 1200),
    parts: 3,
    minDelayMs: 1,
    maxDelayMs: 3,
    market: { priceImpactPct: 1, liquidityUsd: 6690 }
  });

  const receipt = finalizePrivateExecutionReceipt(plan.receiptBase, [
    { index: 0, amount: plan.plan[0].amount, tx: 'SIMULATED_TX_1' },
    { index: 1, amount: plan.plan[1].amount, tx: 'SIMULATED_TX_2' },
    { index: 2, amount: plan.plan[2].amount, tx: 'SIMULATED_TX_3' }
  ]);

  report.executionSpeed = {
    planCreatedMs: Date.now() - t0,
    splitCount: plan.plan.length,
    sumAmount: plan.plan.reduce((a, b) => a + b.amount, 0),
    receiptHashCreated: Boolean(receipt.receiptHash)
  };

  report.feeSettlement = {
    pdaoFeePercent: feePercentForTier('standard', process.env.PDAO_MINT),
    otherTokenFeePercent: feePercentForTier('standard', 'OTHER_TOKEN_TEST'),
    privateFeePercent: feePercentForTier('encrypted', process.env.PDAO_MINT),
    creatorWallet: process.env.CREATOR_WALLET || process.env.WALLET_CREATOR,
    mode: process.env.FEE_SETTLEMENT_MODE || 'instant_pnl',
    rule: 'fees apply only on realized positive PnL'
  };

  const sip = await getSipStatus(TELEGRAM_ID);
  report.withdrawSafety = {
    sipEnabled: sip.enabled,
    withdrawRequiresBotWallet: true,
    exportShouldRequireSip: true,
    creatorPrivateKeyInEnv: Boolean(process.env.CREATOR_WALLET_PRIVATE_KEY)
  };

  report.readiness.push(report.walletSecurity.signerMatchesPublicKey ? 'PASS wallet signer' : 'FAIL wallet signer');
  report.readiness.push(report.executionSpeed.receiptHashCreated ? 'PASS receipt' : 'FAIL receipt');
  report.readiness.push(report.feeSettlement.creatorWallet ? 'PASS creator wallet' : 'FAIL creator wallet');
  report.readiness.push(!report.withdrawSafety.creatorPrivateKeyInEnv ? 'PASS no creator private key' : 'FAIL creator private key exposed');

  report.totalMs = Date.now() - started;

  console.log(JSON.stringify(report, null, 2));
})();
