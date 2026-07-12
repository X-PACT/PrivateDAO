function kb(inline_keyboard) {
  return { reply_markup: { inline_keyboard } };
}

function botRole() {
  return String(process.env.BOT_ROLE || process.env.BOT_PROFILE || 'trading').toLowerCase();
}

function isCommunityBot() {
  return botRole() === 'community';
}

function callbackToken(token = 'PDAO') {
  const value = String(token || 'PDAO');
  if (value === 'PDAO') return value;
  return value.length > 24 ? 'disc' : value;
}

function mainMenu(showAdmin = false) {
  if (isCommunityBot()) {
    return kb([
      [
        { text: '👥 Community', callback_data: 'menu_community' },
        { text: '🧭 Tour', callback_data: 'menu_tour' },
      ],
      [
        { text: '🔓 Redeem', callback_data: 'menu_free_access' },
        { text: '🔗 Invite', callback_data: 'menu_referral' },
      ],
      [
        { text: '📜 Receipts', callback_data: 'menu_receipts' },
        { text: '🔬 ZK Status', callback_data: 'menu_zk' },
      ],
      [
        { text: '🚀 Open Private Chat', url: 'https://t.me/PrivateDAO0_bot?start=community' },
      ],
    ]);
  }
  const rows = [
    [
      { text: '🟢 Buy', callback_data: 'menu_buy' },
      { text: '🔴 Sell', callback_data: 'menu_sell' },
    ],
    [
      { text: '🥷 Private Buy', callback_data: 'menu_private_buy' },
      { text: '🛡 Shield Mode', callback_data: 'menu_shield' },
    ],
    [
      { text: '⚡ MEV Mode', callback_data: 'menu_mev' },
      { text: '📜 Receipts', callback_data: 'menu_receipts' },
    ],
    ...(isCommunityBot()
      ? [[{ text: '👥 Community', callback_data: 'menu_community' }, { text: '🧭 Tour', callback_data: 'menu_tour' }]]
      : [[{ text: '💼 Wallet', callback_data: 'menu_wallet' }, { text: '🪙 $PDAO', callback_data: 'menu_pdao' }]]),
    [
      { text: '🔓 Redeem', callback_data: 'menu_free_access' },
      { text: '🔗 Invite', callback_data: 'menu_referral' },
    ],
    [
      { text: '🧩 Tools', callback_data: 'menu_tools' },
      { text: '🔎 Discover Token', callback_data: 'menu_discover' },
    ],
    [
      { text: '📊 Portfolio', callback_data: 'menu_portfolio' },
      { text: '⚙ Settings', callback_data: 'menu_settings' },
    ],
  ];
  if (showAdmin && !isCommunityBot()) {
    rows.push([{ text: '💡 Admin Dashboard', callback_data: 'menu_admin' }]);
  }
  return kb(rows);
}

function backMenu() {
  return kb([[{ text: '← Main Menu', callback_data: 'menu_home' }]]);
}

function walletMenu() {
  if (isCommunityBot()) {
    return kb([
      [{ text: '🚀 Open Private Chat', url: 'https://t.me/PrivateDAO0_bot?start=community' }],
      [{ text: '👥 Community', callback_data: 'menu_community' }],
      [{ text: '← Main Menu', callback_data: 'menu_home' }],
    ]);
  }
  return kb([
    [
      { text: '➕ Get Deposit Address', callback_data: 'wallet_deposit' },
      { text: '📊 Balance', callback_data: 'wallet_balance' },
    ],
    [
      { text: '💸 Withdraw', callback_data: 'wallet_withdraw' },
      { text: '📤 Send', callback_data: 'wallet_send' },
      { text: '🧯 Recover', callback_data: 'wallet_recover' },
    ],
    [
      { text: '🔐 SIP Protection', callback_data: 'wallet_protection' },
      { text: '✍️ Set SIP Now', callback_data: 'wallet_set_sip' },
      { text: '📦 Encrypted Export', callback_data: 'wallet_export_help' },
    ],
    [
      { text: '← Main Menu', callback_data: 'menu_home' },
      { text: '🧭 Tour', callback_data: 'menu_tour' },
    ],
  ]);
}

