const { buyTokenWithQuote, sellTokenForQuote, getTokenPriceInSol, getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { logTrade } = require('../db/supabase');
const { recordRealizedPnl } = require('../billing/fees');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');
const { shouldExecuteCondition } = require('../dao/conditionalExecution');

class LimitOrdersStrategy {
  constructor(keypair, config, telegramId, onUpdate) {
    this.keypair = keypair;
    this.config = config;
    this.telegramId = telegramId;
    this.onUpdate = onUpdate;
    this.timer = null;
    this.isRunning = false;
    this.peakPrice = null;
    this.entryPrice = null;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.config.entryPrice) this.entryPrice = this.config.entryPrice;
    this.onUpdate(
      `*Limit order started*\n` +
      `Mode: ${this.config.kind}\n` +
      `Token: ${this.config.tokenMint}\n` +
      `Target: ${this.config.targetPrice?.toFixed?.(8) || this.config.targetPrice}\n`
    );
    await this._tick();
    this.timer = setInterval(() => this._tick(), this.config.checkIntervalMs || 15000);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.onUpdate('*Limit order stopped*');
  }

  async _buy(amount) {
    const quoteCurrency = this.config.quoteCurrency || 'SOL';
    const balance = quoteCurrency === 'USDC'
      ? await getTokenBalance(this.keypair.publicKey.toString(), USDC_MINT)
      : await getSolBalance(this.keypair.publicKey.toString());
    if (balance < amount) {
      this.onUpdate(`Insufficient ${quoteCurrency} balance for limit buy.`);
      await this.stop();
      return;
    }

    const { txid, quote, zk, market, liveSwap } = await buyTokenWithQuote(
      this.keypair,
      this.config.tokenMint,
      amount,
      quoteCurrency,
      this.config.slippageBps || 1200,
      { protectedRoute: true, executionMode: 'limit' }
    );
    const receipt = await attachOnchainAnchor(createTradeReceipt({
      telegramId: this.telegramId,
      wallet: this.keypair.publicKey.toString(),
      mode: this.config.kind,
      tokenMint: this.config.tokenMint,
      quoteCurrency,
      amount,
      slippageBps: this.config.slippageBps || 1200,
      routeVenue: market?.dex || 'jupiter',
      routeProvider: 'limit-order',
      txs: [{ index: 0, amount, tx: txid }],
      mevProtection: true,
      proofHash: zk?.publicInput?.proofHash,
      publicSignalsHash: zk?.publicInput?.publicSignalsHash,
      walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
      featureMode: 'Limit Order',
      localGroth16Verified: Boolean(zk?.valid),
    }));
    await logTrade(this.telegramId, {
      strategy: 'Limit',
      type: 'buy',
      tokenMint: this.config.tokenMint,
      amountSol: quoteCurrency === 'SOL' ? amount : null,
      txSignature: txid,
      status: 'success',
    });
    this.onUpdate(
      `${liveSwap ? '' : '[Execution Disabled] '}*Limit buy filled*\n` +
      `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
      `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
      `${formatZkBadge(zk)}\n` +
      `[Tx](https://solscan.io/tx/${txid})`
    );
    await this.stop();
  }

  async _sell(amountAtomic, currentPrice) {
    const quoteCurrency = this.config.quoteCurrency || 'SOL';
    const { txid, quote, zk, market, liveSwap } = await sellTokenForQuote(
      this.keypair,
      this.config.tokenMint,
      amountAtomic,
      quoteCurrency,
      this.config.slippageBps || 1200,
      { protectedRoute: true, executionMode: 'limit' }
    );
    if (quoteCurrency === 'SOL' && Number(quote?.outAmount || 0) > 0) {
      const exitValueSol = Number(quote.outAmount) / 1e9;
      const entryValueSol = this.config.entryAmountSol || 0;
      await recordRealizedPnl(
        this.telegramId,
        this.config.tokenMint,
        exitValueSol - entryValueSol
      ).catch(() => null);
    }
    const receipt = await attachOnchainAnchor(createTradeReceipt({
      telegramId: this.telegramId,
      wallet: this.keypair.publicKey.toString(),
      mode: this.config.kind,
      tokenMint: this.config.tokenMint,
      quoteCurrency,
      amount: amountAtomic,
      slippageBps: this.config.slippageBps || 1200,
      routeVenue: market?.dex || 'jupiter',
      routeProvider: 'limit-order',
      txs: [{ index: 0, amount: amountAtomic, tx: txid }],
      mevProtection: true,
      proofHash: zk?.publicInput?.proofHash,
      publicSignalsHash: zk?.publicInput?.publicSignalsHash,
      walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
      featureMode: 'Limit Order',
      localGroth16Verified: Boolean(zk?.valid),
    }));
    await logTrade(this.telegramId, {
      strategy: 'Limit',
      type: 'sell',
      tokenMint: this.config.tokenMint,
      amountSol: null,
      txSignature: txid,
      status: 'success',
    });
    this.onUpdate(
      `${liveSwap ? '' : '[Execution Disabled] '}*Limit sell filled*\n` +
      `Price: ${Number(currentPrice || 0).toFixed(8)} SOL\n` +
      `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
      `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
      `${formatZkBadge(zk)}\n` +
      `[Tx](https://solscan.io/tx/${txid})`
    );
    await this.stop();
  }

  async _tick() {
    if (!this.isRunning) return;
    try {
      const currentPrice = await getTokenPriceInSol(this.config.tokenMint);
      if (!currentPrice) return;
      if (this.peakPrice === null || currentPrice > this.peakPrice) {
        this.peakPrice = currentPrice;
      }

      const kind = this.config.kind;
      if (kind === 'buy_limit') {
        if (shouldExecuteCondition({ currentPrice, targetPrice: this.config.targetPrice, side: 'buy_at_or_below' })) {
          await this._buy(this.config.amountSol);
        }
        return;
      }

      if (kind === 'take_profit') {
        if (shouldExecuteCondition({ currentPrice, targetPrice: this.config.targetPrice, side: 'sell_at_or_above' })) {
          const tokenBalance = await getTokenBalance(this.keypair.publicKey.toString(), this.config.tokenMint);
          const amountAtomic = this.config.sellPercent
            ? Math.floor(Number(tokenBalance) * (this.config.sellPercent / 100) * 1e6)
            : Math.floor(Number(tokenBalance) * 1e6);
          if (amountAtomic > 0) await this._sell(amountAtomic, currentPrice);
        }
        return;
      }

      if (kind === 'stop_loss') {
        if (shouldExecuteCondition({ currentPrice, targetPrice: this.config.targetPrice, side: 'sell_at_or_below' })) {
          const tokenBalance = await getTokenBalance(this.keypair.publicKey.toString(), this.config.tokenMint);
          const amountAtomic = this.config.sellPercent
            ? Math.floor(Number(tokenBalance) * (this.config.sellPercent / 100) * 1e6)
            : Math.floor(Number(tokenBalance) * 1e6);
          if (amountAtomic > 0) await this._sell(amountAtomic, currentPrice);
        }
        return;
      }

      if (kind === 'trailing_stop') {
        const stopPrice = this.peakPrice * (1 - (this.config.trailingPct / 100));
        if (currentPrice <= stopPrice) {
          const tokenBalance = await getTokenBalance(this.keypair.publicKey.toString(), this.config.tokenMint);
          const amountAtomic = this.config.sellPercent
            ? Math.floor(Number(tokenBalance) * (this.config.sellPercent / 100) * 1e6)
            : Math.floor(Number(tokenBalance) * 1e6);
          if (amountAtomic > 0) await this._sell(amountAtomic, currentPrice);
        }
      }
    } catch (err) {
      console.error('[Limit tick error]', err.message);
    }
  }
}

function defaultLimitConfig(tokenMint, kind = 'take_profit', marketPrice = null) {
  const base = Number(marketPrice || 0.000001);
  const targetPrice = kind === 'buy_limit'
    ? base * 0.98
    : kind === 'stop_loss'
      ? base * 0.95
      : kind === 'trailing_stop'
        ? base
        : base * 1.05;
  return {
    tokenMint,
    kind,
    targetPrice,
    trailingPct: 3,
    sellPercent: 100,
    amountSol: 0.1,
    entryAmountSol: 0.1,
    quoteCurrency: 'SOL',
    slippageBps: 750,
    checkIntervalMs: 10000,
  };
}

module.exports = { LimitOrdersStrategy, defaultLimitConfig };
