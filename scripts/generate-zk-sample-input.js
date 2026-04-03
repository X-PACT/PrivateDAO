const { mkdirSync, writeFileSync } = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");

function toFieldString(value) {
  return value.toString();
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const outputPath = process.argv[2] || path.join(repoRoot, "zk", "inputs", "private_dao_vote_overlay.sample.json");

  const proposalId = 1001n;
  const daoKey = 500000000000000001n;
  const minWeight = 100n;
  const vote = 1n;
  const salt = 9876543210123456789n;
  const voterKey = 400000000000000777n;
  const weight = 250n;

  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const hash = (...items) => BigInt(F.toString(poseidon(items)));

  const sample = {
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

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
  console.log(`[zk] wrote sample input to ${outputPath}`);
}

main().catch((error) => {
  console.error("[zk] failed to generate sample input");
  console.error(error);
  process.exit(1);
});
