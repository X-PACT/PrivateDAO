const crypto = require('crypto');
const { getKeypairFromEncrypted } = require('../trading/wallet');

const EXPORT_VERSION = 1;

function validateExportPassphrase(passphrase) {
  const value = String(passphrase || '');
  if (value.length < 12) {
    throw new Error('Emergency export passphrase must be at least 12 characters.');
  }
  return value;
}

function deriveExportKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, 32, {
    N: Number(process.env.WALLET_EXPORT_SCRYPT_N || 16384),
    r: Number(process.env.WALLET_EXPORT_SCRYPT_R || 8),
    p: Number(process.env.WALLET_EXPORT_SCRYPT_P || 1),
  });
}

function encryptWalletForUser({ encryptedPrivateKey, publicKey, walletUuid, walletFingerprint, passphrase }) {
  const safePassphrase = validateExportPassphrase(passphrase);
  const keypair = getKeypairFromEncrypted(encryptedPrivateKey);
  const signerPublicKey = keypair.publicKey.toString();
  if (signerPublicKey !== publicKey) {
    throw new Error('Wallet export blocked: encrypted key does not match wallet public key.');
  }

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveExportKey(safePassphrase, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(keypair.secretKey)),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    version: EXPORT_VERSION,
    type: 'privatedao-encrypted-execution-wallet-export',
    publicKey,
    walletUuid: walletUuid || null,
    walletFingerprint: walletFingerprint || null,
    kdf: {
      name: 'scrypt',
      N: Number(process.env.WALLET_EXPORT_SCRYPT_N || 16384),
      r: Number(process.env.WALLET_EXPORT_SCRYPT_R || 8),
      p: Number(process.env.WALLET_EXPORT_SCRYPT_P || 1),
      salt: salt.toString('base64'),
    },
    cipher: {
      name: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    },
    createdAt: new Date().toISOString(),
  };
}

function decryptWalletExportForSelfTest(exportJson, passphrase) {
  const payload = typeof exportJson === 'string' ? JSON.parse(exportJson) : exportJson;
  const salt = Buffer.from(payload.kdf.salt, 'base64');
  const iv = Buffer.from(payload.cipher.iv, 'base64');
  const tag = Buffer.from(payload.cipher.tag, 'base64');
  const ciphertext = Buffer.from(payload.cipher.ciphertext, 'base64');
  const key = deriveExportKey(validateExportPassphrase(passphrase), salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = {
  encryptWalletForUser,
  decryptWalletExportForSelfTest,
  validateExportPassphrase,
};
