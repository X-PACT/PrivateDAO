const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createDeterministicBotWallet, encryptPrivateKey, getKeypairFromEncrypted } = require('../trading/wallet');
const { getSolBalance } = require('../trading/jupiter');
const { saveBotWallet, getBotWallet, supabase } = require('../db/supabase');
const { appendWalletBackup } = require('../security/walletBackup');

const ROOT = path.join(__dirname, '..');
const TARGET_WALLET = process.env.RECOVERY_TARGET_WALLET || '7kQPBNCwaXkKDT6UjSfUKi1gBRLmmJNvLHYzuKVGEwvq';
const ADMIN_TELEGRAM_ID = String(process.env.ADMIN_TELEGRAM_ID || '7254012270');
const DEFAULT_LIMIT = Number(process.env.HD_RECOVERY_PATH_LIMIT || 1000);
const MAX_FILE_BYTES = Number(process.env.HD_RECOVERY_MAX_FILE_BYTES || 10 * 1024 * 1024);
const TERMS = [
  'bip39',
  'ed25519-hd-key',
  'micro-ed25519-hdkey',
  'derivePath',
  'mnemonic',
  'seed phrase',
  'fromSeed',
  'Keypair.generate',
  'Keypair.fromSeed',
  'wallet.json',
  'id.json',
  'seed',
  'secretKey',
  'keypair',
  'bs58',
  'nacl',
  '@solana/web3.js',
  'BOT_WALLET_MASTER_SEED',
  'WALLET_ENCRYPTION_KEY',
];

function hashValue(value) {
  return crypto.createHash('sha256').update(Buffer.isBuffer(value) ? value : String(value)).digest('hex').slice(0, 16);
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length;
}

function isSensitiveFile(filePath) {
  const name = path.basename(filePath).toLowerCase();
  return name.startsWith('.env') || filePath.includes('secure-wallet-backups');
}

function isTextCandidate(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.map') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return false;
  if (lower.endsWith('.svg')) return false;
  return /\.(js|cjs|mjs|ts|json|jsonl|md|txt|log|bak|env|html|yml|yaml)$/i.test(filePath) ||
    path.basename(filePath).startsWith('.env') ||
    path.basename(filePath) === 'id.json' ||
    path.basename(filePath) === 'wallet.json';
}

function shouldSkipDir(name, dirPath) {
  if (['.git', '.next', 'dist', 'build', 'coverage', 'target', 'tdata'].includes(name)) return true;
  if (dirPath.includes('/.codex/plugins/cache')) return true;
  return false;
}

function walk(root, out = [], depth = 0, maxDepth = 12) {
  if (!root || depth > maxDepth || !fs.existsSync(root)) return out;
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name, filePath)) walk(filePath, out, depth + 1, maxDepth);
    } else if (entry.isFile() && isTextCandidate(filePath)) {
      out.push(filePath);
    }
  }
  return out;
}

function packageNameFor(filePath) {
  const parts = filePath.split(path.sep);
  const idx = parts.lastIndexOf('node_modules');
  if (idx === -1 || !parts[idx + 1]) return null;
  if (parts[idx + 1].startsWith('@') && parts[idx + 2]) return `${parts[idx + 1]}/${parts[idx + 2]}`;
  return parts[idx + 1];
}

function scanTermsInFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_BYTES) return null;
  let text = '';
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
  const hits = [];
  for (const term of TERMS) {
    let idx = text.indexOf(term);
    while (idx !== -1) {
      hits.push({ term, line: lineAt(text, idx) });
      idx = text.indexOf(term, idx + term.length);
    }
  }
  if (!hits.length) return null;
  const snippets = isSensitiveFile(filePath)
    ? []
    : hits.slice(0, 5).map((hit) => {
      const lines = text.split('\n');
      return {
        line: hit.line,
        term: hit.term,
        text: String(lines[hit.line - 1] || '').trim().slice(0, 180),
      };
    });
  return { filePath, hitCount: hits.length, terms: [...new Set(hits.map((hit) => hit.term))], snippets };
}

function ser32(index) {
  const out = Buffer.alloc(4);
  out.writeUInt32BE(index >>> 0, 0);
  return out;
}

