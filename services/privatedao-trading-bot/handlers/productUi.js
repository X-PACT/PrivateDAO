const fs = require('fs');
const path = require('path');
const {
  mainMenu,
  walletMenu,
  buyMenu,
  amountMenu,
  modeMenu,
  reviewMenu,
  protectionMenu,
  featureActionMenu,
  pdaoMenu,
  backMenu,
  kb,
  settingsMenu,
  communityMenu,
  tourMenu,
  adminMenu,
} = require('../ui/keyboards');
const { getBotWallet } = require('../db/supabase');
const { getSolBalance } = require('../trading/jupiter');
const { setSip, getSipStatus } = require('../security/sip');
const { isOwnerTelegramId } = require('./community');
const BOT_ROLE = String(process.env.BOT_ROLE || process.env.BOT_PROFILE || 'trading').toLowerCase();
const IS_COMMUNITY_BOT = BOT_ROLE === 'community';

const ROOT = path.join(__dirname, '..');
const DEFAULT_VIDEO = path.join(ROOT, 'artifacts', 'marketing', 'privatedao-trading-bot-commercial.mp4');

function introVideoPath() {
  const configured = String(process.env.MARKETING_VIDEO_PATH || '').trim();
  return configured || DEFAULT_VIDEO;
}

async function sendOrEdit(bot, msg, text, options) {
  if (msg.message_id) {
    try {
      return await bot.editMessageText(text, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: 'Markdown',
        ...options,
      });
    } catch (err) {
      if (!/message is not modified|there is no text/i.test(err.message || '')) {
        return bot.sendMessage(msg.chat.id, text, options);
      }
    }
  }
  return bot.sendMessage(msg.chat.id, text, options);
}

async function showIntro(bot, msg) {
  if (IS_COMMUNITY_BOT) {
    return showCommunity(bot, msg);
  }
  const video = introVideoPath();
  const ownerAccess = isOwnerTelegramId(msg.from?.id);
  const caption =
`🛡️ *PrivateDAO*

Trade Solana with protection, privacy and proof.

Watch the demo, then choose Fast, Shield or Private.
Start with a dedicated wallet for your session.`;

  if (fs.existsSync(video)) {
    try {
      return await bot.sendVideo(msg.chat.id, fs.createReadStream(video), {
        caption,
        parse_mode: 'Markdown',
        supports_streaming: true,
        ...mainMenu(ownerAccess),
      });
    } catch (err) {
      console.error('[Intro Video Error]', err.message);
    }
  }
  return showHome(bot, msg);
}

async function showHome(bot, msg) {
  if (IS_COMMUNITY_BOT) {
    return showCommunity(bot, msg);
  }
  const ownerAccess = isOwnerTelegramId(msg.from?.id);
  return sendOrEdit(bot, msg,
`🛡️ *PrivateDAO Trading*

Fast entries. Protected execution. Verified receipts.

Pick an action below.`, mainMenu(ownerAccess));
}

async function showWhy(bot, msg) {
  return sendOrEdit(bot, msg,
`🏆 *Why traders use PrivateDAO*

Normal bots chase speed only.

PrivateDAO adds wallet safety, smarter routing, private-style execution, GoldRush intelligence where it matters and proof after protected trades.`, protectionMenu());
}

