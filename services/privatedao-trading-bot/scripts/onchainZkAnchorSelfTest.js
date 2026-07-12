const crypto = require('crypto');
const path = require('path');
const {
  ComputeBudgetProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PDAO_MINT } = require('../config/tradingPolicy');
const { loadZkMatrix } = require('../proof/zkMatrix');
const { createProofReceipt, sha256 } = require('../proof/proofReceipt');
const {
  MEMO_PROGRAM_ID,
  anchorReceiptOnchain,
  verifyAnchoredReceipt,
  loadAnchorPayerKeypair,
  getConnection,
} = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

async function sendEvidenceTransaction(connection, payer) {
  const payload = JSON.stringify({
    v: 1,
    type: 'privatedao.zk.receipt.evidence',
    nonceHash: crypto.randomBytes(16).toString('hex'),
    timestamp: new Date().toISOString(),
  });
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }))
    .add(new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(payload, 'utf8'),
  }));
  return sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
}

async function main() {
  const matrix = loadZkMatrix();
  if (!matrix.summary.proofHash || !matrix.summary.publicSignalsHash || matrix.summary.verifiedCount < 1) {
    throw new Error('local Groth16 proof files are not verified and complete');
  }

  const connection = getConnection();
  const payer = loadAnchorPayerKeypair();
  const balance = await connection.getBalance(payer.publicKey);
  if (balance < 20000) throw new Error('anchor payer balance is too low for live anchor self-test');

  const evidenceSignature = await sendEvidenceTransaction(connection, payer);
  const receipt = createProofReceipt({
    telegramId: 'onchain-self-test',
    wallet: payer.publicKey.toString(),
    tokenMint: PDAO_MINT,
    quoteCurrency: 'SOL',
    mode: 'zk-anchor-self-test',
    featureMode: 'Verified Receipt',
    intentHash: sha256({ purpose: 'onchain-anchor-self-test', evidenceSignature }),
    policyHash: sha256({ mode: 'mainnet-anchor', verifier: 'memo-anchor' }),
    routeHash: sha256({ route: 'solana-memo', cluster: 'mainnet-beta' }),
    proofHash: matrix.summary.proofHash,
    publicSignalsHash: matrix.summary.publicSignalsHash,
    walletFingerprint: walletFingerprint(payer.publicKey.toString()),
    localGroth16Verified: true,
    txs: [{ index: 0, amount: 0, tx: evidenceSignature }],
    mevProtection: false,
  });

  const anchor = await anchorReceiptOnchain(receipt, { connection, payer });
  const verified = await verifyAnchoredReceipt(receipt.receiptHash, {
    connection,
    signature: anchor.signature,
  });

  const report = {
    ok: verified.verified === true,
    localGroth16Verified: true,
    onchainAnchored: anchor.onchainAnchored === true,
    onchainVerifier: false,
    liveTxVerified: verified.verified === true,
    receiptHash: receipt.receiptHash,
    evidenceSignature,
    anchorSignature: anchor.signature,
    anchorExplorerUrl: anchor.explorerUrl,
    verifierReason: 'Solana memo anchor is active; BN254 verifier program is not claimed active by this test',
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