function parsePath(pathValue) {
  if (!/^m(\/\d+')+$/.test(pathValue)) {
    throw new Error(`Unsupported non-hardened or invalid path: ${pathValue}`);
  }
  return pathValue.split('/').slice(1).map((part) => Number(part.slice(0, -1)) + 0x80000000);
}

function deriveSeedFromPath(seed, pathValue) {
  let i = crypto.createHmac('sha512', 'ed25519 seed').update(seed).digest();
  let key = i.subarray(0, 32);
  let chainCode = i.subarray(32);
  for (const index of parsePath(pathValue)) {
    i = crypto.createHmac('sha512', chainCode)
      .update(Buffer.concat([Buffer.alloc(1), key, ser32(index)]))
      .digest();
    key = i.subarray(0, 32);
    chainCode = i.subarray(32);
  }
  return key;
}

function deriveKeypairFromPath(seed, pathValue) {
  return Keypair.fromSeed(deriveSeedFromPath(seed, pathValue));
}

function derivePathFamilies(limit = DEFAULT_LIMIT) {
  const account = [];
  const accountNoChange = [];
  const change = [];
  for (let i = 0; i < limit; i++) {
    account.push(`m/44'/501'/${i}'/0'`);
    accountNoChange.push(`m/44'/501'/${i}'`);
    change.push(`m/44'/501'/0'/${i}'`);
  }
  return [account, accountNoChange, change];
}

function pathFamilySummary(limit = DEFAULT_LIMIT) {
  return [
    `m/44'/501'/0'..${limit - 1}'/0'`,
    `m/44'/501'/0'..${limit - 1}'`,
    `m/44'/501'/0'/0'..${limit - 1}'`,
  ];
}

function mnemonicToSeed(mnemonic, passphrase = '') {
  const normalized = String(mnemonic).trim().normalize('NFKD');
  const salt = `mnemonic${String(passphrase).normalize('NFKD')}`;
  return crypto.pbkdf2Sync(normalized, salt, 2048, 64, 'sha512');
}

function maybeDecodeBase58(text) {
  try {
    return Buffer.from(bs58.decode(text));
  } catch {
    return null;
  }
}

function addCandidate(candidates, candidate) {
  if (!candidate || !candidate.value) return;
  const digest = hashValue(candidate.value);
  const key = `${candidate.type}:${digest}:${candidate.source}:${candidate.line || ''}`;
  if (candidates.seen.has(key)) return;
  candidates.seen.add(key);
  candidates.items.push({ ...candidate, valueHash: digest });
}

function addSeedCandidate(candidates, source, line, type, seed, derivationSource = type) {
  if (!seed || seed.length < 16) return;
  addCandidate(candidates, {
    kind: 'seed',
    source,
    line,
    type,
    derivationSource,
    value: Buffer.from(seed),
  });
}

function addDirectSecretCandidate(candidates, source, line, type, secretKey) {
  if (!secretKey || secretKey.length !== 64) return;
  addCandidate(candidates, {
    kind: 'direct-secret',
    source,
    line,
    type,
    value: Buffer.from(secretKey),
  });
}

function inspectRawValue(candidates, source, line, type, rawValue) {
  const text = String(rawValue || '').trim();
  if (!text) return;

  if (/^[0-9a-fA-F]{64}$/.test(text)) {
    addSeedCandidate(candidates, source, line, `${type}:hex32`, Buffer.from(text, 'hex'));
  }
  if (/^[0-9a-fA-F]{128}$/.test(text)) {
    const bytes = Buffer.from(text, 'hex');
    addDirectSecretCandidate(candidates, source, line, `${type}:hex64`, bytes);
    addSeedCandidate(candidates, source, line, `${type}:hex64-first32`, bytes.subarray(0, 32));
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{40,120}$/.test(text)) {
    const bytes = maybeDecodeBase58(text);
    if (bytes?.length === 32) addSeedCandidate(candidates, source, line, `${type}:base58-32`, bytes);
    if (bytes?.length === 64) {
      addDirectSecretCandidate(candidates, source, line, `${type}:base58-64`, bytes);
      addSeedCandidate(candidates, source, line, `${type}:base58-64-first32`, bytes.subarray(0, 32));
    }
  }
  if (/^[a-z]+(?:\s+[a-z]+){11,23}$/.test(text)) {
    addSeedCandidate(candidates, source, line, `${type}:mnemonic-empty-passphrase`, mnemonicToSeed(text));
  }
}

function collectFileCandidates(filePath, candidates) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_BYTES) return;
  let text = '';
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  for (const match of text.matchAll(/\[[\d,\s]+\]/g)) {
    try {
      const arr = JSON.parse(match[0]);
      if (!Array.isArray(arr) || !arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) continue;
      const bytes = Buffer.from(arr);
      const line = lineAt(text, match.index || 0);
      if (bytes.length === 64) {
        addDirectSecretCandidate(candidates, filePath, line, 'json-array-64', bytes);
        addSeedCandidate(candidates, filePath, line, 'json-array-64-first32', bytes.subarray(0, 32));
      }
      if (bytes.length === 32) addSeedCandidate(candidates, filePath, line, 'json-array-32', bytes);
    } catch {
      // Ignore malformed arrays.
    }
  }

  for (const match of text.matchAll(/[0-9a-fA-F]{32}:[0-9a-fA-F]{64,}/g)) {
    try {
      const keypair = getKeypairFromEncrypted(match[0]);
      const line = lineAt(text, match.index || 0);
      addDirectSecretCandidate(candidates, filePath, line, 'encrypted-wallet-value', Buffer.from(keypair.secretKey));
      addSeedCandidate(candidates, filePath, line, 'encrypted-wallet-first32', Buffer.from(keypair.secretKey).subarray(0, 32));
    } catch {
      // Encrypted values may belong to a different key.
    }
  }

  for (const match of text.matchAll(/[1-9A-HJ-NP-Za-km-z]{40,120}/g)) {
    inspectRawValue(candidates, filePath, lineAt(text, match.index || 0), 'file-token', match[0]);
  }

  for (const match of text.matchAll(/\b[0-9a-fA-F]{64}\b|\b[0-9a-fA-F]{128}\b/g)) {
    inspectRawValue(candidates, filePath, lineAt(text, match.index || 0), 'file-token', match[0]);
  }

  const sensitiveLinePattern = /(mnemonic|seed phrase|secret recovery phrase|recovery phrase|master seed)[^"'`\n]{0,80}["'`]([^"'`]+)["'`]/ig;
  for (const match of text.matchAll(sensitiveLinePattern)) {
    inspectRawValue(candidates, filePath, lineAt(text, match.index || 0), 'labeled-phrase', match[2]);
  }
}

