require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.WALLET_BACKUP_FILE = process.env.WALLET_BACKUP_FILE ||
  path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pdao-wallet-selftest-')), 'bot-wallets.jsonl');

const { createDeterministicBotWallet, getKeypairFromEncrypted } = require('../trading/wallet');
const { saveBotWallet, getBotWallet, supabase } = require('../db/supabase');
const { appendWalletBackup, findWalletBackup } = require('../security/walletBackup');
const { handleDeposit } = require('../handlers/wallet');

async function main() {
  const telegramId = Number(
    process.env.WALLET_PERSISTENCE_TEST_TELEGRAM_ID ||
    (9000000000000 + Math.floor(Date.now() % 1000000000))
  );
  await supabase.from('users').upsert({ telegram_id: telegramId, username: 'wallet-persistence-selftest' });

  const wallet = createDeterministicBotWallet(telegramId);
  appendWalletBackup({ telegramId, publicKey: wallet.publicKey, encryptedPrivateKey: wallet.encryptedPrivateKey });
  const saved = await saveBotWallet(telegramId, wallet.publicKey, wallet.encryptedPrivateKey);
  const loaded = await getBotWallet(telegramId);
  const backup = findWalletBackup(wallet.publicKey);
  const keypair = getKeypairFromEncrypted(loaded.encrypted_private_key);
  const replacement = createDeterministicBotWallet(`${telegramId}:replacement`);

  let silentReplaceBlocked = false;
  try {
    await saveBotWallet(telegramId, replacement.publicKey, replacement.encryptedPrivateKey);
  } catch (error) {
    silentReplaceBlocked = /Refusing to replace existing bot wallet/.test(error.message);
  }

  const sentMessages = [];
  const fakeBot = {
    sendMessage: async (_chatId, text) => {
      sentMessages.push(text);
    },
  };
  const msg = {
    chat: { id: telegramId },
    from: { id: telegramId, username: 'wallet-persistence-selftest' },
  };
  await handleDeposit(fakeBot, msg, { botWallet: null });
  const afterDeposit = await getBotWallet(telegramId);

  const ok = Boolean(
    saved?.public_key === wallet.publicKey &&
    loaded?.public_key === wallet.publicKey &&
    afterDeposit?.public_key === wallet.publicKey &&
    backup?.publicKey === wallet.publicKey &&
    keypair.publicKey.toString() === wallet.publicKey &&
    sentMessages.some((text) => text.includes(wallet.publicKey)) &&
    silentReplaceBlocked
  );

  await supabase.from('bot_wallets').delete().eq('telegram_id', telegramId);
  await supabase.from('users').delete().eq('telegram_id', telegramId);

  if (!ok) throw new Error('wallet persistence self-test failed');
  console.log(JSON.stringify({
    ok: true,
    publicKey: wallet.publicKey,
    supabasePersisted: true,
    localEncryptedBackup: true,
    canSign: true,
    depositReturnsExistingWallet: afterDeposit?.public_key === wallet.publicKey,
    silentReplaceBlocked,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
