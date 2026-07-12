const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { TARGET_WALLET } = require('../handlers/recovery');
const { getKeypairFromEncrypted } = require('../trading/wallet');

const DEFAULT_ROOT = '/home/x-pact/Downloads/Telegram Desktop';
const MAX_FILE_BYTES = Number(process.env.TELEGRAM_FORENSIC_MAX_FILE_BYTES || 75 * 1024 * 1024);
const MAX_ZIP_ENTRY_BYTES = Number(process.env.TELEGRAM_FORENSIC_MAX_ZIP_ENTRY_BYTES || 25 * 1024 * 1024);
const REPORT_PATH = path.join(__dirname, '..', 'security', 'telegram-forensic-recovery.generated.json');

const TERMS = [
  'secret',
  'seed',
  'mnemonic',
  'wallet',
  'keypair',
  'id.json',
  'solana',
  'base58',
  'bs58',
  'Uint8Array',
  'Keypair',
  'publicKey',
  'privateKey',
  'secretKey',
  'recover',
  'withdraw',
  'deposit',
  TARGET_WALLET,
];

function sha(value, length = 16) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, length);
}

function bytesHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

function safeDecodeBase58(text) {
  try {
    return bs58.decode(text);
  } catch {
    return null;
  }
}

function lineNumberAt(text, index) {
  if (!Number.isFinite(index) || index <= 0) return 1;
  return text.slice(0, index).split('\n').length;
}

function makeSource(filePath, extra = {}) {
  return {
    filePath,
    ...extra,
  };
}

function parseByteArray(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  if (!parsed.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) return null;
  return Uint8Array.from(parsed);
}

function keypairFromBytes(bytes, type) {
  if (bytes.length === 64) {
    return { type, keypair: Keypair.fromSecretKey(bytes) };
  }
  if (bytes.length === 32) {
    return { type, keypair: Keypair.fromSeed(bytes) };
  }
  return null;
}

function evaluateCandidate(candidate, targetPublicKey) {
  const base = {
    candidateId: sha(`${candidate.kind}:${candidate.value}`),
    kind: candidate.kind,
    source: candidate.source,
    line: candidate.line,
    offset: candidate.offset,
    rawLength: candidate.value.length,
    result: 'invalid-candidate',
    reason: 'Candidate did not decode to a supported Solana signer shape.',
  };

  try {
    let decoded = null;
    if (candidate.kind === 'json-array' || candidate.kind === 'typed-array') {
      const bytes = parseByteArray(candidate.value);
      if (!bytes) return { ...base, reason: 'Byte array syntax was not parseable as JSON bytes.' };
      decoded = keypairFromBytes(bytes, bytes.length === 64 ? 'byte-array-64-secret' : 'byte-array-32-seed');
      if (!decoded) {
        return { ...base, decodedByteLength: bytes.length, reason: 'Byte array length was not 32 or 64 bytes.' };
      }
    } else if (candidate.kind === 'base58') {
      const bytes = safeDecodeBase58(candidate.value);
      if (!bytes) return { ...base, reason: 'Base58 decode failed.' };
      decoded = keypairFromBytes(bytes, bytes.length === 64 ? 'base58-64-secret' : 'base58-32-seed');
      if (!decoded) {
        return { ...base, decodedByteLength: bytes.length, reason: 'Base58 decoded length was not 32 or 64 bytes.' };
      }
    } else if (candidate.kind === 'hex') {
      const bytes = Uint8Array.from(Buffer.from(candidate.value, 'hex'));
      decoded = keypairFromBytes(bytes, bytes.length === 64 ? 'hex-64-secret' : 'hex-32-seed');
      if (!decoded) {
        return { ...base, decodedByteLength: bytes.length, reason: 'Hex decoded length was not 32 or 64 bytes.' };
      }
    } else if (candidate.kind === 'encrypted-wallet-value') {
      decoded = { type: 'encrypted-wallet-value', keypair: getKeypairFromEncrypted(candidate.value) };
    }

    if (!decoded || !decoded.keypair) return base;
    const publicKey = decoded.keypair.publicKey.toString();
    const matched = publicKey === targetPublicKey;
    return {
      ...base,
      result: matched ? 'matched-target' : 'public-key-mismatch',
      reason: matched ? 'Candidate opens the target public key.' : 'Candidate opens a different public key.',
      candidateType: decoded.type,
      publicKey,
      publicKeyHash: sha(publicKey),
      matchesTarget: matched,
    };
  } catch (error) {
    return {
      ...base,
      result: 'decode-error',
      reason: error.message || 'Candidate could not be opened as a Solana signer.',
    };
  }
}

