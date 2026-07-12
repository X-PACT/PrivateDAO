const { createBotWallet, withdrawAllToAddress } = require('../trading/wallet');
const { getSolBalance } = require('../trading/jupiter');
const { saveBotWallet, getBotWallet, listArchivedBotWallets } = require('../db/supabase');
const { appendWalletBackup, findLatestWalletBackupByTelegramId } = require('../security/walletBackup');
const { getSipStatus, verifySip } = require('../security/sip');
const { assertWalletBinding } = require('../security/walletBinding');
const { encryptWalletForUser } = require('../security/encryptedWalletExport');

const pendingWithdraws = new Map();

// ─── /deposit ─────────────────────────────────────────────────────────────────
async function handleDeposit(bot, msg, session) {
  const chatId = msg.chat.id;
  const existingWallet = session?.botWallet || await getBotWallet(msg.from.id);

  if (existingWallet) {
    try {
      assertWalletBinding(existingWallet);
    } catch (err) {
      return bot.sendMessage(chatId,
        `Execution wallet binding needs recovery before use.\n\n` +
        `${err.message}\n\n` +
        `Run /recover_wallet.`
      );
    }
    // Already has wallet - show address
    const balance = await getSolBalance(existingWallet.public_key);
    await bot.sendMessage(chatId,
      `*Your PrivateDAO Bot Wallet*\n\n` +
      `\`${existingWallet.public_key}\`\n\n` +
      `SOL balance: *${balance.toFixed(4)} SOL*\n\n` +
      `Fund this wallet with the amount you want to trade. The bot can trade PDAO with SOL or USDC, and your PnL-based service fee is settled automatically to the creator wallet when profit is realized.`
    );
    return;
  }

  const backup = findLatestWalletBackupByTelegramId(msg.from.id);
  const archived = await listArchivedBotWallets(msg.from.id).catch(() => []);
  if (!backup && archived.length === 0) {
    const { publicKey, encryptedPrivateKey } = createBotWallet();
    appendWalletBackup({
      telegramId: msg.from.id,
      publicKey,
      encryptedPrivateKey,
    });
    const savedWallet = await saveBotWallet(msg.from.id, publicKey, encryptedPrivateKey);
    const verifiedWallet = await getBotWallet(msg.from.id);
    if (!verifiedWallet || verifiedWallet.public_key !== savedWallet.public_key) {
      throw new Error('Wallet persistence verification failed. No deposit address was issued.');
    }
    const balance = await getSolBalance(savedWallet.public_key).catch(() => 0);
    return bot.sendMessage(chatId,
      `*Your PrivateDAO Bot Wallet*\n\n` +
      `\`${savedWallet.public_key}\`\n\n` +
      `SOL balance: *${balance.toFixed(4)} SOL*\n\n` +
      `This wallet is now bound to your Telegram session. Fund it with the amount you want to trade.`
    );
  }

  return bot.sendMessage(chatId,
    `*No active execution wallet is bound to this Telegram session.*\n\n` +
    `I will not create a new wallet automatically.\n\n` +
    `${backup ? 'Encrypted local backup: found\n' : 'Encrypted local backup: not found\n'}` +
    `Archived wallets: ${archived.length}\n\n` +
    `Use /recover_wallet to restore the previous wallet, or /new_wallet confirm to create a new execution wallet explicitly.`
  );
}

async function handleNewWallet(bot, msg, raw = '') {
  const chatId = msg.chat.id;
  if (String(raw || '').trim().toLowerCase() !== 'confirm') {
    return bot.sendMessage(chatId,
      `Creating a new execution wallet archives the old one and changes the deposit address.\n\n` +
      `Send:\n\`/new_wallet confirm\``
    );
  }
  const existing = await getBotWallet(msg.from.id);
  const { publicKey, encryptedPrivateKey } = createBotWallet();
  appendWalletBackup({
    telegramId: msg.from.id,
    publicKey,
    encryptedPrivateKey,
  });
  const savedWallet = await saveBotWallet(msg.from.id, publicKey, encryptedPrivateKey, existing ? {
    allowReplace: true,
    replacementReason: 'user_explicit_new_wallet',
  } : {});
  appendWalletBackup({
    telegramId: msg.from.id,
    publicKey: savedWallet.public_key,
    encryptedPrivateKey: savedWallet.encrypted_private_key,
  });

  const verifiedWallet = await getBotWallet(msg.from.id);
  if (!verifiedWallet || verifiedWallet.public_key !== publicKey) {
    throw new Error('Wallet persistence verification failed. No deposit address was issued.');
  }

  return bot.sendMessage(chatId,
    `*New execution wallet created*\n\n` +
    `Address:\n\`${publicKey}\`\n\n` +
    `Previous wallet was archived, not deleted.`
  );
}

async function handleRecoverWallet(bot, msg) {
  const chatId = msg.chat.id;
  const existing = await getBotWallet(msg.from.id);
  if (existing) {
    const healed = await saveBotWallet(msg.from.id, existing.public_key, existing.encrypted_private_key);
    const binding = assertWalletBinding(healed);
    return bot.sendMessage(chatId,
      `*Execution wallet is already bound and verified.*\n\n` +
      `Wallet UUID: \`${binding.walletUuid}\`\n` +
      `Address:\n\`${binding.publicKey}\``
    );
  }

  const backup = findLatestWalletBackupByTelegramId(msg.from.id);
  if (!backup) {
    return bot.sendMessage(chatId, 'No encrypted backup found for this Telegram user. Recovery stopped; no new wallet was created.');
  }

  const saved = await saveBotWallet(msg.from.id, backup.publicKey, backup.encryptedPrivateKey, {
    allowReplace: true,
    replacementReason: 'user_recover_wallet_from_encrypted_backup',
  });
  const binding = assertWalletBinding(saved);
  return bot.sendMessage(chatId,
    `*Execution wallet recovered and verified.*\n\n` +
    `Wallet UUID: \`${binding.walletUuid}\`\n` +
    `Address:\n\`${binding.publicKey}\``
  );
}

