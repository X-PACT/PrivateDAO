const { getOrCreateUser, getSession, getBotWallet, getConnectedWallet } = require('../db/supabase');

async function sessionMiddleware(telegramId, username) {
  const user = await getOrCreateUser(telegramId, username);
  const tradingSession = await getSession(telegramId);
  const botWallet = await getBotWallet(telegramId);
  const connectedWallet = await getConnectedWallet(telegramId);

  return {
    user,
    tradingSession,
    botWallet,
    connectedWallet,
    hasWallet: !!(botWallet || connectedWallet),
    activeWallet: botWallet ? 'custodial' : connectedWallet ? 'connected' : null,
    walletPublicKey: botWallet?.public_key || connectedWallet?.public_key || null,
  };
}

module.exports = { sessionMiddleware };
