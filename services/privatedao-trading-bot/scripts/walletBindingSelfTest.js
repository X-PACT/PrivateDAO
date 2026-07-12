require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.WALLET_BACKUP_FILE = process.env.WALLET_BACKUP_FILE ||
  path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pdao-wallet-binding-')), 'bot-wallets.jsonl');

const { createBotWallet, walletFingerprint } = require('../trading/wallet');
const { saveBotWallet, getBotWallet, archiveBotWallet, listArchivedBotWallets, supabase } = require('../db/supabase');
const { appendWalletBackup } = require('../security/walletBackup');
const { assertWalletBinding } = require('../security/walletBinding');
const { handleDeposit, handleRecoverWallet, handleNewWallet } = require('../handlers/wallet');

async function main() {
  const telegramId = 9100000000000 + Math.floor(Date.now() % 100000000);
  await supabase.from('users').upsert({ telegram_id: telegramId, username: 'wallet-binding-selftest' });
  const firstDepositTelegramId = telegramId + 1;
  await supabase.from('users').upsert({ telegram_id: firstDepositTelegramId, username: 'wallet-first-deposit-selftest' });

  const firstDepositMessages = [];
  const firstDepositBot = { sendMessage: async (_chatId, text) => { firstDepositMessages.push(String(text)); } };
  const firstDepositMsg = {
    chat: { id: firstDepositTelegramId },
    from: { id: firstDepositTelegramId, username: 'wallet-first-deposit-selftest' },
  };
  await handleDeposit(firstDepositBot, firstDepositMsg, { botWallet: null });
  const firstDepositWallet = await getBotWallet(firstDepositTelegramId);

  const wallet = createBotWallet();
  appendWalletBackup({ telegramId, publicKey: wallet.publicKey, encryptedPrivateKey: wallet.encryptedPrivateKey });
  await saveBotWallet(telegramId, wallet.publicKey, wallet.encryptedPrivateKey);
  const loaded = await getBotWallet(telegramId);
  const binding = assertWalletBinding(loaded);

  const messages = [];
  const fakeBot = { sendMessage: async (_chatId, text) => { messages.push(String(text)); } };
  const msg = { chat: { id: telegramId }, from: { id: telegramId, username: 'wallet-binding-selftest' } };

  await handleDeposit(fakeBot, msg, { botWallet: null });
  const stillLoaded = await getBotWallet(telegramId);

  let mismatchBlocked = false;
  try {
    assertWalletBinding({ ...stillLoaded, wallet_fingerprint: walletFingerprint('11111111111111111111111111111111') });
  } catch {
    mismatchBlocked = true;
  }

  await archiveBotWallet(telegramId, 'selftest_archive');
  const archived = await listArchivedBotWallets(telegramId);
  await supabase.from('bot_wallets').delete().eq('telegram_id', telegramId);
  await handleRecoverWallet(fakeBot, msg);
  const recovered = await getBotWallet(telegramId);
  const recoveredBinding = assertWalletBinding(recovered);

  await handleNewWallet(fakeBot, msg, 'confirm');
  const rotated = await getBotWallet(telegramId);
  const rotatedBinding = assertWalletBinding(rotated);
  const rotatedArchives = await listArchivedBotWallets(telegramId);

  const ok = Boolean(
    binding.publicKey === wallet.publicKey &&
    Boolean(firstDepositWallet?.public_key) &&
    stillLoaded.public_key === wallet.publicKey &&
    mismatchBlocked &&
    archived.length >= 1 &&
    recoveredBinding.publicKey === wallet.publicKey &&
    rotatedBinding.publicKey !== wallet.publicKey &&
    rotatedArchives.length >= 2
  );

  await supabase.from('bot_wallets').delete().eq('telegram_id', telegramId);
  await supabase.from('bot_wallets').delete().eq('telegram_id', firstDepositTelegramId);
  await supabase.from('archived_bot_wallets').delete().eq('telegram_id', telegramId);
  await supabase.from('archived_bot_wallets').delete().eq('telegram_id', firstDepositTelegramId);
  await supabase.from('users').delete().eq('telegram_id', telegramId);
  await supabase.from('users').delete().eq('telegram_id', firstDepositTelegramId);

  if (!ok) throw new Error('wallet binding self-test failed');
  console.log(JSON.stringify({
    ok: true,
    firstDepositCreatesWallet: Boolean(firstDepositWallet?.public_key),
    sessionLossRecoveredSameWallet: recoveredBinding.publicKey === wallet.publicKey,
    depositDidNotAutoCreateNewWallet: stillLoaded.public_key === wallet.publicKey,
    mismatchBlocked,
    archivedOnRotation: rotatedArchives.length >= 2,
    newWalletExplicitOnly: rotatedBinding.publicKey !== wallet.publicKey,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
