import fs from "fs";
import path from "path";

type RuntimeAttestation = {
  project: string;
  programId: string;
  verificationWallet: string;
  diagnosticsPage: string;
  runtimeDocs: string[];
  supportedWallets: Array<{ id: string; label: string }>;
  runtimeNotes: string[];
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
  };
};

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  frontend: string;
};

type ProofRegistry = {
  pdaoToken?: {
    mint: string;
    programId: string;
    tokenAccount: string;
  };
};

function main() {
  const attestationPath = path.resolve("docs/runtime-attestation.generated.json");
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing runtime attestation");
  }

  const attestation = readJson<RuntimeAttestation>("docs/runtime-attestation.generated.json");
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  assert(attestation.project === submission.project, "runtime attestation project mismatch");
  assert(attestation.programId === submission.programId, "runtime attestation program mismatch");
  assert(attestation.verificationWallet === submission.verificationWallet, "runtime attestation verification wallet mismatch");
  assert(attestation.diagnosticsPage === `${submission.frontend}?page=diagnostics`, "runtime attestation diagnostics URL mismatch");

  for (const doc of [
    "docs/wallet-runtime.md",
    "docs/runtime/real-device.md",
    "docs/runtime/real-device-captures.json",
    "docs/runtime/real-device.generated.md",
    "docs/runtime/real-device.generated.json",
    "docs/frontier-integrations.generated.md",
    "docs/frontier-integrations.generated.json",
    "docs/zk/enforced-runtime-evidence.md",
    "docs/zk/enforced-runtime-captures.json",
    "docs/zk/enforced-runtime.generated.md",
    "docs/zk/enforced-runtime.generated.json",
    "docs/zk/enforced-operator-flow.md",
    "docs/zk/external-closure.json",
    "docs/zk/external-closure.generated.md",
    "docs/zk/external-closure.generated.json",
    "docs/fair-voting.md",
    "docs/go-live-criteria.md",
    "docs/operational-drillbook.md",
  ]) {
    assert(attestation.runtimeDocs.includes(doc), `runtime attestation is missing runtime doc: ${doc}`);
  }

  for (const wallet of ["auto-detect", "phantom", "solflare", "backpack", "glow"]) {
    assert(attestation.supportedWallets.some((entry) => entry.id === wallet), `runtime attestation is missing wallet: ${wallet}`);
  }

  assert(attestation.runtimeNotes.length >= 3, "runtime attestation notes are unexpectedly weak");

  if (proof.pdaoToken) {
    assert(Boolean(attestation.pdaoToken), "runtime attestation is missing PDAO token section");
    assert(attestation.pdaoToken?.mint === proof.pdaoToken.mint, "runtime attestation PDAO mint mismatch");
    assert(attestation.pdaoToken?.programId === proof.pdaoToken.programId, "runtime attestation PDAO program mismatch");
  }

  console.log("Runtime attestation verification: PASS");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
