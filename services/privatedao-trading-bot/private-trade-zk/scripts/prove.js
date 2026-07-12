const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');

(async () => {
  const wtns = path.join(__dirname, '..', 'build', 'trade-intent.wtns');
  const zkey = path.join(__dirname, '..', 'build', 'private_trade_intent_final.zkey');
  const proofPath = path.join(__dirname, '..', 'proofs', 'trade-intent.proof.json');
  const publicPath = path.join(__dirname, '..', 'proofs', 'trade-intent.public.json');

  if (!fs.existsSync(wtns)) throw new Error(`Missing witness: ${wtns}`);
  if (!fs.existsSync(zkey)) throw new Error(`Missing zkey: ${zkey}`);

  const { proof, publicSignals } = await snarkjs.groth16.prove(zkey, wtns);

  fs.mkdirSync(path.join(__dirname, '..', 'proofs'), { recursive: true });
  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
  fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

  console.log(JSON.stringify({
    ok: true,
    proof: proofPath,
    publicSignals: publicPath,
    publicSignalCount: publicSignals.length
  }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
