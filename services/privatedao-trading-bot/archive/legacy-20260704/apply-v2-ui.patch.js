const fs = require('fs');
const path = require('path');

function mkdir(p){ fs.mkdirSync(p,{recursive:true}); }
function write(file, body){
  mkdir(path.dirname(file));
  fs.writeFileSync(file, body);
  console.log('WROTE', file);
}
function backup(file){
  if(fs.existsSync(file)){
    fs.copyFileSync(file, `${file}.bak-v2-${Date.now()}`);
  }
}

write('ui/ux.js', `
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function pulse(bot, chatId, title, steps=[]){
  const msg = await bot.sendMessage(chatId, title + "\\n\\n⏳ Preparing...", {disable_web_page_preview:true});
  for(const step of steps){
    await sleep(450);
    await bot.editMessageText(title + "\\n\\n" + step, {
      chat_id: chatId,
      message_id: msg.message_id,
      disable_web_page_preview: true
    }).catch(()=>{});
  }
  return msg;
}

module.exports = { pulse, sleep };
`);

write('ui/keyboards.js', `
function kb(rows){ return { reply_markup:{ inline_keyboard: rows } }; }

function mainMenu(){
  return kb([
    [{text:'🟢 Trade',callback_data:'v2_trade'},{text:'🔎 Discover',callback_data:'v2_discover'}],
    [{text:'💼 Wallet',callback_data:'v2_wallet'},{text:'🛡️ Security & Privacy',callback_data:'v2_security'}],
    [{text:'🤖 AI Trader',callback_data:'v2_strategy'},{text:'💰 Fees',callback_data:'v2_fees'}],
    [{text:'🪙 $PDAO',callback_data:'v2_pdao'},{text:'🏆 Why PrivateDAO?',callback_data:'v2_why'}],
    [{text:'🌐 Links',callback_data:'v2_links'},{text:'⚙️ Settings',callback_data:'v2_settings'}]
  ]);
}

function back(){ return kb([[{text:'← Back',callback_data:'v2_home'}]]); }

function walletMenu(){
  return kb([
    [{text:'➕ Deposit SOL',callback_data:'v2_deposit'},{text:'📊 Balance',callback_data:'v2_balance'}],
    [{text:'💸 Withdraw',callback_data:'v2_withdraw'},{text:'🔐 SIP Protection',callback_data:'v2_sip'}],
    [{text:'← Back',callback_data:'v2_home'}]
  ]);
}

function tradeMenu(){
  return kb([
    [{text:'🪙 Buy $PDAO',callback_data:'v2_buy_pdao'},{text:'🔍 Other Token',callback_data:'v2_other_token'}],
    [{text:'0.005 SOL',callback_data:'v2_private_buy:0.005:SOL:PDAO'},{text:'0.01 SOL',callback_data:'v2_private_buy:0.01:SOL:PDAO'}],
    [{text:'0.05 SOL',callback_data:'v2_private_buy:0.05:SOL:PDAO'},{text:'✍️ Custom',callback_data:'v2_custom_buy'}],
    [{text:'← Back',callback_data:'v2_home'}]
  ]);
}

function securityMenu(){
  return kb([
    [{text:'🛡️ Smart Shield',callback_data:'v2_feature_shield'}],
    [{text:'🥷 Private Trade',callback_data:'v2_feature_private'}],
    [{text:'✂️ Smart Split',callback_data:'v2_feature_split'}],
    [{text:'⚡ MEV Shield',callback_data:'v2_feature_mev'}],
    [{text:'📜 Verified Receipt',callback_data:'v2_feature_receipt'}],
    [{text:'← Back',callback_data:'v2_home'}]
  ]);
}

function pdaoMenu(){
  return kb([
    [{text:'💎 Buy $PDAO',callback_data:'v2_buy_pdao'}],
    [{text:'📄 Token Page',url:'https://privatedao.org/token/'}],
    [{text:'𝕏 @PrivateDAOOS',url:'https://x.com/PrivateDAOOS'}],
    [{text:'🔒 Streamflow Lock',url:'https://app.streamflow.finance/contract/solana/mainnet/3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK'}],
    [{text:'← Back',callback_data:'v2_home'}]
  ]);
}

module.exports = { mainMenu, back, walletMenu, tradeMenu, securityMenu, pdaoMenu };
`);

write('security/sip.js', `
const argon2 = require('argon2');
const crypto = require('crypto');
const { supabase } = require('../db/supabase');

function valid(code){ return /^[0-9]{4,10}$/.test(String(code||'')); }

async function setSip(telegramId, code){
  if(!valid(code)) throw new Error('SIP must be 4 to 10 digits.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await argon2.hash(salt + ':' + code, { type: argon2.argon2id });
  await supabase.from('users').upsert({ telegram_id: telegramId });
  const { error } = await supabase.from('users')
    .update({ sip_enabled:true, sip_salt:salt, sip_hash:hash, security_mode:'sip' })
    .eq('telegram_id', telegramId);
  if(error) throw new Error(error.message);
  return true;
}

async function getSipStatus(telegramId){
  const { data } = await supabase.from('users')
    .select('sip_enabled,sip_salt,sip_hash,security_mode')
    .eq('telegram_id', telegramId).single();
  return { enabled: Boolean(data?.sip_enabled), mode: data?.security_mode || 'standard', salt:data?.sip_salt, hash:data?.sip_hash };
}

async function verifySip(telegramId, code){
  const s = await getSipStatus(telegramId);
  if(!s.enabled) return true;
  if(!valid(code) || !s.hash) return false;
  return argon2.verify(s.hash, s.salt + ':' + code);
}

module.exports = { setSip, getSipStatus, verifySip, valid };
`);

