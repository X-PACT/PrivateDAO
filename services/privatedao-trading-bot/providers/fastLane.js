const fetch = require('node-fetch');
require('dotenv').config();

const JITO_SEND_TRANSACTION_URL =
  process.env.JITO_SEND_TRANSACTION_URL || 'https://mainnet.block-engine.jito.wtf/api/v1/transactions';
const JITO_BUNDLE_URL =
  process.env.JITO_BUNDLE_URL || 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';

function jitoHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.JITO_AUTH_UUID) headers['x-jito-auth'] = process.env.JITO_AUTH_UUID;
  return headers;
}

async function sendViaJito(rawTxBase64) {
  const res = await fetch(JITO_SEND_TRANSACTION_URL, {
    method: 'POST',
    timeout: 6000,
    headers: jitoHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [rawTxBase64, { encoding: 'base64' }],
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Jito send failed: ${res.status}`);
  }
  return { signature: json.result, provider: 'jito-send-transaction' };
}

async function sendViaJitoBundle(rawTxBase64) {
  const res = await fetch(JITO_BUNDLE_URL, {
    method: 'POST',
    timeout: 8000,
    headers: jitoHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendBundle',
      params: [[rawTxBase64]],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Jito bundle failed: ${res.status}`);
  }
  return { signature: json.result, provider: 'jito-bundle', bundleId: json.result };
}

async function sendViaHeliusSender(rawTxBase64) {
  if (!process.env.HELIUS_SENDER_URL) throw new Error('HELIUS_SENDER_URL missing');
  const res = await fetch(process.env.HELIUS_SENDER_URL, {
    method: 'POST',
    timeout: 8000,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [rawTxBase64, { encoding: 'base64', skipPreflight: false, maxRetries: 0 }],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Helius Sender failed: ${res.status}`);
  }
  return { signature: json.result, provider: 'helius-sender' };
}

async function sendViaRpc(rawTxBase64, connection) {
  const signature = await connection.sendRawTransaction(Buffer.from(rawTxBase64, 'base64'), {
    skipPreflight: false,
    maxRetries: 2,
  });
  return { signature, provider: 'rpc-sendRawTransaction' };
}

async function sendSignedTransactionFast(rawTxBase64, connection, opts = {}) {
  const protectedRoute = opts.protectedRoute === true;
  const preferHelius = opts.preferHelius === true;

  if (protectedRoute && preferHelius && process.env.HELIUS_SENDER_URL) {
    try {
      return await sendViaHeliusSender(rawTxBase64);
    } catch (err) {
      if (process.env.HELIUS_SENDER_STRICT === 'true') throw err;
      console.warn('[FastLane] Helius Sender fallback:', err.message);
    }
  }

  if (protectedRoute && process.env.ENABLE_JITO_FAST_SEND === 'true') {
    try {
      return await sendViaJitoBundle(rawTxBase64);
    } catch (err) {
      if (process.env.JITO_STRICT === 'true') throw err;
      console.warn('[FastLane] Jito bundle fallback:', err.message);
    }
  }
  if (protectedRoute && !preferHelius && process.env.HELIUS_SENDER_URL) {
    try {
      return await sendViaHeliusSender(rawTxBase64);
    } catch (err) {
      if (process.env.HELIUS_SENDER_STRICT === 'true') throw err;
      console.warn('[FastLane] Helius Sender fallback:', err.message);
    }
  }
  if (protectedRoute && process.env.ENABLE_JITO_FAST_SEND === 'true') {
    try {
      return await sendViaJito(rawTxBase64);
    } catch (err) {
      if (process.env.JITO_STRICT === 'true') throw err;
      console.warn('[FastLane] Jito send fallback:', err.message);
    }
  }
  return sendViaRpc(rawTxBase64, connection);
}

module.exports = {
  sendSignedTransactionFast,
  sendViaHeliusSender,
  sendViaJito,
  sendViaJitoBundle,
};
