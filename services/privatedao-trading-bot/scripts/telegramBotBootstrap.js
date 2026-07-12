const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const role = String(process.env.BOT_ROLE || 'trading').toLowerCase();
const token = process.env.TELEGRAM_BOT_TOKEN
  || (role === 'community'
    ? process.env.COMMUNITY_BOT_TOKEN || process.env.PDAOTRAK_BOT_API
    : process.env.TRADING_BOT_TOKEN);

if (!token) throw new Error(`Missing Telegram token for role=${role}`);

process.env.TELEGRAM_BOT_TOKEN = token;
process.env.BOT_ROLE = role;
if (role === 'community') process.env.BOT_IS_COMMUNITY = 'true';

require(path.join(__dirname, '..', 'bot.js'));
