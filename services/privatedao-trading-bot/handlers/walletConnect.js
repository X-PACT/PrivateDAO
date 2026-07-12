const { saveConnectedWallet } = require('../db/supabase');
const { PublicKey } = require('@solana/web3.js');

async function handleConnectWallet(bot, msg, session) {
  const chatId = msg.chat.id;

  if (session.connectedWallet) {
    return bot.sendMessage(chatId,
      `*Connected wallet already set*\n\`${session.connectedWallet.public_key}\`\n\nSend a new public key if you want to change it.`
    );
  }

  await bot.sendMessage(chatId,
    `*Connect an external wallet*\n\nSend your public key only. Never send a private key.\n\nExample:\n\`7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU\``
  );

  // Listen for next message from this user
  const listener = async (nextMsg) => {
    if (nextMsg.from.id !== msg.from.id) return;
    const pubKeyStr = nextMsg.text?.trim();

    try {
      new PublicKey(pubKeyStr); // validate
      await saveConnectedWallet(msg.from.id, pubKeyStr);
      await bot.sendMessage(chatId,
        `*Wallet connected*\n\`${pubKeyStr}\`\n\nConnected-wallet mode is read-only for status. Live automated trading uses the dedicated bot wallet created with /deposit.`
      );
    } catch {
      await bot.sendMessage(chatId, 'Invalid public key. Try again.');
    }

    bot.removeListener('message', listener);
  };

  bot.on('message', listener);
}

module.exports = { handleConnectWallet };
