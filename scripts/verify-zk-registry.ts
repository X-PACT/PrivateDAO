import fs from "fs";
import path from "path";

type ZkRegistryEntry = {
  circuit: string;
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

function main() {
  const registryPath = path.resolve("docs/zk-registry.generated.json");
  if (!fs.existsSync(registryPath)) {
    throw new Error("missing zk registry");
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    project: string;
    zkStackVersion: number;
    entryCount: number;
    entries: ZkRegistryEntry[];
  };

  if (registry.project !== "PrivateDAO") {
    throw new Error("zk registry project mismatch");
  }

  if (registry.zkStackVersion < 1) {
    throw new Error("zk registry version is invalid");
  }

  if (registry.entryCount !== registry.entries.length || registry.entries.length < 3) {
    throw new Error("zk registry entry count mismatch");
  }

  for (const entry of registry.entries) {
    verifyEntry(entry);
  }

  console.log("ZK registry verification: PASS");
}

function verifyEntry(entry: ZkRegistryEntry) {
  const requiredPaths = [
    entry.source,
    entry.sampleInput,
    entry.proof,
    entry.publicSignals,
    entry.verificationKey,
    entry.provingKey,
    entry.r1cs,
    entry.wasm,
    entry.witness,
  ];

  for (const relativePath of requiredPaths) {
    if (!fs.existsSync(path.resolve(relativePath))) {
      throw new Error(`zk registry missing path: ${relativePath}`);
    }
  }

  if (!entry.commands.build.includes(`zk:build:${entry.layer}`)) {
    throw new Error(`zk registry build command mismatch: ${entry.circuit}`);
  }
  if (!entry.commands.prove.includes(`zk:prove:${entry.layer}`)) {
    throw new Error(`zk registry prove command mismatch: ${entry.circuit}`);
  }
  if (!entry.commands.verify.includes(`zk:verify:${entry.layer}`)) {
    throw new Error(`zk registry verify command mismatch: ${entry.circuit}`);
  }

  const publicSignals = JSON.parse(fs.readFileSync(path.resolve(entry.publicSignals), "utf8")) as string[];
  if (publicSignals.length !== entry.publicSignalCount || entry.publicSignalCount <= 0) {
    throw new Error(`zk registry public signal count mismatch: ${entry.circuit}`);
  }
}

main();
