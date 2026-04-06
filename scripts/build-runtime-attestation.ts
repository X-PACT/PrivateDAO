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
      "docs/real-device-runtime.md",
      "docs/real-device-runtime-captures.json",
      "docs/real-device-runtime.generated.md",
      "docs/real-device-runtime.generated.json",
      "docs/zk-enforced-runtime-evidence.md",
      "docs/zk-enforced-runtime-captures.json",
      "docs/zk-enforced-runtime.generated.md",
      "docs/zk-enforced-runtime.generated.json",
      "docs/zk-enforced-operator-flow.md",
      "docs/zk-external-closure.json",
      "docs/zk-external-closure.generated.md",
      "docs/zk-external-closure.generated.json",
      "docs/wallet-compatibility-matrix.generated.md",
      "docs/wallet-compatibility-matrix.generated.json",
      "docs/fair-voting.md",
      "docs/devnet-canary.generated.md",
      "docs/devnet-canary.generated.json",
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
      "A generated wallet compatibility matrix makes per-wallet support surfaces explicit.",
      "A read-only Devnet canary provides a lightweight operational signal between heavy stress runs.",
      "Real-device runtime capture intake is tracked separately so mobile and desktop wallet runs can be added without rewriting reviewer docs.",
      "A separate zk_enforced runtime capture path tracks stronger-path wallet evidence without overstating production readiness.",
      "A separate zk external closure package tracks the remaining external execution path: captures, audit, and verifier-boundary freeze.",
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
