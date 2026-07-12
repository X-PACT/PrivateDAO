const fs = require('fs');
const path = require('path');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
const { TARGET_WALLET } = require('../handlers/recovery');
const { encryptPrivateKey, getKeypairFromEncrypted } = require('../trading/wallet');
const { saveBotWallet, getBotWallet } = require('../db/supabase');
const { appendWalletBackup } = require('../security/walletBackup');
const { getSolBalance } = require('../trading/jupiter');

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '7254012270';

function readText(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > 250 * 1024 * 1024) {
    throw new Error(`Refusing to scan huge file (${stat.size} bytes): ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function flattenJson(value, out = []) {
  if (value === null || value === undefined) return out;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) flattenJson(item, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) flattenJson(item, out);
  }
  return out;
}

function extractText(filePath) {
  const raw = readText(filePath);
  if (filePath.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(raw);
      return `${raw}\n${flattenJson(parsed).join('\n')}`;
    } catch {
      return raw;
    }
  }
  return raw;
}

function keypairFromCandidate(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  if (text.startsWith('[') && text.endsWith(']')) {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.length === 64 && arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
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
  for (const match of raw.match(/\[[\d,\s]+\]/g) || []) candidates.add(match);
  for (const token of raw.split(/[\s"'`:=<>()[\]{},;]+/)) {
    if (/^[1-9A-HJ-NP-Za-km-z]{80,120}$/.test(token)) candidates.add(token);
  }
  return [...candidates];
}

function redactedPubkey(pubkey) {
  if (!pubkey) return 'unknown';
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-6)}`;
}

async function bindRecoveredWallet(keypair) {
  const publicKey = keypair.publicKey.toString();
  const encryptedPrivateKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
  const saved = await saveBotWallet(ADMIN_TELEGRAM_ID, publicKey, encryptedPrivateKey, {
    allowReplace: true,
    replacementReason: 'admin_recovery_export_match',
  });
  appendWalletBackup({
    telegramId: ADMIN_TELEGRAM_ID,
    publicKey: saved.public_key,
    encryptedPrivateKey: saved.encrypted_private_key,
  });
  const loaded = await getBotWallet(ADMIN_TELEGRAM_ID);
  const signer = getKeypairFromEncrypted(loaded.encrypted_private_key);
  if (signer.publicKey.toString() !== publicKey) {
    throw new Error('Persisted recovered signer does not reopen the target wallet');
  }
  const sol = await getSolBalance(publicKey).catch(() => null);
  return { publicKey, sol };
}

async function scanFile(filePath, shouldBind) {
  const text = extractText(filePath);
  const candidates = extractCandidates(text);
  const mentionsTarget = text.includes(TARGET_WALLET);
  const opened = [];

  for (const candidate of candidates) {
    try {
      const keypair = keypairFromCandidate(candidate);
      if (!keypair) continue;
      const publicKey = keypair.publicKey.toString();
      opened.push(publicKey);
      if (publicKey === TARGET_WALLET) {
        const result = shouldBind ? await bindRecoveredWallet(keypair) : { publicKey, sol: null };
        return {
          filePath,
          mentionsTarget,
          candidateCount: candidates.length,
          openedCount: opened.length,
          matched: true,
          bound: shouldBind,
          publicKey: result.publicKey,
          sol: result.sol,
        };
      }
    } catch {
      // Ignore malformed candidate text; never print candidate material.
    }
  }

  return {
    filePath,
    mentionsTarget,
    candidateCount: candidates.length,
    openedCount: opened.length,
    openedPubkeys: [...new Set(opened)].slice(0, 10).map(redactedPubkey),
    matched: false,
    bound: false,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const shouldBind = args.includes('--bind');
  const files = args.filter((arg) => arg !== '--bind');
  if (!files.length) {
    console.error('Usage: node scripts/scanTelegramExportForRecovery.js [--bind] <export-json-or-html> [...]');
    process.exit(2);
  }

  for (const file of files) {
    const filePath = path.resolve(file);
    const result = await scanFile(filePath, shouldBind);
    console.log(JSON.stringify(result, null, 2));
    if (result.matched) return;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`Recovery scan failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { scanFile };
