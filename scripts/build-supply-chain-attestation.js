"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const TRACKED_FILES = [
    "Cargo.toml",
    "Cargo.lock",
    "Anchor.toml",
    "package.json",
    "package-lock.json",
    "yarn.lock",
];
function main() {
    const packageJson = readJson("package.json");
    const packageLock = readJson("package-lock.json");
    const yarnLock = fs_1.default.readFileSync(path_1.default.resolve("yarn.lock"), "utf8");
    const cargoLock = fs_1.default.readFileSync(path_1.default.resolve("Cargo.lock"), "utf8");
    const files = TRACKED_FILES.map(hashFile);
    const packageLockEntries = Object.keys(packageLock.packages ?? {}).length;
    const yarnEntryCount = countYarnEntries(yarnLock);
    const cargoPackageCount = (cargoLock.match(/^\[\[package\]\]$/gm) ?? []).length;
    const attestation = {
        project: "PrivateDAO",
        generatedAt: deterministicGeneratedAt(),
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
    const jsonPath = path_1.default.resolve("docs/supply-chain-attestation.generated.json");
    const mdPath = path_1.default.resolve("docs/supply-chain-attestation.generated.md");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(attestation, null, 2) + "\n");
    fs_1.default.writeFileSync(mdPath, buildMarkdown(attestation));
    console.log("Wrote supply-chain attestation");
}
function buildMarkdown(attestation) {
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
function hashFile(relativePath) {
    const absolutePath = path_1.default.resolve(relativePath);
    const body = fs_1.default.readFileSync(absolutePath);
    return {
        path: relativePath,
        sha256: sha256(body),
        bytes: body.byteLength,
    };
}
function countYarnEntries(body) {
    return body
        .split("\n")
        .filter((line) => line.length > 0 && !line.startsWith(" ") && line.endsWith(":") && line !== "__metadata:")
        .length;
}
function sha256(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
function deterministicGeneratedAt() {
    const explicit = process.env.PRIVATE_DAO_BUILD_TIMESTAMP;
    if (explicit) {
        return explicit;
    }
    return (0, child_process_1.execSync)("git log -1 --format=%cI", {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "ignore"],
    })
        .toString()
        .trim();
}
main();
