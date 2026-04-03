import fs from "fs";
import path from "path";

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
  const submission = readJson<SubmissionRegistry>("docs/submission-registry.json");
  const proof = readJson<ProofRegistry>("docs/proof-registry.json");

  const attestation = {
    project: submission.project,
    programId: submission.programId,
    verificationWallet: submission.verificationWallet,
    diagnosticsPage: `${submission.frontend}?page=diagnostics`,
    runtimeDocs: [
      "docs/wallet-runtime.md",
      "docs/fair-voting.md",
      "docs/go-live-criteria.md",
      "docs/operational-drillbook.md",
    ],
    supportedWallets: [
      { id: "auto-detect", label: "Auto Detect" },
      { id: "phantom", label: "Phantom" },
      { id: "solflare", label: "Solflare" },
      { id: "backpack", label: "Backpack" },
      { id: "glow", label: "Glow" },
    ],
    runtimeNotes: [
      "Browser-side wallet diagnostics are exposed through the live frontend.",
      "Provider detection and capability reporting are reviewer-visible.",
      "Real client-side wallet QA remains required before any mainnet cutover claim.",
    ],
    pdaoToken: proof.pdaoToken
      ? {
          mint: proof.pdaoToken.mint,
          programId: proof.pdaoToken.programId,
          tokenAccount: proof.pdaoToken.tokenAccount,
        }
      : undefined,
  };

  const outPath = path.resolve("docs/runtime-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote runtime attestation: ${path.relative(process.cwd(), outPath)}`);
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
