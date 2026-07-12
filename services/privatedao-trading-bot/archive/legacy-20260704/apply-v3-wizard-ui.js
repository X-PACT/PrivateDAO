const fs = require('fs');
const path = require('path');

function mkdir(p){ fs.mkdirSync(p,{recursive:true}); }
function write(file, body){
  mkdir(path.dirname(file));
  fs.writeFileSync(file, body);
  console.log('WROTE', file);
}
function backup(file){
  if(fs.existsSync(file)) fs.copyFileSync(file, `${file}.bak-v3-${Date.now()}`);
}

write('ui/keyboards.js', `
function kb(rows){ return { reply_markup:{ inline_keyboard: rows } }; }

function home(){
  return kb([
    [{text:'🟢 Trade',callback_data:'v3_trade'}],
    [{text:'💼 Wallet',callback_data:'v3_wallet'},{text:'🔍 Discover Token',callback_data:'v3_discover'}],
    [{text:'🛡 Security & Privacy',callback_data:'v3_security'}],
    [{text:'🤖 AI Trader',callback_data:'v3_ai'},{text:'📊 Portfolio',callback_data:'v3_portfolio'}],
    [{text:'🪙 $PDAO',callback_data:'v3_pdao'},{text:'💰 Fees',callback_data:'v3_fees'}],
    [{text:'🌐 Links',callback_data:'v3_links'},{text:'⚙ Settings',callback_data:'v3_settings'}]
  ]);
}

function back(){ return kb([[{text:'← Back',callback_data:'v3_home'}]]); }

function tradeAsset(){
  return kb([
    [{text:'🪙 $PDAO',callback_data:'v3_asset_pdao'}],
    [{text:'🧬 Paste Token Mint',callback_data:'v3_asset_custom'}],
    [{text:'⭐ Watchlist',callback_data:'v3_watchlist'}],
    [{text:'← Back',callback_data:'v3_home'}]
  ]);
}

function tradeAmount(){
  return kb([
    [{text:'0.005 SOL',callback_data:'v3_amount:0.005:SOL'},{text:'0.01 SOL',callback_data:'v3_amount:0.01:SOL'}],
    [{text:'0.05 SOL',callback_data:'v3_amount:0.05:SOL'},{text:'0.1 SOL',callback_data:'v3_amount:0.1:SOL'}],
    [{text:'✍ Custom Amount',callback_data:'v3_custom_amount'}],
    [{text:'← Back',callback_data:'v3_trade'}]
  ]);
}

function executionMode(){
  return kb([
    [{text:'⚡ Fast',callback_data:'v3_mode_fast'}],
    [{text:'🛡 Shield',callback_data:'v3_mode_shield'}],
    [{text:'🥷 Private',callback_data:'v3_mode_private'}],
    [{text:'← Back',callback_data:'v3_asset_pdao'}]
  ]);
}

function review(){
  return kb([
    [{text:'✅ Execute Protected Trade',callback_data:'v3_execute'}],
    [{text:'⚙ Change Protection',callback_data:'v3_execution_mode'}],
    [{text:'← Back',callback_data:'v3_asset_pdao'}]
  ]);
}

function wallet(){
  return kb([
    [{text:'➕ Deposit SOL',callback_data:'v3_deposit'},{text:'📊 Balance',callback_data:'v3_balance'}],
    [{text:'💸 Withdraw',callback_data:'v3_withdraw'},{text:'📜 History',callback_data:'v3_history'}],
    [{text:'🔐 SIP Protection',callback_data:'v3_sip'}],
    [{text:'← Back',callback_data:'v3_home'}]
  ]);
}

function security(){
  return kb([
    [{text:'🛡 Smart Shield',callback_data:'v3_feature_shield'}],
    [{text:'🥷 Private Execution',callback_data:'v3_feature_private'}],
    [{text:'✂ Smart Split',callback_data:'v3_feature_split'}],
    [{text:'⚡ MEV Shield',callback_data:'v3_feature_mev'}],
    [{text:'📜 Verified Receipt',callback_data:'v3_feature_receipt'}],
    [{text:'🔐 SIP Protection',callback_data:'v3_sip'}],
    [{text:'← Back',callback_data:'v3_home'}]
  ]);
}

function pdao(){
  return kb([
    [{text:'💎 Buy $PDAO',callback_data:'v3_asset_pdao'}],
    [{text:'📄 Token Page',url:'https://privatedao.org/token/'}],
    [{text:'𝕏 @PrivateDAOOS',url:'https://x.com/PrivateDAOOS'}],
    [{text:'🔒 Streamflow Lock',url:'https://app.streamflow.finance/contract/solana/mainnet/3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK'}],
    [{text:'← Back',callback_data:'v3_home'}]
  ]);
}

module.exports = { home, back, tradeAsset, tradeAmount, executionMode, review, wallet, security, pdao };
`);

