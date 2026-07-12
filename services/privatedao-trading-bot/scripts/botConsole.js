const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LOG = path.join(ROOT, 'bot-runtime.log');

function run(command, options = {}) {
  return execSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    shell: '/bin/bash',
  });
}

function print(text = '') {
  process.stdout.write(`${text}\n`);
}

function botPids() {
  try {
    return run("pgrep -f '^node bot.js$'").trim().split(/\s+/).filter(Boolean);
  } catch {
    return [];
  }
}

function status() {
  const pids = botPids();
  print(`Bot process: ${pids.length ? `running (${pids.join(', ')})` : 'stopped'}`);
  if (fs.existsSync(LOG)) {
    const stat = fs.statSync(LOG);
    print(`Log file: ${LOG}`);
    print(`Log size: ${stat.size} bytes`);
  }
  const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const key of [
    'TRADING_BOT_EXECUTE_SWAPS',
    'ENABLE_MAINNET_TRADING',
    'ALLOW_ANY_TOKEN',
    'USER_DEFINED_TRADE_LIMIT',
    'MIN_TRADE_USD',
    'FEE_SETTLEMENT_CRON',
    'JUPITER_API_KEY',
    'HELIUS_RPC_URL',
    'JITO_SEND_TRANSACTION_URL',
    'SOLANA_TRACKER_API_KEY',
    'SUPABASE_URL',
  ]) {
    const value = env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1] || '';
    print(`${key}=${value ? '<set>' : '<missing>'}`);
  }
}

function logs(count = 120) {
  if (!fs.existsSync(LOG)) return print('No bot-runtime.log yet.');
  print(run(`tail -n ${Number(count) || 120} ${JSON.stringify(LOG)}`));
}

function errors() {
  if (!fs.existsSync(LOG)) return print('No bot-runtime.log yet.');
  const output = run(`grep -Ei 'error|warning|exception|unhandled|rejected|failed: [1-9]' ${JSON.stringify(LOG)} | grep -Ev 'Done\\. Settled: [0-9]+, Skipped: [0-9]+, Failed: 0' | tail -n 120 || true`);
  print(output || 'No recent error lines found.');
}

function start() {
  if (botPids().length) return print('Bot is already running.');
  const child = spawn('bash', ['-lc', `cd ${JSON.stringify(ROOT)} && nohup node bot.js >> bot-runtime.log 2>&1 &`], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  print('Bot start requested.');
}

function stop() {
  const pids = botPids();
  if (!pids.length) return print('Bot is already stopped.');
  for (const pid of pids) process.kill(Number(pid), 'SIGTERM');
  print(`Stopped bot process(es): ${pids.join(', ')}`);
}

function restart() {
  stop();
  setTimeout(start, 500);
}

function health() {
  run('npm run check:syntax', { stdio: 'inherit' });
  run('npm run check:security', { stdio: 'inherit' });
  run('npm run check:post-tools', { stdio: 'inherit' });
  run('npm run check:quotes', { stdio: 'inherit' });
}

function importEnv() {
  run('node scripts/importPrivateDaoBotEnv.js', { stdio: 'inherit' });
}

function mainnet() {
  run(`node - <<'NODE'
require('dotenv').config();
const { connection, getQuote, getRouteVenue, SOL_MINT, USDC_MINT } = require('./trading/jupiter');
const { PDAO_MINT, LAMPORTS_PER_SOL, USDC_DECIMALS, DEFAULT_SLIPPAGE_BPS } = require('./config/tradingPolicy');
const { getTokenMarketSummary } = require('./providers/marketData');
const { createTradeAttestation } = require('./proof/zkMatrix');
(async () => {
  const blockhash = await connection.getLatestBlockhash('confirmed');
  console.log('MAINNET_BLOCKHASH=' + blockhash.blockhash);
  const solQuote = await getQuote(SOL_MINT, PDAO_MINT, Math.floor(0.005 * LAMPORTS_PER_SOL), DEFAULT_SLIPPAGE_BPS);
  const usdcQuote = await getQuote(USDC_MINT, PDAO_MINT, Math.floor(1 * USDC_DECIMALS), DEFAULT_SLIPPAGE_BPS);
  console.log('SOL_ROUTE=' + getRouteVenue(solQuote) + ' OUT=' + solQuote.outAmount);
  console.log('USDC_ROUTE=' + getRouteVenue(usdcQuote) + ' OUT=' + usdcQuote.outAmount);
  const market = await getTokenMarketSummary(PDAO_MINT);
  const proof = createTradeAttestation({ walletPublicKey: 'readiness-wallet', side: 'buy', tokenMint: PDAO_MINT, quoteCurrency: 'SOL', inputMint: SOL_MINT, outputMint: PDAO_MINT, amountAtomic: Math.floor(0.1 * LAMPORTS_PER_SOL), slippageBps: DEFAULT_SLIPPAGE_BPS, routeVenue: getRouteVenue(solQuote), market });
  console.log('MARKET=' + [market.symbol, market.dex, market.source].filter(Boolean).join('/'));
  console.log('ZK_ATTESTATION_HASH=' + proof.attestationHash);
})().catch((err) => { console.error(err.message); process.exit(1); });
NODE`, { stdio: 'inherit' });
}

function recoveryAudit(args = []) {
  const safeArgs = args.map((arg) => JSON.stringify(arg)).join(' ');
  run(`node scripts/localRecoveryAudit.js ${safeArgs}`, { stdio: 'inherit' });
}

function help() {
  print(`PrivateDAO Bot Console

Commands:
  status       Show process and provider status
  logs [n]     Tail bot-runtime.log
  errors       Show recent warning/error lines
  health       Run syntax, security, provider, and quote checks
  mainnet      Verify live blockhash, PDAO routes, and ZK attestation
  recovery     Run redacted local wallet recovery audit
  import-env   Import /home/x-pact/PrivateDAO_bot.env into .env safely
  restart      Restart the bot
  start        Start the bot
  stop         Stop the bot
  help         Show this help
  exit         Quit interactive mode

Examples:
  npm run console -- status
  npm run console -- logs 200
  npm run console -- health`);
}

async function interactive() {
  help();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'pdao-bot> ' });
  rl.prompt();
  rl.on('line', (line) => {
    try {
      dispatch(line.trim().split(/\s+/).filter(Boolean));
    } catch (err) {
      print(`ERROR: ${err.message}`);
    }
    rl.prompt();
  });
}

function dispatch(args) {
  const cmd = args[0] || 'help';
  if (cmd === 'status') return status();
  if (cmd === 'logs') return logs(args[1]);
  if (cmd === 'errors') return errors();
  if (cmd === 'health') return health();
  if (cmd === 'mainnet') return mainnet();
  if (cmd === 'recovery') return recoveryAudit(args.slice(1));
  if (cmd === 'import-env') return importEnv();
  if (cmd === 'restart') return restart();
  if (cmd === 'start') return start();
  if (cmd === 'stop') return stop();
  if (cmd === 'help') return help();
  if (cmd === 'exit' || cmd === 'quit') process.exit(0);
  print(`Unknown command: ${cmd}`);
  help();
}

if (process.argv.length > 2) dispatch(process.argv.slice(2));
else interactive();
