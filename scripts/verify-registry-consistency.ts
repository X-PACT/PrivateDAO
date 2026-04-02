import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  programId: string;
  verificationWallet: string;
  packages: Record<string, string[]>;
  status: Record<string, string>;
};

type ProofRegistry = {
  programId: string;
  verificationWallet: string;
};

function main() {
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  if (submission.programId !== proof.programId) {
    throw new Error("submission/proof registry program id mismatch");
  }

  if (submission.verificationWallet !== proof.verificationWallet) {
    throw new Error("submission/proof registry verification wallet mismatch");
  }

  for (const pkg of ["strategy", "security", "proof", "operations"] as const) {
    const entries = submission.packages[pkg];
    if (!entries || entries.length === 0) {
      throw new Error(`submission registry package '${pkg}' is empty`);
    }
    for (const entry of entries) {
      if (!fs.existsSync(path.resolve(entry))) {
        throw new Error(`submission registry references missing file: ${entry}`);
      }
    }
  }

  if (submission.status.governanceLifecycle !== "verified") {
    throw new Error("submission registry governanceLifecycle status is unexpected");
  }

  console.log("Registry consistency verification: PASS");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