async function showWallet(bot, msg) {
  const w = await getBotWallet(msg.from.id).catch(() => null);
  const sip = await getSipStatus(msg.from.id).catch(() => ({ enabled: false }));
  let balance = 0;
  if (w) balance = await getSolBalance(w.public_key).catch(() => 0);

  return sendOrEdit(bot, msg,
`💼 *Trading Wallet*

${w ? `Address:\n\`${w.public_key}\`` : 'No wallet yet. Tap Get Deposit Address.'}

SOL: *${balance.toFixed(5)}*
Protection: ${sip.enabled ? 'SIP ON' : 'SIP OFF'}

This is your dedicated execution wallet.`, walletMenu());
}

async function showBuy(bot, msg) {
  return sendOrEdit(bot, msg,
`🟢 *Buy*

Choose the asset, amount and execution style.

Flow: asset -> amount -> mode -> review -> execute.

PrivateDAO checks wallet, route and risk before sending.

Use *Tools* to discover tokens, run limit orders, or start sniper mode.`, buyMenu());
}

async function showPrivateBuy(bot, msg) {
  return sendOrEdit(bot, msg,
`🥷 *Private Buy*

For trades where you want less obvious execution.

The bot prepares split execution and verified receipt data before broadcast.`, reviewMenu('private', '0.01', 'SOL', 'PDAO'));
}

async function showAmount(bot, msg, token = 'PDAO') {
  return sendOrEdit(bot, msg,
`💎 *Amount*

Pick a starter size.

Use small first trades while testing routes and wallet setup.`, amountMenu(token));
}

async function showMode(bot, msg, amount = '0.01', quote = 'SOL', token = 'PDAO') {
  return sendOrEdit(bot, msg,
`⚙ *Execution Mode*

Fast: quickest route.
Shield: checks risk before sending.
Private: splits and protects footprint.`, modeMenu(amount, quote, token));
}

async function showReview(bot, msg, mode = 'private', amount = '0.01', quote = 'SOL', token = 'PDAO') {
  const modeText = {
    fast: 'Fast route for simple entries.',
    shield: 'Risk checks plus protected receipt flow.',
    private: 'Split execution with privacy-first receipt flow.',
  }[mode] || 'Protected execution.';

  return sendOrEdit(bot, msg,
`✅ *Review Trade*

Asset: *${token}*
Amount: *${amount} ${quote}*
Mode: *${mode.toUpperCase()}*

${modeText}

Execution starts only after you tap Execute.`, reviewMenu(mode, amount, quote, token));
}

async function showPasteToken(bot, msg, side = 'buy') {
  const command = side === 'sell' ? '/sell 100% <token_mint> SOL shield' : '/buy 0.01 SOL <token_mint> shield';
  return sendOrEdit(bot, msg,
`✍️ *Custom Token*

Paste a token mint when you want a token that is not on the quick list.

Example:
\`${command}\``, kb([
    [{ text: 'Buy $PDAO Instead', callback_data: 'trade_review:private:0.01:SOL:PDAO' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function showProtection(bot, msg) {
  return sendOrEdit(bot, msg,
`🛡️ *Protection Center*

Choose what you want the bot to protect.

Each mode keeps the trader experience simple and puts checks in the background.`, protectionMenu());
}

async function showFeature(bot, msg, feature) {
  const text = {
    shield:
`🛡️ *Smart Shield*

Problem: bad pools, thin liquidity and painful slippage.

What it does: checks liquidity, price impact and slippage before execution.`,

    stealth:
`🥷 *Private Execution*

Problem: one obvious order can reveal your intent.

What it does: prepares smaller chunks and receipt proof around the execution plan.`,

    mev:
`⚡ *MEV Mode*

Problem: fast bots can react around public trades.

What it does: uses protected send paths when available, with split fallback.`,

    auto:
`🤖 *AI / Auto Trader*

Problem: you cannot watch every entry.

What it does: runs your chosen strategy with wallet and risk guards.`,

    receipt:
`📜 *Verified Receipts*

Problem: you need proof the bot followed the route.

What it does: links trade, route, policy, proof and Solscan confirmation without exposing your private strategy.`,
  }[feature];

  return sendOrEdit(bot, msg, text, featureActionMenu(feature));
}

async function showPdao(bot, msg) {
  return sendOrEdit(bot, msg,
`🪙 *Official $PDAO*

Mint:
\`9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump\`

$PDAO trades use the lower fee tier and the product discount path.
You can open the private trade flow, jump to the website, check the DEX, or share the community link from here.

Fees apply only when there is realized positive PnL.`, pdaoMenu());
}

async function showLinks(bot, msg) {
  return sendOrEdit(bot, msg,
`🌐 *PrivateDAO Links*

Website: https://privatedao.org
Token: https://privatedao.org/token/
X: https://x.com/PrivateDAOOS
Community: https://t.me/PrivateDAOO`, backMenu());
}

async function showFees(bot, msg) {
  return sendOrEdit(bot, msg,
`💰 *Fees*

$PDAO trades: *4%*
Other tokens: *8%*
Full Private Mode: *15%*

GoldRush add-ons:
Market intel: *0.02 SOL*
Token discovery: *0.015 SOL*
Trade preflight: *0.01 SOL*

Only from realized positive PnL.
No profit means no service fee.`, kb([
    [{ text: '🔓 Redeem Access', callback_data: 'menu_free_access' }],
    [{ text: '🔗 Invite Traders', callback_data: 'menu_referral' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function askSip(bot, msg) {
  return sendOrEdit(bot, msg,
`🔐 *Wallet Protection*

SIP protects withdrawals and sensitive wallet actions.

Tap Set SIP Now, then type your code directly in chat.
Save it somewhere safe before you continue.`, kb([
    [{ text: '✍️ Set SIP Now', callback_data: 'wallet_set_sip' }],
    [{ text: 'How to set SIP', callback_data: 'sip_help' }],
    [{ text: 'Wallet', callback_data: 'menu_wallet' }],
    [{ text: 'Community', callback_data: 'menu_community' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function showSipHelp(bot, msg) {
  return sendOrEdit(bot, msg,
`🔐 *Set SIP*

Tap Set SIP Now, then type the code directly in the next message.

Use a PIN you do not reuse elsewhere and save it offline.`, kb([
    [{ text: '✍️ Set SIP Now', callback_data: 'wallet_set_sip' }],
    [{ text: '← Wallet', callback_data: 'menu_wallet' }],
  ]));
}

async function showSettings(bot, msg) {
  return sendOrEdit(bot, msg,
`⚙ *Settings*

Keep trading private, protected and easy.

Use this area for SIP, ZK status, community tools and the guided tour.`, settingsMenu());
}

async function showCommunity(bot, msg) {
  return sendOrEdit(bot, msg,
`👥 *Community*

Groups stay social. Trading stays private.

Use this space for welcomes, verification, invites, promos, and the secure private-chat redirect.`, communityMenu());
}

async function showTour(bot, msg) {
  return sendOrEdit(bot, msg,
`🧭 *Quick Tour*

1. Open Private Chat
2. Create wallet
3. Pick Buy or Private Buy
4. Review
5. Execute

That keeps the flow simple for new traders.`, tourMenu());
}

async function showAdmin(bot, msg) {
  return sendOrEdit(bot, msg,
`💡 *Admin Dashboard*

Track groups, promo usage, community growth and emergency controls from one place.

Community group controls are available for the live group once the bot is added as admin.`, adminMenu());
}

async function showSell(bot, msg) {
  return sendOrEdit(bot, msg,
`🔴 *Sell*

Sell uses the same wallet guard, route checks and receipt flow.

Review before execution.`, kb([
    [{ text: 'Sell 100% $PDAO', callback_data: 'sell_pdao_review' }],
    [{ text: 'Paste Token', callback_data: 'sell_other' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function showSellReview(bot, msg) {
  return sendOrEdit(bot, msg,
`✅ *Review Sell*

Asset: *$PDAO*
Amount: *100%*
Mode: *Shield*

Execution starts only after you tap Execute.`, kb([
    [{ text: '🚀 Execute Sell', callback_data: 'sell_pdao_all' }],
    [{ text: 'Cancel', callback_data: 'menu_home' }],
  ]));
}

async function showReceipts(bot, msg) {
  return sendOrEdit(bot, msg,
`📜 *Receipts*

After protected execution you get hashes, signatures and Solscan links.

Use it to verify what happened without exposing your strategy.`, kb([
    [{ text: 'Buy With Receipt', callback_data: 'trade_review:private:0.01:SOL:PDAO' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function showPortfolio(bot, msg) {
  return sendOrEdit(bot, msg,
`📊 *Portfolio*

Check your execution wallet and positions from one place.

Use Balance for the current on-chain snapshot.`, kb([
    [{ text: '📊 Balance', callback_data: 'wallet_balance' }],
    [{ text: '💼 Wallet', callback_data: 'menu_wallet' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]));
}

async function showWalletExportHelp(bot, msg) {
  return sendOrEdit(bot, msg,
`📦 *Encrypted Export*

For emergency recovery, export is encrypted and sent only to your Telegram session.

Raw private keys are never printed in chat.`, kb([
    [{ text: 'Set SIP First', callback_data: 'wallet_protection' }],
    [{ text: '← Wallet', callback_data: 'menu_wallet' }],
  ]));
}

async function handleSetSip(bot, msg, raw = '') {
  const code = String(raw || '').trim();
  await setSip(msg.from.id, code);
  return bot.sendMessage(msg.chat.id,
`✅ *SIP Protection Enabled*

Withdrawals and sensitive wallet actions now require your SIP.`, backMenu());
}

module.exports = {
  showIntro,
  showHome,
  showWhy,
  showWallet,
  showBuy,
  showPrivateBuy,
  showAmount,
  showMode,
  showReview,
  showPasteToken,
  showProtection,
  showFeature,
  showPdao,
  showLinks,
  showFees,
  showSell,
  showSellReview,
  showReceipts,
  showPortfolio,
  showWalletExportHelp,
  askSip,
  showSipHelp,
  showSettings,
  showCommunity,
  showTour,
  showAdmin,
  handleSetSip,
};
