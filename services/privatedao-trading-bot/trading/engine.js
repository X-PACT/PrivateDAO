const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const { DCAStrategy, defaultDCAConfig } = require('../strategies/dca');
const { GridStrategy, defaultGridConfig } = require('../strategies/grid');
const { MomentumStrategy, defaultMomentumConfig } = require('../strategies/momentum');
const { LimitOrdersStrategy, defaultLimitConfig } = require('../strategies/limitOrders');
const { SniperStrategy, defaultSniperConfig } = require('../strategies/sniper');
const { decryptPrivateKey } = require('./wallet');

// In-memory map of active strategies per user
// Map<telegramId, strategyInstance>
const activeStrategies = new Map();

async function startStrategy(telegramId, strategyName, config, encryptedPrivateKey, sendMessage) {
  // Stop any existing strategy
  await stopStrategy(telegramId, sendMessage, true);

  // Decrypt key and build keypair
  const privateKeyBytes = decryptPrivateKey(encryptedPrivateKey);
  const keypair = Keypair.fromSecretKey(privateKeyBytes);

  const notify = (text) => sendMessage(text, { parse_mode: 'Markdown' });

  let strategy;
  switch (strategyName.toLowerCase()) {
    case 'dca':
      strategy = new DCAStrategy(keypair, config, telegramId, notify);
      break;
    case 'grid':
      strategy = new GridStrategy(keypair, config, telegramId, notify);
      break;
    case 'momentum':
      strategy = new MomentumStrategy(keypair, config, telegramId, notify);
      break;
    case 'limit':
      strategy = new LimitOrdersStrategy(keypair, config, telegramId, notify);
      break;
    case 'sniper':
      strategy = new SniperStrategy(keypair, config, telegramId, notify);
      break;
    default:
      throw new Error(`Unknown strategy: ${strategyName}`);
  }

  activeStrategies.set(String(telegramId), strategy);
  await strategy.start();
}

async function stopStrategy(telegramId, sendMessage, silent = false) {
  const key = String(telegramId);
  const strategy = activeStrategies.get(key);
  if (strategy) {
    await strategy.stop();
    activeStrategies.delete(key);
  } else if (!silent && sendMessage) {
    sendMessage('No active strategy is running.');
  }
}

function isStrategyActive(telegramId) {
  return activeStrategies.has(String(telegramId));
}

function getActiveStrategyCount() {
  return activeStrategies.size;
}

async function stopAllStrategies(sendMessage, silent = false) {
  const keys = [...activeStrategies.keys()];
  for (const telegramId of keys) {
    await stopStrategy(telegramId, sendMessage, silent);
  }
  return keys.length;
}

function getDefaultConfig(strategyName, tokenMint) {
  switch (strategyName.toLowerCase()) {
    case 'dca': return defaultDCAConfig(tokenMint);
    case 'grid': return defaultGridConfig(tokenMint);
    case 'momentum': return defaultMomentumConfig(tokenMint);
    case 'limit': return defaultLimitConfig(tokenMint);
    case 'sniper': return defaultSniperConfig(tokenMint);
    default: return null;
  }
}

module.exports = { startStrategy, stopStrategy, stopAllStrategies, isStrategyActive, getActiveStrategyCount, getDefaultConfig };
