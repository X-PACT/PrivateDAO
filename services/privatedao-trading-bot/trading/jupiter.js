const { Connection, Keypair, VersionedTransaction, PublicKey, TransactionMessage, SystemProgram } = require('@solana/web3.js');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { createTradeAttestation } = require('../proof/zkMatrix');
const { getTokenMarketSummary } = require('../providers/marketData');
const { sendSignedTransactionFast } = require('../providers/fastLane');
const { executePumpPortalTrade, hasPumpPortalApiKey } = require('../providers/pumpPortal');
const { assertTradeRisk } = require('../risk/riskGuard');
const {
  PDAO_MINT,
  SOL_MINT,
  USDC_MINT,
  LAMPORTS_PER_SOL,
  QUOTE_MINTS,
  MIN_GAS_SOL,
  assertPdaoMint,
  getQuoteInfo,
  quoteAmountToAtomic,
  normalizeSlippageBps,
  getLiveTradingStatus,
} = require('../config/tradingPolicy');
require('dotenv').config();

const HELIUS_SENDER_TIP_ACCOUNTS = [
  '4ACfpUFoaSD9bfPdeu6DBt89gB6ENTeHBXCAi87NhDEE',
  'D2L6yPZ2FmmmTKPgzaMKdhu6EWZcTpLy1Vhx8uvZe7NZ',
  '9bnz4RShgq1hAnLnZbP8kbgBg1kEmcJBYQq3gQbmnSta',
  '5VY91ws6B2hMmBFRsXkoAAdsPHBJwRfBht4DXox3xkwn',
  '2nyhqdwKcJZR2vcqCyrYsaPVdAnFoJjiksCXJ7hfEYgD',
  '2q5pghRs6arqVjRvT5gfgWfWcHWmw1ZuCzphgd5KfWGJ',
  'wyvPkWjVZz1M8fHQnMMCDTQDbkManefNNhweYk5WkcF',
  '3KCKozbAaF75qEU33jtzozcJ29yJuaLJTy2jFdzUY8bT',
  '4vieeGHPYPG2MmyPRcYjdiDmmhN3ww7hsFNap8pVN3Ey',
  '4TQLFNWK8AovT1gFvda5jfw2oJeRMKEmw7aH6MGBJ3or',
];

function heliusRpcUrl() {
  if (process.env.HELIUS_RPC_URL) return process.env.HELIUS_RPC_URL;
  if (process.env.HELIUS_API_KEY) return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  return null;
}

const RPC_URL =
  heliusRpcUrl() ||
  process.env.HELIUS_BETA_RPC_URL ||
  process.env.QUICKNODE_RPC_URL ||
  'https://api.mainnet-beta.solana.com';

const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000,
});

const JUPITER_SWAP_API = process.env.JUPITER_SWAP_API ||
  (process.env.JUPITER_BASE_URL ? `${process.env.JUPITER_BASE_URL.replace(/\/$/, '')}/swap/v1` : null) ||
  (process.env.JUPITER_API_KEY ? 'https://api.jup.ag/swap/v1' : 'https://lite-api.jup.ag/swap/v1');
const JUPITER_ORDER_ENDPOINT = process.env.JUPITER_ORDER_ENDPOINT;
const JUPITER_EXECUTE_ENDPOINT = process.env.JUPITER_EXECUTE_ENDPOINT;

function hasRealJupiterKey() {
  const key = process.env.JUPITER_API_KEY || '';
  return key && !/[^\x00-\x7F]/.test(key) && key.length > 20;
}

function useJupiterV2Order() {
  return process.env.JUPITER_ENABLE_V2_ORDER === 'true' && hasRealJupiterKey() && JUPITER_ORDER_ENDPOINT;
}

function jupiterHeaders(extra = {}) {
  return hasRealJupiterKey()
    ? { ...extra, 'x-api-key': process.env.JUPITER_API_KEY }
    : extra;
}

function isLiveSwapEnabled() {
  return getLiveTradingStatus().enabled;
}

function dryRunSignature(payload) {
  const digest = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return `dryrun_${digest.slice(0, 48)}`;
}

