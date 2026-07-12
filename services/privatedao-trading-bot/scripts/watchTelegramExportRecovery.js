const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { scanFile } = require('./scanTelegramExportForRecovery');
require('dotenv').config();

const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '7254012270';
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const roots = [
  '/home/x-pact/Downloads',
  '/home/x-pact/Desktop',
  '/home/x-pact/Downloads/Telegram Desktop',
].filter((p) => fs.existsSync(p));

const seen = new Set();
const bot = TOKEN ? new TelegramBot(TOKEN, { polling: false }) : null;

function isCandidate(filePath) {
  const name = path.basename(filePath).toLowerCase();
  return (
    name === 'result.json' ||
    name === 'messages.json' ||
    name.includes('export') ||
    name.endsWith('.json') ||
    name.endsWith('.html') ||
    name.endsWith('.txt')
  );
}

function walk(root, out = [], depth = 0) {
  if (depth > 3) return out;
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (
        ['node_modules', '.next', 'out', '.git', 'tdata'].includes(entry.name) ||
        entry.name.startsWith('PrivateDAO-') ||
        entry.name.startsWith('PrivateDAO_') ||
        entry.name.includes('CANONICAL')
      ) continue;
      walk(filePath, out, depth + 1);
    } else if (entry.isFile() && isCandidate(filePath)) {
      out.push(filePath);
    }
  }
  return out;
}

async function notify(text) {
  console.log(text);
  if (bot) {
    try {
      await bot.sendMessage(ADMIN_TELEGRAM_ID, text);
    } catch (err) {
      console.log(`Telegram notify failed: ${err.message}`);
    }
  }
}

async function scanNewFiles() {
  const now = Date.now();
  for (const root of roots) {
    for (const filePath of walk(root)) {
      if (seen.has(filePath)) continue;
      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch {
        continue;
      }
      if (now - stat.mtimeMs > 6 * 60 * 60 * 1000) continue;
      seen.add(filePath);
      try {
        const result = await scanFile(filePath, true);
        if (result.matched) {
          await notify(`RECOVERY SUCCESS from export file.\nWallet: ${result.publicKey}\nSOL: ${result.sol === null ? 'unknown' : result.sol.toFixed(9)}`);
          process.exit(0);
        }
        if (result.mentionsTarget || result.candidateCount > 0) {
          await notify(`Recovery watcher scanned ${path.basename(filePath)}: targetMention=${result.mentionsTarget}, candidates=${result.candidateCount}, matched=false`);
        }
      } catch (err) {
        console.log(`Skipped ${filePath}: ${err.message}`);
      }
    }
  }
}

async function main() {
  await notify(`PrivateDAO recovery watcher is active.\nWatching: ${roots.join(', ')}\nIf Telegram export appears as result.json/html, I will scan and bind only if the funded wallet signer is found.`);
  await scanNewFiles();
  setInterval(scanNewFiles, 5000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
