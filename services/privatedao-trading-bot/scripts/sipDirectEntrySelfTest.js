const assert = require('assert');

process.env.WALLET_ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test';

const { walletMenu } = require('../ui/keyboards');
const productUi = require('../handlers/productUi');

async function main() {
  const walletButtons = walletMenu().reply_markup.inline_keyboard.flat();
  const hasDirectSipButton = walletButtons.some((button) => /set sip/i.test(button.text));
  assert.ok(hasDirectSipButton, 'wallet menu should expose a direct SIP setup button');

  const calls = [];
  const bot = {
    sendMessage: async (chatId, text, options) => {
      calls.push({ chatId, text, options });
      return { chatId, text, options };
    },
    editMessageText: async () => { throw new Error('not used'); },
  };

  await productUi.showSipHelp(bot, { chat: { id: 123 }, from: { id: 123 } });
  const help = calls.find((call) => String(call.text || '').includes('SIP'));
  assert.ok(help, 'SIP help message should be sent');
  assert.ok(/direct/i.test(help.text), 'SIP help should tell the user to type the code directly');
  assert.ok(/save/i.test(help.text), 'SIP help should warn the user to save the code');
  assert.ok(!/\/set_sip/i.test(help.text), 'SIP help should not require a slash command');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