// ─── Get Quote (with retry for low-liquidity volatility) ─────────────────────
async function getQuote(inputMint, outputMint, amountLamports, slippageBps = 300, retries = 3, taker = null) {
  const safeSlippageBps = normalizeSlippageBps(slippageBps);
  if (useJupiterV2Order()) {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: String(amountLamports),
      slippageBps: String(safeSlippageBps),
    });
    if (taker) params.set('taker', taker);
    const res = await fetch(`${JUPITER_ORDER_ENDPOINT}?${params}`, {
      timeout: 10000,
      headers: jupiterHeaders(),
    });
    if (res.ok) return res.json();
  }

  const url = `${JUPITER_SWAP_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${safeSlippageBps}&onlyDirectRoutes=false`;

  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { timeout: 5000, headers: jupiterHeaders() });
      if (!res.ok) throw new Error(`Jupiter quote failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}

// ─── Get Swap Transaction ─────────────────────────────────────────────────────
async function getSwapTransaction(quoteResponse, walletPublicKey) {
  if (hasRealJupiterKey() && JUPITER_ORDER_ENDPOINT) {
    if (quoteResponse?.transaction) return quoteResponse.transaction;
    if (quoteResponse?.requestId && quoteResponse?.transaction === '') {
      throw new Error(quoteResponse?.errorMessage || quoteResponse?.error || `Jupiter order build failed: ${quoteResponse?.errorCode || 'unknown'}`);
    }
  }

  const res = await fetch(`${JUPITER_SWAP_API}/swap`, {
    method: 'POST',
    headers: jupiterHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: walletPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap tx failed: ${res.status}`);
  const { swapTransaction } = await res.json();
  return swapTransaction;
}

