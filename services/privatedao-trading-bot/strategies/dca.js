const { buyTokenWithQuote, getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { logTrade } = require('../db/supabase');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

/**
 * DCA Strategy - recurring buys at fixed intervals.
 * Config: { tokenMint, amountPerBuy (SOL), intervalMs, maxBuys }
 */
class DCAStrategy {
  constructor(keypair, config, telegramId, onUpdate) {
    this.keypair = keypair;
    this.config = config;
    this.telegramId = telegramId;
    this.onUpdate = onUpdate; // callback to send Telegram message
    this.buyCount = 0;
    this.timer = null;
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const quoteCurrency = this.config.quoteCurrency || 'SOL';
    this.onUpdate(`*DCA started*\nEvery ${this.config.intervalMs / 60000} minutes - ${this.config.amountPerBuy} ${quoteCurrency} per buy\nTarget buys: ${this.config.maxBuys}`);
    await this._executeBuy();
    this.timer = setInterval(() => this._executeBuy(), this.config.intervalMs);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;
    this.onUpdate(`*DCA stopped*\nExecuted buys: ${this.buyCount}`);
  }

  async _executeBuy() {
    if (!this.isRunning) return;
    if (this.buyCount >= this.config.maxBuys) {
      await this.stop();
      return;
    }

    try {
      const quoteCurrency = this.config.quoteCurrency || 'SOL';
      const balance = quoteCurrency === 'USDC'
        ? await getTokenBalance(this.keypair.publicKey.toString(), USDC_MINT)
        : await getSolBalance(this.keypair.publicKey.toString());
      if (balance < this.config.amountPerBuy) {
        this.onUpdate(`Insufficient balance (${balance.toFixed(4)} ${quoteCurrency}). DCA stopped.`);
        await this.stop();
        return;
      }

      const { txid, quote, zk, market, liveSwap } = await buyTokenWithQuote(
        this.keypair,
        this.config.tokenMint,
        this.config.amountPerBuy,
        quoteCurrency,
        this.config.slippageBps,
        { protectedRoute: true, executionMode: 'auto' }
      );
      this.buyCount++;
      const receipt = await attachOnchainAnchor(createTradeReceipt({
        telegramId: this.telegramId,
        wallet: this.keypair.publicKey.toString(),
        mode: 'auto-dca',
        tokenMint: this.config.tokenMint,
        quoteCurrency,
        amount: this.config.amountPerBuy,
        slippageBps: this.config.slippageBps,
        routeVenue: market?.dex || 'jupiter',
        routeProvider: 'auto-strategy',
        txs: [{ index: this.buyCount - 1, amount: this.config.amountPerBuy, tx: txid }],
        mevProtection: true,
        proofHash: zk?.publicInput?.proofHash,
        publicSignalsHash: zk?.publicInput?.publicSignalsHash,
        walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
        featureMode: 'Verified Receipt',
        localGroth16Verified: Boolean(zk?.valid),
      }));

      await logTrade(this.telegramId, {
        strategy: 'DCA',
        type: 'buy',
        tokenMint: this.config.tokenMint,
        amountSol: quoteCurrency === 'SOL' ? this.config.amountPerBuy : null,
        txSignature: txid,
        status: 'success',
      });

      this.onUpdate(
        `${liveSwap ? '' : '[Execution Disabled] '}*DCA buy #${this.buyCount}*\n` +
        `Input: ${this.config.amountPerBuy} ${quoteCurrency}\n` +
        `Estimated output: ${quote.outAmount} raw units ${market?.symbol ? `(${market.symbol})` : ''}\n` +
        (market?.dex ? `Route market: ${market.dex}\n` : '') +
        `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
        `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
        `${formatZkBadge(zk)}\n` +
        `[Tx](https://solscan.io/tx/${txid})`
      );
    } catch (err) {
      await logTrade(this.telegramId, {
        strategy: 'DCA',
        type: 'buy',
        tokenMint: this.config.tokenMint,
        amountSol: this.config.amountPerBuy,
        status: 'failed',
        error: err.message,
      });
      this.onUpdate(`DCA failed: ${err.message}`);
    }
  }
}

// ─── Default Config ───────────────────────────────────────────────────────────
function defaultDCAConfig(tokenMint) {
  return {
    tokenMint,
    amountPerBuy: 0.1,      // SOL per buy
    quoteCurrency: 'SOL',
    slippageBps: 750,
    intervalMs: 10 * 60 * 1000, // every 10 minutes
    maxBuys: 10,
  };
}

module.exports = { DCAStrategy, defaultDCAConfig };
