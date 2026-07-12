const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { getConnection, loadAnchorPayerKeypair } = require('../onchain/zkReceiptAnchor');
const { PROGRAM_SO, PROGRAM_KEYPAIR, getBuiltProgramId } = require('../onchain/zkGroth16Verifier');

const ROOT = path.join(__dirname, '..');
const MIN_DEPLOY_SOL = Number(process.env.ZK_VERIFIER_MIN_DEPLOY_SOL || 0.22);

function run(command, args, options = {}) {
  const result = childProcess.spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function safeDeployOutput(stdout) {
  const programId = stdout.match(/Program Id:\s*([1-9A-HJ-NP-Za-km-z]{32,44})/)?.[1] || null;
  const signature = stdout.match(/Signature:\s*([1-9A-HJ-NP-Za-km-z]{64,88})/)?.[1] || null;
  return { programId, signature };
}

async function main() {
  if (!fs.existsSync(PROGRAM_SO)) throw new Error(`missing built verifier program: ${PROGRAM_SO}`);
  if (!fs.existsSync(PROGRAM_KEYPAIR)) throw new Error(`missing verifier program keypair: ${PROGRAM_KEYPAIR}`);

  const payer = loadAnchorPayerKeypair();
  const connection = getConnection();
  const lamports = await connection.getBalance(payer.publicKey, 'confirmed');
  const sol = lamports / 1e9;
  const builtProgramId = getBuiltProgramId()?.toBase58();
  const artifactBytes = fs.statSync(PROGRAM_SO).size;

  if (sol < MIN_DEPLOY_SOL) {
    console.log(JSON.stringify({
      ok: false,
      blocked: true,
      reason: 'insufficient deploy payer balance',
      payer: payer.publicKey.toBase58(),
      balanceSol: sol,
      requiredSol: MIN_DEPLOY_SOL,
      builtProgramId,
      artifactBytes,
      nextAction: `fund ${payer.publicKey.toBase58()} to at least ${MIN_DEPLOY_SOL} SOL, then run node scripts/deployZkVerifierProgram.js`,
    }, null, 2));
    process.exitCode = 2;
    return;
  }

  const tempKeypair = path.join(os.tmpdir(), `privatedao-zk-deploy-${process.pid}.json`);
  fs.writeFileSync(tempKeypair, JSON.stringify(Array.from(payer.secretKey)));
  fs.chmodSync(tempKeypair, 0o600);

  try {
    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.QUICKNODE_RPC_URL || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const deploy = run('solana', [
      'program',
      'deploy',
      PROGRAM_SO,
      '--program-id',
      PROGRAM_KEYPAIR,
      '--keypair',
      tempKeypair,
      '--url',
      rpcUrl,
    ]);

    const parsed = safeDeployOutput(`${deploy.stdout}\n${deploy.stderr}`);
    console.log(JSON.stringify({
      ok: deploy.ok,
      status: deploy.status,
      payer: payer.publicKey.toBase58(),
      builtProgramId,
      artifactBytes,
      programId: parsed.programId || builtProgramId,
      deploySignature: parsed.signature,
      explorerUrl: parsed.signature ? `https://solscan.io/tx/${parsed.signature}` : null,
      hint: deploy.ok ? 'Set ZK_VERIFIER_PROGRAM_ID to programId and ENABLE_ONCHAIN_ZK_VERIFIER=true' : 'Deploy failed; stderr was redacted to avoid leaking RPC URLs',
      error: deploy.ok ? null : (deploy.stderr || deploy.stdout).replace(rpcUrl, '[RPC_URL]').slice(0, 4000),
    }, null, 2));
    if (!deploy.ok) process.exitCode = deploy.status || 1;
  } finally {
    try { fs.rmSync(tempKeypair, { force: true }); } catch {}
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
