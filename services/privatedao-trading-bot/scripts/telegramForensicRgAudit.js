const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const childProcess = require('child_process');
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getKeypairFromEncrypted } = require('../trading/wallet');

const TARGET_WALLET = process.env.RECOVERY_TARGET_WALLET || '7kQPBNCwaXkKDT6UjSfUKi1gBRLmmJNvLHYzuKVGEwvq';
const DEFAULT_ROOT = '/home/x-pact/Downloads/Telegram Desktop';
const DEFAULT_OUT = path.join(__dirname, '..', 'security', 'telegram-forensic-rg.generated.json');

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

const CANDIDATE_PATTERNS = [
  {
    kind: 'base58',
    pattern: String.raw`(?<![1-9A-HJ-NP-Za-km-z])(?:[1-9A-HJ-NP-Za-km-z]{43,49}|[1-9A-HJ-NP-Za-km-z]{86,90})(?![1-9A-HJ-NP-Za-km-z])`,
  },
  {
    kind: 'hex',
    pattern: String.raw`\b(?:[0-9a-fA-F]{64}|[0-9a-fA-F]{128})\b`,
  },
  {
    kind: 'encrypted-wallet-value',
    pattern: String.raw`[0-9a-fA-F]{32}:[0-9a-fA-F]{64,}`,
  },
  {
    kind: 'json-array',
    pattern: String.raw`\[(?:\s*\d{1,3}\s*,){31,63}\s*\d{1,3}\s*\]`,
  },
];

function sha(value, length = 16) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, length);
}

function parseArgs(argv) {
  const args = { root: DEFAULT_ROOT, out: DEFAULT_OUT };
  for (const arg of argv) {
    if (arg.startsWith('--out=')) args.out = path.resolve(arg.slice('--out='.length));
    else args.root = path.resolve(arg);
  }
  return args;
}

