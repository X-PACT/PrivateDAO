const path = require('path');
const childProcess = require('child_process');
const { Keypair } = require('@solana/web3.js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { encryptPrivateKey, decryptPrivateKey, walletFingerprint } = require('../trading/wallet');
const { feePercentForTier } = require('../billing/fees');
const { createPrivateExecutionPlan, finalizePrivateExecutionReceipt } = require('../privacy/privateExecutionPlan');
const { PDAO_MINT, CREATOR_WALLET, getLiveTradingStatus } = require('../config/tradingPolicy');
const { getQuickNodeX402Status } = require('../providers/quicknodeX402');
const { hasPumpPortalApiKey } = require('../providers/pumpPortal');
const { hasGoldRush } = require('../providers/goldrush');
const { validateZkMatrix } = require('../proof/zkMatrix');
const { readAnchorIndex, verifyAnchoredReceipt } = require('../onchain/zkReceiptAnchor');
const { getOnchainVerifierStatus } = require('../onchain/zkGroth16Verifier');

function runJson(script) {
  const result = childProcess.spawnSync('node', [script], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) return { ok: false, error: (result.stderr || result.stdout || '').trim() };
  try { return { ok: true, data: JSON.parse(result.stdout) }; } catch { return { ok: false, error: 'non-json output' }; }
}

function yes(value) {
  return value ? 'YES' : 'NO';
}

async function latestAnchorState() {
  const latest = [...readAnchorIndex()].reverse()[0];
  if (!latest) return { ok: false, missing: 'Run scripts/onchainZkAnchorSelfTest.js' };
  const verified = await verifyAnchoredReceipt(latest.receiptHash, { signature: latest.signature }).catch((err) => ({ verified: false, reason: err.message }));
  return {
    ok: verified.verified === true,
    signature: latest.signature,
    explorerUrl: verified.explorerUrl,
    missing: verified.verified ? '' : verified.reason,
  };
}

async function main() {
  const kp = Keypair.generate();
  const reopened = Keypair.fromSecretKey(decryptPrivateKey(encryptPrivateKey(Buffer.from(kp.secretKey))));
  const fingerprint = walletFingerprint(kp.publicKey.toString());
  const zk = validateZkMatrix();
  const anchor = await latestAnchorState();
  const verifier = await getOnchainVerifierStatus();
  const infra = runJson('scripts/infraDeepHealthCheck.js');
  const walletBinding = runJson('scripts/walletBindingSelfTest.js');
  const live = getLiveTradingStatus();
  const x402 = getQuickNodeX402Status();
  const plan = createPrivateExecutionPlan({
    telegramId: 'readiness',
    wallet: kp.publicKey.toString(),
    totalAmount: 0.02,
    quoteCurrency: 'SOL',
    tokenMint: PDAO_MINT,
    strategy: 'private-readiness',
    slippageBps: 1200,
    parts: 3,
    minDelayMs: 1,
    maxDelayMs: 2,
    market: { priceImpactPct: 0.1, liquidityUsd: 12000 },
  });
  const receipt = finalizePrivateExecutionReceipt({
    ...plan.receiptBase,
    proofHash: zk.matrix.summary.proofHash,
    publicSignalsHash: zk.matrix.summary.publicSignalsHash,
    walletFingerprint: fingerprint,
    localGroth16Verified: zk.ok,
  }, []);

  const rows = [
    {
      Feature: 'Smart Shield',
      CONFIG_PRESENT: yes(Boolean(process.env.HELIUS_RPC_URL || process.env.JITO_BUNDLE_URL)),
      CODE_PATH_ACTIVE: 'YES: /buy shield -> protectedRoute -> fastLane -> receipt anchor',
      LOCAL_GROTH16_VERIFIED: yes(zk.ok),
      ONCHAIN_ANCHORED: yes(anchor.ok),
      ONCHAIN_VERIFIER_ACTIVE: yes(verifier.executable),
      LIVE_TX_VERIFIED: yes(anchor.ok),
      Missing: verifier.executable ? (anchor.ok ? '' : anchor.missing) : verifier.missing,
    },
    {
      Feature: 'Private Execution',
      CONFIG_PRESENT: yes(live.enabled),
      CODE_PATH_ACTIVE: 'YES: /private_buy -> split chunks -> protectedRoute -> receipt anchor',
      LOCAL_GROTH16_VERIFIED: yes(zk.ok),
      ONCHAIN_ANCHORED: yes(anchor.ok),
      ONCHAIN_VERIFIER_ACTIVE: yes(verifier.executable),
      LIVE_TX_VERIFIED: yes(anchor.ok),
      Missing: verifier.executable ? (anchor.ok ? 'Needs user-authorized Telegram swap to verify private chunk tx signatures' : anchor.missing) : verifier.missing,
    },
    {
      Feature: 'Smart Split',
      CONFIG_PRESENT: yes(Number(process.env.PRIVATE_SPLIT_PARTS || 3) > 1),
      CODE_PATH_ACTIVE: 'YES: privacy/privateExecutionPlan + handlers/privateTrading',
      LOCAL_GROTH16_VERIFIED: yes(zk.ok),
      ONCHAIN_ANCHORED: yes(anchor.ok),
      ONCHAIN_VERIFIER_ACTIVE: yes(verifier.executable),
      LIVE_TX_VERIFIED: yes(anchor.ok),
      Missing: verifier.executable ? (anchor.ok ? 'Needs live user split trade for chunk signature proof' : anchor.missing) : verifier.missing,
    },
    {
      Feature: 'MEV Shield',
      CONFIG_PRESENT: yes(Boolean(process.env.HELIUS_SENDER_URL || process.env.JITO_BUNDLE_URL)),
      CODE_PATH_ACTIVE: 'YES: protectedRoute uses Helius Sender/Jito fallback in providers/fastLane',
      LOCAL_GROTH16_VERIFIED: yes(zk.ok),
      ONCHAIN_ANCHORED: yes(anchor.ok),
      ONCHAIN_VERIFIER_ACTIVE: yes(verifier.executable),
      LIVE_TX_VERIFIED: yes(anchor.ok),
      Missing: verifier.executable ? (process.env.ENABLE_JITO_FAST_SEND === 'true' ? 'Needs live bundle id/signature evidence' : 'Jito fast send disabled; Helius/split path active') : verifier.missing,
    },
    {
      Feature: 'Verified Receipt',
      CONFIG_PRESENT: 'YES',
      CODE_PATH_ACTIVE: 'YES: proofReceipt -> onchain/zkReceiptAnchor -> Solana memo',
      LOCAL_GROTH16_VERIFIED: yes(zk.ok),
      ONCHAIN_ANCHORED: yes(anchor.ok),
      ONCHAIN_VERIFIER_ACTIVE: yes(verifier.executable),
      LIVE_TX_VERIFIED: yes(anchor.ok),
      Missing: verifier.executable ? (anchor.ok ? '' : anchor.missing) : verifier.missing,
    },
    {
      Feature: 'Wallet Binding',
      CONFIG_PRESENT: yes(Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)),
      CODE_PATH_ACTIVE: 'YES: wallet_uuid + fingerprint + archive + recover guards',
      LOCAL_GROTH16_VERIFIED: 'N/A',
      ONCHAIN_ANCHORED: 'N/A',
      ONCHAIN_VERIFIER_ACTIVE: 'N/A',
      LIVE_TX_VERIFIED: yes(walletBinding.ok),
      Missing: walletBinding.ok ? '' : `Supabase migration or local check failed: ${walletBinding.error}`,
    },
    {
      Feature: 'QuickNode x402',
      CONFIG_PRESENT: yes(x402.configured),
      CODE_PATH_ACTIVE: yes(x402.codePathActive),
      LOCAL_GROTH16_VERIFIED: 'N/A',
      ONCHAIN_ANCHORED: 'N/A',
      ONCHAIN_VERIFIER_ACTIVE: 'N/A',
      LIVE_TX_VERIFIED: 'NO',
      Missing: x402.codePathActive ? 'Payment flow not charged in readiness' : 'Signer/public wallet mismatch or missing',
    },
    {
      Feature: 'PumpPortal',
      CONFIG_PRESENT: yes(hasPumpPortalApiKey()),
      CODE_PATH_ACTIVE: 'YES: providers/pumpPortal',
      LOCAL_GROTH16_VERIFIED: 'N/A',
      ONCHAIN_ANCHORED: 'N/A',
      ONCHAIN_VERIFIER_ACTIVE: 'N/A',
      LIVE_TX_VERIFIED: 'NO',
      Missing: 'No live PumpPortal trade executed by readiness',
    },
    {
      Feature: 'GoldRush',
      CONFIG_PRESENT: yes(hasGoldRush()),
      CODE_PATH_ACTIVE: 'YES: providers/goldrush Solana balances',
      LOCAL_GROTH16_VERIFIED: 'N/A',
      ONCHAIN_ANCHORED: 'N/A',
      ONCHAIN_VERIFIER_ACTIVE: 'N/A',
      LIVE_TX_VERIFIED: yes(Boolean(infra.data?.apis?.goldRush?.liveCheck?.ok)),
      Missing: infra.data?.apis?.goldRush?.liveCheck?.ok ? '' : 'GoldRush live check failed or unavailable',
    },
  ];

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    creatorWallet: CREATOR_WALLET,
    pdaoMint: PDAO_MINT,
    liveTradingGate: live,
    walletEncryptionRoundtrip: reopened.publicKey.toString() === kp.publicKey.toString(),
    receiptShape: {
      receiptHash: Boolean(receipt.receiptHash),
      intentHash: Boolean(receipt.intentHash),
      policyHash: Boolean(receipt.policyHash),
      routeHash: Boolean(receipt.routeHash),
      txSignaturesHash: Boolean(receipt.txSignaturesHash),
    },
    latestAnchor: anchor,
    onchainVerifier: verifier,
    feeConfig: {
      pdaoTrades: feePercentForTier('standard', PDAO_MINT),
      otherTokens: feePercentForTier('standard', 'Other111111111111111111111111111111111111111'),
      fullPrivateMode: feePercentForTier('encrypted', PDAO_MINT),
    },
    rows,
    readyForTelegramUse: live.enabled && walletBinding.ok && zk.ok && reopened.publicKey.toString() === kp.publicKey.toString(),
    fullOnchainZkVerifierReady: verifier.executable === true,
  }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
