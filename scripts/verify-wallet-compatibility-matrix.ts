import fs from "fs";
import path from "path";

type Matrix = {
  programId: string;
  diagnosticsPage: string;
  entries: Array<{
    id: string;
    label: string;
    diagnosticsVisible: boolean;
    selectorVisible: boolean;
    status: string;
  }>;
};

type RuntimeAttestation = {
  programId: string;
  diagnosticsPage: string;
  supportedWallets: Array<{ id: string; label: string }>;
};

function main() {
  const matrixPath = path.resolve("docs/wallet-compatibility-matrix.generated.json");
  const markdownPath = path.resolve("docs/wallet-compatibility-matrix.generated.md");

  if (!fs.existsSync(matrixPath) || !fs.existsSync(markdownPath)) {
    throw new Error("wallet compatibility matrix artifacts are missing");
  }

  const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8")) as Matrix;
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const runtime = JSON.parse(fs.readFileSync(path.resolve("docs/runtime-attestation.generated.json"), "utf8")) as RuntimeAttestation;

  if (matrix.programId !== runtime.programId) {
    throw new Error("wallet compatibility matrix program mismatch");
  }
  if (matrix.diagnosticsPage !== runtime.diagnosticsPage) {
    throw new Error("wallet compatibility matrix diagnostics page mismatch");
  }
  if (matrix.entries.length !== runtime.supportedWallets.length) {
    throw new Error("wallet compatibility matrix entry count mismatch");
  }
  for (const wallet of runtime.supportedWallets) {
    const entry = matrix.entries.find((candidate) => candidate.id === wallet.id);
    if (!entry || entry.label !== wallet.label) {
      throw new Error(`wallet compatibility matrix is missing ${wallet.id}`);
    }
    if (!entry.diagnosticsVisible || !entry.selectorVisible) {
      throw new Error(`wallet compatibility matrix is unexpectedly weak for ${wallet.id}`);
    }
  }
  if (!markdown.includes("# Wallet Compatibility Matrix") || !markdown.includes("runtime QA")) {
    throw new Error("wallet compatibility matrix markdown is incomplete");
  }

  console.log("Wallet compatibility matrix verification: PASS");
}

main();