function buyMenu() {
  return kb([
    [
      { text: '🪙 $PDAO', callback_data: 'buy_asset_pdao' },
      { text: '✍️ Paste Token', callback_data: 'buy_asset_custom' },
    ],
    [
      { text: '0.01 SOL', callback_data: 'buy_amount:0.01:SOL:PDAO' },
      { text: '0.05 SOL', callback_data: 'buy_amount:0.05:SOL:PDAO' },
      { text: '0.10 SOL', callback_data: 'buy_amount:0.10:SOL:PDAO' },
    ],
    [
      { text: 'Fast', callback_data: 'trade_mode:fast:0.01:SOL:PDAO' },
      { text: 'Shield', callback_data: 'trade_mode:shield:0.01:SOL:PDAO' },
      { text: 'Private', callback_data: 'trade_mode:private:0.01:SOL:PDAO' },
    ],
    [{ text: 'Review $PDAO Buy', callback_data: 'trade_review:private:0.01:SOL:PDAO' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function amountMenu(token = 'PDAO') {
  const cbToken = callbackToken(token);
  return kb([
    [
      { text: '0.01 SOL', callback_data: `buy_amount:0.01:SOL:${cbToken}` },
      { text: '0.05 SOL', callback_data: `buy_amount:0.05:SOL:${cbToken}` },
      { text: '0.10 SOL', callback_data: `buy_amount:0.10:SOL:${cbToken}` },
    ],
    [{ text: 'Custom Token', callback_data: 'buy_asset_custom' }],
    [{ text: '← Buy Menu', callback_data: 'menu_buy' }],
  ]);
}

function modeMenu(amount = '0.01', quote = 'SOL', token = 'PDAO') {
  const cbToken = callbackToken(token);
  return kb([
    [
      { text: 'Fast', callback_data: `trade_review:fast:${amount}:${quote}:${cbToken}` },
      { text: 'Shield', callback_data: `trade_review:shield:${amount}:${quote}:${cbToken}` },
      { text: 'Private', callback_data: `trade_review:private:${amount}:${quote}:${cbToken}` },
    ],
    [{ text: 'Change Amount', callback_data: `buy_asset_${token === 'PDAO' ? 'pdao' : 'custom'}` }],
    [{ text: '← Buy Menu', callback_data: 'menu_buy' }],
  ]);
}

function reviewMenu(mode = 'private', amount = '0.01', quote = 'SOL', token = 'PDAO') {
  const cbToken = callbackToken(token);
  return kb([
    [{ text: '🚀 Execute', callback_data: `trade_execute:${mode}:${amount}:${quote}:${cbToken}` }],
    [
      { text: 'Change Mode', callback_data: `buy_amount:${amount}:${quote}:${cbToken}` },
      { text: 'Cancel', callback_data: 'menu_home' },
    ],
  ]);
}

function protectionMenu() {
  return kb([
    [{ text: '🛡 Smart Shield', callback_data: 'feature_shield' }],
    [{ text: '🥷 Private Split Orders', callback_data: 'feature_stealth' }],
    [{ text: '⚡ MEV Protection', callback_data: 'feature_mev' }],
    [{ text: '🤖 AI / Auto Trader', callback_data: 'feature_auto' }],
    [{ text: '📜 Verified Receipts', callback_data: 'feature_receipt' }],
    [{ text: '🔬 ZK Status', callback_data: 'menu_zk' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function featureActionMenu(feature) {
  const rows = {
    shield: [[{ text: 'Review Shield Buy', callback_data: 'trade_review:shield:0.01:SOL:PDAO' }]],
    stealth: [[{ text: 'Review Private Buy', callback_data: 'trade_review:private:0.01:SOL:PDAO' }]],
    mev: [[{ text: 'Review Protected Buy', callback_data: 'trade_review:shield:0.01:SOL:PDAO' }]],
    auto: [[{ text: 'Open Strategies', callback_data: 'menu_trading' }]],
    receipt: [[{ text: 'Buy With Receipt', callback_data: 'trade_review:private:0.01:SOL:PDAO' }]],
  }[feature] || [];
  return kb([...rows, [{ text: 'All Protections', callback_data: 'menu_shield' }], [{ text: '← Main Menu', callback_data: 'menu_home' }]]);
}

function settingsMenu() {
  if (isCommunityBot()) {
    return kb([
      [
        { text: '👥 Community', callback_data: 'menu_community' },
        { text: '🧭 Tour', callback_data: 'menu_tour' },
      ],
      [
        { text: '🔓 Redeem', callback_data: 'menu_free_access' },
        { text: '🔗 Invite', callback_data: 'menu_referral' },
      ],
      [{ text: '🚀 Open Private Chat', url: 'https://t.me/PrivateDAO0_bot?start=community' }],
      [{ text: '← Main Menu', callback_data: 'menu_home' }],
    ]);
  }
  const rows = [
    [
      { text: '🔐 SIP Protection', callback_data: 'wallet_protection' },
      { text: '🔬 ZK Status', callback_data: 'menu_zk' },
    ],
    [
      { text: '👥 Community', callback_data: 'menu_community' },
      { text: '🧭 Tour', callback_data: 'menu_tour' },
    ],
    ...(isCommunityBot() ? [] : [[{ text: '🎁 Promo', callback_data: 'menu_free_access' }]]),
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ];
  return kb(rows);
}

function communityMenu() {
  return kb([
    [
      { text: '✅ Verify', url: 'https://t.me/PrivateDAO0_bot?start=community' },
    ],
    [
      { text: '🎁 Promo / Redeem', callback_data: 'menu_free_access' },
      { text: '🔗 Invite', callback_data: 'menu_referral' },
    ],
    [{ text: '🧭 Tour', callback_data: 'menu_tour' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function tourMenu() {
  return kb([
    [{ text: 'Buy', callback_data: 'menu_buy' }],
    [{ text: 'Private Buy', callback_data: 'menu_private_buy' }],
    [{ text: 'Shield Mode', callback_data: 'menu_shield' }],
    [{ text: 'MEV Mode', callback_data: 'menu_mev' }],
    [{ text: 'Wallet', callback_data: 'menu_wallet' }],
    [{ text: 'ZK Status', callback_data: 'menu_zk' }],
    [{ text: 'Community', callback_data: 'menu_community' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function adminMenu() {
  if (isCommunityBot()) {
    return kb([
      [{ text: '🚀 Open Private Chat', url: 'https://t.me/PrivateDAO0_bot?start=community' }],
      [{ text: '← Main Menu', callback_data: 'menu_home' }],
    ]);
  }
  return kb([
    [
      { text: '📊 Dashboard', callback_data: 'admin_dashboard' },
      { text: '⏸ Pause Trading', callback_data: 'admin_emergency_stop' },
    ],
    [
      { text: '▶ Resume Trading', callback_data: 'admin_emergency_resume' },
      { text: '🧹 Stop All Strategies', callback_data: 'admin_stop_all' },
    ],
    [
      { text: '📣 Broadcast Update', callback_data: 'admin_broadcast' },
    ],
    [
      { text: '🎯 Promo Codes', callback_data: 'admin_promos' },
      { text: '🎥 Welcome Script', callback_data: 'admin_announce' },
    ],
    [{ text: '🔬 ZK Status', callback_data: 'menu_zk' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function limitOrdersMenu(token = 'PDAO') {
  return kb([
    [
      { text: 'Take Profit', callback_data: `limit_tp:${token}` },
      { text: 'Stop Loss', callback_data: `limit_sl:${token}` },
    ],
    [
      { text: 'Trailing Stop', callback_data: `limit_trailing:${token}` },
      { text: 'Recurring Buy', callback_data: `limit_dca:${token}` },
    ],
    [
      { text: 'Manual Contract', callback_data: 'buy_asset_custom' },
      { text: 'Grid Trading', callback_data: 'strategy:grid' },
    ],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function tradingToolsMenu() {
  return kb([
    [
      { text: '🔎 Discover Token', callback_data: 'menu_discover' },
      { text: '🎯 Limit Orders', callback_data: 'menu_limit_orders' },
    ],
    [
      { text: '📈 DCA', callback_data: 'strategy:dca' },
      { text: '🧱 Grid', callback_data: 'strategy:grid' },
    ],
    [
      { text: '⚡ Sniper', callback_data: 'menu_sniper' },
      { text: '🤖 Momentum', callback_data: 'strategy:momentum' },
    ],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function tokenDiscoveryMenu() {
  return kb([
    [{ text: '← Tools', callback_data: 'menu_tools' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function limitActionsMenu(token = 'PDAO') {
  const cbToken = callbackToken(token);
  return kb([
    [
      { text: '🟢 Buy Limit', callback_data: `limit_launch:buy_limit:${cbToken}` },
      { text: '🎯 Take Profit', callback_data: `limit_launch:take_profit:${cbToken}` },
    ],
    [
      { text: '🛑 Stop Loss', callback_data: `limit_launch:stop_loss:${cbToken}` },
      { text: '🌊 Trailing Stop', callback_data: `limit_launch:trailing_stop:${cbToken}` },
    ],
    [
      { text: '📈 DCA', callback_data: `strategy_launch:dca:${cbToken}` },
      { text: '🧱 Grid', callback_data: `strategy_launch:grid:${cbToken}` },
    ],
    [
      { text: '⚡ Sniper', callback_data: `strategy_launch:sniper:${cbToken}` },
      { text: '← Tools', callback_data: 'menu_tools' },
    ],
  ]);
}

function promoMenu() {
  return kb([
    [{ text: '🔓 Redeem Code', callback_data: 'menu_free_access' }],
    [{ text: '🔗 Invite & Earn', callback_data: 'menu_referral' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

function pdaoMenu() {
  return kb([
    [{ text: '💎 Review $PDAO Buy', callback_data: 'trade_review:private:0.01:SOL:PDAO' }],
    [{ text: '🚀 Private Trade', url: 'https://t.me/PrivateDAOO_bot?start=community' }],
    [{ text: '🌐 Website', url: 'https://privatedao.org' }],
    [{ text: '📄 Token Page', url: 'https://privatedao.org/token/' }],
    [{ text: '🪙 PDAO DEX', url: `https://jup.ag/swap/SOL-${'9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump'}` }],
    [{ text: '𝕏 @PrivateDAOOS', url: 'https://x.com/PrivateDAOOS' }],
    [{ text: '🔒 Streamflow Lock', url: 'https://app.streamflow.finance/contract/solana/mainnet/3s5gg6upQXd4USTUQKdrWPBexEa2sZwzoD4P3HLA4tUK' }],
    [{ text: '← Main Menu', callback_data: 'menu_home' }],
  ]);
}

module.exports = {
  kb,
  mainMenu,
  backMenu,
  walletMenu,
  buyMenu,
  amountMenu,
  modeMenu,
  reviewMenu,
  protectionMenu,
  featureActionMenu,
  pdaoMenu,
  settingsMenu,
  communityMenu,
  tourMenu,
  adminMenu,
  limitOrdersMenu,
  tradingToolsMenu,
  tokenDiscoveryMenu,
  limitActionsMenu,
  promoMenu,
};
