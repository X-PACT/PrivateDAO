"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/supply-chain-attestation.generated.json");
    const mdPath = path_1.default.resolve("docs/supply-chain-attestation.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing supply-chain attestation artifacts");
    }
    const attestation = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
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
        const body = fs_1.default.readFileSync(path_1.default.resolve(file));
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
function sha256(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
