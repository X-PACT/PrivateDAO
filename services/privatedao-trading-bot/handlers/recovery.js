const fs = require('fs');
const os = require('os');
const path = require('path');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
const { encryptPrivateKey, getKeypairFromEncrypted } = require('../trading/wallet');
const { withdrawAllToAddress } = require('../trading/wallet');
const { saveBotWallet, getBotWallet } = require('../db/supabase');
const { appendWalletBackup } = require('../security/walletBackup');
const { getSolBalance } = require('../trading/jupiter');
const { CREATOR_WALLET, assertPublicKey } = require('../config/tradingPolicy');

const TARGET_WALLET = process.env.RECOVERY_TARGET_WALLET || '7kQPBNCwaXkKDT6UjSfUKi1gBRLmmJNvLHYzuKVGEwvq';
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '7254012270');

function isAdmin(msg) {
  return String(msg.from?.id || msg.chat?.id || '') === ADMIN_TELEGRAM_ID;
}

function keypairFromCandidate(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  if (text.startsWith('[') && text.endsWith(']')) {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.length === 64) {
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{80,120}$/.test(text)) {
    const bytes = bs58.decode(text);
    if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  }

  return null;
}

function extractCandidates(text) {
  const candidates = new Set();
  const raw = String(text || '');
  const jsonArrayMatches = raw.match(/\[[\d,\s]+\]/g) || [];
  for (const match of jsonArrayMatches) candidates.add(match);

  for (const token of raw.split(/[\s"'`:=]+/)) {
    if (/^[1-9A-HJ-NP-Za-km-z]{80,120}$/.test(token)) candidates.add(token);
  }
  return [...candidates];
}

async function deleteSensitiveMessage(bot, msg) {
  try {
    await bot.deleteMessage(msg.chat.id, msg.message_id);
  } catch {
    // Best effort only. Telegram may refuse deletes depending on chat context.
  }
}

async function handleRescue(bot, msg) {
  if (!isAdmin(msg)) return;
  const current = await getBotWallet(msg.from.id).catch(() => null);
  const oldBalance = await getSolBalance(TARGET_WALLET).catch(() => null);
  await bot.sendMessage(msg.chat.id,
    `PrivateDAO recovery mode is active.\n\n` +
    `Target wallet:\n${TARGET_WALLET}\n` +
    `Target SOL: ${oldBalance === null ? 'unknown' : oldBalance.toFixed(9)}\n\n` +
    `Current bot wallet:\n${current?.public_key || 'not set'}\n\n` +
    `Send one of these only if you find it on the phone/cache:\n` +
    `/recover_key <base58_secret_key>\n` +
    `/recover_key [64,byte,array,...]\n\n` +
    `I will delete the message, test whether it opens the target wallet, and if it matches I will bind that wallet to your bot session.`
  );
}

async function tryRecoverFromText(bot, msg, text) {
  if (!isAdmin(msg)) return false;
  const candidates = extractCandidates(text);
  if (!candidates.length) return false;

  await deleteSensitiveMessage(bot, msg);

  for (const candidate of candidates) {
    try {
      const keypair = keypairFromCandidate(candidate);
      if (!keypair) continue;
      const publicKey = keypair.publicKey.toString();
      if (publicKey !== TARGET_WALLET) {
        await bot.sendMessage(msg.chat.id, `Recovery key checked but it opens ${publicKey}, not the funded wallet.`);
        continue;
      }

      const encryptedPrivateKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
      const saved = await saveBotWallet(msg.from.id, publicKey, encryptedPrivateKey, {
        allowReplace: true,
        replacementReason: 'admin_recovery_target_match',
      });
      appendWalletBackup({
        telegramId: msg.from.id,
        publicKey: saved.public_key,
        encryptedPrivateKey: saved.encrypted_private_key,
      });
      const loaded = await getBotWallet(msg.from.id);
      const signer = getKeypairFromEncrypted(loaded.encrypted_private_key);
      const sol = await getSolBalance(publicKey);
      if (signer.publicKey.toString() !== publicKey) throw new Error('Recovered signer verification failed');

      await bot.sendMessage(msg.chat.id,
        `RECOVERY SUCCESS.\n\n` +
        `The funded wallet is now bound to your bot session:\n${publicKey}\n\n` +
        `SOL balance: ${sol.toFixed(9)}\n\n` +
        `You can now use /deposit, /balance, /dex, and /buy from the same wallet.`
      );
      return true;
    } catch (err) {
      await bot.sendMessage(msg.chat.id, `Recovery candidate failed validation: ${err.message}`);
    }
  }
  return true;
}

async function handleRecoverKey(bot, msg, rawText) {
  if (!isAdmin(msg)) return;
  const handled = await tryRecoverFromText(bot, msg, rawText);
  if (!handled) {
    await bot.sendMessage(msg.chat.id, 'No usable Solana secret key candidate found in that message.');
  }
}

async function handleRescueWithdraw(bot, msg, destinationAddress) {
  if (!isAdmin(msg)) return;
  const destination = assertPublicKey(destinationAddress || CREATOR_WALLET, 'rescue destination');
  const wallet = await getBotWallet(msg.from.id);
  if (!wallet) {
    return bot.sendMessage(msg.chat.id, 'No bound bot wallet found for rescue withdraw.');
  }

  const signer = getKeypairFromEncrypted(wallet.encrypted_private_key);
  const signerPublicKey = signer.publicKey.toString();
  if (signerPublicKey !== TARGET_WALLET || wallet.public_key !== TARGET_WALLET) {
    return bot.sendMessage(
      msg.chat.id,
      `Rescue withdraw blocked.\nBound wallet: ${wallet.public_key}\nExpected recovered wallet: ${TARGET_WALLET}`
    );
  }

  const before = await getSolBalance(TARGET_WALLET);
  const { txid, amount } = await withdrawAllToAddress(wallet.encrypted_private_key, destination);
  await bot.sendMessage(
    msg.chat.id,
    `Rescue withdraw completed.\nWallet: ${TARGET_WALLET}\nDestination: ${destination}\nPrevious SOL: ${before.toFixed(9)}\nSent SOL: ${amount.toFixed(9)}\nTx: https://solscan.io/tx/${txid}`
  );
}

async function handleRecoveryDocument(bot, msg) {
  if (!isAdmin(msg) || !msg.document) return false;
  const fileName = msg.document.file_name || 'telegram-recovery.txt';
  if (!/\.(txt|json|log|md|env)$/i.test(fileName)) return false;
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdao-recovery-'));
    const filePath = await bot.downloadFile(msg.document.file_id, tmpDir);
    const text = fs.readFileSync(filePath, 'utf8');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return tryRecoverFromText(bot, msg, text);
  } catch (err) {
    await bot.sendMessage(msg.chat.id, `Recovery file scan failed: ${err.message}`);
    return true;
  }
}

module.exports = {
  TARGET_WALLET,
  handleRescue,
  handleRecoverKey,
  handleRescueWithdraw,
  tryRecoverFromText,
  handleRecoveryDocument,
};