function addCandidate(candidates, seen, kind, value, source, line, offset) {
  const normalized = String(value || '').trim();
  if (!normalized) return;
  const key = `${kind}:${sha(normalized, 32)}:${source.filePath}:${source.zipEntry || ''}:${offset || 0}`;
  if (seen.has(key)) return;
  seen.add(key);
  candidates.push({
    kind,
    value: normalized,
    source,
    line,
    offset,
  });
}

function collectTermHits(text, source) {
  const hits = [];
  const lower = text.toLowerCase();
  for (const term of TERMS) {
    const needle = term.toLowerCase();
    let count = 0;
    let firstLine = null;
    let index = lower.indexOf(needle);
    while (index !== -1) {
      count += 1;
      if (firstLine === null) firstLine = lineNumberAt(text, index);
      index = lower.indexOf(needle, index + needle.length);
    }
    if (count > 0) {
      hits.push({ term, count, firstLine, source });
    }
  }
  return hits;
}

function collectCandidatesFromText(text, source) {
  const candidates = [];
  const seen = new Set();

  for (const match of text.matchAll(/(?:Uint8Array|Buffer)\.from\(\s*(\[[\d,\s]+\])\s*\)/g)) {
    addCandidate(candidates, seen, 'typed-array', match[1], source, lineNumberAt(text, match.index || 0), match.index || 0);
  }
  for (const match of text.matchAll(/\[[0-9,\s]{90,520}\]/g)) {
    addCandidate(candidates, seen, 'json-array', match[0], source, lineNumberAt(text, match.index || 0), match.index || 0);
  }
  for (const match of text.matchAll(/[1-9A-HJ-NP-Za-km-z]{43,49}|[1-9A-HJ-NP-Za-km-z]{86,90}/g)) {
    addCandidate(candidates, seen, 'base58', match[0], source, lineNumberAt(text, match.index || 0), match.index || 0);
  }
  for (const match of text.matchAll(/\b(?:[0-9a-fA-F]{64}|[0-9a-fA-F]{128})\b/g)) {
    addCandidate(candidates, seen, 'hex', match[0], source, lineNumberAt(text, match.index || 0), match.index || 0);
  }
  for (const match of text.matchAll(/[0-9a-fA-F]{32}:[0-9a-fA-F]{64,}/g)) {
    addCandidate(candidates, seen, 'encrypted-wallet-value', match[0], source, lineNumberAt(text, match.index || 0), match.index || 0);
  }

  return {
    candidates,
    termHits: collectTermHits(text, source),
  };
}

function bufferToSearchText(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  const nulCount = [...sample].filter((byte) => byte === 0).length;
  const controlCount = [...sample].filter((byte) => byte < 9 || (byte > 13 && byte < 32)).length;
  const likelyBinary = nulCount > 0 || controlCount / Math.max(sample.length, 1) > 0.08;

  if (!likelyBinary) {
    const utf8 = buffer.toString('utf8');
    const latin1 = buffer.toString('latin1');
    return utf8 === latin1 ? utf8 : `${utf8}\n${latin1}`;
  }

  const chunks = [];
  let start = -1;
  for (let index = 0; index < buffer.length; index += 1) {
    const byte = buffer[index];
    if (byte >= 32 && byte <= 126) {
      if (start === -1) start = index;
      continue;
    }
    if (start !== -1 && index - start >= 32) chunks.push(buffer.toString('latin1', start, index));
    start = -1;
  }
  if (start !== -1 && buffer.length - start >= 32) chunks.push(buffer.toString('latin1', start));
  return chunks.join('\n');
}

function walk(root, out = []) {
  let stat;
  try {
    stat = fs.statSync(root);
  } catch {
    return out;
  }
  if (stat.isFile()) {
    out.push(root);
    return out;
  }
  if (!stat.isDirectory()) return out;

  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, out);
    } else if (entry.isFile()) {
      out.push(entryPath);
    }
  }
  return out;
}

