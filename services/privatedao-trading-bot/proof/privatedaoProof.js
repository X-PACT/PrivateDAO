const fetch = require('node-fetch');
require('dotenv').config();

// This module does NOT implement any ZK cryptography. It only calls your
// existing api.privatedao.org endpoints to request/verify proofs and
// attaches the result to settlement/trade records. Fill in the actual
// endpoint paths and payload shape to match your API once you share it.

const PROOF_API_BASE = process.env.PRIVATEDAO_API_URL || 'https://api.privatedao.org';
const PROOF_API_KEY = process.env.PRIVATEDAO_API_KEY || null;

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (PROOF_API_KEY) headers['Authorization'] = `Bearer ${PROOF_API_KEY}`;
  return headers;
}

// ─── Request a proof for a settlement/trade event ────────────────────────────
// Generic shape — adjust `endpoint` and `payload` to match your real API once
// you share the spec. This just wraps the HTTP call so the rest of the bot
// never has to know proof internals.
async function requestProof({ endpoint = '/proofs/generate', payload }) {
  const res = await fetch(`${PROOF_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Proof API error ${res.status}: ${text}`);
  }
  return res.json(); // expected to include something like { proofId, proofHash, verifyUrl }
}

// ─── Verify an existing proof ────────────────────────────────────────────────
async function verifyProof(proofId) {
  const res = await fetch(`${PROOF_API_BASE}/proofs/${proofId}/verify`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Proof verify failed: ${res.status}`);
  return res.json(); // expected { valid: boolean, ... }
}

// ─── Attach a proof to a fee settlement transaction ──────────────────────────
// Called right after a settlement tx confirms, so the PnL fee transfer itself
// becomes independently verifiable via your proof center.
async function generateSettlementProof({ telegramId, txSignature, amountSol, feePercent }) {
  try {
    const proof = await requestProof({
      endpoint: '/proofs/settlement',
      payload: { telegramId, txSignature, amountSol, feePercent, source: 'pdao-trading-bot' },
    });
    return proof;
  } catch (err) {
    // Never block fee settlement on proof generation failing — log and move on
    console.error('[Proof] settlement proof failed:', err.message);
    return null;
  }
}

module.exports = { requestProof, verifyProof, generateSettlementProof };
