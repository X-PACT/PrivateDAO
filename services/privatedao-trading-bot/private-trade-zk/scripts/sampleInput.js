require('dotenv').config({ path: '../.env' });

const fs = require('fs');
const path = require('path');
const { encryptIntent, buildTradeIntentInput } = require('../src/encryptedIntent');
const { buildCommitments } = require('../src/poseidonCommitments');
const { fieldHash, randomField } = require('../src/field');

(async () => {
  const intent = {
    side: 'buy',
    amountBucket: 10,
    slippageBps: 300,
    strategyId: 101,
    userKey: fieldHash('telegram:7254012270'),
    tokenMint: 'PRIVATE_TOKEN_PLACEHOLDER',
    route: 'refhe:private-execution:v1',
    riskScore: 20,
    expirySlot: 999999999999,
    salt: randomField()
  };

  const policy = {
    policyHash: fieldHash('privatedao-private-trade-policy-v1'),
    maxSlippageBps: 1200,
    minAmountBucket: 1,
    maxAmountBucket: 1000000,
    expirySlot: 999999999999
  };

  const encryptedIntent = encryptIntent(intent);
  const input = buildTradeIntentInput(intent, policy);
  const commitments = await buildCommitments(input);

  const circuitInput = {
    ...commitments,
    ...input.public,
    ...input.private
  };

  fs.mkdirSync(path.join(__dirname, '..', 'input'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'input', 'trade-intent.input.json'), JSON.stringify(circuitInput, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'input', 'trade-intent.encrypted.json'), JSON.stringify(encryptedIntent, null, 2));

  console.log(JSON.stringify({
    ok: true,
    input: 'input/trade-intent.input.json',
    encrypted: 'input/trade-intent.encrypted.json',
    publicCommitments: commitments
  }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
