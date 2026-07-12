const crypto = require('crypto');

function sha256(x) {
  return crypto.createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
}

function createProofReceipt(data) {
  const txSignatures = (data.txs || []).map((tx) => tx.tx || tx.signature).filter(Boolean);
  const receipt = {
    version: 'privatedao-trade-receipt-v1',
    mode: data.mode || 'private-split-mev',
    userHash: sha256(String(data.telegramId)),
    wallet: data.wallet,
    tokenMint: data.tokenMint || null,
    quoteCurrency: data.quoteCurrency || null,
    intentHash: data.intentHash,
    policyHash: data.policyHash,
    routeHash: data.routeHash,
    proofHash: data.proofHash || null,
    publicSignalsHash: data.publicSignalsHash || null,
    encryptedIntentHash: data.encryptedIntentHash || null,
    txs: data.txs || [],
    txSignatures,
    txSignaturesHash: sha256(txSignatures),
    splitCount: data.splitCount || 1,
    mevProtection: Boolean(data.mevProtection),
    routeProvider: data.routeProvider || null,
    walletFingerprint: data.walletFingerprint || null,
    featureMode: data.featureMode || data.mode || 'private-split-mev',
    localGroth16Verified: data.localGroth16Verified ?? null,
    onchainAnchored: false,
    anchorSignature: null,
    anchorExplorerUrl: null,
    onchainVerifier: false,
    verifierSignature: data.verifierSignature || null,
    verifierExplorerUrl: data.verifierExplorerUrl || null,
    createdAt: new Date().toISOString()
  };
  receipt.receiptHash = sha256(receipt);
  return receipt;
}

function createTradeReceipt({
  telegramId,
  wallet,
  mode = 'fast',
  tokenMint,
  quoteCurrency,
  amount,
  slippageBps,
  routeVenue,
  routeProvider,
  txs = [],
  mevProtection = false,
  proofHash = null,
  publicSignalsHash = null,
  walletFingerprint = null,
  featureMode = mode,
  localGroth16Verified = null,
}) {
  const intentHash = sha256({
    telegramId,
    wallet,
    tokenMint,
    quoteCurrency,
    amount,
    salt: Date.now(),
  });
  const policyHash = sha256({
    mode,
    quoteCurrency,
    slippageBps,
    feeRule: 'realized-positive-pnl-only',
  });
  const routeHash = sha256({
    tokenMint,
    quoteCurrency,
    routeVenue,
    routeProvider,
  });
  const encryptedIntentHash = sha256({
    intentHash,
    policyHash,
    scope: 'encrypted-intent-reference',
  });
  return createProofReceipt({
    telegramId,
    wallet,
    mode,
    tokenMint,
    quoteCurrency,
    intentHash,
    policyHash,
    routeHash,
    proofHash,
    publicSignalsHash,
    encryptedIntentHash,
    txs,
    splitCount: txs.length || 1,
    mevProtection,
    routeProvider,
    walletFingerprint,
    featureMode,
    localGroth16Verified,
  });
}

module.exports = { createProofReceipt, createTradeReceipt, sha256 };
