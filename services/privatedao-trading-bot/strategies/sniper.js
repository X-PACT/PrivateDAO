const { buyTokenWithQuote, getSolBalance, getTokenBalance, USDC_MINT } = require('../trading/jupiter');
const { getTokenMarketSummary } = require('../providers/marketData');
const { logTrade } = require('../db/supabase');
const { formatZkBadge } = require('../proof/zkMatrix');
const { createTradeReceipt } = require('../proof/proofReceipt');
const { attachOnchainAnchor } = require('../onchain/zkReceiptAnchor');
const { walletFingerprint } = require('../trading/wallet');

class SniperStrategy {
  constructor(keypair, config, telegramId, onUpdate) {
    this.keypair = keypair;
    this.config = config;
    this.telegramId = telegramId;
    this.onUpdate = onUpdate;
    this.timer = null;
    this.isRunning = false;
    this.fired = false;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onUpdate(
      `*Sniper started*\n` +
      `Token: ${this.config.tokenMint}\n` +
      `Mode: ${this.config.mode || 'auto'}\n` +
      `Trigger: launch or liquidity signal\n`
    );
    await this._tick();
    this.timer = setInterval(() => this._tick(), this.config.checkIntervalMs || 12000);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.onUpdate('*Sniper stopped*');
  }

  async _tick() {
    if (!this.isRunning || this.fired) return;
    try {
      const market = await getTokenMarketSummary(this.config.tokenMint);
      if (!market) return;

      const isLaunchLike = Boolean(market.bondingCurve || market.dex === 'pumpfun' || market.dex === 'pump');
      const liquidityUsd = Number(market.liquidityUsd || 0);
      const liquidityOk = !Number.isFinite(this.config.maxLiquidityUsd) || liquidityUsd <= this.config.maxLiquidityUsd;
      const mode = String(this.config.mode || 'auto').toLowerCase();
      const modeOk = mode === 'auto'
        || (mode === 'launch' && isLaunchLike)
        || (mode === 'migrated' && !isLaunchLike && liquidityUsd > 0);

      if (!modeOk || !liquidityOk) return;

      const quoteCurrency = this.config.quoteCurrency || 'SOL';
      const balance = quoteCurrency === 'USDC'
        ? await getTokenBalance(this.keypair.publicKey.toString(), USDC_MINT)
        : await getSolBalance(this.keypair.publicKey.toString());
      if (balance < this.config.amountSol) {
        this.onUpdate(`Sniper waiting: insufficient ${quoteCurrency} balance.`);
        return;
      }

      this.fired = true;
      const { txid, quote, zk, liveSwap } = await buyTokenWithQuote(
        this.keypair,
        this.config.tokenMint,
        this.config.amountSol,
        quoteCurrency,
        this.config.slippageBps || 1200,
        { protectedRoute: true, executionMode: 'sniper' }
      );
      const receipt = await attachOnchainAnchor(createTradeReceipt({
        telegramId: this.telegramId,
        wallet: this.keypair.publicKey.toString(),
        mode: 'sniper',
        tokenMint: this.config.tokenMint,
        quoteCurrency,
        amount: this.config.amountSol,
        slippageBps: this.config.slippageBps || 1200,
        routeVenue: market?.dex || 'jupiter',
        routeProvider: 'sniper-launch',
        txs: [{ index: 0, amount: this.config.amountSol, tx: txid }],
        mevProtection: true,
        proofHash: zk?.publicInput?.proofHash,
        publicSignalsHash: zk?.publicInput?.publicSignalsHash,
        walletFingerprint: walletFingerprint(this.keypair.publicKey.toString()),
        featureMode: 'Sniper',
        localGroth16Verified: Boolean(zk?.valid),
      }));
      await logTrade(this.telegramId, {
        strategy: 'Sniper',
        type: 'buy',
        tokenMint: this.config.tokenMint,
        amountSol: quoteCurrency === 'SOL' ? this.config.amountSol : null,
        txSignature: txid,
        status: 'success',
      });
      this.onUpdate(
        `${liveSwap ? '' : '[Execution Disabled] '}*Sniper fired*\n` +
        `Market: ${market.symbol || this.config.tokenMint}\n` +
        `Receipt: ${receipt.receiptHash.slice(0, 12)}...\n` +
        `Anchor: ${receipt.onchainAnchored ? receipt.anchorExplorerUrl : 'not anchored'}\n` +
        `${formatZkBadge(zk)}\n` +
        `[Tx](https://solscan.io/tx/${txid})`
      );
      await this.stop();
    } catch (err) {
      console.error('[Sniper tick error]', err.message);
    }
  }
}

function defaultSniperConfig(tokenMint) {
  return {
    tokenMint,
    mode: 'auto',
    amountSol: 0.1,
    quoteCurrency: 'SOL',
    slippageBps: 900,
    maxLiquidityUsd: 150000,
    checkIntervalMs: 10000,
  };
}

module.exports = { SniperStrategy, defaultSniperConfig };
