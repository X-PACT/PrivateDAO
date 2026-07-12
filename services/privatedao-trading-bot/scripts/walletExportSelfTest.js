const assert = require('assert');
require('dotenv').config();

const { createBotWallet, getKeypairFromEncrypted } = require('../trading/wallet');
const { encryptWalletForUser, decryptWalletExportForSelfTest } = require('../security/encryptedWalletExport');

async function main() {
  const wallet = createBotWallet();
  const passphrase = 'test-passphrase-strong-enough';
  const opened = getKeypairFromEncrypted(wallet.encryptedPrivateKey);
  const encrypted = encryptWalletForUser({
    encryptedPrivateKey: wallet.encryptedPrivateKey,
    publicKey: wallet.publicKey,
    walletUuid: '00000000-0000-4000-8000-000000000001',
    walletFingerprint: 'selftest-fingerprint',
    passphrase,
  });
  const secret = decryptWalletExportForSelfTest(encrypted, passphrase);
  assert.strictEqual(secret.length, 64, 'export decrypts to a Solana 64-byte secret key');
  assert.deepStrictEqual([...secret], [...opened.secretKey], 'export decrypts the same wallet');
  assert.throws(() => decryptWalletExportForSelfTest(encrypted, 'wrong-passphrase-strong-enough'), /Unsupported state|authenticate|bad decrypt|invalid/i);
  assert(!JSON.stringify(encrypted).includes(Buffer.from(opened.secretKey).toString('hex')), 'export must not include raw secret hex');
  console.log(JSON.stringify({ ok: true, encryptedEmergencyExport: 'PASS', rawSecretPrinted: false }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
