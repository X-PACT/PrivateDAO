const fs = require('fs');
const path = require('path');
const wc = require('../build/private_trade_intent_js/witness_calculator.js');

(async () => {
  const wasmPath = path.join(__dirname, '..', 'build', 'private_trade_intent_js', 'private_trade_intent.wasm');
  const inputPath = path.join(__dirname, '..', 'input', 'trade-intent.input.json');
  const outputPath = path.join(__dirname, '..', 'build', 'trade-intent.wtns');

  if (!fs.existsSync(wasmPath)) throw new Error(`Missing wasm: ${wasmPath}`);
  if (!fs.existsSync(inputPath)) throw new Error(`Missing input: ${inputPath}`);

  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const buffer = fs.readFileSync(wasmPath);
  const witnessCalculator = await wc(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input, 0);

  fs.writeFileSync(outputPath, buff);
  console.log(JSON.stringify({ ok: true, witness: outputPath }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