function listFiles(root) {
  const output = childProcess.execFileSync('find', [root, '-type', 'f', '-print'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  return output.split('\n').filter(Boolean).sort();
}

function runRg(root, pattern, extraArgs = []) {
  const args = ['-a', '-uuu', '--pcre2', '--no-heading', '-n', '-o', ...extraArgs, pattern, root];
  const result = childProcess.spawnSync('rg', args, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status === 1) return [];
  if (result.error) throw result.error;
  if (result.status !== 0) {
    return [{
      error: (result.stderr || `rg exited ${result.status}`).trim(),
      pattern,
    }];
  }
  return result.stdout.split('\n').filter(Boolean);
}

function splitRgLine(line) {
  const first = line.indexOf(':');
  if (first === -1) return null;
  const second = line.indexOf(':', first + 1);
  if (second === -1) return null;
  return {
    filePath: line.slice(0, first),
    line: Number(line.slice(first + 1, second)) || null,
    value: line.slice(second + 1),
  };
}

function parseByteArray(text) {
  try {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) return null;
    if (!arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) return null;
    return Uint8Array.from(arr);
  } catch {
    return null;
  }
}

function keypairFromBytes(bytes) {
  if (bytes.length === 64) return { candidateType: '64-byte-secret', keypair: Keypair.fromSecretKey(bytes) };
  if (bytes.length === 32) return { candidateType: '32-byte-seed', keypair: Keypair.fromSeed(bytes) };
  return null;
}

function evaluate(kind, value, filePath, line) {
  const base = {
    candidateId: sha(`${kind}:${value}`),
    kind,
    source: { filePath },
    line,
    rawLength: value.length,
    result: 'invalid-candidate',
    reason: 'Candidate did not decode to a supported Solana signer shape.',
  };

  try {
    let decoded = null;
    if (kind === 'base58') {
      let bytes;
      try {
        bytes = bs58.decode(value);
      } catch {
        return { ...base, result: 'decode-error', reason: 'Base58 decode failed.' };
      }
      decoded = keypairFromBytes(bytes);
      if (!decoded) {
        return { ...base, decodedByteLength: bytes.length, reason: 'Base58 decoded length was not 32 or 64 bytes.' };
      }
    } else if (kind === 'hex') {
      decoded = keypairFromBytes(Uint8Array.from(Buffer.from(value, 'hex')));
      if (!decoded) return { ...base, reason: 'Hex decoded length was not 32 or 64 bytes.' };
    } else if (kind === 'json-array') {
      const bytes = parseByteArray(value);
      if (!bytes) return { ...base, result: 'decode-error', reason: 'JSON byte array parse failed.' };
      decoded = keypairFromBytes(bytes);
      if (!decoded) return { ...base, decodedByteLength: bytes.length, reason: 'Array length was not 32 or 64 bytes.' };
    } else if (kind === 'encrypted-wallet-value') {
      decoded = { candidateType: 'encrypted-wallet-value', keypair: getKeypairFromEncrypted(value) };
    }

    const publicKey = decoded.keypair.publicKey.toString();
    const matchesTarget = publicKey === TARGET_WALLET;
    return {
      ...base,
      candidateType: decoded.candidateType,
      publicKey,
      publicKeyHash: sha(publicKey),
      result: matchesTarget ? 'matched-target' : 'public-key-mismatch',
      reason: matchesTarget ? 'Candidate opens the target public key.' : 'Candidate opens a different public key.',
      matchesTarget,
    };
  } catch (error) {
    return {
      ...base,
      result: 'decode-error',
      reason: error.message || 'Candidate could not be opened.',
    };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = listFiles(args.root);
  const termHits = [];
  const candidates = [];
  const seenCandidates = new Set();

  for (const term of TERMS) {
    const rows = runRg(args.root, term, ['-i', '-F']);
    if (rows[0]?.error) {
      termHits.push({ term, error: rows[0].error });
      continue;
    }
    const byFile = new Map();
    for (const row of rows) {
      const parsed = splitRgLine(row);
      if (!parsed) continue;
      const key = `${parsed.filePath}:${parsed.line}`;
      if (!byFile.has(key)) {
        byFile.set(key, { source: { filePath: parsed.filePath }, line: parsed.line, count: 0 });
      }
      byFile.get(key).count += 1;
    }
    for (const hit of byFile.values()) termHits.push({ term, ...hit });
  }

  for (const { kind, pattern } of CANDIDATE_PATTERNS) {
    const rows = runRg(args.root, pattern);
    if (rows[0]?.error) {
      candidates.push({
        candidateId: sha(`${kind}:rg-error:${pattern}`),
        kind,
        result: 'scan-error',
        reason: rows[0].error,
      });
      continue;
    }
    for (const row of rows) {
      const parsed = splitRgLine(row);
      if (!parsed) continue;
      const key = `${kind}:${sha(parsed.value, 32)}:${parsed.filePath}:${parsed.line}`;
      if (seenCandidates.has(key)) continue;
      seenCandidates.add(key);
      candidates.push(evaluate(kind, parsed.value, parsed.filePath, parsed.line));
    }
  }

  const candidateResults = {};
  const candidateKinds = {};
  const openedPublicKeys = new Map();
  for (const candidate of candidates) {
    candidateResults[candidate.result] = (candidateResults[candidate.result] || 0) + 1;
    candidateKinds[candidate.kind] = (candidateKinds[candidate.kind] || 0) + 1;
    if (candidate.publicKey) openedPublicKeys.set(candidate.publicKey, candidate.publicKeyHash);
  }
  const matches = candidates.filter((candidate) => candidate.matchesTarget);

  const report = {
    summary: {
      generatedAt: new Date().toISOString(),
      root: args.root,
      targetPublicKey: TARGET_WALLET,
      filesDiscovered: files.length,
      termHitCount: termHits.length,
      candidateCount: candidates.length,
      candidateKinds,
      candidateResults,
      openedPublicKeyCount: openedPublicKeys.size,
      matchesFound: matches.length,
      matchedCandidateIds: matches.map((candidate) => candidate.candidateId),
      targetMentionSources: termHits
        .filter((hit) => hit.term === TARGET_WALLET)
        .map((hit) => ({ source: hit.source, line: hit.line, count: hit.count })),
    },
    termHits,
    candidates,
  };

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ reportPath: args.out, ...report.summary }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Telegram rg forensic audit failed: ${error.message}`);
    process.exit(1);
  }
}
