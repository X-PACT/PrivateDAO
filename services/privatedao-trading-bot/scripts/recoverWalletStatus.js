require('dotenv').config();

const { PublicKey } = require('@solana/web3.js');
const { supabase } = require('../db/supabase');
const { findWalletBackup } = require('../security/walletBackup');
const { getKeypairFromEncrypted } = require('../trading/wallet');
const { getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { PDAO_MINT } = require('../config/tradingPolicy');

async function main() {
  const publicKey = process.argv[2];
  if (!publicKey) throw new Error('Usage: node scripts/recoverWalletStatus.js <publicKey>');
  new PublicKey(publicKey);

  const [sol, usdc, pdao] = await Promise.all([
    getSolBalance(publicKey),
    getTokenBalance(publicKey, USDC_MINT),
    getTokenBalance(publicKey, PDAO_MINT),
  ]);

  const { data: dbRows, error } = await supabase
    .from('bot_wallets')
    .select('telegram_id,public_key,encrypted_private_key,created_at')
    .eq('public_key', publicKey)
    .limit(5);
  if (error) throw new Error(error.message);

  const backup = findWalletBackup(publicKey);
  const encryptedPrivateKey = dbRows?.[0]?.encrypted_private_key || backup?.encryptedPrivateKey || null;
  let signerMatches = false;
  if (encryptedPrivateKey) {
    const keypair = getKeypairFromEncrypted(encryptedPrivateKey);
    signerMatches = keypair.publicKey.toString() === publicKey;
  }

  console.log(JSON.stringify({
    publicKey,
    balances: { sol, usdc, pdao },
    supabaseRows: (dbRows || []).map((row) => ({
      telegram_id: row.telegram_id,
      public_key: row.public_key,
      created_at: row.created_at,
      encrypted_private_key: '<redacted>',
    })),
    localEncryptedBackup: Boolean(backup),
    canSign: signerMatches,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