async function executeJupiterV2SignedTransaction(signedTransaction, requestId) {
  if (!hasRealJupiterKey() || !JUPITER_EXECUTE_ENDPOINT || !requestId) return null;
  const res = await fetch(JUPITER_EXECUTE_ENDPOINT, {
    method: 'POST',
    timeout: 10000,
    headers: jupiterHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ signedTransaction, requestId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Jupiter execute failed: ${res.status}`);
  }
  return json.signature || json.txid || json.transactionId || null;
}

// ─── Execute Swap (custodial, with retry) ─────────────────────────────────────
async function executeSwap(keypair, quoteResponse, maxRetries = 2, options = {}) {
  const liveStatus = getLiveTradingStatus();
  if (!liveStatus.enabled) {
    return dryRunSignature({
      wallet: keypair.publicKey.toString(),
      inAmount: quoteResponse?.inAmount,
      outAmount: quoteResponse?.outAmount,
      route: getRouteVenue(quoteResponse),
      liveBlockedBy: liveStatus.reasons,
      at: new Date().toISOString(),
    });
  }

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const swapTxBase64 = await getSwapTransaction(quoteResponse, keypair.publicKey.toString());
      const swapTxBuf = Buffer.from(swapTxBase64, 'base64');
      let tx = VersionedTransaction.deserialize(swapTxBuf);
      const protectedRoute = options.protectedRoute === true;
      const heliusReadyTx = protectedRoute
        ? await maybeAddHeliusSenderTip(tx, keypair.publicKey)
        : { tx, preferHelius: false };
      tx = heliusReadyTx.tx;
      tx.sign([keypair]);

      const rawTx = tx.serialize();
      const rawTxBase64 = Buffer.from(rawTx).toString('base64');
      const sent = protectedRoute
        ? await sendSignedTransactionFast(rawTxBase64, connection, { protectedRoute: true, preferHelius: heliusReadyTx.preferHelius })
        : await executeJupiterV2SignedTransaction(rawTxBase64, quoteResponse?.requestId)
          .then((signature) => signature ? { signature, provider: 'jupiter-execute' } : null)
          || await sendSignedTransactionFast(rawTxBase64, connection);
      const txid = sent.signature;

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'confirmed');

      return { txid, routeProvider: sent.provider };
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 250));
    }
  }
  throw lastErr;
}

function heliusSenderTipLamports() {
  const configured = Number(process.env.HELIUS_SENDER_TIP_LAMPORTS);
  if (Number.isFinite(configured) && configured > 0) return Math.floor(configured);
  const url = String(process.env.HELIUS_SENDER_URL || '');
  return url.includes('swqos_only=true') ? 5_000 : 1_000_000;
}

function heliusSenderTipAccount() {
  const accounts = String(process.env.HELIUS_SENDER_TIP_ACCOUNTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const pool = accounts.length ? accounts : HELIUS_SENDER_TIP_ACCOUNTS;
  return new PublicKey(pool[Math.floor(Math.random() * pool.length)]);
}

async function maybeAddHeliusSenderTip(tx, payerPublicKey) {
  if (!process.env.HELIUS_SENDER_URL) return { tx, preferHelius: false };
  const tipLamports = heliusSenderTipLamports();
  try {
    const altAccounts = await Promise.all(
      tx.message.addressTableLookups.map(async (lookup) => {
        const response = await connection.getAddressLookupTable(lookup.accountKey);
        if (!response.value) throw new Error(`Missing ALT ${lookup.accountKey.toString()}`);
        return response.value;
      })
    );
    const message = TransactionMessage.decompile(tx.message, { addressLookupTableAccounts: altAccounts });
    message.instructions.push(SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      toPubkey: heliusSenderTipAccount(),
      lamports: tipLamports,
    }));
    return {
      tx: new VersionedTransaction(message.compileToV0Message(altAccounts)),
      preferHelius: true,
    };
  } catch (err) {
    console.warn('[FastLane] Helius Sender tip preparation fallback:', err.message);
    return { tx, preferHelius: false };
  }
}

// ─── Buy Token (generic — SOL or USDC as quote currency) ─────────────────────
async function buyTokenWithQuote(keypair, tokenMint, quoteAmount, quoteCurrency = 'SOL', slippageBps, options = {}) {
  const safeMint = assertPdaoMint(tokenMint || PDAO_MINT);
  const market = await getTokenMarketSummary(safeMint).catch(() => null);
  const quoteInfo = getQuoteInfo(quoteCurrency);
  const safeSlippageBps = normalizeSlippageBps(slippageBps);
  const amount = quoteAmountToAtomic(quoteAmount, quoteInfo.label);
  if (quoteInfo.label === 'USDC') await assertGasReserve(keypair.publicKey.toString());
  try {
    const quote = await getQuote(quoteInfo.mint, safeMint, amount, safeSlippageBps, 3, keypair.publicKey.toString());
    assertTradeRisk({
      amount: quoteAmount,
      slippageBps: safeSlippageBps,
      priceImpactPct: Number(quote.priceImpactPct || 0),
      liquidityUsd: market?.liquidityUsd,
    });
    const zk = createTradeAttestation({
      walletPublicKey: keypair.publicKey.toString(),
      side: 'buy',
      tokenMint: safeMint,
      quoteCurrency: quoteInfo.label,
      inputMint: quoteInfo.mint,
      outputMint: safeMint,
      amountAtomic: amount,
      slippageBps: safeSlippageBps,
      routeVenue: getRouteVenue(quote),
      market,
    });
    const sent = await executeSwap(keypair, quote, 2, options);
    return {
      txid: typeof sent === 'string' ? sent : sent.txid,
      routeProvider: typeof sent === 'string' ? (isLiveSwapEnabled() ? 'unknown' : 'execution-disabled') : sent.routeProvider,
      quote,
      quoteCurrency: quoteInfo.label,
      zk,
      market,
      liveSwap: isLiveSwapEnabled(),
      slippageBps: safeSlippageBps,
    };
  } catch (error) {
    if (!shouldUsePumpPortalFallback({ quoteInfo, tokenMint: safeMint })) throw error;
    assertTradeRisk({
      amount: quoteAmount,
      slippageBps: safeSlippageBps,
      priceImpactPct: 0,
      liquidityUsd: market?.liquidityUsd,
    });
    return buyViaPumpPortal(keypair, safeMint, quoteAmount, safeSlippageBps, market, options);
  }
}

// ─── Sell Token (generic — receive SOL or USDC) ───────────────────────────────
async function sellTokenForQuote(keypair, tokenMint, tokenAmount, quoteCurrency = 'SOL', slippageBps, options = {}) {
  const safeMint = assertPdaoMint(tokenMint || PDAO_MINT);
  const market = await getTokenMarketSummary(safeMint).catch(() => null);
  const quoteInfo = getQuoteInfo(quoteCurrency);
  const safeSlippageBps = normalizeSlippageBps(slippageBps);
  if (quoteInfo.label === 'USDC') await assertGasReserve(keypair.publicKey.toString());
  try {
    const quote = await getQuote(safeMint, quoteInfo.mint, tokenAmount, safeSlippageBps, 3, keypair.publicKey.toString());
    assertTradeRisk({
      amount: tokenAmount,
      slippageBps: safeSlippageBps,
      priceImpactPct: Number(quote.priceImpactPct || 0),
      liquidityUsd: market?.liquidityUsd,
    });
    const zk = createTradeAttestation({
      walletPublicKey: keypair.publicKey.toString(),
      side: 'sell',
      tokenMint: safeMint,
      quoteCurrency: quoteInfo.label,
      inputMint: safeMint,
      outputMint: quoteInfo.mint,
      amountAtomic: tokenAmount,
      slippageBps: safeSlippageBps,
      routeVenue: getRouteVenue(quote),
      market,
    });
    const sent = await executeSwap(keypair, quote, 2, options);
    return {
      txid: typeof sent === 'string' ? sent : sent.txid,
      routeProvider: typeof sent === 'string' ? (isLiveSwapEnabled() ? 'unknown' : 'execution-disabled') : sent.routeProvider,
      quote,
      quoteCurrency: quoteInfo.label,
      zk,
      market,
      liveSwap: isLiveSwapEnabled(),
      slippageBps: safeSlippageBps,
    };
  } catch (error) {
    if (!shouldUsePumpPortalFallback({ quoteInfo, tokenMint: safeMint })) throw error;
    assertTradeRisk({
      amount: tokenAmount,
      slippageBps: safeSlippageBps,
      priceImpactPct: 0,
      liquidityUsd: market?.liquidityUsd,
    });
    return sellViaPumpPortal(keypair, safeMint, tokenAmount, safeSlippageBps, market, options);
  }
}

function pumpSlippagePercent(slippageBps) {
  return Math.max(1, Math.min(50, Math.ceil(Number(slippageBps || 1000) / 100)));
}

function shouldUsePumpPortalFallback({ quoteInfo, tokenMint }) {
  return hasPumpPortalApiKey() && quoteInfo.label === 'SOL' && tokenMint !== PDAO_MINT;
}

async function buyViaPumpPortal(keypair, safeMint, quoteAmount, safeSlippageBps, market, options = {}) {
  const sent = await executePumpPortalTrade({
    keypair,
    action: 'buy',
    mint: safeMint,
    amount: quoteAmount,
    denominatedInSol: true,
    slippage: pumpSlippagePercent(safeSlippageBps),
    priorityFee: Number(process.env.PUMP_PORTAL_PRIORITY_FEE_SOL || 0.0001),
    pool: process.env.PUMP_PORTAL_POOL || 'auto',
    connection,
    protectedRoute: options.protectedRoute === true,
  });
  const amountAtomic = Math.floor(Number(quoteAmount) * LAMPORTS_PER_SOL);
  const zk = createTradeAttestation({
    walletPublicKey: keypair.publicKey.toString(),
    side: 'buy',
    tokenMint: safeMint,
    quoteCurrency: 'SOL',
    inputMint: SOL_MINT,
    outputMint: safeMint,
    amountAtomic,
    slippageBps: safeSlippageBps,
    routeVenue: 'pumpportal',
    market,
  });
  return {
    txid: sent.txid,
    routeProvider: sent.routeProvider,
    quote: { inAmount: String(amountAtomic), outAmount: 'pumpportal-local', routePlan: [{ swapInfo: { label: 'PumpPortal' } }] },
    quoteCurrency: 'SOL',
    zk,
    market,
    liveSwap: isLiveSwapEnabled(),
    slippageBps: safeSlippageBps,
  };
}

async function sellViaPumpPortal(keypair, safeMint, tokenAmountAtomic, safeSlippageBps, market, options = {}) {
  const { decimals } = await getTokenBalanceAtomic(keypair.publicKey.toString(), safeMint);
  const uiAmount = Number(tokenAmountAtomic) / (10 ** decimals);
  if (!Number.isFinite(uiAmount) || uiAmount <= 0) throw new Error('Invalid PumpPortal sell amount');
  const sent = await executePumpPortalTrade({
    keypair,
    action: 'sell',
    mint: safeMint,
    amount: uiAmount,
    denominatedInSol: false,
    slippage: pumpSlippagePercent(safeSlippageBps),
    priorityFee: Number(process.env.PUMP_PORTAL_PRIORITY_FEE_SOL || 0.0001),
    pool: process.env.PUMP_PORTAL_POOL || 'auto',
    connection,
    protectedRoute: options.protectedRoute === true,
  });
  const zk = createTradeAttestation({
    walletPublicKey: keypair.publicKey.toString(),
    side: 'sell',
    tokenMint: safeMint,
    quoteCurrency: 'SOL',
    inputMint: safeMint,
    outputMint: SOL_MINT,
    amountAtomic: tokenAmountAtomic,
    slippageBps: safeSlippageBps,
    routeVenue: 'pumpportal',
    market,
  });
  return {
    txid: sent.txid,
    routeProvider: sent.routeProvider,
    quote: { inAmount: String(tokenAmountAtomic), outAmount: 'pumpportal-local', routePlan: [{ swapInfo: { label: 'PumpPortal' } }] },
    quoteCurrency: 'SOL',
    zk,
    market,
    liveSwap: isLiveSwapEnabled(),
    slippageBps: safeSlippageBps,
  };
}

// ─── Buy Token (SOL-only convenience wrapper) ────────────────────────────────
async function buyToken(keypair, tokenMint, solAmount) {
  return buyTokenWithQuote(keypair, tokenMint, solAmount, 'SOL');
}

// ─── Sell Token (SOL-only convenience wrapper) ───────────────────────────────
async function sellToken(keypair, tokenMint, tokenAmount) {
  return sellTokenForQuote(keypair, tokenMint, tokenAmount, 'SOL');
}

// ─── Get SOL Balance ──────────────────────────────────────────────────────────
async function getSolBalance(publicKey) {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / LAMPORTS_PER_SOL;
}

async function assertGasReserve(publicKey) {
  const solBalance = await getSolBalance(publicKey);
  if (solBalance < MIN_GAS_SOL) {
    throw new Error(`SOL gas reserve is too low (${solBalance.toFixed(4)} SOL). Keep at least ${MIN_GAS_SOL} SOL before USDC trading.`);
  }
  return solBalance;
}

// ─── Get Token Balance ────────────────────────────────────────────────────────
async function getTokenBalance(walletPublicKey, tokenMint) {
  try {
    const pubkey = new PublicKey(walletPublicKey);
    const mintPubkey = new PublicKey(tokenMint);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { mint: mintPubkey });
    if (!tokenAccounts.value.length) return 0;
    return tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
  } catch {
    return 0;
  }
}

async function getTokenBalanceAtomic(walletPublicKey, tokenMint) {
  const pubkey = new PublicKey(walletPublicKey);
  const mintPubkey = new PublicKey(tokenMint);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { mint: mintPubkey });
  if (!tokenAccounts.value.length) return { amountAtomic: '0', uiAmount: 0, decimals: 0 };
  const tokenAmount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount;
  return {
    amountAtomic: tokenAmount.amount,
    uiAmount: tokenAmount.uiAmount || 0,
    decimals: tokenAmount.decimals || 0,
  };
}

// ─── Get Token Price in SOL ───────────────────────────────────────────────────
async function getTokenPriceInSol(tokenMint) {
  try {
    const testAmount = 1_000_000; // 0.001 SOL equivalent
    const quote = await getQuote(SOL_MINT, tokenMint, testAmount);
    const tokensOut = parseInt(quote.outAmount);
    const solIn = testAmount / LAMPORTS_PER_SOL;
    return solIn / tokensOut; // price per token in SOL
  } catch {
    return null;
  }
}

// ─── Migration-aware quote check ──────────────────────────────────────────────
// Jupiter's aggregator already covers all DEXs (pump.fun bonding curve, Raydium,
// Meteora, etc) so no special handling is needed when a token migrates — the
// quote/swap calls below transparently route through whichever venue has
// liquidity at call time. This just surfaces which venue was used, for logging.
function getRouteVenue(quoteResponse) {
  try {
    return quoteResponse?.routePlan?.[0]?.swapInfo?.label || 'unknown';
  } catch {
    return 'unknown';
  }
}

module.exports = {
  connection,
  buyToken,
  sellToken,
  buyTokenWithQuote,
  sellTokenForQuote,
  getSolBalance,
  getTokenBalance,
  getTokenBalanceAtomic,
  getTokenPriceInSol,
  assertGasReserve,
  getQuote,
  getRouteVenue,
  isLiveSwapEnabled,
  QUOTE_MINTS,
  SOL_MINT,
  USDC_MINT,
};
