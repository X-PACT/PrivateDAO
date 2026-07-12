const assert = require('assert');
const { tradingToolsMenu, tokenDiscoveryMenu, limitActionsMenu } = require('../ui/keyboards');
const { normalizeTokenInput, extractFromUrl } = require('../providers/tokenDiscovery');

function flattenButtons(markup) {
  return markup.reply_markup.inline_keyboard.flat().map((button) => button.text);
}

async function main() {
  const tools = flattenButtons(tradingToolsMenu());
  assert.ok(tools.includes('🔎 Discover Token'), 'tools menu should expose token discovery');
  assert.ok(tools.includes('🎯 Limit Orders'), 'tools menu should expose limit orders');
  assert.ok(tools.includes('⚡ Sniper'), 'tools menu should expose sniper');

  const limit = flattenButtons(limitActionsMenu('PDAO'));
  assert.ok(limit.includes('🟢 Buy Limit'), 'limit actions should include buy limit');
  assert.ok(limit.includes('🎯 Take Profit'), 'limit actions should include take profit');

  const discoveryMenu = flattenButtons(tokenDiscoveryMenu());
  assert.ok(discoveryMenu.includes('← Tools'), 'discovery menu should include a back button');

  assert.strictEqual(normalizeTokenInput('9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump'), '9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump');
  assert.strictEqual(extractFromUrl('https://dexscreener.com/solana/9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump'), '9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
