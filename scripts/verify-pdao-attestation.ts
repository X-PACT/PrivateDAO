import crypto from "crypto";
import fs from "fs";
import path from "path";

import { loadProofRegistry } from "./lib/proof-registry";

type PdaoAttestation = {
  project: string;
  privateDaoProgramId: string;
  verificationWallet: string;
  pdaoToken: {
    name: string;
    symbol: string;
    network: string;
    utility: string;
    platform: string;
    mint: string;
    tokenProgramId: string;
    tokenAccount: string;
    decimals: number;
    supplyUi: string;
    metadataUri: string;
    metadataAssetPath: string;
    metadataSha256: string;
    image: string;
    externalUrl: string;
    transactionLabels: string[];
  };
  programBoundary: {
    privateDaoProgramId: string;
    tokenProgramId: string;
    explanation: string;
  };
  verificationDocs: string[];
};

function main() {
  const proof = loadProofRegistry();
  if (!proof.pdaoToken) {
    throw new Error("proof registry is missing the PDAO token surface");
  }

  const attestationPath = path.resolve("docs/pdao-attestation.generated.json");
  if (!fs.existsSync(attestationPath)) {
    throw new Error("missing docs/pdao-attestation.generated.json");
  }

  const metadataPath = path.resolve("docs/assets/pdao-token.json");
  if (!fs.existsSync(metadataPath)) {
    throw new Error("missing docs/assets/pdao-token.json");
  }

  const attestation = JSON.parse(fs.readFileSync(attestationPath, "utf8")) as PdaoAttestation;
  const metadataBody = fs.readFileSync(metadataPath);

  assert(attestation.project === "PrivateDAO", "PDAO attestation project mismatch");
  assert(attestation.privateDaoProgramId === proof.programId, "PDAO attestation governance program mismatch");
  assert(attestation.verificationWallet === proof.verificationWallet, "PDAO attestation verification wallet mismatch");
  assert(attestation.pdaoToken.name === "PDAO", "PDAO attestation name mismatch");
  assert(attestation.pdaoToken.symbol === "PDAO", "PDAO attestation symbol mismatch");
  assert(attestation.pdaoToken.network === "Devnet", "PDAO attestation network mismatch");
  assert(attestation.pdaoToken.utility === "Governance Voting Token", "PDAO attestation utility mismatch");
  assert(attestation.pdaoToken.platform === "DeAura", "PDAO attestation platform mismatch");
  assert(attestation.pdaoToken.mint === proof.pdaoToken.mint, "PDAO attestation mint mismatch");
  assert(attestation.pdaoToken.tokenProgramId === proof.pdaoToken.programId, "PDAO attestation token program mismatch");
  assert(attestation.pdaoToken.tokenAccount === proof.pdaoToken.tokenAccount, "PDAO attestation token account mismatch");
  assert(attestation.pdaoToken.decimals === proof.pdaoToken.decimals, "PDAO attestation decimals mismatch");
  assert(attestation.pdaoToken.supplyUi === proof.pdaoToken.supplyUi, "PDAO attestation supply mismatch");
  assert(attestation.pdaoToken.metadataUri === proof.pdaoToken.metadataUri, "PDAO attestation metadata URI mismatch");
  assert(attestation.pdaoToken.metadataAssetPath === "docs/assets/pdao-token.json", "PDAO attestation metadata asset path mismatch");
  assert(attestation.pdaoToken.metadataSha256 === sha256Hex(metadataBody), "PDAO attestation metadata sha256 mismatch");
  assert(attestation.pdaoToken.image === "https://x-pact.github.io/PrivateDAO/assets/logo.png", "PDAO attestation image mismatch");
  assert(attestation.pdaoToken.externalUrl === "https://x-pact.github.io/PrivateDAO/?page=security", "PDAO attestation external URL mismatch");
  assert(attestation.pdaoToken.transactionLabels.length >= 4, "PDAO attestation transaction labels are incomplete");
  assert(attestation.programBoundary.privateDaoProgramId === proof.programId, "PDAO attestation program boundary governance mismatch");
  assert(attestation.programBoundary.tokenProgramId === proof.pdaoToken.programId, "PDAO attestation program boundary token mismatch");
  assert(attestation.programBoundary.explanation.includes("Token-2022"), "PDAO attestation boundary explanation is incomplete");

  for (const doc of [
    "docs/token.md",
    "docs/pdao-token.md",
    "docs/assets/pdao-token.json",
    "docs/devnet-release-manifest.md",
    "docs/proof-registry.json",
  ]) {
    assert(attestation.verificationDocs.includes(doc), `PDAO attestation is missing verification doc: ${doc}`);
  }

  console.log("PDAO attestation verification: PASS");
}

function sha256Hex(input: crypto.BinaryLike): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