async function collectSupabaseCandidates(candidates) {
  const { data } = await supabase
    .from('bot_wallets')
    .select('telegram_id,public_key,encrypted_private_key,created_at')
    .limit(1000);
  for (const row of data || []) {
    if (!row.encrypted_private_key) continue;
    try {
      const keypair = getKeypairFromEncrypted(row.encrypted_private_key);
      const label = `supabase.bot_wallets:${row.telegram_id}:${row.public_key}`;
      addDirectSecretCandidate(candidates, label, null, 'supabase-encrypted-wallet', Buffer.from(keypair.secretKey));
      addSeedCandidate(candidates, label, null, 'supabase-encrypted-wallet-first32', Buffer.from(keypair.secretKey).subarray(0, 32));
    } catch {
      // Ignore unreadable encrypted rows.
    }
  }
}

function collectEnvCandidates(candidates) {
  const names = Object.keys(process.env).filter((key) => /seed|mnemonic|private|secret|key|wallet/i.test(key));
  for (const name of names) {
    if (/TOKEN|API|URL|SUPABASE|TELEGRAM|JUPITER|HELIUS|QUICKNODE|TRACKER|JITO/i.test(name) && !/WALLET|SEED|MNEMONIC/i.test(name)) {
      continue;
    }
    inspectRawValue(candidates, `env:${name}`, null, 'env', process.env[name]);
  }
}

function scanSeedCandidate({ label, type, seed, targetPublicKey, paths }) {
  let pathsTested = 0;
  for (const pathValue of paths) {
    pathsTested += 1;
    const keypair = deriveKeypairFromPath(seed, pathValue);
    if (keypair.publicKey.toString() === targetPublicKey) {
      return {
        label,
        type,
        matched: true,
        matchPath: pathValue,
        publicKey: keypair.publicKey.toString(),
        pathsTested,
        keypair,
      };
    }
  }
  return { label, type, matched: false, pathsTested };
}

function scanDirectSecretCandidate({ label, type, secretKey, targetPublicKey }) {
  try {
    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    return {
      label,
      type,
      matched: keypair.publicKey.toString() === targetPublicKey,
      publicKey: keypair.publicKey.toString(),
      keypair,
    };
  } catch {
    return { label, type, matched: false, invalid: true };
  }
}

async function bindMatchedWallet(keypair) {
  const publicKey = keypair.publicKey.toString();
  const encryptedPrivateKey = encryptPrivateKey(Buffer.from(keypair.secretKey));
  const saved = await saveBotWallet(ADMIN_TELEGRAM_ID, publicKey, encryptedPrivateKey, {
    allowReplace: true,
    replacementReason: 'hd_recovery_audit_target_match',
  });
  appendWalletBackup({
    telegramId: ADMIN_TELEGRAM_ID,
    publicKey: saved.public_key,
    encryptedPrivateKey: saved.encrypted_private_key,
  });
  const loaded = await getBotWallet(ADMIN_TELEGRAM_ID);
  const signer = getKeypairFromEncrypted(loaded.encrypted_private_key);
  if (signer.publicKey.toString() !== publicKey) {
    throw new Error('Bound recovered signer did not reopen the target wallet');
  }
  return { bound: true, publicKey, sol: await getSolBalance(publicKey).catch(() => null) };
}

