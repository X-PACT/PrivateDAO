const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEFAULT_SOURCE = '/home/x-pact/PrivateDAO_bot.env';
const SOURCE = process.argv[2] || DEFAULT_SOURCE;
const TARGET = path.join(ROOT, '.env');

function parseDotEnv(text) {
  const env = new Map();
  for (const line of text.split(/\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]{2,})\s*=\s*(.*?)\s*$/);
    if (match) env.set(match[1], match[2]);
  }
  return env;
}

function setIfReal(env, key, value) {
  if (!value) return false;
  const clean = String(value).trim().replace(/^['"]|['"]$/g, '').replace(/,$/, '');
  if (!clean || clean.includes('ضع_') || clean.includes('your_')) return false;
  env.set(key, clean);
  return true;
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1] || match[0] : null;
}

function allMatches(text, regex) {
  return [...text.matchAll(regex)].map((m) => m[1] || m[0]);
}

function serializeEnv(env, original) {
  const seen = new Set();
  const lines = original.split(/\n/).map((line) => {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]{2,})=/);
    if (!match || !env.has(match[1])) return line;
    seen.add(match[1]);
    return `${match[1]}=${env.get(match[1])}`;
  });
  for (const [key, value] of env.entries()) {
    if (!seen.has(key)) lines.push(`${key}=${value}`);
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
}

function mask(value) {
  if (!value) return '<empty>';
  return '<set>';
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Source env text file not found: ${SOURCE}`);
  process.exit(1);
}

const sourceText = fs.readFileSync(SOURCE, 'utf8');
const targetText = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, 'utf8') : '';
const env = parseDotEnv(targetText);
const imported = [];

function record(key, value) {
  if (setIfReal(env, key, value)) imported.push(key);
}

for (const [key, value] of parseDotEnv(sourceText).entries()) record(key, value);

record('JUPITER_API_KEY', firstMatch(sourceText, /Jupiter\s+API\s+Key\s*=\s*([^\s]+)/i));

const urls = allMatches(sourceText, /(https?:\/\/[^\s,'"<>]+|wss:\/\/[^\s,'"<>]+)/g);
const heliusMainnet = urls.find((url) => /mainnet\.helius-rpc\.com/.test(url) && /^https:/.test(url));
const heliusWs = urls.find((url) => /^wss:\/\/mainnet\.helius-rpc\.com/.test(url));
const heliusSender = urls.find((url) => /sender\.helius-rpc\.com/.test(url));
const heliusBeta = urls.find((url) => /beta\.helius-rpc\.com/.test(url));
const solanaTracker = urls.find((url) => /data\.solanatracker\.io/.test(url));
const jitoUrls = urls.filter((url) => /block-engine\.jito\.wtf/.test(url));

record('HELIUS_RPC_URL', heliusMainnet);
record('HELIUS_WS_URL', heliusWs);
record('HELIUS_SENDER_URL', heliusSender);
record('HELIUS_BETA_RPC_URL', heliusBeta);
record('SOLANA_TRACKER_BASE_URL', solanaTracker || 'https://data.solanatracker.io');

const jitoTx = jitoUrls.find((url) => /\/transactions/.test(url));
const jitoBundle = jitoUrls.find((url) => /\/bundles/.test(url));
const jitoBase = jitoUrls.find((url) => !/\/api\//.test(url));
record('JITO_BLOCK_ENGINE_URL', jitoBase || 'https://mainnet.block-engine.jito.wtf');
record('JITO_SEND_TRANSACTION_URL', jitoTx || 'https://mainnet.block-engine.jito.wtf/api/v1/transactions');
record('JITO_BUNDLE_URL', jitoBundle || 'https://mainnet.block-engine.jito.wtf/api/v1/bundles');

const tipSection = sourceText.split(/Tip Accounts/i)[1] || '';
const tipAccounts = allMatches(tipSection, /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g).slice(0, 16);
if (tipAccounts.length) record('JITO_TIP_ACCOUNTS', tipAccounts.join(','));

const heliusKeyFromUrl = firstMatch(sourceText, /[?&]api-key=([A-Za-z0-9_-]+)/);
record('HELIUS_API_KEY', heliusKeyFromUrl);

env.set('JUPITER_BASE_URL', env.get('JUPITER_BASE_URL') || 'https://api.jup.ag');
env.set('JUPITER_ORDER_ENDPOINT', env.get('JUPITER_ORDER_ENDPOINT') || 'https://api.jup.ag/swap/v2/order');
env.set('JUPITER_EXECUTE_ENDPOINT', env.get('JUPITER_EXECUTE_ENDPOINT') || 'https://api.jup.ag/swap/v2/execute');
env.set('JUPITER_BUILD_ENDPOINT', env.get('JUPITER_BUILD_ENDPOINT') || 'https://api.jup.ag/swap/v2/build');
env.set('JUPITER_SUBMIT_ENDPOINT', env.get('JUPITER_SUBMIT_ENDPOINT') || 'https://api.jup.ag/tx/v1/submit');
env.set('JUPITER_ENABLE_V2_ORDER', env.get('JUPITER_ENABLE_V2_ORDER') || 'false');
env.set('ENABLE_JITO_FAST_SEND', env.get('ENABLE_JITO_FAST_SEND') || 'false');
env.set('JITO_STRICT', env.get('JITO_STRICT') || 'false');

fs.writeFileSync(TARGET, serializeEnv(env, targetText), { mode: 0o600 });
fs.chmodSync(TARGET, 0o600);

console.log('Imported PrivateDAO bot environment without printing secrets.');
for (const key of [...new Set(imported)].sort()) {
  console.log(`${key}=${mask(env.get(key))}`);
}
