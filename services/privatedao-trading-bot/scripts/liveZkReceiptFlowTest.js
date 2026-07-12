const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PDAO_MINT } = require('../config/tradingPolicy');
const { createTradeAttestation } = require('../proof/zkMatrix');
const { createTradeReceipt, sha256 } = require('../proof/proofReceipt');
const {
  anchorReceiptOnchain,
  verifyAnchoredReceipt,
  loadAnchorPayerKeypair,
  getConnection,
} = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

async function main() {
  const connection = getConnection();
  const payer = loadAnchorPayerKeypair();
  const signatures = await connection.getSignaturesForAddress(payer.publicKey, { limit: 1 });
  if (!signatures.length) {
    throw new Error('anchor payer has no confirmed transaction history; run scripts/onchainZkAnchorSelfTest.js first');
  }

  const liveSignature = signatures[0].signature;
  const zk = createTradeAttestation({
    walletPublicKey: payer.publicKey.toString(),
    side: 'buy',
    tokenMint: PDAO_MINT,
    quoteCurrency: 'SOL',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: PDAO_MINT,
    amountAtomic: '0',
    slippageBps: 1200,
    routeVenue: 'receipt-anchor-flow',
    market: { source: 'local-proof-flow', riskLevel: 'test' },
  });

  const receipt = createTradeReceipt({
    telegramId: 'live-zk-receipt-flow',
    wallet: payer.publicKey.toString(),
    mode: 'verified-receipt-flow',
    tokenMint: PDAO_MINT,
    quoteCurrency: 'SOL',
    amount: 0,
    slippageBps: 1200,
    routeVenue: 'solana-mainnet',
    routeProvider: 'zk-anchor-client',
    txs: [{ index: 0, amount: 0, tx: liveSignature }],
    mevProtection: false,
    proofHash: zk.publicInput.proofHash,
    publicSignalsHash: zk.publicInput.publicSignalsHash,
    walletFingerprint: walletFingerprint(payer.publicKey.toString()),
    featureMode: 'Verified Receipt',
    localGroth16Verified: Boolean(zk.valid),
  });
  receipt.intentHash = sha256({ ...receipt, flow: 'live-zk-receipt-flow' });
  receipt.receiptHash = sha256(receipt);

  const anchor = await anchorReceiptOnchain(receipt, { connection, payer });
  const verified = await verifyAnchoredReceipt(receipt.receiptHash, {
    connection,
    signature: anchor.signature,
  });

  console.log(JSON.stringify({
    ok: Boolean(zk.valid && verified.verified),
    fullZk: Boolean(zk.valid && receipt.proofHash && receipt.publicSignalsHash),
    localGroth16Verified: Boolean(zk.valid),
    onchainAnchored: Boolean(anchor.onchainAnchored),
    onchainVerifier: false,
    liveTxVerified: Boolean(verified.verified),
    receiptHash: receipt.receiptHash,
    sourceTxSignature: liveSignature,
    anchorSignature: anchor.signature,
    anchorExplorerUrl: anchor.explorerUrl,
    note: 'This verifies the production receipt anchor path with live Solana transactions; it does not execute a swap.',
  }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
