import fs from "fs";
import path from "path";

type ZkRegistry = {
  provingSystem: string;
  ptau: {
    path: string;
    sha256: string;
  };
  entries: Array<{
    circuit: string;
    layer: string;
    commands: {
      build: string;
      prove: string;
      verify: string;
    };
    artifacts: Record<string, { sha256: string }>;
  }>;
};

function main() {
  const transcriptPath = path.resolve("docs/zk-transcript.generated.md");
  if (!fs.existsSync(transcriptPath)) {
    throw new Error("missing zk transcript");
  }

  const transcript = fs.readFileSync(transcriptPath, "utf8");
  const registry = JSON.parse(fs.readFileSync(path.resolve("docs/zk-registry.generated.json"), "utf8")) as ZkRegistry;

  assertContains(transcript, "# ZK Transcript");
  assertContains(transcript, `Proving system: \`${registry.provingSystem}\``);
  assertContains(transcript, registry.ptau.path);
  assertContains(transcript, registry.ptau.sha256);
  assertContains(transcript, "docs/zk-attestation.generated.json");

  for (const entry of registry.entries) {
    assertContains(transcript, `### ${entry.layer.toUpperCase()} — \`${entry.circuit}\``);
    assertContains(transcript, entry.commands.build);
    assertContains(transcript, entry.commands.prove);
    assertContains(transcript, entry.commands.verify);
    assertContains(transcript, entry.artifacts.source.sha256);
    assertContains(transcript, entry.artifacts.proof.sha256);
    assertContains(transcript, entry.artifacts.verificationKey.sha256);
  }

  for (const command of [
    "npm run build:zk-registry",
    "npm run build:zk-transcript",
    "npm run build:zk-attestation",
    "npm run verify:zk-registry",
    "npm run verify:zk-transcript",
    "npm run verify:zk-attestation",
    "npm run verify:zk-docs",
    "npm run verify:zk-consistency",
    "npm run verify:zk-negative",
    "npm run zk:all",
  ]) {
    assertContains(transcript, command);
  }

  console.log("ZK transcript verification: PASS");
}

function assertContains(content: string, needle: string) {
  if (!content.includes(needle)) {
    throw new Error(`zk transcript is missing: ${needle}`);
  }
}

main();
