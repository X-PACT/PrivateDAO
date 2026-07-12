const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ROOT = path.join(__dirname, '..');
const ZK_ROOT = path.join(ROOT, 'private-trade-zk');

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function commandAvailable(command) {
  const result = childProcess.spawnSync(command, ['--version'], { encoding: 'utf8' });
  return !result.error && result.status === 0;
}

function findFiles(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      findFiles(p, predicate, out);
    }
    else if (entry.isFile() && predicate(p)) out.push(p);
  }
  return out;
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function main() {
  const anchors = (() => {
    try {
      const { readAnchorIndex } = require('../onchain/zkReceiptAnchor');
      return readAnchorIndex();
    } catch {
      return [];
    }
  })();
  const ptau = findFiles(ROOT, (p) => p.endsWith('.ptau')).map(rel);
  const zkeys = findFiles(ZK_ROOT, (p) => p.endsWith('.zkey')).map(rel);
  const vkeys = findFiles(ZK_ROOT, (p) => /vkey|verification_key/i.test(path.basename(p))).map(rel);
  const proofFiles = findFiles(path.join(ZK_ROOT, 'proofs'), (p) => p.endsWith('.json')).map(rel);
  const circuit = 'private-trade-zk/circuits/private_trade_intent.circom';
  const witnessGenerator = 'private-trade-zk/build/private_trade_intent_js/generate_witness.js';
  const wasm = 'private-trade-zk/build/private_trade_intent_js/private_trade_intent.wasm';

  const mainnetGroth16Runtime = (() => {
    try {
      const { validateZkMatrix } = require('../proof/zkMatrix');
      const result = validateZkMatrix();
      return {
        ok: result.ok,
        network: result.matrix.summary.network,
        verificationMode: result.matrix.summary.verificationMode,
        anchors: result.matrix.summary.anchorCount,
        issues: result.issues,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  })();
  const onchainVerifier = (() => {
    try {
      const { getOnchainVerifierStatus } = require('../onchain/zkGroth16Verifier');
      return { available: true, statusPromise: getOnchainVerifierStatus() };
    } catch (error) {
      return { available: false, error: error.message };
    }
  })();
  const onchainVerifierStatus = onchainVerifier.available
    ? await onchainVerifier.statusPromise.catch((error) => ({ ok: false, error: error.message }))
    : onchainVerifier;

  const checks = {
    circuitsExist: exists(circuit),
    circomIncludePaths: fs.readFileSync(path.join(ROOT, circuit), 'utf8').includes('circomlib'),
    circomlibExists: exists('private-trade-zk/node_modules/circomlib'),
    ptauExists: ptau.length > 0,
    witnessGeneratorExists: exists(witnessGenerator),
    wasmExists: exists(wasm),
    zkeyExists: zkeys.length > 0,
    vkeyExists: vkeys.length > 0,
    proofVerifyAvailable: commandAvailable(path.join(ZK_ROOT, 'node_modules/.bin/snarkjs')) || exists('private-trade-zk/node_modules/snarkjs'),
    proofFilesExist: proofFiles.length > 0,
    mainnetGroth16Runtime,
    onchainAnchorsFound: anchors.length > 0,
    onchainVerifierClientExists: exists('onchain/zkGroth16Verifier.js'),
    onchainVerifierProgramBuilt: exists('onchain/zk-verifier-program/target/deploy/privatedao_zk_verifier.so'),
  };

  const instructions = [];
  if (!checks.ptauExists) instructions.push('Download or place pot12_final.ptau at repository parent or configure private-trade-zk/package.json setup path.');
  if (!checks.zkeyExists || !checks.vkeyExists) instructions.push('Run from private-trade-zk after ptau exists: npm run setup && npm run witness && npm run prove && npm run verify');
  if (!checks.circomlibExists) instructions.push('Run: cd private-trade-zk && npm install');

  const productionReceiptMode = {
    mainnetTradeReceipts: 'receipt hash + encrypted intent hash + policy hash + route hash + tx signatures',
    groth16Runtime: 'local Groth16 proof, public signals, verification key, and receipt hashes are required before launch',
  };

  const report = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    checks,
    files: { ptau, zkeys, vkeys, proofFiles },
    productionReceiptMode,
    anchors: {
      count: anchors.length,
      latestSignature: anchors.length ? anchors[anchors.length - 1].signature : null,
    },
    onchainVerifier: onchainVerifier.available ? onchainVerifierStatus : onchainVerifier,
    instructions,
    okForReceipts: checks.circuitsExist && checks.witnessGeneratorExists && checks.proofFilesExist,
    okForGroth16ProveVerify: checks.ptauExists && checks.zkeyExists && checks.vkeyExists && checks.proofVerifyAvailable,
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.okForReceipts || !report.okForGroth16ProveVerify || !checks.mainnetGroth16Runtime.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
  process.exit(1);
});
