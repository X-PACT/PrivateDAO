const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  Connection,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const bs58 = require('bs58');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const INDEX_PATH = path.join(__dirname, '..', 'data', 'zk_receipt_anchors.jsonl');

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function getConnection() {
  const rpcUrl = process.env.HELIUS_RPC_URL || process.env.QUICKNODE_RPC_URL || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

function decodeSecret(value) {
  const text = String(value || '').trim();
  if (!text) throw new Error('anchor payer private key is missing');
  if (text.startsWith('[')) return Uint8Array.from(JSON.parse(text));
  const decoder = bs58.decode || bs58.default?.decode;
  if (!decoder) throw new Error('bs58 decoder is unavailable');
  return Uint8Array.from(decoder(text));
}

function loadAnchorPayerKeypair() {
  let secret = process.env.ZK_ANCHOR_PAYER_PRIVATE_KEY;
  let expected = process.env.ZK_ANCHOR_PAYER;
  if (!secret) {
    secret = process.env.CREATOR_WALLET_PRIVATE_KEY;
    expected = process.env.CREATOR_WALLET;
  }
  if (!secret) {
    secret = process.env.QUICKNODE_X402_WALLET_PRIVATE_KEY;
    expected = process.env.QUICKNODE_X402_WALLET;
  }
  const keypair = Keypair.fromSecretKey(decodeSecret(secret));
  if (expected && keypair.publicKey.toString() !== expected) {
    throw new Error('anchor payer public key does not match configured public wallet');
  }
  return keypair;
}

function assertHash(value, name) {
  if (!/^[a-f0-9]{64}$/i.test(String(value || ''))) {
    throw new Error(`${name} must be a 32-byte hex hash`);
  }
}

function normalizeReceiptForAnchor(receipt) {
  const txSignatures = receipt.txSignatures || (receipt.txs || []).map((tx) => tx.tx || tx.signature).filter(Boolean);
  const normalized = {
    receiptHash: receipt.receiptHash,
    intentHash: receipt.intentHash,
    policyHash: receipt.policyHash,
    routeHash: receipt.routeHash,
    proofHash: receipt.proofHash || receipt.zk?.publicInput?.proofHash || null,
    publicSignalsHash: receipt.publicSignalsHash || receipt.zk?.publicInput?.publicSignalsHash || null,
    txSignaturesHash: receipt.txSignaturesHash || sha256(txSignatures || []),
    walletFingerprint: receipt.walletFingerprint || sha256(String(receipt.wallet || '')),
    featureMode: receipt.featureMode || receipt.mode || 'Verified Receipt',
    timestamp: receipt.timestamp || receipt.createdAt || new Date().toISOString(),
    tokenMint: receipt.tokenMint,
  };

  for (const field of ['receiptHash', 'intentHash', 'policyHash', 'routeHash', 'proofHash', 'publicSignalsHash', 'txSignaturesHash', 'walletFingerprint']) {
    assertHash(normalized[field], field);
  }
  if (!normalized.featureMode) throw new Error('featureMode is required');
  if (!normalized.timestamp) throw new Error('timestamp is required');
  if (!normalized.tokenMint) throw new Error('tokenMint is required');

  return normalized;
}

function buildAnchorPayload(receipt) {
  const normalized = normalizeReceiptForAnchor(receipt);
  return {
    v: 1,
    type: 'privatedao.zk.receipt.anchor',
    ...normalized,
    canonicalHash: sha256(normalized),
  };
}

function encodeAnchorPayload(payload) {
  return [
    'PDAOZK1',
    payload.receiptHash,
    payload.intentHash,
    payload.policyHash,
    payload.routeHash,
    payload.proofHash,
    payload.publicSignalsHash,
    payload.txSignaturesHash,
    payload.walletFingerprint,
    encodeURIComponent(payload.featureMode),
    encodeURIComponent(String(payload.timestamp)),
    payload.tokenMint,
    payload.canonicalHash,
  ].join('|');
}

function decodeAnchorPayload(text) {
  if (!String(text || '').startsWith('PDAOZK1|')) return null;
  const parts = String(text).split('|');
  if (parts.length !== 13) return null;
  return {
    v: 1,
    type: 'privatedao.zk.receipt.anchor',
    receiptHash: parts[1],
    intentHash: parts[2],
    policyHash: parts[3],
    routeHash: parts[4],
    proofHash: parts[5],
    publicSignalsHash: parts[6],
    txSignaturesHash: parts[7],
    walletFingerprint: parts[8],
    featureMode: decodeURIComponent(parts[9]),
    timestamp: decodeURIComponent(parts[10]),
    tokenMint: parts[11],
    canonicalHash: parts[12],
  };
}

function appendAnchorIndex(entry) {
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.appendFileSync(INDEX_PATH, `${JSON.stringify(entry)}\n`);
}

function readAnchorIndex() {
  if (!fs.existsSync(INDEX_PATH)) return [];
  return fs.readFileSync(INDEX_PATH, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

async function anchorReceiptOnchain(receipt, options = {}) {
  const payload = buildAnchorPayload(receipt);
  const payer = options.payer || loadAnchorPayerKeypair();
  const connection = options.connection || getConnection();
  const balance = await connection.getBalance(payer.publicKey);
  if (balance < 5000) throw new Error('anchor payer balance is too low for a Solana memo transaction');

  const memo = Buffer.from(encodeAnchorPayload(payload), 'utf8');
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }))
    .add(new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: memo,
  }));
  const signature = await sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
  const explorerUrl = `https://solscan.io/tx/${signature}`;
  const indexEntry = {
    receiptHash: payload.receiptHash,
    signature,
    canonicalHash: payload.canonicalHash,
    featureMode: payload.featureMode,
    tokenMint: payload.tokenMint,
    anchoredAt: new Date().toISOString(),
  };
  appendAnchorIndex(indexEntry);
  return {
    ...indexEntry,
    explorerUrl,
    onchainAnchored: true,
    onchainVerifier: false,
    payload,
  };
}

