const { buyTokenWithQuote, sellTokenForQuote, getTokenPriceInSol, getSolBalance, getTokenBalance, getTokenBalanceAtomic, USDC_MINT } = require('../trading/jupiter');
const { logTrade } = require('../db/supabase');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

/**
 * Grid Strategy - range trading between lower and upper levels.
 * Buys when price drops to a grid level and sells when it recovers.
 * Config: { tokenMint, lowerPrice, upperPrice, gridLevels, amountPerGrid (SOL) }
 */
class GridStrategy {
  constructor(keypair, config, telegramId, onUpdate) {
    this.keypair = keypair;
    this.config = config;
    this.telegramId = telegramId;
    this.onUpdate = onUpdate;
    this.isRunning = false;
    this.timer = null;
    this.gridLevels = [];
    this.lastPrice = null;
    this._buildGrid();
  }

  _buildGrid() {
    const { lowerPrice, upperPrice, gridLevels } = this.config;
    const step = (upperPrice - lowerPrice) / (gridLevels - 1);
    for (let i = 0; i < gridLevels; i++) {
      this.gridLevels.push({
        price: lowerPrice + i * step,
        bought: false,
      });
    }
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const quoteCurrency = this.config.quoteCurrency || 'SOL';
    this.onUpdate(
      `*Grid trading started*\n` +
      `Lower: ${this.config.lowerPrice} SOL\n` +
      `Upper: ${this.config.upperPrice} SOL\n` +
      `Quote currency: ${quoteCurrency}\n` +
      `Grid levels: ${this.config.gridLevels}`
    );
    this.timer = setInterval(() => this._tick(), 15000); // check every 15s
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;
    this.onUpdate(`*Grid trading stopped*`);
  }

  async _tick() {
    if (!this.isRunning) return;
    try {
      const currentPrice = await getTokenPriceInSol(this.config.tokenMint);
      if (!currentPrice) return;

      for (const level of this.gridLevels) {
        // Buy zone: price dropped to or below this level
        if (!level.bought && currentPrice <= level.price) {
          const quoteCurrency = this.config.quoteCurrency || 'SOL';
          const balance = quoteCurrency === 'USDC'
            ? await getTokenBalance(this.keypair.publicKey.toString(), USDC_MINT)
            : await getSolBalance(this.keypair.publicKey.toString());
          if (balance >= this.config.amountPerGrid) {
            const { txid, zk, liveSwap } = await buyTokenWithQuote(
              this.keypair,
              this.config.tokenMint,
              this.config.amountPerGrid,
              quoteCurrency,
              this.config.slippageBps,
              { protectedRoute: true, executionMode: 'auto' }
            );
            level.bought = true;
            const receipt = await attachOnchainAnchor(createTradeReceipt({
              telegramId: this.telegramId,
              wallet: this.keypair.publicKey.toString(),
              mode: 'auto-grid-buy',
              tokenMint: this.config.tokenMint,
              quoteCurrency,
              amount: this.config.amountPerGrid,
              slippageBps: this.config.slippageBps,
              routeVenue: 'jupiter',
              routeProvider: 'auto-strategy',
              txs: [{ index: 0, amount: this.config.amountPerGrid, tx: txid }],
              mevProtection: true,
              proofHash: zk?.publicInput?.proofHash,
              publicSignalsHash: zk?.publicInput?.publicSignalsHash,
              walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
              featureMode: 'Verified Receipt',
              localGroth16Verified: Boolean(zk?.valid),
            }));
            await logTrade(this.telegramId, {
              strategy: 'Grid',
              type: 'buy',
              tokenMint: this.config.tokenMint,
              amountSol: quoteCurrency === 'SOL' ? this.config.amountPerGrid : null,
              txSignature: txid,
              status: 'success',
            });
            this.onUpdate(`${liveSwap ? '' : '[Execution Disabled] '}*Grid buy*\nPrice: ${currentPrice.toFixed(8)} SOL\nReceipt: ${receipt.receiptHash.slice(0, 12)}...\nAnchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n${formatZkBadge(zk)}\n[Tx](https://solscan.io/tx/${txid})`);
          }
        }

        // Sell zone: price recovered above this level + margin
        const sellThreshold = level.price * 1.02; // 2% profit per level
        if (level.bought && currentPrice >= sellThreshold) {
          const tokenBalance = await getTokenBalanceAtomic(this.keypair.publicKey.toString(), this.config.tokenMint);
          const sellAmount = BigInt(tokenBalance.amountAtomic || '0') / BigInt(this.config.gridLevels);
          if (sellAmount > 0n) {
            const quoteCurrency = this.config.quoteCurrency || 'SOL';
            const sellAmountAtomic = sellAmount.toString();
            const { txid, zk, liveSwap } = await sellTokenForQuote(
              this.keypair,
              this.config.tokenMint,
              sellAmountAtomic,
              quoteCurrency,
              this.config.slippageBps,
              { protectedRoute: true, executionMode: 'auto' }
            );
            level.bought = false;
            const receipt = await attachOnchainAnchor(createTradeReceipt({
              telegramId: this.telegramId,
              wallet: this.keypair.publicKey.toString(),
              mode: 'auto-grid-sell',
              tokenMint: this.config.tokenMint,
              quoteCurrency,
              amount: sellAmountAtomic,
              slippageBps: this.config.slippageBps,
              routeVenue: 'jupiter',
              routeProvider: 'auto-strategy',
              txs: [{ index: 0, amount: sellAmountAtomic, tx: txid }],
              mevProtection: true,
              proofHash: zk?.publicInput?.proofHash,
              publicSignalsHash: zk?.publicInput?.publicSignalsHash,
              walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
              featureMode: 'Verified Receipt',
              localGroth16Verified: Boolean(zk?.valid),
            }));
            await logTrade(this.telegramId, {
              strategy: 'Grid',
              type: 'sell',
              tokenMint: this.config.tokenMint,
              amountSol: null,
              txSignature: txid,
              status: 'success',
            });
            this.onUpdate(`${liveSwap ? '' : '[Execution Disabled] '}*Grid sell*\nPrice: ${currentPrice.toFixed(8)} SOL\nReceipt: ${receipt.receiptHash.slice(0, 12)}...\nAnchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n${formatZkBadge(zk)}\n[Tx](https://solscan.io/tx/${txid})`);
          }
        }
      }

      this.lastPrice = currentPrice;
    } catch (err) {
      console.error('[Grid tick error]', err.message);
    }
  }
}

function defaultGridConfig(tokenMint) {
  return {
    tokenMint,
    lowerPrice: 0.000001,   // SOL per token
    upperPrice: 0.00001,
    gridLevels: 5,
    amountPerGrid: 0.05,   // SOL per level
    quoteCurrency: 'SOL',
    slippageBps: 750,
  };
}

module.exports = { GridStrategy, defaultGridConfig };
