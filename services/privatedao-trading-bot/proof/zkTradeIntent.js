const crypto = require('crypto');
const { validateZkMatrix } = require('./zkMatrix');

function canonicalJson(obj) {
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  if (obj && typeof obj === 'object') {
    return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k)+':'+canonicalJson(obj[k])).join(',') + '}';
  }
  return JSON.stringify(obj);
}

function sha256(x) {
  return crypto.createHash('sha256').update(x).digest('hex');
}

function getIntentKey() {
  const key = process.env.TRADE_INTENT_ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_KEY;
  if (!/^[0-9a-fA-F]{64}$/.test(key || '')) {
    throw new Error('TRADE_INTENT_ENCRYPTION_KEY or WALLET_ENCRYPTION_KEY must be 32-byte hex');
  }
  return Buffer.from(key, 'hex');
}

function encryptTradeIntent(intent) {
  const plaintext = Buffer.from(canonicalJson(intent));
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getIntentKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    alg: 'AES-256-GCM',
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: encrypted.toString('hex'),
    intentHash: sha256(plaintext),
  };
}

function createStrictZkTradeIntent(intent) {
  const zk = validateZkMatrix();
  if (!zk.ok) throw new Error('ZK matrix not valid: ' + zk.issues.join('; '));

  const encryptedIntent = encryptTradeIntent(intent);
  const publicCommitment = {
    intentHash: encryptedIntent.intentHash,
    registryHash: sha256(canonicalJson(zk.matrix.registry)),
    network: zk.matrix.summary.network,
    verificationMode: zk.matrix.summary.verificationMode,
    programId: zk.matrix.summary.programId,
    anchorCount: zk.matrix.summary.anchorCount,
    verifiedCount: zk.matrix.summary.verifiedCount,
  };

  if (process.env.PRIVATEDAO_ZK_REQUIRED !== 'false') {
    if (publicCommitment.anchorCount < 1) throw new Error('ZK strict mode requires on-chain anchors');
    if (publicCommitment.verifiedCount < 1) throw new Error('ZK strict mode requires verified proof entries');
  }

  return {
    encryptedIntent,
    publicCommitment,
    attestationHash: sha256(canonicalJson(publicCommitment)),
  };
}

module.exports = { createStrictZkTradeIntent, encryptTradeIntent, canonicalJson };
