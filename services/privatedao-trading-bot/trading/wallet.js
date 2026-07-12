const { Keypair, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const crypto = require('crypto');
const bs58 = require('bs58');
const { connection } = require('../trading/jupiter');
require('dotenv').config();

const ENCRYPTION_KEY = Buffer.from(process.env.WALLET_ENCRYPTION_KEY, 'hex'); // 32 bytes hex
const IV_LENGTH = 16;

function walletFingerprint(publicKey) {
  return crypto
    .createHash('sha256')
    .update(`privatedao-wallet-fingerprint:v1:${publicKey}`)
    .digest('hex');
}

function createWalletUuid() {
  return crypto.randomUUID();
}

// ─── Encrypt / Decrypt ────────────────────────────────────────────────────────
function encryptPrivateKey(privateKeyBytes) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(privateKeyBytes), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptPrivateKey(encryptedStr) {
  const [ivHex, encryptedHex] = encryptedStr.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// ─── Create New Bot Wallet ────────────────────────────────────────────────────
function createBotWallet() {
  const keypair = Keypair.generate();
  const encryptedKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
  return {
    publicKey: keypair.publicKey.toString(),
    encryptedPrivateKey: encryptedKey,
  };
}

// Deterministic recovery wallet per Telegram user. This prevents issuing an
// unrecoverable random deposit address if persistence fails mid-flow.
function createDeterministicBotWallet(telegramId) {
  const masterSeed = process.env.BOT_WALLET_MASTER_SEED || process.env.WALLET_ENCRYPTION_KEY;
  if (!masterSeed || masterSeed.length < 32) {
    throw new Error('BOT_WALLET_MASTER_SEED or WALLET_ENCRYPTION_KEY is required for deterministic wallet generation');
  }
  const seed = crypto
    .createHmac('sha256', Buffer.from(masterSeed))
    .update(`privatedao-telegram-bot-wallet:v1:${telegramId}`)
    .digest()
    .subarray(0, 32);
  const keypair = Keypair.fromSeed(seed);
  const encryptedKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
  return {
    publicKey: keypair.publicKey.toString(),
    encryptedPrivateKey: encryptedKey,
  };
}

// ─── Get Keypair from Encrypted Key ──────────────────────────────────────────
function getKeypairFromEncrypted(encryptedPrivateKey) {
  const privateKeyBytes = decryptPrivateKey(encryptedPrivateKey);
  return Keypair.fromSecretKey(new Uint8Array(privateKeyBytes));
}

// ─── Transfer SOL back to user (emergency withdraw) ──────────────────────────
async function withdrawAllToAddress(encryptedPrivateKey, destinationAddress) {
  const keypair = getKeypairFromEncrypted(encryptedPrivateKey);
  const destination = new PublicKey(destinationAddress);

  const balance = await connection.getBalance(keypair.publicKey);
  if (balance === 0) throw new Error('Wallet balance is zero');

  // Keep ~0.000005 SOL for tx fee, transfer the rest
  const fee = 5000; // lamports
  const transferAmount = balance - fee;
  if (transferAmount <= 0) throw new Error('Insufficient balance after network fee');

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: destination,
      lamports: transferAmount,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = keypair.publicKey;
  tx.sign(keypair);

  const txid = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(txid, 'confirmed');
  return { txid, amount: transferAmount / LAMPORTS_PER_SOL };
}

module.exports = {
  createBotWallet,
  createDeterministicBotWallet,
  getKeypairFromEncrypted,
  encryptPrivateKey,
  decryptPrivateKey,
  walletFingerprint,
  createWalletUuid,
  withdrawAllToAddress,
};
