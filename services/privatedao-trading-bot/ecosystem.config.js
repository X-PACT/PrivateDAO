require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const apps = [
  {
    name: 'privatedao-trading-bot',
    script: './scripts/telegramBotBootstrap.js',
    env: {
      BOT_ROLE: 'trading',
      TELEGRAM_BOT_TOKEN: process.env.TRADING_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN,
    },
  },
];

const communityToken = process.env.COMMUNITY_BOT_TOKEN || process.env.PDAOTRAK_BOT_API;

if (communityToken && communityToken !== process.env.TRADING_BOT_TOKEN) {
  apps.push({
    name: 'privatedao-community-bot',
    script: './scripts/telegramBotBootstrap.js',
    env: {
      BOT_ROLE: 'community',
      TELEGRAM_BOT_TOKEN: communityToken,
    },
  });
}

module.exports = { apps };