function unzipAvailable() {
  try {
    childProcess.execFileSync('unzip', ['-v'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function listZipEntries(zipPath) {
  try {
    const output = childProcess.execFileSync('unzip', ['-Z1', zipPath], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return output.split(/\r?\n/).filter(Boolean);
  } catch (error) {
    return { error: error.message };
  }
}

function readZipEntry(zipPath, entry) {
  try {
    return childProcess.execFileSync('unzip', ['-p', zipPath, entry], {
      maxBuffer: MAX_ZIP_ENTRY_BYTES,
    });
  } catch (error) {
    return { error: error.message };
  }
}

function scanBuffer(buffer, source, targetPublicKey) {
  const text = bufferToSearchText(buffer);
  const { candidates, termHits } = collectCandidatesFromText(text, source);
  const evaluated = candidates.map((candidate) => evaluateCandidate(candidate, targetPublicKey));
  return {
    source,
    byteLength: buffer.length,
    byteHash: bytesHash(buffer),
    termHits,
    candidates: evaluated,
  };
}

function scanRegularFile(filePath, targetPublicKey) {
  const stat = fs.statSync(filePath);
  const source = makeSource(filePath);
  if (stat.size > MAX_FILE_BYTES) {
    return {
      source,
      byteLength: stat.size,
      skipped: true,
      reason: `File exceeds TELEGRAM_FORENSIC_MAX_FILE_BYTES (${MAX_FILE_BYTES}).`,
      termHits: [],
      candidates: [],
    };
  }
  const buffer = fs.readFileSync(filePath);
  return scanBuffer(buffer, source, targetPublicKey);
}

function scanZipFile(zipPath, targetPublicKey) {
  const scans = [];
  const entries = listZipEntries(zipPath);
  if (!Array.isArray(entries)) {
    scans.push({
      source: makeSource(zipPath),
      skipped: true,
      reason: `Could not list zip entries: ${entries.error}`,
      termHits: [],
      candidates: [],
    });
    return scans;
  }
  for (const entry of entries) {
    if (entry.endsWith('/')) continue;
    const buffer = readZipEntry(zipPath, entry);
    const source = makeSource(zipPath, { zipEntry: entry });
    if (!Buffer.isBuffer(buffer)) {
      scans.push({
        source,
        skipped: true,
        reason: `Could not read zip entry or entry exceeds ${MAX_ZIP_ENTRY_BYTES} bytes.`,
        termHits: [],
        candidates: [],
      });
      continue;
    }
    scans.push(scanBuffer(buffer, source, targetPublicKey));
  }
  return scans;
}

function summarize(scans, roots, targetPublicKey) {
  const candidates = scans.flatMap((scan) => scan.candidates || []);
  const termHits = scans.flatMap((scan) => scan.termHits || []);
  const byKind = {};
  const byResult = {};
  const uniquePublicKeys = new Map();
  for (const candidate of candidates) {
    byKind[candidate.kind] = (byKind[candidate.kind] || 0) + 1;
    byResult[candidate.result] = (byResult[candidate.result] || 0) + 1;
    if (candidate.publicKey) uniquePublicKeys.set(candidate.publicKey, candidate.publicKeyHash);
  }
  const matches = candidates.filter((candidate) => candidate.matchesTarget);
  return {
    generatedAt: new Date().toISOString(),
    roots,
    targetPublicKey,
    zipSupport: unzipAvailable(),
    filesOrEntriesScanned: scans.filter((scan) => !scan.skipped).length,
    filesOrEntriesSkipped: scans.filter((scan) => scan.skipped).length,
    termHitCount: termHits.length,
    candidateCount: candidates.length,
    candidateKinds: byKind,
    candidateResults: byResult,
    openedPublicKeyCount: uniquePublicKeys.size,
    matchesFound: matches.length,
    matchedCandidateIds: matches.map((candidate) => candidate.candidateId),
    targetMentionSources: termHits
      .filter((hit) => hit.term === targetPublicKey)
      .map((hit) => ({ source: hit.source, firstLine: hit.firstLine, count: hit.count })),
  };
}

function makeReport(roots, targetPublicKey = TARGET_WALLET) {
  const resolvedRoots = roots.map((root) => path.resolve(root));
  const files = [...new Set(resolvedRoots.flatMap((root) => walk(root)))].sort();
  const canUnzip = unzipAvailable();
  const scans = [];

  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.zip' && canUnzip) {
      scans.push(...scanZipFile(filePath, targetPublicKey));
      continue;
    }
    scans.push(scanRegularFile(filePath, targetPublicKey));
  }

  return {
    summary: summarize(scans, resolvedRoots, targetPublicKey),
    scannedFiles: files.map((filePath) => ({ filePath })),
    termHits: scans.flatMap((scan) => scan.termHits || []),
    candidates: scans.flatMap((scan) => scan.candidates || []),
    skipped: scans
      .filter((scan) => scan.skipped)
      .map((scan) => ({ source: scan.source, byteLength: scan.byteLength || null, reason: scan.reason })),
  };
}

function parseArgs(argv) {
  const args = {
    roots: [],
    out: REPORT_PATH,
    target: TARGET_WALLET,
  };
  for (const arg of argv) {
    if (arg.startsWith('--out=')) {
      args.out = path.resolve(arg.slice('--out='.length));
    } else if (arg.startsWith('--target=')) {
      args.target = arg.slice('--target='.length);
    } else {
      args.roots.push(arg);
    }
  }
  if (args.roots.length === 0) args.roots.push(DEFAULT_ROOT);
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = makeReport(args.roots, args.target);
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({
    reportPath: args.out,
    ...report.summary,
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Telegram forensic recovery audit failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  collectCandidatesFromText,
  evaluateCandidate,
  makeReport,
};
