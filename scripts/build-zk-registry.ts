import crypto from "crypto";
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
  artifacts: Record<
    | "source"
    | "sampleInput"
    | "proof"
    | "publicSignals"
    | "verificationKey"
    | "provingKey"
    | "r1cs"
    | "wasm"
    | "witness",
    {
      sha256: string;
      bytes: number;
    }
  >;
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
    provingSystem: "groth16",
    ptau: buildArtifact("zk/setup/pot12_final.ptau"),
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
  const source = `zk/circuits/${circuit}.circom`;
  const sampleInput = `zk/inputs/${circuit}.sample.json`;
  const proof = `zk/proofs/${circuit}.proof.json`;
  const verificationKey = `zk/setup/${circuit}_vkey.json`;
  const provingKey = `zk/setup/${circuit}_final.zkey`;
  const r1cs = `zk/build/${circuit}.r1cs`;
  const wasm = `zk/build/${circuit}_js/${circuit}.wasm`;
  const witness = `zk/proofs/${circuit}.wtns`;

  return {
    circuit,
    layer,
    source,
    sampleInput,
    proof,
    publicSignals: publicSignalsPath,
    verificationKey,
    provingKey,
    r1cs,
    wasm,
    witness,
    publicSignalCount: publicSignals.length,
    commands: {
      build: `npm run zk:build:${layer}`,
      prove: `npm run zk:prove:${layer}`,
      verify: `npm run zk:verify:${layer}`,
    },
    artifacts: {
      source: buildArtifact(source),
      sampleInput: buildArtifact(sampleInput),
      proof: buildArtifact(proof),
      publicSignals: buildArtifact(publicSignalsPath),
      verificationKey: buildArtifact(verificationKey),
      provingKey: buildArtifact(provingKey),
      r1cs: buildArtifact(r1cs),
      wasm: buildArtifact(wasm),
      witness: buildArtifact(witness),
    },
  };
}

function buildArtifact(relativePath: string) {
  const absolutePath = path.resolve(relativePath);
  const body = fs.readFileSync(absolutePath);
  return {
    path: relativePath,
    sha256: crypto.createHash("sha256").update(body).digest("hex"),
    bytes: body.byteLength,
  };
}

main();
