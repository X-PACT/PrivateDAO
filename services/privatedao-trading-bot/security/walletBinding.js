const { getKeypairFromEncrypted, walletFingerprint } = require('../trading/wallet');

function getWalletBinding(row) {
  if (!row) throw new Error('No execution wallet is bound to this Telegram user. Use /recover_wallet or /new_wallet confirm.');
  const signer = getKeypairFromEncrypted(row.encrypted_private_key);
  const signerPublicKey = signer.publicKey.toString();
  const expectedFingerprint = row.wallet_fingerprint || walletFingerprint(row.public_key);
  const actualFingerprint = walletFingerprint(signerPublicKey);
  return {
    walletUuid: row.wallet_uuid || null,
    publicKey: row.public_key,
    signerPublicKey,
    expectedFingerprint,
    actualFingerprint,
    status: row.status || 'active',
    signer,
  };
}

function assertWalletBinding(row) {
  const binding = getWalletBinding(row);
  const errors = [];
  if (!binding.walletUuid) errors.push('wallet_uuid_missing');
  if (binding.status !== 'active') errors.push(`wallet_status_${binding.status}`);
  if (binding.signerPublicKey !== binding.publicKey) errors.push('encrypted_key_public_key_mismatch');
  if (binding.expectedFingerprint !== binding.actualFingerprint) errors.push('wallet_fingerprint_mismatch');
  if (errors.length) {
    throw new Error(`Wallet binding verification failed: ${errors.join(', ')}. Execution stopped; run /recover_wallet.`);
  }
  return binding;
}

module.exports = { getWalletBinding, assertWalletBinding };
