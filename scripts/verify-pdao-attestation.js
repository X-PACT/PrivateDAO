"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const proof_registry_1 = require("./lib/proof-registry");
function main() {
    const proof = (0, proof_registry_1.loadProofRegistry)();
    if (!proof.pdaoToken) {
        throw new Error("proof registry is missing the PDAO token surface");
    }
    const attestationPath = path_1.default.resolve("docs/pdao-attestation.generated.json");
    if (!fs_1.default.existsSync(attestationPath)) {
        throw new Error("missing docs/pdao-attestation.generated.json");
    }
    const metadataPath = path_1.default.resolve("docs/assets/pdao-token.json");
    if (!fs_1.default.existsSync(metadataPath)) {
        throw new Error("missing docs/assets/pdao-token.json");
    }
    const attestation = JSON.parse(fs_1.default.readFileSync(attestationPath, "utf8"));
    const metadataBody = fs_1.default.readFileSync(metadataPath);
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
    assert(attestation.pdaoToken.image === "https://privatedao.org/assets/logo.png", "PDAO attestation image mismatch");
    assert(attestation.pdaoToken.externalUrl === "https://privatedao.org/security/", "PDAO attestation external URL mismatch");
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
function sha256Hex(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