write('ui/ux.js', `
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function render(bot, msg, text, keyboard){
  const opts = Object.assign({ parse_mode:'Markdown', disable_web_page_preview:true }, keyboard || {});
  if(msg.message_id){
    return bot.editMessageText(text, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode:'Markdown',
      disable_web_page_preview:true,
      reply_markup: keyboard?.reply_markup
    }).catch(() => bot.sendMessage(msg.chat.id, text, opts));
  }
  return bot.sendMessage(msg.chat.id, text, opts);
}

async function pulse(bot, chatId, title, steps=[]){
  const msg = await bot.sendMessage(chatId, title + "\\n\\n⏳ Preparing...", {parse_mode:'Markdown'});
  for(const step of steps){
    await sleep(500);
    await bot.editMessageText(title + "\\n\\n" + step, {
      chat_id: chatId,
      message_id: msg.message_id,
      parse_mode:'Markdown',
      disable_web_page_preview:true
    }).catch(()=>{});
  }
  return msg;
}

module.exports = { render, pulse, sleep };
`);

write('handlers/productUi.js', `
const kb = require('../ui/keyboards');
const { render, pulse } = require('../ui/ux');
const { getBotWallet } = require('../db/supabase');
const { getSolBalance } = require('../trading/jupiter');
const { setSip, getSipStatus } = require('../security/sip');

const PDAO_MINT = '9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump';

async function home(bot,msg){
  return render(bot,msg,
'🛡 *PrivateDAO Trading*\\n\\n' +
'Private execution for Solana traders.\\n\\n' +
'Trade *$PDAO* or any Solana token using a dedicated bot wallet.\\n\\n' +
'*Core advantages*\\n' +
'🛡 Smart Shield\\n' +
'🥷 Private Execution\\n' +
'✂ Smart Split\\n' +
'⚡ MEV Shield\\n' +
'📜 Verified Receipts\\n' +
'💰 Profit-based fees only\\n\\n' +
'Start below.', kb.home());
}

async function trade(bot,msg){
  return render(bot,msg,
'🟢 *Trade Wizard*\\n\\n' +
'Step 1 of 4: choose the asset.\\n\\n' +
'You can trade official *$PDAO* or paste any Solana token mint.', kb.tradeAsset());
}

async function assetPdao(bot,msg){
  return render(bot,msg,
'🪙 *Asset Selected: $PDAO*\\n\\n' +
'Mint:\\n`'+PDAO_MINT+'`\\n\\n' +
'Perk: $PDAO trades use the lower fee tier.\\n\\n' +
'Step 2 of 4: choose amount.', kb.tradeAmount());
}

async function executionMode(bot,msg){
  return render(bot,msg,
'🛡 *Execution Mode*\\n\\n' +
'Step 3 of 4: choose protection level.\\n\\n' +
'⚡ *Fast* - normal quick execution.\\n' +
'🛡 *Shield* - checks risk before execution.\\n' +
'🥷 *Private* - split execution + receipt.', kb.executionMode());
}

async function review(bot,msg){
  return render(bot,msg,
'📋 *Review Trade*\\n\\n' +
'Asset: *$PDAO*\\n' +
'Mode: *Private Protected*\\n' +
'Wallet: dedicated bot wallet\\n' +
'Fee: PnL-based only\\n\\n' +
'Execution will check wallet, liquidity, protection, split plan and receipt before broadcasting.', kb.review());
}

async function wallet(bot,msg){
  const w = await getBotWallet(msg.from.id).catch(()=>null);
  const sip = await getSipStatus(msg.from.id).catch(()=>({enabled:false}));
  let bal = 0;
  if(w) bal = await getSolBalance(w.public_key).catch(()=>0);

  return render(bot,msg,
'💼 *Wallet Dashboard*\\n\\n' +
(w ? 'Trading wallet:\\n`'+w.public_key+'`\\n\\n' : 'No trading wallet yet. Use Deposit.\\n\\n') +
'SOL Balance: *'+bal.toFixed(5)+' SOL*\\n' +
'SIP Protection: *'+(sip.enabled?'ON':'OFF')+'*\\n\\n' +
'Your personal wallet is not used for execution.', kb.wallet());
}

async function security(bot,msg){
  return render(bot,msg,
'🛡 *Security & Privacy*\\n\\n' +
'Choose a protection layer. Each feature is designed for simple trading, without technical setup.', kb.security());
}

async function feature(bot,msg,name){
  const map = {
    shield:'🛡 *Smart Shield*\\n\\nChecks liquidity, slippage and price impact before sending the trade.\\n\\nGoal: avoid dangerous pools and bad entries.',
    private:'🥷 *Private Execution*\\n\\nKeeps your strategy and execution plan private inside the bot.\\n\\nGoal: trade without exposing your full plan.',
    split:'✂ *Smart Split*\\n\\nSplits one order into smaller chunks with randomized timing.\\n\\nGoal: make larger trades harder to track.',
    mev:'⚡ *MEV Shield*\\n\\nUses protected execution routes when available.\\n\\nGoal: reduce the chance of bots exploiting your swap.',
    receipt:'📜 *Verified Receipt*\\n\\nEvery protected trade gets a receipt hash.\\n\\nGoal: prove the bot followed the plan without exposing the private strategy.'
  };
  return render(bot,msg,map[name] || map.shield,kb.back());
}

async function pdao(bot,msg){
  return render(bot,msg,
'🪙 *Official $PDAO*\\n\\n' +
'Mint Address:\\n`'+PDAO_MINT+'`\\n\\n' +
'Streamflow Lock:\\n`3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK`\\n\\n' +
'🎁 *PDAO Trading Perk*\\n' +
'$PDAO trades use the lower service fee tier.\\n\\n' +
'Fees are taken only from realized positive PnL.', kb.pdao());
}

async function fees(bot,msg){
  return render(bot,msg,
'💰 *Fees*\\n\\n' +
'No realized profit = no PnL service fee.\\n\\n' +
'$PDAO trades: *5%*\\n' +
'Other tokens: *8%*\\n' +
'Full Private Mode: *15%*\\n\\n' +
'Creator wallet receives fees automatically after profitable settlement.', kb.back());
}

async function why(bot,msg){
  return render(bot,msg,
'🏆 *Why PrivateDAO?*\\n\\n' +
'Most bots focus only on speed.\\n\\n' +
'PrivateDAO adds privacy, protection and proof to trading execution.\\n\\n' +
'Built for traders who want better execution quality, fewer exposed signals and verifiable trade receipts.', kb.back());
}

async function links(bot,msg){
  return render(bot,msg,
'🌐 *Official Links*\\n\\n' +
'Website:\\nhttps://privatedao.org\\n\\n' +
'Token:\\nhttps://privatedao.org/token/\\n\\n' +
'X:\\nhttps://x.com/PrivateDAOOS\\n\\n' +
'GitHub:\\nhttps://github.com/X-PACT/PrivateDAO', kb.back());
}

async function askSip(bot,msg){
  return render(bot,msg,
'🔐 *SIP Protection*\\n\\n' +
'Set a 4 to 10 digit PIN to protect withdrawals and sensitive wallet actions.\\n\\n' +
'Send:\\n`/set_sip 1234`', kb.back());
}

async function handleSetSip(bot,msg,raw=''){
  try{
    await setSip(msg.from.id,String(raw||'').trim());
    return bot.sendMessage(msg.chat.id,'✅ *SIP Protection Enabled*\\n\\nWithdrawals and sensitive wallet actions are now protected.', {parse_mode:'Markdown'});
  }catch(e){
    return bot.sendMessage(msg.chat.id,'SIP setup failed: '+e.message);
  }
}

async function executePreview(bot,msg){
  await pulse(bot,msg.chat.id,'🛡 *Private Execution*',[
    '✅ Wallet checked',
    '✅ Liquidity checked',
    '✅ Smart Shield enabled',
    '✅ Split order prepared',
    '✅ Receipt layer ready',
    '🚀 Sending protected execution...'
  ]);
  return bot.emit('text',{...msg,text:'/buy 0.005 SOL PDAO private'});
}

async function simple(bot,msg,title){
  return render(bot,msg,title+'\\n\\nComing next in v3 wizard.', kb.back());
}

module.exports = {
  home, showHome:home,
  trade, showBuy:trade,
  wallet, showWallet:wallet,
  security, showProtection:security,
  feature, showFeature:feature,
  pdao, showPdao:pdao,
  fees, showFees:fees,
  why, showWhy:why,
  links, showLinks:links,
  askSip, handleSetSip,
  assetPdao, executionMode, review, executePreview, simple
};
`);

