const fs = require('fs');
const path = require('path');

const DEFAULT_BACKUP_DIR = path.join(__dirname, '..', 'secure-wallet-backups');
const BACKUP_FILE = process.env.WALLET_BACKUP_FILE || path.join(DEFAULT_BACKUP_DIR, 'bot-wallets.jsonl');
const BACKUP_DIR = path.dirname(BACKUP_FILE);

function ensureBackupStore() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(BACKUP_FILE)) {
    fs.writeFileSync(BACKUP_FILE, '', { mode: 0o600 });
  }
  fs.chmodSync(BACKUP_DIR, 0o700);
  fs.chmodSync(BACKUP_FILE, 0o600);
}

function appendWalletBackup({ telegramId, publicKey, encryptedPrivateKey }) {
  ensureBackupStore();
  const record = {
    createdAt: new Date().toISOString(),
    telegramId,
    publicKey,
    encryptedPrivateKey,
  };
  fs.appendFileSync(BACKUP_FILE, `${JSON.stringify(record)}\n`, { mode: 0o600 });
}

function readBackups() {
  ensureBackupStore();
  return fs.readFileSync(BACKUP_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findWalletBackup(publicKey) {
  const records = readBackups();
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (record.publicKey === publicKey) return record;
  }
  return null;
}

function findLatestWalletBackupByTelegramId(telegramId) {
  const records = readBackups();
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i];
    if (String(record.telegramId) === String(telegramId)) return record;
  }
  return null;
}

module.exports = { appendWalletBackup, findWalletBackup, findLatestWalletBackupByTelegramId, BACKUP_FILE };