function defaultRoots() {
  return [
    ROOT,
    '/home/x-pact/.codex',
    '/home/x-pact/.agents',
    '/home/x-pact/Downloads/Telegram Desktop',
    '/home/x-pact/.config',
    '/home/x-pact/.solana',
    '/home/x-pact/Documents',
    '/home/x-pact/Desktop',
    '/data/PrivateDAO-BOTS',
    '/var/lib/docker/volumes',
    '/home/x-pact/.pm2',
  ].filter((dir, index, arr) => fs.existsSync(dir) && arr.indexOf(dir) === index);
}

function summarizeDependencyHits(files) {
  const packages = new Map();
  for (const filePath of files) {
    if (!filePath.includes('/node_modules/')) continue;
    const pkg = packageNameFor(filePath);
    if (!pkg) continue;
    const hit = scanTermsInFile(filePath);
    if (!hit) continue;
    const current = packages.get(pkg) || { package: pkg, filesWithHits: 0, hitCount: 0, terms: new Set(), sampleFiles: [] };
    current.filesWithHits += 1;
    current.hitCount += hit.hitCount;
    for (const term of hit.terms) current.terms.add(term);
    if (current.sampleFiles.length < 8) current.sampleFiles.push(filePath);
    packages.set(pkg, current);
  }
  return [...packages.values()].map((entry) => ({
    package: entry.package,
    filesWithHits: entry.filesWithHits,
    hitCount: entry.hitCount,
    terms: [...entry.terms].sort(),
    sampleFiles: entry.sampleFiles,
  })).sort((a, b) => b.hitCount - a.hitCount);
}