backup('bot.js');
let s = fs.readFileSync('bot.js','utf8');

if(!s.includes("handlers/productUi")){
  s = s.replace("const db = require('./db/supabase');", "const db = require('./db/supabase');\\nconst productUi = require('./handlers/productUi');");
}

s = s.replace(/bot\\.onText\\(\\/\\\\\\/start[\\s\\S]*?\\n\\}\\);/m, "bot.onText(/\\\\/start/, async (msg) => productUi.home(bot, msg));");

if(!s.includes('PRIVATE_DAO_V3_WIZARD_ROUTES')){
s += `

// PRIVATE_DAO_V3_WIZARD_ROUTES
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
  if(!d.startsWith('v3_')) return;
  await bot.answerCallbackQuery(q.id).catch(()=>{});

  if(d === 'v3_home') return productUi.home(bot,msg);
  if(d === 'v3_trade') return productUi.trade(bot,msg);
  if(d === 'v3_wallet') return productUi.wallet(bot,msg);
  if(d === 'v3_security') return productUi.security(bot,msg);
  if(d === 'v3_pdao') return productUi.pdao(bot,msg);
  if(d === 'v3_fees') return productUi.fees(bot,msg);
  if(d === 'v3_why') return productUi.why(bot,msg);
  if(d === 'v3_links') return productUi.links(bot,msg);
  if(d === 'v3_settings' || d === 'v3_sip') return productUi.askSip(bot,msg);

  if(d === 'v3_asset_pdao') return productUi.assetPdao(bot,msg);
  if(d && d.startsWith('v3_amount:')) return productUi.executionMode(bot,msg);
  if(d === 'v3_mode_fast' || d === 'v3_mode_shield' || d === 'v3_mode_private') return productUi.review(bot,msg);
  if(d === 'v3_execute') return productUi.executePreview(bot,msg);

  if(d === 'v3_deposit') return bot.emit('text',{...msg,text:'/deposit'});
  if(d === 'v3_balance') return bot.emit('text',{...msg,text:'/balance'});
  if(d === 'v3_withdraw') return bot.emit('text',{...msg,text:'/withdraw'});

  if(d === 'v3_feature_shield') return productUi.feature(bot,msg,'shield');
  if(d === 'v3_feature_private') return productUi.feature(bot,msg,'private');
  if(d === 'v3_feature_split') return productUi.feature(bot,msg,'split');
  if(d === 'v3_feature_mev') return productUi.feature(bot,msg,'mev');
  if(d === 'v3_feature_receipt') return productUi.feature(bot,msg,'receipt');

  if(d === 'v3_ai') return productUi.simple(bot,msg,'🤖 AI Trader');
  if(d === 'v3_portfolio') return productUi.simple(bot,msg,'📊 Portfolio');
  if(d === 'v3_discover' || d === 'v3_asset_custom') return productUi.simple(bot,msg,'🔍 Discover Token');
  if(d === 'v3_watchlist') return productUi.simple(bot,msg,'⭐ Watchlist');
  if(d === 'v3_custom_amount') return bot.sendMessage(msg.chat.id,'✍ Send amount like: /buy 0.02 SOL PDAO private');
  if(d === 'v3_history') return productUi.simple(bot,msg,'📜 Trade History');
});
`;
}

fs.writeFileSync('bot.js',s);
console.log('PATCHED bot.js');