write('handlers/productUi.js', `
const { mainMenu, back, walletMenu, tradeMenu, securityMenu, pdaoMenu } = require('../ui/keyboards');
const { getBotWallet } = require('../db/supabase');
const { getSolBalance } = require('../trading/jupiter');
const { setSip, getSipStatus } = require('../security/sip');

async function home(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🛡️ *PrivateDAO Trading Bot*\\n\\n' +
'A Solana trading bot built by PrivateDAO.\\n\\n' +
'Trade *$PDAO* or any Solana token using a dedicated bot wallet.\\n\\n' +
'What makes it different:\\n\\n' +
'🛡️ Smart Shield\\n🥷 Private Trade\\n✂️ Smart Split\\n⚡ MEV Shield\\n📜 Verified Receipts\\n💰 Profit-based fees only\\n\\n' +
'Choose below.', mainMenu());
}

async function wallet(bot,msg){
  const w = await getBotWallet(msg.from.id).catch(()=>null);
  const sip = await getSipStatus(msg.from.id).catch(()=>({enabled:false}));
  let bal = 0;
  if(w) bal = await getSolBalance(w.public_key).catch(()=>0);
  return bot.sendMessage(msg.chat.id,
'💼 *Wallet Center*\\n\\n' +
(w ? 'Trading wallet:\\n`'+w.public_key+'`\\n\\n' : 'No trading wallet yet. Use Deposit.\\n\\n') +
'SOL Balance: *' + bal.toFixed(5) + ' SOL*\\n' +
'SIP Protection: *' + (sip.enabled ? 'ON' : 'OFF') + '*\\n\\n' +
'This bot trades only from your dedicated bot wallet.', walletMenu());
}

async function trade(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🟢 *Trade Center*\\n\\n' +
'Choose $PDAO for the lower fee tier, or paste another Solana token mint.\\n\\n' +
'Protected trades can use Smart Shield, Smart Split and Verified Receipt.', tradeMenu());
}

async function security(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🛡️ *Security & Privacy Center*\\n\\n' +
'Simple protection tools for safer Solana trading.\\n\\n' +
'Pick a feature below.', securityMenu());
}

async function feature(bot,msg,name){
  const map = {
    shield: '🛡️ *Smart Shield*\\n\\nChecks liquidity, slippage and price impact before execution.\\n\\nGoal: avoid dangerous pools and bad entries.',
    private: '🥷 *Private Trade*\\n\\nKeeps your strategy and execution plan private inside the bot.\\n\\nGoal: trade without exposing your full plan.',
    split: '✂️ *Smart Split*\\n\\nSplits one order into smaller chunks with randomized timing.\\n\\nGoal: make large trades harder to track.',
    mev: '⚡ *MEV Shield*\\n\\nUses protected execution routes when available.\\n\\nGoal: reduce the chance of bots exploiting your swap.',
    receipt: '📜 *Verified Receipt*\\n\\nEvery protected trade gets a receipt hash.\\n\\nGoal: prove the bot followed the plan without exposing the private strategy.'
  };
  return bot.sendMessage(msg.chat.id, map[name] || map.shield, back());
}

async function pdao(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🪙 *Official $PDAO*\\n\\n' +
'Mint Address:\\n`9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump`\\n\\n' +
'Streamflow Lock:\\n`3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK`\\n\\n' +
'🎁 Trading perk:\\n$PDAO trades use the lower service fee tier.\\n\\n' +
'Fees are taken only from realized positive PnL.', pdaoMenu());
}

async function fees(bot,msg){
  return bot.sendMessage(msg.chat.id,
'💰 *Profit-Based Fees*\\n\\n' +
'No realized profit = no PnL service fee.\\n\\n' +
'$PDAO trades: *5%*\\n' +
'Other tokens: *8%*\\n' +
'Full Private Mode: *15%*\\n\\n' +
'Creator wallet receives fees automatically after profitable settlement.', back());
}

async function why(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🏆 *Why PrivateDAO?*\\n\\n' +
'Most bots focus only on speed.\\n\\n' +
'PrivateDAO adds privacy, protection and proof to execution.\\n\\n' +
'Built for Solana traders who want better execution quality, fewer exposed signals, and verifiable trade receipts.', back());
}

async function links(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🌐 *Official Links*\\n\\n' +
'Website:\\nhttps://privatedao.org\\n\\n' +
'Token:\\nhttps://privatedao.org/token/\\n\\n' +
'X:\\nhttps://x.com/PrivateDAOOS\\n\\n' +
'GitHub:\\nhttps://github.com/X-PACT/PrivateDAO', back());
}

async function askSip(bot,msg){
  return bot.sendMessage(msg.chat.id,
'🔐 *SIP Protection*\\n\\n' +
'Set a 4 to 10 digit PIN to protect withdrawals and sensitive wallet actions.\\n\\n' +
'Send:\\n`/set_sip 1234`', back());
}

async function handleSetSip(bot,msg,raw=''){
  try{
    await setSip(msg.from.id, String(raw||'').trim());
    return bot.sendMessage(msg.chat.id,'✅ *SIP Protection Enabled*\\n\\nWithdrawals and sensitive wallet actions are now protected.', back());
  }catch(e){
    return bot.sendMessage(msg.chat.id,'SIP setup failed: '+e.message, back());
  }
}

module.exports = { home, wallet, trade, security, feature, pdao, fees, why, links, askSip, handleSetSip };
`);

