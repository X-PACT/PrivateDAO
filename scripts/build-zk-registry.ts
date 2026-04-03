import fs from "fs";
import path from "path";

type ZkCircuitName =
  | "private_dao_vote_overlay"
  | "private_dao_delegation_overlay"
  | "private_dao_tally_overlay";

type ZkRegistryEntry = {
  circuit: ZkCircuitName;
  layer: string;
  source: string;
  sampleInput: string;
  proof: string;
  publicSignals: string;
  verificationKey: string;
  provingKey: string;
  r1cs: string;
  wasm: string;
  witness: string;
  publicSignalCount: number;
  commands: {
    build: string;
    prove: string;
    verify: string;
  };
};

const ENTRIES: Array<{ circuit: ZkCircuitName; layer: string }> = [
  { circuit: "private_dao_vote_overlay", layer: "vote" },
  { circuit: "private_dao_delegation_overlay", layer: "delegation" },
  { circuit: "private_dao_tally_overlay", layer: "tally" },
];

function main() {
  const registry = {
    project: "PrivateDAO",
    zkStackVersion: 1,
    entryCount: ENTRIES.length,
    entries: ENTRIES.map(buildEntry),
  };

  const outPath = path.resolve("docs/zk-registry.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Wrote zk registry: ${path.relative(process.cwd(), outPath)}`);
}

function buildEntry({ circuit, layer }: { circuit: ZkCircuitName; layer: string }): ZkRegistryEntry {
  const publicSignalsPath = `zk/proofs/${circuit}.public.json`;
  const publicSignals = JSON.parse(fs.readFileSync(path.resolve(publicSignalsPath), "utf8")) as string[];

  return {
    circuit,
    layer,
    source: `zk/circuits/${circuit}.circom`,
    sampleInput: `zk/inputs/${circuit}.sample.json`,
    proof: `zk/proofs/${circuit}.proof.json`,
    publicSignals: publicSignalsPath,
    verificationKey: `zk/setup/${circuit}_vkey.json`,
    provingKey: `zk/setup/${circuit}_final.zkey`,
    r1cs: `zk/build/${circuit}.r1cs`,
    wasm: `zk/build/${circuit}_js/${circuit}.wasm`,
    witness: `zk/proofs/${circuit}.wtns`,
    publicSignalCount: publicSignals.length,
    commands: {
      build: `npm run zk:build:${layer}`,
      prove: `npm run zk:prove:${layer}`,
      verify: `npm run zk:verify:${layer}`,
    },
  };
}

main();
