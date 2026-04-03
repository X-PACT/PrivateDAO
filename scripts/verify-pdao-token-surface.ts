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

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")) as PdaoMetadata;
  const readme = fs.readFileSync(path.resolve("README.md"), "utf8");
  const tokenDoc = fs.readFileSync(path.resolve("docs/token.md"), "utf8");
  const pdaoDoc = fs.readFileSync(path.resolve("docs/pdao-token.md"), "utf8");
  const frontend = fs.readFileSync(path.resolve("docs/index.html"), "utf8");

  assert(metadata.name === "PDAO", "PDAO metadata name mismatch");
  assert(metadata.symbol === "PDAO", "PDAO metadata symbol mismatch");
  assert(metadata.image === "https://x-pact.github.io/PrivateDAO/assets/logo.png", "PDAO metadata image mismatch");
  assert(metadata.external_url === "https://x-pact.github.io/PrivateDAO/?page=security", "PDAO metadata external URL mismatch");
  assert(
    metadata.attributes.some((entry) => entry.trait_type === "PrivateDAO Program ID" && entry.value === proof.programId),
    "PDAO metadata is missing the canonical PrivateDAO program id",
  );
  assert(
    metadata.attributes.some((entry) => entry.trait_type === "Mint" && entry.value === proof.pdaoToken?.mint),
    "PDAO metadata is missing the live mint",
  );
  assert(metadata.properties?.category === "image", "PDAO metadata category mismatch");
  assert(
    Boolean(metadata.properties?.files?.some((entry) => entry.uri === "https://x-pact.github.io/PrivateDAO/assets/logo.png")),
    "PDAO metadata files are missing the canonical logo",
  );

  for (const fragment of [
    "docs/pdao-token.md",
    "docs/pdao-attestation.generated.json",
    proof.pdaoToken.mint,
    "1,000,000 PDAO",
  ]) {
    assert(readme.includes(fragment), `README is missing token surface fragment: ${fragment}`);
  }

  for (const fragment of [
    "Token Name: `PrivateDAO Governance Token`",
    "Symbol: `PDAO`",
    "Launch Platform: `DeAura`",
  ]) {
    assert(tokenDoc.includes(fragment), `docs/token.md is missing token architecture fragment: ${fragment}`);
  }

  for (const fragment of [
    proof.pdaoToken.mint,
    proof.pdaoToken.programId,
    proof.pdaoToken.tokenAccount,
    proof.pdaoToken.metadataUri,
    proof.verificationWallet,
    `PrivateDAO governance program: \`${proof.programId}\``,
    "Token-2022 program:",
    "Program Identity Boundary",
    "docs/assets/pdao-token.json",
  ]) {
    assert(pdaoDoc.includes(fragment), `docs/pdao-token.md is missing token surface fragment: ${fragment}`);
  }

  for (const fragment of [
    proof.pdaoToken.mint,
    "PDAO Token Surface",
    "pdao-attestation.generated.json",
    "assets/pdao-token.json",
    "PROGRAM BOUNDARY",
  ]) {
    assert(frontend.includes(fragment), `docs/index.html is missing token UI fragment: ${fragment}`);
  }

  console.log("PDAO token surface verification: PASS");
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

main();
