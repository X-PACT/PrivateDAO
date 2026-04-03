const { mkdirSync, writeFileSync } = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");

function toFieldString(value) {
  return value.toString();
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const circuit = process.argv[2] || "private_dao_vote_overlay";
  const outputPath = process.argv[3] || path.join(repoRoot, "zk", "inputs", `${circuit}.sample.json`);

  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const hash = (...items) => BigInt(F.toString(poseidon(items)));

  const proposalId = 1001n;
  const daoKey = 500000000000000001n;
  const minWeight = 100n;

  let sample;

  if (circuit === "private_dao_vote_overlay") {
    const vote = 1n;
    const salt = 9876543210123456789n;
    const voterKey = 400000000000000777n;
    const weight = 250n;

    sample = {
      proposalId: toFieldString(proposalId),
      daoKey: toFieldString(daoKey),
      minWeight: toFieldString(minWeight),
      commitment: toFieldString(hash(vote, salt, voterKey, proposalId, daoKey)),
      nullifier: toFieldString(hash(voterKey, proposalId, daoKey)),
      eligibilityHash: toFieldString(hash(voterKey, weight, daoKey)),
      vote: toFieldString(vote),
      salt: toFieldString(salt),
      voterKey: toFieldString(voterKey),
      weight: toFieldString(weight),
    };
  } else if (circuit === "private_dao_delegation_overlay") {
    const delegatorKey = 400000000000000777n;
    const delegateeKey = 400000000000000888n;
    const salt = 765432109876543210n;
    const delegatedWeight = 250n;
    const active = 1n;

    sample = {
      proposalId: toFieldString(proposalId),
      daoKey: toFieldString(daoKey),
      minWeight: toFieldString(minWeight),
      delegationCommitment: toFieldString(hash(delegatorKey, delegateeKey, proposalId, daoKey, salt)),
      delegationNullifier: toFieldString(hash(delegatorKey, proposalId, daoKey)),
      delegateeBinding: toFieldString(hash(delegateeKey, proposalId, daoKey)),
      weightCommitment: toFieldString(hash(delegateeKey, delegatedWeight, daoKey)),
      delegatorKey: toFieldString(delegatorKey),
      delegateeKey: toFieldString(delegateeKey),
      salt: toFieldString(salt),
      delegatedWeight: toFieldString(delegatedWeight),
      active: toFieldString(active),
    };
  } else if (circuit === "private_dao_tally_overlay") {
    const votes = [1n, 0n];
    const salts = [11111111n, 22222222n];
    const voterKeys = [
      400000000000000111n,
      400000000000000222n,
    ];
    const weights = [150n, 90n];
    const commitments = votes.map((vote, index) => hash(vote, salts[index], voterKeys[index], proposalId, daoKey));
    const nullifiers = voterKeys.map((voterKey) => hash(voterKey, proposalId, daoKey));
    const yesWeightTotal = weights.reduce((sum, weight, index) => sum + votes[index] * weight, 0n);
    const noWeightTotal = weights.reduce((sum, weight, index) => sum + (1n - votes[index]) * weight, 0n);

    sample = {
      proposalId: toFieldString(proposalId),
      daoKey: toFieldString(daoKey),
      commitment0: toFieldString(commitments[0]),
      commitment1: toFieldString(commitments[1]),
      yesWeightTotal: toFieldString(yesWeightTotal),
      noWeightTotal: toFieldString(noWeightTotal),
      nullifierAccumulator: toFieldString(hash(nullifiers[0], nullifiers[1])),
      vote0: toFieldString(votes[0]),
      vote1: toFieldString(votes[1]),
      salt0: toFieldString(salts[0]),
      salt1: toFieldString(salts[1]),
      voterKey0: toFieldString(voterKeys[0]),
      voterKey1: toFieldString(voterKeys[1]),
      weight0: toFieldString(weights[0]),
      weight1: toFieldString(weights[1]),
    };
  } else {
    throw new Error(`Unsupported zk circuit: ${circuit}`);
  }

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
  console.log(`[zk] wrote ${circuit} sample input to ${outputPath}`);
}

main().catch((error) => {
  console.error("[zk] failed to generate sample input");
  console.error(error);
  process.exit(1);
});
