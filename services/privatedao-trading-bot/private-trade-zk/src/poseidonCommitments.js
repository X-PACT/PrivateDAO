const circomlibjs = require('circomlibjs');

let poseidon;

async function getPoseidon() {
  if (!poseidon) poseidon = await circomlibjs.buildPoseidon();
  return poseidon;
}

async function poseidonField(inputs) {
  const p = await getPoseidon();
  return p.F.toString(p(inputs.map((x) => BigInt(x))));
}

async function buildCommitments(input) {
  const pub = input.public;
  const priv = input.private;

  const intentCommitment = await poseidonField([
    priv.side,
    priv.amountBucket,
    priv.slippageBps,
    priv.strategyId,
    priv.userKey,
    priv.tokenHash,
    priv.salt,
    pub.policyHash
  ]);

  const routeCommitment = await poseidonField([
    priv.routeHash,
    priv.strategyId,
    priv.salt
  ]);

  const riskCommitment = await poseidonField([
    priv.riskScore,
    priv.amountBucket,
    priv.slippageBps,
    pub.policyHash
  ]);

  return {
    intentCommitment,
    routeCommitment,
    riskCommitment
  };
}

module.exports = {
  poseidonField,
  buildCommitments
};
