const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const snarkjs = require('snarkjs');

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

(async () => {
  const vkeyPath = path.join(__dirname, '..', 'build', 'private_trade_intent_vkey.json');
  const proofPath = path.join(__dirname, '..', 'proofs', 'trade-intent.proof.json');
  const publicPath = path.join(__dirname, '..', 'proofs', 'trade-intent.public.json');

  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
  const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

  const ok = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  if (!ok) throw new Error('Groth16 verification failed');

  const receipt = {
    ok: true,
    protocol: proof.protocol,
    curve: proof.curve,
    proofHash: sha256File(proofPath),
    publicSignalsHash: sha256File(publicPath),
    verificationKeyHash: sha256File(vkeyPath),
    generatedAt: new Date().toISOString()
  };

  const receiptPath = path.join(__dirname, '..', 'proofs', 'trade-intent.receipt.json');
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

  console.log(JSON.stringify(receipt, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
