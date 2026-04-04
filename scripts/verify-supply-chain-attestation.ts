import crypto from "crypto";
import fs from "fs";
import path from "path";

type SupplyChainAttestation = {
  project: string;
  algorithm: string;
  packageManager: string;
  topLevel: {
    name: string;
    version: string;
    dependencies: number;
    devDependencies: number;
    scripts: number;
  };
  lockfiles: {
    cargo: { path: string; packageCount: number };
    npm: { path: string; lockfileVersion: number; packageCount: number };
    yarn: { path: string; entryCount: number };
  };
  files: Array<{ path: string; sha256: string; bytes: number }>;
  aggregateSha256: string;
  reviewCommands: string[];
  notes: string[];
};

function main() {
  const jsonPath = path.resolve("docs/supply-chain-attestation.generated.json");
  const mdPath = path.resolve("docs/supply-chain-attestation.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing supply-chain attestation artifacts");
  }

  const attestation = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as SupplyChainAttestation;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(attestation.project === "PrivateDAO", "supply-chain attestation project mismatch");
  assert(attestation.algorithm === "sha256", "supply-chain attestation algorithm mismatch");
  assert(attestation.topLevel.name === "private-dao", "supply-chain package name mismatch");
  assert(attestation.topLevel.dependencies > 0, "dependency count is unexpectedly low");
  assert(attestation.topLevel.devDependencies > 0, "devDependency count is unexpectedly low");
  assert(attestation.topLevel.scripts > 0, "script count is unexpectedly low");
  assert(attestation.lockfiles.cargo.packageCount > 0, "cargo package count is unexpectedly low");
  assert(attestation.lockfiles.npm.packageCount > 0, "npm package count is unexpectedly low");
  assert(attestation.lockfiles.yarn.entryCount > 0, "yarn entry count is unexpectedly low");

  const requiredFiles = ["Cargo.toml", "Cargo.lock", "Anchor.toml", "package.json", "package-lock.json", "yarn.lock"];
  for (const file of requiredFiles) {
    const entry = attestation.files.find((item) => item.path === file);
    assert(Boolean(entry), `missing hashed file entry: ${file}`);
    const body = fs.readFileSync(path.resolve(file));
    assert(entry?.sha256 === sha256(body), `sha256 mismatch for ${file}`);
    assert(entry?.bytes === body.byteLength, `byte-length mismatch for ${file}`);
  }

  const aggregate = sha256(attestation.files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));
  assert(attestation.aggregateSha256 === aggregate, "aggregate sha256 mismatch");

  const requiredCommands = [
    "npm run build:supply-chain-attestation",
    "npm run verify:supply-chain-attestation",
    "npm run build:cryptographic-manifest",
    "npm run verify:cryptographic-manifest",
    "npm run verify:all",
  ];
  for (const command of requiredCommands) {
    assert(attestation.reviewCommands.includes(command), `missing review command: ${command}`);
  }

  assert(markdown.includes("# Supply-Chain Attestation"), "markdown is missing title");
  assert(markdown.includes("Cargo.lock"), "markdown is missing Cargo.lock coverage");
  assert(markdown.includes("package-lock.json"), "markdown is missing npm lock coverage");
  assert(markdown.includes("yarn.lock"), "markdown is missing yarn lock coverage");
  assert(markdown.includes("Aggregate sha256"), "markdown is missing aggregate sha256 summary");

  console.log("Supply-chain attestation verification: PASS");
}

function sha256(input: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