async function handleExportWalletEncrypted(bot, msg, raw = '') {
  const chatId = msg.chat.id;
  const parts = String(raw || '').trim().split(/\s+/).filter(Boolean);
  const sip = await getSipStatus(msg.from.id).catch(() => ({ enabled: false }));
  const sipCode = sip.enabled ? parts.shift() : null;
  const passphrase = parts.join(' ');

  if (sip.enabled && !(await verifySip(msg.from.id, sipCode))) {
    return bot.sendMessage(chatId, 'Emergency export blocked: SIP verification failed.');
  }

  if (!passphrase || passphrase.length < 12) {
    return bot.sendMessage(chatId,
      `*Encrypted emergency export*\n\n` +
      `This sends an encrypted wallet file to this Telegram session. The raw private key is never printed in chat.\n\n` +
      `Send:\n` +
      `\`/export_wallet_encrypted ${sip.enabled ? '<SIP> ' : ''}<12+ character passphrase>\``
    );
  }

  const botWallet = await getBotWallet(msg.from.id);
  const binding = assertWalletBinding(botWallet);
  const encryptedExport = encryptWalletForUser({
    encryptedPrivateKey: botWallet.encrypted_private_key,
    publicKey: binding.publicKey,
    walletUuid: binding.walletUuid,
    walletFingerprint: binding.actualFingerprint,
    passphrase,
  });

  const buffer = Buffer.from(JSON.stringify(encryptedExport, null, 2));
  return bot.sendDocument(chatId, buffer, {
    caption:
      `Encrypted wallet export for:\n${binding.publicKey}\n\n` +
      `Keep the passphrase offline. PrivateDAO never sends the raw private key in Telegram.`,
  }, {
    filename: `privatedao-wallet-${binding.publicKey.slice(0, 8)}.encrypted.json`,
    contentType: 'application/json',
  });
}

// ─── /balance ─────────────────────────────────────────────────────────────────
async function handleBalance(bot, msg, session) {
  const chatId = msg.chat.id;

  if (!session.hasWallet) {
    return bot.sendMessage(chatId, 'No wallet found. Use /deposit or /connect.');
  }

  const balance = await getSolBalance(session.walletPublicKey);
  const walletType = session.activeWallet === 'custodial' ? 'Bot wallet' : 'Connected wallet';

  await bot.sendMessage(chatId,
    `${walletType}\n\`${session.walletPublicKey}\`\n\nSOL balance: *${balance.toFixed(4)} SOL*`
  );
}

// ─── /withdraw ────────────────────────────────────────────────────────────────
async function handleWithdraw(bot, msg, session, destinationAddress, confirmed = false) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  if (!session.botWallet) {
    return bot.sendMessage(chatId, 'No custodial bot wallet found. Withdraw works with bot wallets only.');
  }

  const parts = String(destinationAddress || '').split(/\s+/).filter(Boolean);
  const destination = parts[0] || null;
  const sipCode = parts[1] || null;
  const sip = await getSipStatus(telegramId).catch(() => ({ enabled: false }));

  if (!destination && !confirmed) {
    return bot.sendMessage(chatId,
      `*Withdraw*\n\nSend:\n\`/withdraw <your_wallet_address>${sip.enabled ? ' <SIP>' : ''}\`\n\nExample:\n\`/withdraw 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU${sip.enabled ? ' 1234' : ''}\``
    );
  }

  if (destination && !confirmed) {
    if (sip.enabled) {
      const ok = await verifySip(telegramId, sipCode);
      if (!ok) return bot.sendMessage(chatId, 'Withdraw blocked: SIP verification failed.');
    }
    pendingWithdraws.set(String(telegramId), { destination, createdAt: Date.now() });
    // Confirm step
    await bot.sendMessage(chatId,
      `*Confirm withdraw*\n\nAll available SOL will be sent to:\n\`${destination}\`\n\nConfirm only if the address is correct.`, { reply_markup: {
          inline_keyboard: [[
            { text: 'Confirm', callback_data: 'confirm_withdraw' },
            { text: 'Cancel', callback_data: 'cancel' },
          ]],
        },
      }
    );
    return;
  }

  // Execute withdraw
  try {
    const pending = pendingWithdraws.get(String(telegramId));
    const finalDestination = destination || pending?.destination || confirmed;
    if (!finalDestination) throw new Error('No confirmed withdrawal destination.');
    pendingWithdraws.delete(String(telegramId));
    const botWallet = await getBotWallet(msg.from.id);
    assertWalletBinding(botWallet);
    const { txid, amount } = await withdrawAllToAddress(botWallet.encrypted_private_key, finalDestination);
    await bot.sendMessage(chatId,
      `*Withdraw completed*\n${amount.toFixed(4)} SOL\n[Tx](https://solscan.io/tx/${txid})`
    );
  } catch (err) {
    await bot.sendMessage(chatId, `Withdraw failed: ${err.message}`);
  }
}

module.exports = {
  handleDeposit,
  handleBalance,
  handleWithdraw,
  handleRecoverWallet,
  handleNewWallet,
  handleExportWalletEncrypted,
};
