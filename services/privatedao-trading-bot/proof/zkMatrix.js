const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const ZK_ROOT = path.join(__dirname, '..', 'private-trade-zk');
const VKEY_PATH = path.join(ZK_ROOT, 'build', 'private_trade_intent_vkey.json');
const PROOF_PATH = path.join(ZK_ROOT, 'proofs', 'trade-intent.proof.json');
const PUBLIC_PATH = path.join(ZK_ROOT, 'proofs', 'trade-intent.public.json');
const RECEIPT_PATH = path.join(ZK_ROOT, 'proofs', 'trade-intent.receipt.json');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(filePath) {
  return sha256(fs.readFileSync(filePath));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadZkMatrix() {
  const files = {
    verificationKey: VKEY_PATH,
    proof: PROOF_PATH,
    publicSignals: PUBLIC_PATH,
    receipt: RECEIPT_PATH,
  };
  const missing = Object.values(files).filter((filePath) => !fs.existsSync(filePath));
  const receipt = missing.length ? null : readJson(RECEIPT_PATH);
  return {
    files,
    missing,
    receipt,
    summary: {
      network: 'mainnet',
      verificationMode: 'local-groth16-bn128',
      programId: null,
      entryCount: receipt ? 1 : 0,
      verifiedCount: receipt?.ok ? 1 : 0,
      anchorCount: 0,
      onchainVerifier: false,
      proofHash: fs.existsSync(PROOF_PATH) ? sha256File(PROOF_PATH) : null,
      publicSignalsHash: fs.existsSync(PUBLIC_PATH) ? sha256File(PUBLIC_PATH) : null,
      verificationKeyHash: fs.existsSync(VKEY_PATH) ? sha256File(VKEY_PATH) : null,
    },
  };
}

function validateZkMatrix() {
  const matrix = loadZkMatrix();
  const issues = [];
  if (matrix.missing.length) issues.push(`missing Groth16 files: ${matrix.missing.map((p) => path.relative(ZK_ROOT, p)).join(', ')}`);
  if (matrix.receipt && matrix.receipt.ok !== true) issues.push('Groth16 receipt is not verified');
  if (matrix.receipt && matrix.receipt.protocol !== 'groth16') issues.push('Proof protocol is not groth16');
  if (matrix.receipt && !['bn128', 'bn254'].includes(matrix.receipt.curve)) issues.push(`Unexpected proof curve: ${matrix.receipt.curve}`);

  const required = process.env.PRIVATEDAO_ZK_REQUIRED !== 'false';
  if (required && issues.length) {
    throw new Error(`PrivateDAO ZK proof system not ready: ${issues.join('; ')}`);
  }

  return { ok: issues.length === 0, issues, matrix };
}

function createTradeAttestation(intent) {
  const { ok, issues, matrix } = validateZkMatrix();
  const walletCommitment = sha256(String(intent.walletPublicKey || ''));
  const strategyCommitment = sha256(JSON.stringify({
    side: intent.side,
    tokenMint: intent.tokenMint,
    quoteCurrency: intent.quoteCurrency,
    inputMint: intent.inputMint,
    outputMint: intent.outputMint,
    amountAtomic: String(intent.amountAtomic),
    slippageBps: Number(intent.slippageBps || 300),
    routeVenue: intent.routeVenue || 'unknown',
  }));

  const publicInput = {
    intentHash: sha256(JSON.stringify({
      walletCommitment,
      strategyCommitment,
      side: intent.side,
      tokenMint: intent.tokenMint,
      quoteCurrency: intent.quoteCurrency,
      inputMint: intent.inputMint,
      outputMint: intent.outputMint,
      amountAtomic: String(intent.amountAtomic),
      slippageBps: Number(intent.slippageBps || 300),
      routeVenue: intent.routeVenue || 'unknown',
      marketSource: intent.market?.source || 'unknown',
      marketRiskLevel: intent.market?.riskLevel || null,
    })),
    proofHash: matrix.summary.proofHash,
    publicSignalsHash: matrix.summary.publicSignalsHash,
    verificationKeyHash: matrix.summary.verificationKeyHash,
    zkNetwork: matrix.summary.network,
    zkVerificationMode: matrix.summary.verificationMode,
    verifiedProofEntries: matrix.summary.verifiedCount,
  };

  return {
    valid: ok,
    issues,
    circuit: 'private_trade_intent',
    verificationMode: 'local-groth16-bn128-mainnet-receipt',
    publicInput,
    attestationHash: sha256(JSON.stringify(publicInput)),
    summary: matrix.summary,
  };
}

function formatZkBadge(attestation) {
  if (!attestation) return 'ZK: not attached';
  const state = attestation.valid ? 'Groth16 verified' : 'ZK warning';
  return `${state}: ${attestation.attestationHash.slice(0, 12)}...`;
}

module.exports = {
  loadZkMatrix,
  validateZkMatrix,
  createTradeAttestation,
  formatZkBadge,
};
