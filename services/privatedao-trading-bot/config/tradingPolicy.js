const { PublicKey } = require('@solana/web3.js');
const { isTradingPaused, readTradingControl } = require('../control/tradingControl');
require('dotenv').config();

const PDAO_MINT = process.env.PDAO_MINT || '9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump';
const CREATOR_WALLET = process.env.CREATOR_WALLET || '2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const LAMPORTS_PER_SOL = 1_000_000_000;
const USDC_DECIMALS = 1_000_000;
const DEFAULT_SLIPPAGE_BPS = Number(process.env.DEFAULT_SLIPPAGE_BPS || 1200);
const MAX_SLIPPAGE_BPS = Number(process.env.MAX_SLIPPAGE_BPS || 5000);
const MIN_GAS_SOL = Number(process.env.MIN_SOL_GAS_RESERVE || 0.003);
const MAX_TRADE_SOL = Number(process.env.MAX_TRADE_SOL || 1);
const MAX_TRADE_USDC = Number(process.env.MAX_TRADE_USDC || 1000);
const MIN_TRADE_USD = Number(process.env.MIN_TRADE_USD || 1);
const SOL_USD_FALLBACK = Number(process.env.SOL_USD_FALLBACK || 150);
const ALLOW_ANY_TOKEN = process.env.ALLOW_ANY_TOKEN !== 'false';
const USER_DEFINED_TRADE_LIMIT = process.env.USER_DEFINED_TRADE_LIMIT !== 'false';

const QUOTE_MINTS = {
  SOL: { mint: SOL_MINT, decimals: LAMPORTS_PER_SOL, label: 'SOL', maxUiAmount: MAX_TRADE_SOL },
  USDC: { mint: USDC_MINT, decimals: USDC_DECIMALS, label: 'USDC', maxUiAmount: MAX_TRADE_USDC },
};

function assertPublicKey(value, label) {
  try {
    return new PublicKey(value).toString();
  } catch {
    throw new Error(`${label} is invalid`);
  }
}

function normalizeSlippageBps(value) {
  const slippage = Number(value || DEFAULT_SLIPPAGE_BPS);
  if (!Number.isFinite(slippage) || slippage < 50 || slippage > MAX_SLIPPAGE_BPS) {
    throw new Error(`Slippage must be between 50 and ${MAX_SLIPPAGE_BPS} bps`);
  }
  return Math.floor(slippage);
}

function assertPdaoMint(tokenMint) {
  const mint = assertPublicKey(tokenMint, 'Token mint');
  if (!ALLOW_ANY_TOKEN && mint !== PDAO_MINT) {
    throw new Error('This production bot is configured for PDAO trading only.');
  }
  return mint;
}

function getQuoteInfo(quoteCurrency) {
  const key = String(quoteCurrency || 'SOL').toUpperCase();
  const quoteInfo = QUOTE_MINTS[key];
  if (!quoteInfo) throw new Error(`Unsupported quote currency: ${quoteCurrency}`);
  return quoteInfo;
}

function quoteAmountToAtomic(quoteAmount, quoteCurrency) {
  const quoteInfo = getQuoteInfo(quoteCurrency);
  const amount = Number(quoteAmount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid trade amount');
  const usdEstimate = quoteInfo.label === 'USDC' ? amount : amount * SOL_USD_FALLBACK;
  if (usdEstimate < MIN_TRADE_USD) {
    throw new Error(`Minimum trade size is ${MIN_TRADE_USD} USD equivalent`);
  }
  if (!USER_DEFINED_TRADE_LIMIT && amount > quoteInfo.maxUiAmount) {
    throw new Error(`Trade amount exceeds the current per-trade limit: ${quoteInfo.maxUiAmount} ${quoteInfo.label}`);
  }
  return Math.floor(amount * quoteInfo.decimals);
}

function getLiveTradingStatus() {
  const reasons = [];
  const control = readTradingControl();
  if (isTradingPaused()) reasons.push(`TRADING_PAUSED${control.reason ? `:${control.reason}` : ''}`);
  if (process.env.TRADING_BOT_EXECUTE_SWAPS !== 'true') reasons.push('TRADING_BOT_EXECUTE_SWAPS!=true');
  if (process.env.ENABLE_MAINNET_TRADING !== 'true') reasons.push('ENABLE_MAINNET_TRADING!=true');
  if (!process.env.HELIUS_RPC_URL && !process.env.QUICKNODE_RPC_URL) reasons.push('RPC URL missing');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) reasons.push('Supabase missing');
  if (!process.env.WALLET_ENCRYPTION_KEY || !/^[0-9a-fA-F]{64}$/.test(process.env.WALLET_ENCRYPTION_KEY)) {
    reasons.push('WALLET_ENCRYPTION_KEY invalid');
  }
  try { assertPublicKey(CREATOR_WALLET, 'Creator wallet'); } catch (err) { reasons.push(err.message); }
  try { assertPublicKey(PDAO_MINT, 'PDAO mint'); } catch (err) { reasons.push(err.message); }
  return { enabled: reasons.length === 0, reasons };
}

module.exports = {
  PDAO_MINT,
  CREATOR_WALLET,
  SOL_MINT,
  USDC_MINT,
  LAMPORTS_PER_SOL,
  USDC_DECIMALS,
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_GAS_SOL,
  MAX_TRADE_SOL,
  MAX_TRADE_USDC,
  MIN_TRADE_USD,
  SOL_USD_FALLBACK,
  ALLOW_ANY_TOKEN,
  USER_DEFINED_TRADE_LIMIT,
  QUOTE_MINTS,
  assertPublicKey,
  assertPdaoMint,
  getQuoteInfo,
  quoteAmountToAtomic,
  normalizeSlippageBps,
  getLiveTradingStatus,
};
