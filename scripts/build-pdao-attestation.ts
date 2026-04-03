import crypto from "crypto";
import fs from "fs";
import path from "path";

import { loadProofRegistry } from "./lib/proof-registry";

type PdaoMetadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string }>;
  properties?: {
    category?: string;
    files?: Array<{ uri: string; type?: string }>;
  };
};

function main() {
  const proof = loadProofRegistry();
  if (!proof.pdaoToken) {
    throw new Error("proof registry is missing the PDAO token surface");
  }

  const metadataPath = path.resolve("docs/assets/pdao-token.json");
  if (!fs.existsSync(metadataPath)) {
    throw new Error("missing docs/assets/pdao-token.json");
  }

  const metadataBody = fs.readFileSync(metadataPath);
  const metadata = JSON.parse(metadataBody.toString("utf8")) as PdaoMetadata;

  const attestation = {
    project: "PrivateDAO",
    privateDaoProgramId: proof.programId,
    verificationWallet: proof.verificationWallet,
    pdaoToken: {
      name: metadata.name,
      symbol: metadata.symbol,
      network: "Devnet",
      utility: "Governance Voting Token",
      platform: "DeAura",
      mint: proof.pdaoToken.mint,
      tokenProgramId: proof.pdaoToken.programId,
      tokenAccount: proof.pdaoToken.tokenAccount,
      decimals: proof.pdaoToken.decimals,
      supplyUi: proof.pdaoToken.supplyUi,
      metadataUri: proof.pdaoToken.metadataUri,
      metadataAssetPath: "docs/assets/pdao-token.json",
      metadataSha256: sha256Hex(metadataBody),
      image: metadata.image,
      externalUrl: metadata.external_url,
      transactionLabels: Object.keys(proof.pdaoToken.transactions),
    },
    programBoundary: {
      privateDaoProgramId: proof.programId,
      tokenProgramId: proof.pdaoToken.programId,
      explanation:
        "PrivateDAO has one canonical governance program id. The separate Token-2022 program id belongs to the PDAO mint surface and is expected.",
    },
    verificationDocs: [
      "docs/token.md",
      "docs/pdao-token.md",
      "docs/assets/pdao-token.json",
      "docs/devnet-release-manifest.md",
      "docs/proof-registry.json",
    ],
  };

  const outPath = path.resolve("docs/pdao-attestation.generated.json");
  fs.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
  console.log(`Wrote PDAO attestation: ${path.relative(process.cwd(), outPath)}`);
}

function sha256Hex(input: crypto.BinaryLike): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

main();
