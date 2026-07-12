const fetch = require('node-fetch');
const bs58 = require('bs58');
const { VersionedTransaction } = require('@solana/web3.js');
const { sendSignedTransactionFast } = require('./fastLane');

function normalizePumpPortalTradeLocalUrl(value) {
  const text = String(value || '').trim();
  if (!/^https?:\/\//i.test(text)) return null;
  if (!/\/api\/trade-local(?:[/?#]|$)/i.test(text)) return null;
  return text;
}

const PUMP_PORTAL_TRADE_LOCAL =
  normalizePumpPortalTradeLocalUrl(process.env.PUMP_PORTAL_TRADE_LOCAL_URL) ||
  normalizePumpPortalTradeLocalUrl(process.env.PUMP_PORTAL_LOCAL_API) ||
  'https://pumpportal.fun/api/trade-local';

function hasPumpPortalApiKey() {
  return Boolean(process.env.PUMP_PORTAL_API_KEY);
}

function pumpPortalHeaders(extra = {}) {
  return process.env.PUMP_PORTAL_API_KEY
    ? { ...extra, 'x-api-key': process.env.PUMP_PORTAL_API_KEY }
    : extra;
}

async function buildPumpPortalTransaction({ publicKey, action, mint, amount, denominatedInSol, slippage, priorityFee, pool = 'auto' }) {
  const res = await fetch(PUMP_PORTAL_TRADE_LOCAL, {
    method: 'POST',
    timeout: 10000,
    headers: pumpPortalHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      publicKey,
      action,
      mint,
      amount,
      denominatedInSol: String(Boolean(denominatedInSol)),
      slippage,
      priorityFee,
      pool,
    }),
  });
  const body = await res.buffer();
  if (!res.ok) throw new Error(`PumpPortal trade-local failed: ${res.status} ${body.toString('utf8').slice(0, 160)}`);
  return body;
}

function decodePumpPortalTransaction(body) {
  const text = body.toString('utf8').trim();
  if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(text)) {
    return VersionedTransaction.deserialize(bs58.decode(text));
  }
  return VersionedTransaction.deserialize(body);
}

async function executePumpPortalTrade({ keypair, action, mint, amount, denominatedInSol, slippage = 10, priorityFee = 0.0001, pool = 'auto', connection, protectedRoute = false }) {
  const unsignedBody = await buildPumpPortalTransaction({
    publicKey: keypair.publicKey.toString(),
    action,
    mint,
    amount,
    denominatedInSol,
    slippage,
    priorityFee,
    pool,
  });
  const tx = decodePumpPortalTransaction(unsignedBody);
  tx.sign([keypair]);
  const rawTxBase64 = Buffer.from(tx.serialize()).toString('base64');
  const sent = await sendSignedTransactionFast(rawTxBase64, connection, { protectedRoute });
  return {
    txid: sent.signature,
    routeProvider: `pumpportal/${sent.provider}`,
    signature: sent.signature,
  };
}

module.exports = {
  hasPumpPortalApiKey,
  buildPumpPortalTransaction,
  executePumpPortalTrade,
};
