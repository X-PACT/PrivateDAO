const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const role = String(process.env.BOT_ROLE || 'trading').toLowerCase();
const token = process.env.TELEGRAM_BOT_TOKEN
  || (role === 'community'
    ? process.env.COMMUNITY_BOT_TOKEN || process.env.PDAOTRAK_BOT_API
    : process.env.TRADING_BOT_TOKEN);
if (!token) {
  throw new Error(`Telegram bot token is missing for role=${role}`);
}

const api = (method) => `https://api.telegram.org/bot${token}/${method}`;

async function call(method, payload) {
  const res = await fetch(api(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`${method} failed: ${json.description || res.status}`);
  }
  return json.result;
}

async function main() {
  if (role === 'community') {
    await call('setMyName', { name: 'PrivateDAO Community Bot' });
    await call('setMyShortDescription', {
      short_description: 'PrivateDAO Community Bot • Alerts, Verify, Invite, Community',
    });
    await call('setMyDescription', {
      description:
        '👥 PrivateDAO community bot for alerts, welcomes, verification, community stats, and secure redirects to private trading.\n\n' +
        'Trading, wallets, and execution stay in the private trading bot.',
    });
  } else {
    await call('setMyName', { name: 'PrivateDAO Trading Bot' });
    await call('setMyShortDescription', {
      short_description: 'PrivateDAO Trading Bot • Buy, Sell, Private Trade, Wallet, Proof',
    });
    await call('setMyDescription', {
      description:
        '🛡 PrivateDAO official Solana trading bot for PDAO and any Solana token.\n\n' +
        '🟢 Fast Buy / 🔴 Sell / 🥷 Private Buy / ⚡ MEV / 📜 Receipts\n' +
        '💼 Dedicated wallet, SIP protection, encrypted recovery, verified execution proof, and community redirects.',
    });
  }
  await call('setChatMenuButton', {
    menu_button: {
      type: 'commands',
    },
  });
  await call('setMyCommands', {
    commands: role === 'community'
      ? [
        { command: 'start', description: '👥 Open community bot' },
        { command: 'help', description: '❓ Community help' },
        { command: 'verify', description: '✅ Verify official links' },
        { command: 'community', description: '👥 Community hub' },
        { command: 'tour', description: '🧭 Guided tour' },
        { command: 'stats', description: '📊 Community stats' },
      ]
      : [
        { command: 'start', description: '🚀 Open PrivateDAO' },
        { command: 'help', description: '❓ Commands and safety' },
        { command: 'buy', description: '🟢 Instant buy' },
        { command: 'sell', description: '🔴 Instant sell' },
        { command: 'private_buy', description: '🥷 Private execution' },
        { command: 'dex', description: '🪙 Route and DEX check' },
        { command: 'links', description: '🌐 Official links' },
        { command: 'community', description: '👥 Community hub' },
        { command: 'tour', description: '🧭 Guided tour' },
        { command: 'admin', description: '💡 Admin dashboard' },
        { command: 'verify', description: '✅ Verify official links' },
        { command: 'community_status', description: '🛡 Group status' },
        { command: 'community_on', description: '🔔 Enable group alerts' },
        { command: 'community_off', description: '🔕 Disable group alerts' },
        { command: 'promo', description: '🎁 Redeem promo access' },
        { command: 'zk', description: '🔬 ZK status' },
        { command: 'privacy', description: '🥷 Private mode' },
        { command: 'safety', description: '🛡 Safety check' },
        { command: 'modes', description: '⚙ Trading modes' },
        { command: 'deposit', description: '💼 Wallet address' },
        { command: 'balance', description: '📊 Wallet balance' },
        { command: 'strategy', description: '🤖 Choose strategy' },
        { command: 'start_trade', description: '🚀 Start strategy' },
        { command: 'stop', description: '⏹ Stop strategy' },
        { command: 'status', description: '📈 Trading status' },
        { command: 'billing', description: '💰 Fees and access' },
        { command: 'withdraw', description: '📤 Send funds out' },
      ],
  });

  console.log('Telegram bot profile and commands configured');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