backup('bot.js');
let s = fs.readFileSync('bot.js','utf8');

if(!s.includes("handlers/productUi")){
  s = s.replace("const db = require('./db/supabase');", "const db = require('./db/supabase');\\nconst productUi = require('./handlers/productUi');");
}

s = s.replace(/bot\\.onText\\(\\/\\\\\\/start[\\s\\S]*?\\n\\}\\);/m, "bot.onText(/\\\\/start/, async (msg) => productUi.home(bot, msg));");

if(!s.includes('PRIVATE_DAO_V2_UI_ROUTES')){
s += `

// PRIVATE_DAO_V2_UI_ROUTES
bot.onText(/\\/why/, async (msg) => productUi.why(bot, msg));
bot.onText(/\\/wallet/, async (msg) => productUi.wallet(bot, msg));
bot.onText(/\\/fees/, async (msg) => productUi.fees(bot, msg));
bot.onText(/\\/pdao/, async (msg) => productUi.pdao(bot, msg));
bot.onText(/\\/links/, async (msg) => productUi.links(bot, msg));
bot.onText(/\\/security/, async (msg) => productUi.security(bot, msg));
bot.onText(/\\/set_sip(?:\\s+(.+))?/, async (msg, match) => productUi.handleSetSip(bot, msg, match[1] || ''));

bot.on('callback_query', async (q) => {
  const msg = q.message;
  const d = q.data || '';
  if(!d.startsWith('v2_')) return;

  await bot.answerCallbackQuery(q.id).catch(()=>{});

  if(d === 'v2_home') return productUi.home(bot,msg);
  if(d === 'v2_wallet') return productUi.wallet(bot,msg);
  if(d === 'v2_trade') return productUi.trade(bot,msg);
  if(d === 'v2_security') return productUi.security(bot,msg);
  if(d === 'v2_pdao') return productUi.pdao(bot,msg);
  if(d === 'v2_fees') return productUi.fees(bot,msg);
  if(d === 'v2_why') return productUi.why(bot,msg);
  if(d === 'v2_links') return productUi.links(bot,msg);
  if(d === 'v2_settings' || d === 'v2_sip') return productUi.askSip(bot,msg);

  if(d === 'v2_deposit') return bot.emit('text', { ...msg, text:'/deposit' });
  if(d === 'v2_balance') return bot.emit('text', { ...msg, text:'/balance' });
  if(d === 'v2_withdraw') return bot.emit('text', { ...msg, text:'/withdraw' });

  if(d === 'v2_buy_pdao') return bot.emit('text', { ...msg, text:'/buy 0.005 SOL PDAO private' });
  if(d.startsWith('v2_private_buy:')){
    const [,amount,quote,token] = d.split(':');
    return bot.emit('text', { ...msg, text:\`/buy \${amount} \${quote} \${token} private\` });
  }

  if(d === 'v2_feature_shield') return productUi.feature(bot,msg,'shield');
  if(d === 'v2_feature_private') return productUi.feature(bot,msg,'private');
  if(d === 'v2_feature_split') return productUi.feature(bot,msg,'split');
  if(d === 'v2_feature_mev') return productUi.feature(bot,msg,'mev');
  if(d === 'v2_feature_receipt') return productUi.feature(bot,msg,'receipt');

  if(d === 'v2_strategy') return bot.sendMessage(msg.chat.id, '🤖 *AI Trader*\\n\\nDescribe your strategy in plain English.\\n\\nExample:\\nBuy PDAO if price drops 5%, split the order, and avoid high slippage.', { parse_mode:'Markdown' });
  if(d === 'v2_discover' || d === 'v2_other_token' || d === 'v2_custom_buy') return bot.sendMessage(msg.chat.id, '🔍 Paste any Solana token mint address, then choose your trade size.', { parse_mode:'Markdown' });
});
`;
}

fs.writeFileSync('bot.js', s);
console.log('PATCHED bot.js');