function extractMemoPayload(transaction) {
  const instructions = transaction?.transaction?.message?.instructions || [];
  for (const ix of instructions) {
    if (ix.program === 'spl-memo' && typeof ix.parsed === 'string') {
      return decodeAnchorPayload(ix.parsed) || (() => { try { return JSON.parse(ix.parsed); } catch { return null; } })();
    }
    if (String(ix.programId || '') === MEMO_PROGRAM_ID.toString()) {
      const raw = ix.data || ix.parsed;
      if (typeof raw === 'string') {
        return decodeAnchorPayload(raw) || (() => { try { return JSON.parse(raw); } catch { return null; } })();
      }
    }
  }
  return null;
}

async function verifyAnchoredReceipt(receiptHash, options = {}) {
  assertHash(receiptHash, 'receiptHash');
  const connection = options.connection || getConnection();
  const signature = options.signature || [...readAnchorIndex()].reverse().find((x) => x.receiptHash === receiptHash)?.signature;
  if (!signature) {
    return { verified: false, receiptHash, reason: 'anchor signature not found in local index' };
  }
  const tx = await connection.getParsedTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });
  const payload = extractMemoPayload(tx);
  const verified = Boolean(payload && payload.type === 'privatedao.zk.receipt.anchor' && payload.receiptHash === receiptHash);
  return {
    verified,
    receiptHash,
    signature,
    explorerUrl: `https://solscan.io/tx/${signature}`,
    onchainVerifier: false,
    payload: verified ? payload : null,
    reason: verified ? null : 'memo payload did not match receiptHash',
  };
}

async function attachOnchainAnchor(receipt, options = {}) {
  let verifier = {
    onchainVerifier: false,
    verifierSignature: receipt.verifierSignature || null,
    verifierExplorerUrl: receipt.verifierExplorerUrl || null,
    verifierError: null,
  };
  try {
    const shouldRunVerifier = options.verifyGroth16Onchain === true || process.env.ENABLE_ONCHAIN_ZK_VERIFIER === 'true';
    if (shouldRunVerifier) {
      try {
        const { verifyGroth16ProofOnchain } = require('./zkGroth16Verifier');
        const verified = await verifyGroth16ProofOnchain(options.zkProofOptions || {});
        verifier = {
          onchainVerifier: true,
          verifierSignature: verified.verifierSignature,
          verifierExplorerUrl: verified.verifierExplorerUrl,
          verifierError: null,
        };
      } catch (err) {
        verifier = {
          onchainVerifier: false,
          verifierSignature: null,
          verifierExplorerUrl: null,
          verifierError: err.message,
        };
      }
    }
    const anchored = await anchorReceiptOnchain({ ...receipt, ...options.receiptFields }, options);
    return {
      ...receipt,
      onchainAnchored: true,
      anchorSignature: anchored.signature,
      anchorExplorerUrl: anchored.explorerUrl,
      ...verifier,
    };
  } catch (err) {
    return {
      ...receipt,
      onchainAnchored: false,
      anchorSignature: null,
      anchorExplorerUrl: null,
      ...verifier,
      anchorError: err.message,
    };
  }
}

module.exports = {
  MEMO_PROGRAM_ID,
  INDEX_PATH,
  buildAnchorPayload,
  normalizeReceiptForAnchor,
  readAnchorIndex,
  anchorReceiptOnchain,
  verifyAnchoredReceipt,
  attachOnchainAnchor,
  loadAnchorPayerKeypair,
  getConnection,
};
