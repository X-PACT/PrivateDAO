const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { TARGET_WALLET } = require('../handlers/recovery');
const { createDeterministicBotWallet, encryptPrivateKey, getKeypairFromEncrypted } = require('../trading/wallet');
const { getSolBalance } = require('../trading/jupiter');
const { saveBotWallet, getBotWallet, supabase } = require('../db/supabase');
const { appendWalletBackup } = require('../security/walletBackup');

const ROOT = path.join(__dirname, '..');
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '7254012270');
const MAX_FILE_BYTES = Number(process.env.RECOVERY_AUDIT_MAX_FILE_BYTES || 50 * 1024 * 1024);
const DEFAULT_ROOTS = [
  ROOT,
  '/home/x-pact/.codex',
  '/home/x-pact/.agents',
  '/home/x-pact/Downloads',
  '/home/x-pact/Desktop',
  '/home/x-pact/PrivateDAO',
  '/data/PrivateDAO-BOTS',
].filter((dir, index, arr) => fs.existsSync(dir) && arr.indexOf(dir) === index);

function shaPublic(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function decodeCandidate(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  if (text.startsWith('[') && text.endsWith(']')) {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.length === 64 && arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
      return { type: 'json64', keypair: Keypair.fromSecretKey(Uint8Array.from(arr)) };
    }
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{80,120}$/.test(text)) {
    const bytes = bs58.decode(text);
    if (bytes.length === 64) return { type: 'base58-64', keypair: Keypair.fromSecretKey(bytes) };
  }

  if (/^[0-9a-fA-F]{128}$/.test(text)) {
    const bytes = Buffer.from(text, 'hex');
    if (bytes.length === 64) return { type: 'hex64', keypair: Keypair.fromSecretKey(bytes) };
  }

  return null;
}

function tryEncryptedWallet(value) {
  if (!/^[0-9a-fA-F]{32}:[0-9a-fA-F]{64,}$/.test(value)) return null;
  try {
    return { type: 'encrypted', keypair: getKeypairFromEncrypted(value) };
  } catch {
    return null;
  }
}

