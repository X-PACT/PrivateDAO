const fetch = require('node-fetch');

async function sendJitoBundle(rawTransactionsBase64, tipLamports = 1000000) {
  if (process.env.ENABLE_JITO_FAST_SEND !== 'true') {
    return { enabled: false, reason: 'Jito disabled' };
  }

  const endpoint = process.env.JITO_BUNDLE_URL || 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendBundle',
      params: [rawTransactionsBase64]
    })
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Jito bundle failed: ${res.status}`);
  }

  return {
    enabled: true,
    provider: 'jito-bundle',
    bundleId: json.result,
    tipLamports
  };
}

module.exports = { sendJitoBundle };
