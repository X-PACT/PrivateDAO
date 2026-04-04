import crypto from "crypto";
import fs from "fs";
import path from "path";

type HashEntry = {
  path: string;
  sha256: string;
  bytes: number;
};

const TRACKED_FILES = [
  "Cargo.toml",
  "Cargo.lock",
  "Anchor.toml",
  "package.json",
  "package-lock.json",
  "yarn.lock",
];

function main() {
  const packageJson = readJson<{
    name: string;
    version: string;
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  }>("package.json");
  const packageLock = readJson<{
    lockfileVersion: number;
    packages?: Record<string, unknown>;
  }>("package-lock.json");

  const yarnLock = fs.readFileSync(path.resolve("yarn.lock"), "utf8");
  const cargoLock = fs.readFileSync(path.resolve("Cargo.lock"), "utf8");

  const files = TRACKED_FILES.map(hashFile);
  const packageLockEntries = Object.keys(packageLock.packages ?? {}).length;
  const yarnEntryCount = countYarnEntries(yarnLock);
  const cargoPackageCount = (cargoLock.match(/^\[\[package\]\]$/gm) ?? []).length;

  const attestation = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    algorithm: "sha256",
    packageManager: packageJson.packageManager ?? "npm+yarn",
    topLevel: {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies ?? {}).length,
      devDependencies: Object.keys(packageJson.devDependencies ?? {}).length,
      scripts: Object.keys(packageJson.scripts ?? {}).length,
    },
    lockfiles: {
      cargo: {
        path: "Cargo.lock",
        packageCount: cargoPackageCount,
      },
      npm: {
        path: "package-lock.json",
        lockfileVersion: packageLock.lockfileVersion,
        packageCount: packageLockEntries,
      },
      yarn: {
        path: "yarn.lock",
        entryCount: yarnEntryCount,
      },
    },
    files,
    aggregateSha256: sha256(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n")),
    reviewCommands: [
      "npm run build:supply-chain-attestation",
      "npm run verify:supply-chain-attestation",
      "npm run build:cryptographic-manifest",
      "npm run verify:cryptographic-manifest",
      "npm run verify:all",
    ],
    notes: [
      "Lockfile integrity is reviewer-visible and machine-verified.",
      "This attestation does not replace external dependency auditing.",
      "The current posture remains classical-cryptography based rather than post-quantum.",
    ],
  };

  const jsonPath = path.resolve("docs/supply-chain-attestation.generated.json");
  const mdPath = path.resolve("docs/supply-chain-attestation.generated.md");

  fs.writeFileSync(jsonPath, JSON.stringify(attestation, null, 2) + "\n");
  fs.writeFileSync(mdPath, buildMarkdown(attestation));
  console.log("Wrote supply-chain attestation");
}

function buildMarkdown(attestation: {
  generatedAt: string;
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
  files: HashEntry[];
  aggregateSha256: string;
  reviewCommands: string[];
  notes: string[];
}) {
  return `# Supply-Chain Attestation

## Overview

- Generated at: \`${attestation.generatedAt}\`
- Hash algorithm: \`${attestation.algorithm}\`
- Package manager surface: \`${attestation.packageManager}\`
- Aggregate sha256: \`${attestation.aggregateSha256}\`

## Top-Level Package Surface

- Package name: \`${attestation.topLevel.name}\`
- Package version: \`${attestation.topLevel.version}\`
- Dependencies: \`${attestation.topLevel.dependencies}\`
- Dev dependencies: \`${attestation.topLevel.devDependencies}\`
- Scripts: \`${attestation.topLevel.scripts}\`

## Lockfile Coverage

- Cargo lock: \`${attestation.lockfiles.cargo.path}\` with \`${attestation.lockfiles.cargo.packageCount}\` packages
- npm lock: \`${attestation.lockfiles.npm.path}\` with lockfile version \`${attestation.lockfiles.npm.lockfileVersion}\` and \`${attestation.lockfiles.npm.packageCount}\` packages
- Yarn lock: \`${attestation.lockfiles.yarn.path}\` with \`${attestation.lockfiles.yarn.entryCount}\` entries

## Tracked Integrity Files

${attestation.files.map((entry) => `- \`${entry.path}\` | sha256 \`${entry.sha256}\` | bytes \`${entry.bytes}\``).join("\n")}

## Review Commands

${attestation.reviewCommands.map((command) => `- \`${command}\``).join("\n")}

## Notes

${attestation.notes.map((note) => `- ${note}`).join("\n")}
`;
}

function hashFile(relativePath: string): HashEntry {
  const absolutePath = path.resolve(relativePath);
  const body = fs.readFileSync(absolutePath);
  return {
    path: relativePath,
    sha256: sha256(body),
    bytes: body.byteLength,
  };
}

function countYarnEntries(body: string) {
  return body
    .split("\n")
    .filter((line) => line.length > 0 && !line.startsWith(" ") && line.endsWith(":") && line !== "__metadata:")
    .length;
}

function sha256(input: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