function collectCandidates(text) {
  const candidates = [];
  const seen = new Set();
  const add = (kind, value, index) => {
    const key = `${kind}:${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ kind, value, index });
  };

  for (const match of text.matchAll(/\[[\d,\s]+\]/g)) add('array', match[0], match.index || 0);
  for (const match of text.matchAll(/(?:Uint8Array|Buffer)\.from\(\s*(\[[\d,\s]+\])\s*\)/g)) {
    add('typed-array', match[1], match.index || 0);
  }
  for (const match of text.matchAll(/[1-9A-HJ-NP-Za-km-z]{80,120}/g)) add('base58', match[0], match.index || 0);
  for (const match of text.matchAll(/\b[0-9a-fA-F]{128}\b/g)) add('hex64', match[0], match.index || 0);
  for (const match of text.matchAll(/[0-9a-fA-F]{32}:[0-9a-fA-F]{64,}/g)) add('encrypted', match[0], match.index || 0);

  return candidates;
}

function shouldSkipDir(name, dirPath) {
  if (['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'tdata'].includes(name)) return true;
  if (dirPath.includes('/.codex/plugins/cache')) return true;
  return false;
}

function shouldScanFile(filePath) {
  const name = path.basename(filePath).toLowerCase();
  const ext = path.extname(name);
  if (name.startsWith('.env')) return true;
  if (name.includes('wallet') || name.includes('backup') || name.includes('session')) return true;
  return ['.js', '.json', '.jsonl', '.log', '.bak', '.txt', '.md', '.env', '.yaml', '.yml', '.html'].includes(ext);
}

function walk(root, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name, filePath)) walk(filePath, out);
      continue;
    }
    if (!entry.isFile() || !shouldScanFile(filePath)) continue;
    out.push(filePath);
  }
  return out;
}

async function bindIfRequested(keypair, bind) {
  const publicKey = keypair.publicKey.toString();
  if (!bind) return { bound: false };

  const encryptedPrivateKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
  const saved = await saveBotWallet(ADMIN_TELEGRAM_ID, publicKey, encryptedPrivateKey, {
    allowReplace: true,
    replacementReason: 'local_recovery_audit_target_match',
  });
  appendWalletBackup({
    telegramId: ADMIN_TELEGRAM_ID,
    publicKey: saved.public_key,
    encryptedPrivateKey: saved.encrypted_private_key,
  });
  const loaded = await getBotWallet(ADMIN_TELEGRAM_ID);
  const signer = getKeypairFromEncrypted(loaded.encrypted_private_key);
  if (signer.publicKey.toString() !== publicKey) {
    throw new Error('Recovered wallet did not reopen after encrypted storage');
  }
  return { bound: true };
}

async function scanSupabase(bind) {
  const summary = {
    source: 'supabase.bot_wallets',
    rowsScanned: 0,
    currentTelegramWallet: null,
    targetRows: [],
    openedWallets: [],
    matches: [],
  };

  const { data: rows, error } = await supabase
    .from('bot_wallets')
    .select('telegram_id,public_key,encrypted_private_key,created_at')
    .limit(1000);
  if (error) {
    summary.error = error.message;
    return summary;
  }

  for (const row of rows || []) {
    summary.rowsScanned += 1;
    if (String(row.telegram_id) === ADMIN_TELEGRAM_ID) {
      summary.currentTelegramWallet = {
        telegramId: row.telegram_id,
        publicKey: row.public_key,
        publicKeyHash: shaPublic(row.public_key),
        createdAt: row.created_at || null,
      };
    }
    if (row.public_key === TARGET_WALLET) {
      summary.targetRows.push({
        telegramId: row.telegram_id,
        publicKey: row.public_key,
        publicKeyHash: shaPublic(row.public_key),
        createdAt: row.created_at || null,
      });
    }
    if (!row.encrypted_private_key) continue;
    try {
      const signer = getKeypairFromEncrypted(row.encrypted_private_key);
      const publicKey = signer.publicKey.toString();
      summary.openedWallets.push({
        telegramId: row.telegram_id,
        publicKey,
        publicKeyHash: shaPublic(publicKey),
        matchesTarget: publicKey === TARGET_WALLET,
      });
      if (publicKey === TARGET_WALLET) {
        const bound = await bindIfRequested(signer, bind);
        summary.matches.push({
          telegramId: row.telegram_id,
          publicKey,
          publicKeyHash: shaPublic(publicKey),
          source: 'encrypted_private_key',
          ...bound,
        });
      }
    } catch {
      summary.openedWallets.push({
        telegramId: row.telegram_id,
        publicKey: row.public_key,
        publicKeyHash: shaPublic(row.public_key),
        encryptedPrivateKeyReadable: false,
      });
    }
  }
  return summary;
}

async function scanFile(filePath, bind) {
  const stat = fs.statSync(filePath);
  const result = {
    filePath,
    size: stat.size,
    mentionsTarget: false,
    targetLines: [],
    candidateCount: 0,
    openedCount: 0,
    openedPublicKeys: [],
    matches: [],
  };

  if (stat.size > MAX_FILE_BYTES) {
    result.skipped = `file larger than ${MAX_FILE_BYTES} bytes`;
    return result;
  }

  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    result.skipped = error.message;
    return result;
  }

  let targetIndex = text.indexOf(TARGET_WALLET);
  while (targetIndex !== -1 && result.targetLines.length < 20) {
    result.mentionsTarget = true;
    result.targetLines.push(lineNumberAt(text, targetIndex));
    targetIndex = text.indexOf(TARGET_WALLET, targetIndex + TARGET_WALLET.length);
  }

  const candidates = collectCandidates(text);
  result.candidateCount = candidates.length;
  for (const candidate of candidates) {
    try {
      const decoded = candidate.kind === 'encrypted'
        ? tryEncryptedWallet(candidate.value)
        : decodeCandidate(candidate.value);
      if (!decoded) continue;
      const publicKey = decoded.keypair.publicKey.toString();
      result.openedCount += 1;
      result.openedPublicKeys.push({
        publicKey,
        publicKeyHash: shaPublic(publicKey),
        type: decoded.type,
        line: lineNumberAt(text, candidate.index),
        matchesTarget: publicKey === TARGET_WALLET,
      });
      if (publicKey === TARGET_WALLET) {
        const bound = await bindIfRequested(decoded.keypair, bind);
        result.matches.push({
          publicKey,
          publicKeyHash: shaPublic(publicKey),
          type: decoded.type,
          line: lineNumberAt(text, candidate.index),
          ...bound,
        });
      }
    } catch {
      // Candidate material is intentionally not printed.
    }
  }

  result.openedPublicKeys = result.openedPublicKeys.slice(0, 25);
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const bind = args.includes('--bind');
  const roots = args.filter((arg) => arg !== '--bind');
  const scanRoots = roots.length ? roots : DEFAULT_ROOTS;
  const files = scanRoots.flatMap((root) => (fs.existsSync(root) ? walk(path.resolve(root)) : []));
  const uniqueFiles = [...new Set(files)];
  const report = {
    targetPublicKey: TARGET_WALLET,
    telegramId: ADMIN_TELEGRAM_ID,
    bindRequested: bind,
    deterministicPublicKey: createDeterministicBotWallet(ADMIN_TELEGRAM_ID).publicKey,
    targetSolBalance: await getSolBalance(TARGET_WALLET).catch(() => null),
    supabase: await scanSupabase(bind),
    fileStats: {
      roots: scanRoots,
      filesDiscovered: uniqueFiles.length,
      filesScanned: 0,
      filesMentioningTarget: 0,
      filesWithCandidates: 0,
      totalCandidates: 0,
      totalOpened: 0,
    },
    notableFiles: [],
    matches: [],
  };

  for (const filePath of uniqueFiles) {
    const scanned = await scanFile(filePath, bind);
    if (scanned.skipped) continue;
    report.fileStats.filesScanned += 1;
    if (scanned.mentionsTarget) report.fileStats.filesMentioningTarget += 1;
    if (scanned.candidateCount > 0) report.fileStats.filesWithCandidates += 1;
    report.fileStats.totalCandidates += scanned.candidateCount;
    report.fileStats.totalOpened += scanned.openedCount;
    if (scanned.mentionsTarget || scanned.openedCount > 0 || scanned.matches.length > 0) {
      report.notableFiles.push(scanned);
    }
    if (scanned.matches.length > 0) {
      report.matches.push({ filePath, matches: scanned.matches });
    }
  }

  report.notableFiles = report.notableFiles.slice(0, 100);
  report.supabase.openedWallets = report.supabase.openedWallets.slice(0, 100);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Local recovery audit failed: ${error.message}`);
    process.exit(1);
  });
}
