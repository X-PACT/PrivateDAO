pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template PrivateTradeIntent() {
  signal input intentCommitment;
  signal input routeCommitment;
  signal input riskCommitment;
  signal input policyHash;
  signal input maxSlippageBps;
  signal input minAmountBucket;
  signal input maxAmountBucket;
  signal input expirySlot;

  signal input side;
  signal input amountBucket;
  signal input slippageBps;
  signal input strategyId;
  signal input userKey;
  signal input tokenHash;
  signal input salt;
  signal input routeHash;
  signal input riskScore;
  signal input currentSlot;

  side * (side - 1) === 0;

  component amountMin = GreaterEqThan(64);
  amountMin.in[0] <== amountBucket;
  amountMin.in[1] <== minAmountBucket;
  amountMin.out === 1;

  component amountMax = GreaterEqThan(64);
  amountMax.in[0] <== maxAmountBucket;
  amountMax.in[1] <== amountBucket;
  amountMax.out === 1;

  component slipGate = GreaterEqThan(64);
  slipGate.in[0] <== maxSlippageBps;
  slipGate.in[1] <== slippageBps;
  slipGate.out === 1;

  component expiryGate = GreaterEqThan(64);
  expiryGate.in[0] <== expirySlot;
  expiryGate.in[1] <== currentSlot;
  expiryGate.out === 1;

  component intentHash = Poseidon(8);
  intentHash.inputs[0] <== side;
  intentHash.inputs[1] <== amountBucket;
  intentHash.inputs[2] <== slippageBps;
  intentHash.inputs[3] <== strategyId;
  intentHash.inputs[4] <== userKey;
  intentHash.inputs[5] <== tokenHash;
  intentHash.inputs[6] <== salt;
  intentHash.inputs[7] <== policyHash;
  intentHash.out === intentCommitment;

  component routeHashCheck = Poseidon(3);
  routeHashCheck.inputs[0] <== routeHash;
  routeHashCheck.inputs[1] <== strategyId;
  routeHashCheck.inputs[2] <== salt;
  routeHashCheck.out === routeCommitment;

  component riskHashCheck = Poseidon(4);
  riskHashCheck.inputs[0] <== riskScore;
  riskHashCheck.inputs[1] <== amountBucket;
  riskHashCheck.inputs[2] <== slippageBps;
  riskHashCheck.inputs[3] <== policyHash;
  riskHashCheck.out === riskCommitment;
}

component main {
  public [
    intentCommitment,
    routeCommitment,
    riskCommitment,
    policyHash,
    maxSlippageBps,
    minAmountBucket,
    maxAmountBucket,
    expirySlot
  ]
} = PrivateTradeIntent();
