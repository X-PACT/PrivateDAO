const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const { getConnection, loadAnchorPayerKeypair } = require('./zkReceiptAnchor');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');
const PROGRAM_DIR = path.join(__dirname, 'zk-verifier-program');
const PROGRAM_SO = path.join(PROGRAM_DIR, 'target', 'deploy', 'privatedao_zk_verifier.so');
const PROGRAM_KEYPAIR = path.join(PROGRAM_DIR, 'target', 'deploy', 'privatedao_zk_verifier-keypair.json');
const VERIFIER_INDEX_PATH = path.join(ROOT, 'data', 'zk_verifier_txs.jsonl');
const INSTRUCTION_DATA_CACHE = path.join(ROOT, 'data', 'zk_verifier_instruction_data.b64');
const VERIFY_SUCCESS_LOG = 'PrivateDAO Groth16 proof verified on-chain';

function appendVerifierIndex(entry) {
  fs.mkdirSync(path.dirname(VERIFIER_INDEX_PATH), { recursive: true });
  fs.appendFileSync(VERIFIER_INDEX_PATH, `${JSON.stringify(entry)}\n`);
}

function readVerifierIndex() {
  if (!fs.existsSync(VERIFIER_INDEX_PATH)) return [];
  return fs.readFileSync(VERIFIER_INDEX_PATH, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getVerifierProgramId() {
  const value = String(process.env.ZK_VERIFIER_PROGRAM_ID || process.env.PRIVATEDAO_ZK_VERIFIER_PROGRAM_ID || '').trim();
  if (!value) return null;
  return new PublicKey(value);
}

function getBuiltProgramId() {
  if (!fs.existsSync(PROGRAM_KEYPAIR)) return null;
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(PROGRAM_KEYPAIR, 'utf8')));
  const { Keypair } = require('@solana/web3.js');
  return Keypair.fromSecretKey(secret).publicKey;
}

function buildInstructionData(options = {}) {
  const root = options.root || ROOT;
  const result = childProcess.spawnSync('cargo', [
    'run',
    '--quiet',
    '--manifest-path',
    path.join(PROGRAM_DIR, 'Cargo.toml'),
    '--features',
    'tools',
    '--bin',
    'generate_instruction_data',
    '--',
    root,
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    if (options.allowCached !== false && fs.existsSync(INSTRUCTION_DATA_CACHE)) {
      const cached = Buffer.from(fs.readFileSync(INSTRUCTION_DATA_CACHE, 'utf8').trim(), 'base64');
      if (cached.length === 512) return cached;
    }
    const reason = (result.stderr || result.stdout || result.error?.message || '').trim();
    throw new Error(`failed to build Groth16 verifier instruction data: ${reason || 'cargo unavailable and cache missing'}`);
  }
  const line = result.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  if (!line) throw new Error('Groth16 verifier instruction data was empty');
  const data = Buffer.from(line, 'base64');
  if (data.length !== 512) throw new Error(`Groth16 verifier instruction data must be 512 bytes, got ${data.length}`);
  return data;
}

async function getOnchainVerifierStatus(options = {}) {
  const programId = getVerifierProgramId();
  const builtProgramId = getBuiltProgramId();
  const connection = options.connection || getConnection();
  const latestVerifierTx = [...readVerifierIndex()].reverse().find((entry) => !programId || entry.programId === programId.toBase58()) || null;
  const artifactExists = fs.existsSync(PROGRAM_SO);
  const artifactBytes = artifactExists ? fs.statSync(PROGRAM_SO).size : 0;
  let account = null;
  let executable = false;
  if (programId) {
    account = await connection.getAccountInfo(programId, 'confirmed').catch(() => null);
    executable = Boolean(account?.executable);
  }
  return {
    configPresent: Boolean(programId),
    codePathActive: true,
    programId: programId ? programId.toBase58() : null,
    builtProgramId: builtProgramId ? builtProgramId.toBase58() : null,
    artifactExists,
    artifactBytes,
    executable,
    deployed: executable,
    liveTxVerified: Boolean(executable && latestVerifierTx?.logsVerified),
    latestVerifierSignature: latestVerifierTx?.signature || null,
    latestVerifierExplorerUrl: latestVerifierTx?.explorerUrl || null,
    missing: executable ? '' : (programId ? 'configured program id is not executable on mainnet' : 'ZK_VERIFIER_PROGRAM_ID is not configured'),
  };
}

async function verifyGroth16ProofOnchain(options = {}) {
  const programId = options.programId ? new PublicKey(options.programId) : getVerifierProgramId();
  if (!programId) throw new Error('ZK_VERIFIER_PROGRAM_ID is not configured');

  const connection = options.connection || getConnection();
  const payer = options.payer || loadAnchorPayerKeypair();
  const account = await connection.getAccountInfo(programId, 'confirmed');
  if (!account?.executable) throw new Error(`configured verifier program is not executable: ${programId.toBase58()}`);

  const data = options.instructionData || buildInstructionData(options);
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: Number(process.env.ZK_VERIFIER_COMPUTE_UNITS || 1_400_000) }))
    .add(new TransactionInstruction({
      programId,
      keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: false }],
      data,
    }));

  const signature = await sendAndConfirmTransaction(connection, tx, [payer], { commitment: 'confirmed' });
  const explorerUrl = `https://solscan.io/tx/${signature}`;
  let fetched = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    fetched = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (Array.isArray(fetched?.meta?.logMessages) && fetched.meta.logMessages.length > 0) break;
    await wait(1000);
  }
  const logs = fetched?.meta?.logMessages || [];
  const verified = logs.some((line) => line.includes(VERIFY_SUCCESS_LOG));
  if (!verified) {
    throw new Error(`verifier tx confirmed but success log was not found: ${signature}`);
  }
  appendVerifierIndex({
    programId: programId.toBase58(),
    signature,
    explorerUrl,
    logsVerified: true,
    verifiedAt: new Date().toISOString(),
  });
  return {
    onchainVerifier: true,
    verifierSignature: signature,
    verifierExplorerUrl: explorerUrl,
    programId: programId.toBase58(),
    logsVerified: true,
  };
}

module.exports = {
  PROGRAM_DIR,
  PROGRAM_SO,
  PROGRAM_KEYPAIR,
  VERIFY_SUCCESS_LOG,
  VERIFIER_INDEX_PATH,
  INSTRUCTION_DATA_CACHE,
  buildInstructionData,
  readVerifierIndex,
  getBuiltProgramId,
  getVerifierProgramId,
  getOnchainVerifierStatus,
  verifyGroth16ProofOnchain,
};