async function runAudit(options = {}) {
  const limit = Number(options.limit || DEFAULT_LIMIT);
  const roots = options.roots?.length ? options.roots : defaultRoots();
  const bind = options.bind === true;
  const files = [...new Set(roots.flatMap((root) => walk(path.resolve(root), [], 0, root.includes('node_modules') ? 6 : 12)))];
  const sourceFiles = files.filter((filePath) => !filePath.includes('/node_modules/'));
  const dependencyFiles = files.filter((filePath) => filePath.includes('/node_modules/'));
  const pathGroups = derivePathFamilies(limit);
  const paths = pathGroups.flat();
  const candidates = { seen: new Set(), items: [] };

  collectEnvCandidates(candidates);
  await collectSupabaseCandidates(candidates);
  for (const filePath of sourceFiles) collectFileCandidates(filePath, candidates);

  const sourceTermHits = sourceFiles
    .map(scanTermsInFile)
    .filter(Boolean)
    .slice(0, 200);
  const dependencyTermHits = summarizeDependencyHits(dependencyFiles);

  const deterministicPublicKey = createDeterministicBotWallet(ADMIN_TELEGRAM_ID).publicKey;
  const masterSeedName = process.env.BOT_WALLET_MASTER_SEED ? 'BOT_WALLET_MASTER_SEED' : 'WALLET_ENCRYPTION_KEY';
  const customMasterCheck = {
    telegramId: ADMIN_TELEGRAM_ID,
    source: `env:${masterSeedName}`,
    sourceHash: hashValue(process.env[masterSeedName] || ''),
    method: 'HMAC-SHA256("privatedao-telegram-bot-wallet:v1:<telegramId>") + Keypair.fromSeed',
    publicKey: deterministicPublicKey,
    matchesTarget: deterministicPublicKey === TARGET_WALLET,
  };

  const seedResults = [];
  const directResults = [];
  const matches = [];

  for (const candidate of candidates.items) {
    if (candidate.kind === 'direct-secret') {
      const result = scanDirectSecretCandidate({
        label: `${candidate.source}${candidate.line ? `:${candidate.line}` : ''}`,
        type: candidate.type,
        secretKey: candidate.value,
        targetPublicKey: TARGET_WALLET,
      });
      const redacted = {
        source: candidate.source,
        line: candidate.line || null,
        type: candidate.type,
        valueHash: candidate.valueHash,
        directPublicKey: result.publicKey || null,
        matched: result.matched,
      };
      directResults.push(redacted);
      if (result.matched) matches.push({ ...redacted, keypair: result.keypair, matchType: 'direct-secret' });
      continue;
    }

    const result = scanSeedCandidate({
      label: `${candidate.source}${candidate.line ? `:${candidate.line}` : ''}`,
      type: candidate.type,
      seed: candidate.value,
      targetPublicKey: TARGET_WALLET,
      paths,
    });
    const redacted = {
      source: candidate.source,
      line: candidate.line || null,
      type: candidate.type,
      valueHash: candidate.valueHash,
      pathsTested: result.pathsTested,
      matched: result.matched,
      matchPath: result.matchPath || null,
    };
    seedResults.push(redacted);
    if (result.matched) matches.push({ ...redacted, keypair: result.keypair, matchType: 'hd-seed' });
  }

  let bindResult = null;
  if (bind && matches.length) bindResult = await bindMatchedWallet(matches[0].keypair);

  return {
    targetPublicKey: TARGET_WALLET,
    targetSolBalance: await getSolBalance(TARGET_WALLET).catch(() => null),
    telegramId: ADMIN_TELEGRAM_ID,
    walletGenerationImplementation: {
      appUsesKeypairGenerate: sourceTermHits.some((hit) => hit.terms.includes('Keypair.generate')),
      appUsesKeypairFromSeed: sourceTermHits.some((hit) => hit.terms.includes('Keypair.fromSeed') || hit.terms.includes('fromSeed')),
      appUsesBip39OrDerivePathLibrary: sourceTermHits.some((hit) => hit.terms.some((term) => ['bip39', 'ed25519-hd-key', 'micro-ed25519-hdkey', 'derivePath', 'mnemonic'].includes(term))),
      dependencyPackagesWithHdTerms: dependencyTermHits.filter((entry) => entry.terms.some((term) => ['bip39', 'ed25519-hd-key', 'micro-ed25519-hdkey', 'derivePath', 'mnemonic', 'fromSeed'].includes(term))),
      customMasterCheck,
    },
    derivationCoverage: {
      limitPerFamily: limit,
      pathFamilies: pathFamilySummary(limit),
      totalPathsPerSeedCandidate: paths.length,
    },
    candidateSummary: {
      totalCandidates: candidates.items.length,
      seedCandidates: seedResults.length,
      directSecretCandidates: directResults.length,
      matches: matches.length,
    },
    seedCandidatesTested: seedResults.map((item) => ({
      source: item.source,
      line: item.line,
      type: item.type,
      valueHash: item.valueHash,
      pathsTested: item.pathsTested,
      matched: item.matched,
      matchPath: item.matchPath,
    })),
    directSecretCandidatesTested: directResults.map((item) => ({
      source: item.source,
      line: item.line,
      type: item.type,
      valueHash: item.valueHash,
      directPublicKey: item.directPublicKey,
      matched: item.matched,
    })),
    matches: matches.map((match) => ({
      source: match.source,
      line: match.line,
      type: match.type,
      valueHash: match.valueHash,
      matchType: match.matchType,
      matchPath: match.matchPath || null,
    })),
    bindResult,
    sourceTermHits,
    dependencyAudit: {
      dependencyFilesScanned: dependencyFiles.length,
      packagesWithWalletTerms: dependencyTermHits,
    },
    roots,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const bind = args.includes('--bind');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const outArg = args.find((arg) => arg.startsWith('--out='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : DEFAULT_LIMIT;
  const outPath = outArg ? path.resolve(outArg.slice('--out='.length)) : null;
  const roots = args.filter((arg) => arg !== '--bind' && !arg.startsWith('--limit=') && !arg.startsWith('--out='));
  const report = await runAudit({ bind, limit, roots });
  const redactedJson = JSON.stringify(report, (key, value) => (key === 'keypair' ? undefined : value), 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${redactedJson}\n`, { mode: 0o600 });
    console.log(JSON.stringify({
      ok: true,
      reportPath: outPath,
      targetPublicKey: report.targetPublicKey,
      targetSolBalance: report.targetSolBalance,
      totalCandidates: report.candidateSummary.totalCandidates,
      seedCandidates: report.candidateSummary.seedCandidates,
      directSecretCandidates: report.candidateSummary.directSecretCandidates,
      matches: report.candidateSummary.matches,
      derivationCoverage: report.derivationCoverage,
    }, null, 2));
    return;
  }
  console.log(redactedJson);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`HD recovery audit failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  deriveKeypairFromPath,
  derivePathFamilies,
  deriveSeedFromPath,
  mnemonicToSeed,
  runAudit,
  scanSeedCandidate,
};
