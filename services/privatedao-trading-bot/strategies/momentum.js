const { buyTokenWithQuote, sellTokenForQuote, getTokenPriceInSol, getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { logTrade } = require('../db/supabase');
const { recordRealizedPnl } = require('../billing/fees');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

/**
 * Momentum Strategy - buys on positive movement and exits on profit or stop loss.
 * Config: { tokenMint, buyThreshold (%), sellThreshold (%), checkIntervalMs, amountSol, stopLoss (%) }
 */
class MomentumStrategy {
  constructor(keypair, config, telegramId, onUpdate) {
    this.keypair = keypair;
    this.config = config;
    this.telegramId = telegramId;
    this.onUpdate = onUpdate;
    this.isRunning = false;
    this.timer = null;
    this.priceHistory = [];
    this.inPosition = false;
    this.entryPrice = null;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const quoteCurrency = this.config.quoteCurrency || 'SOL';
    this.onUpdate(
      `*Momentum started*\n` +
      `Buy trigger: +${this.config.buyThreshold}%\n` +
      `Sell trigger: -${this.config.sellThreshold}%\n` +
      `🛑 Stop Loss: -${this.config.stopLoss}%\n` +
      `Quote currency: ${quoteCurrency}`
    );
    this.timer = setInterval(() => this._tick(), this.config.checkIntervalMs || 20000);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;
    this.onUpdate(`*Momentum stopped*`);
  }

  async _tick() {
    if (!this.isRunning) return;
    try {
      const price = await getTokenPriceInSol(this.config.tokenMint);
      if (!price) return;

      this.priceHistory.push(price);
      if (this.priceHistory.length > 20) this.priceHistory.shift();
      if (this.priceHistory.length < 3) return;

      const prevPrice = this.priceHistory[this.priceHistory.length - 4] || this.priceHistory[0];
      const priceChange = ((price - prevPrice) / prevPrice) * 100;

      // ── Buy Signal ────────────────────────────────────────────────────────
      if (!this.inPosition && priceChange >= this.config.buyThreshold) {
        const quoteCurrency = this.config.quoteCurrency || 'SOL';
        const balance = quoteCurrency === 'USDC'
          ? await getTokenBalance(this.keypair.publicKey.toString(), USDC_MINT)
          : await getSolBalance(this.keypair.publicKey.toString());
        if (balance >= this.config.amountSol) {
          const { txid, zk, liveSwap } = await buyTokenWithQuote(
            this.keypair,
            this.config.tokenMint,
            this.config.amountSol,
            quoteCurrency,
            this.config.slippageBps,
            { protectedRoute: true, executionMode: 'auto' }
          );
          this.inPosition = true;
          this.entryPrice = price;
          const receipt = await attachOnchainAnchor(createTradeReceipt({
            telegramId: this.telegramId,
            wallet: this.keypair.publicKey.toString(),
            mode: 'auto-momentum-buy',
            tokenMint: this.config.tokenMint,
            quoteCurrency,
            amount: this.config.amountSol,
            slippageBps: this.config.slippageBps,
            routeVenue: 'jupiter',
            routeProvider: 'auto-strategy',
            txs: [{ index: 0, amount: this.config.amountSol, tx: txid }],
            mevProtection: true,
            proofHash: zk?.publicInput?.proofHash,
            publicSignalsHash: zk?.publicInput?.publicSignalsHash,
            walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
            featureMode: 'Verified Receipt',
            localGroth16Verified: Boolean(zk?.valid),
          }));
          await logTrade(this.telegramId, {
            strategy: 'Momentum',
            type: 'buy',
            tokenMint: this.config.tokenMint,
            amountSol: quoteCurrency === 'SOL' ? this.config.amountSol : null,
            txSignature: txid,
            status: 'success',
          });
          this.onUpdate(
            `${liveSwap ? '' : '[Execution Disabled] '}*Momentum buy*\n` +
            `Move: +${priceChange.toFixed(2)}%\n` +
            `Entry price: ${price.toFixed(8)} SOL\n` +
            `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
            `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
            `${formatZkBadge(zk)}\n` +
            `[Tx](https://solscan.io/tx/${txid})`
          );
        }
      }

      // ── Sell Signal (Take Profit) ─────────────────────────────────────────
      if (this.inPosition && this.entryPrice) {
        const profitPct = ((price - this.entryPrice) / this.entryPrice) * 100;
        const lossPct = ((this.entryPrice - price) / this.entryPrice) * 100;

        const shouldSell = profitPct >= this.config.sellThreshold || lossPct >= this.config.stopLoss;

        if (shouldSell) {
            const tokenBalance = await getTokenBalance(this.keypair.publicKey.toString(), this.config.tokenMint);
          if (tokenBalance > 0) {
            const sellAmount = Math.floor(tokenBalance * 1e6);
            const quoteCurrency = this.config.quoteCurrency || 'SOL';
            const { txid, quote, zk, liveSwap } = await sellTokenForQuote(
              this.keypair,
              this.config.tokenMint,
              sellAmount,
              quoteCurrency,
              this.config.slippageBps,
              { protectedRoute: true, executionMode: 'auto' }
            );
            const isProfit = profitPct > 0;
            this.inPosition = false;
            this.entryPrice = null;

            // Realized PnL in SOL terms — used to calculate subscription fee owed
            const exitValueSol = quoteCurrency === 'SOL' ? (parseInt(quote?.outAmount || 0)) / 1e9 : 0;
            const entryValueSol = quoteCurrency === 'SOL' ? this.config.amountSol : 0;
            const realizedPnlSol = quoteCurrency === 'SOL' && exitValueSol > 0
              ? exitValueSol - entryValueSol
              : entryValueSol * (profitPct / 100);
            await recordRealizedPnl(this.telegramId, this.config.tokenMint, realizedPnlSol);
            const receipt = await attachOnchainAnchor(createTradeReceipt({
              telegramId: this.telegramId,
              wallet: this.keypair.publicKey.toString(),
              mode: 'auto-momentum-sell',
              tokenMint: this.config.tokenMint,
              quoteCurrency,
              amount: sellAmount,
              slippageBps: this.config.slippageBps,
              routeVenue: 'jupiter',
              routeProvider: 'auto-strategy',
              txs: [{ index: 0, amount: sellAmount, tx: txid }],
              mevProtection: true,
              proofHash: zk?.publicInput?.proofHash,
              publicSignalsHash: zk?.publicInput?.publicSignalsHash,
              walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
              featureMode: 'Verified Receipt',
              localGroth16Verified: Boolean(zk?.valid),
            }));

            await logTrade(this.telegramId, {
              strategy: 'Momentum',
              type: 'sell',
              tokenMint: this.config.tokenMint,
              amountSol: null,
              txSignature: txid,
              status: 'success',
            });
            this.onUpdate(
              `${liveSwap ? '' : '[Execution Disabled] '}*Momentum ${isProfit ? 'Take Profit' : 'Stop Loss'}*\n` +
              `PnL move: ${isProfit ? '+' : ''}${profitPct.toFixed(2)}%\n` +
              `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
              `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
              `${formatZkBadge(zk)}\n` +
              `[Tx](https://solscan.io/tx/${txid})`
            );
          }
        }
      }
    } catch (err) {
      console.error('[Momentum tick error]', err.message);
    }
  }
}

function defaultMomentumConfig(tokenMint) {
  return {
    tokenMint,
    buyThreshold: 5,       // buy if price up 5% in last 3 ticks
    sellThreshold: 8,      // take profit at 8%
    stopLoss: 5,           // stop loss at -5%
    amountSol: 0.1,
    quoteCurrency: 'SOL',
    slippageBps: 750,
    checkIntervalMs: 10000, // every 10s — tighter loop since this pool moves fast on low liquidity
  };
}

module.exports = { MomentumStrategy, defaultMomentumConfig };
