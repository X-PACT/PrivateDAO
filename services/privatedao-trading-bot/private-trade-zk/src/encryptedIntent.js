const crypto = require('crypto');
const { canonicalJson, sha256Hex, fieldHash, randomField } = require('./field');

function getKey() {
  const key = process.env.TRADE_INTENT_ENCRYPTION_KEY;
  if (!/^[0-9a-fA-F]{64}$/.test(key || '')) {
    throw new Error('TRADE_INTENT_ENCRYPTION_KEY is required and must be 32-byte hex. Do not reuse WALLET_ENCRYPTION_KEY.');
  }
  return Buffer.from(key, 'hex');
}

function encryptIntent(intent) {
  const plaintext = Buffer.from(canonicalJson(intent), 'utf8');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    alg: 'AES-256-GCM',
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    plaintextHash: sha256Hex(plaintext),
    fieldCommitmentSeed: fieldHash(plaintext.toString('hex'))
  };
}

function decryptIntent(envelope) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(envelope.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'hex'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'hex')),
    decipher.final()
  ]);
  const decoded = plaintext.toString('utf8');
  if (sha256Hex(decoded) !== envelope.plaintextHash) {
    throw new Error('Encrypted intent hash mismatch');
  }
  return JSON.parse(decoded);
}

function buildTradeIntentInput(intent, policy = {}) {
  const salt = intent.salt || randomField();

  return {
    public: {
      policyHash: String(policy.policyHash || fieldHash('privatedao-private-trade-policy-v1')),
      maxSlippageBps: String(policy.maxSlippageBps ?? 1200),
      minAmountBucket: String(policy.minAmountBucket ?? 1),
      maxAmountBucket: String(policy.maxAmountBucket ?? 1000000000),
      expirySlot: String(policy.expirySlot ?? intent.expirySlot ?? 999999999999)
    },
    private: {
      side: String(intent.side === 'sell' || intent.side === 1 ? 1 : 0),
      amountBucket: String(intent.amountBucket),
      slippageBps: String(intent.slippageBps),
      strategyId: String(intent.strategyId),
      userKey: String(intent.userKey),
      tokenHash: String(intent.tokenHash || fieldHash(intent.tokenMint || 'UNKNOWN_TOKEN')),
      salt: String(salt),
      routeHash: String(intent.routeHash || fieldHash(intent.route || 'PRIVATE_ROUTE')),
      riskScore: String(intent.riskScore ?? 0),
      currentSlot: String(intent.currentSlot ?? 0)
    }
  };
}

module.exports = {
  encryptIntent,
  decryptIntent,
  buildTradeIntentInput
};
