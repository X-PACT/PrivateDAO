"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const proof_registry_1 = require("./lib/proof-registry");
function main() {
    const proof = (0, proof_registry_1.loadProofRegistry)();
    if (!proof.pdaoToken) {
        throw new Error("proof registry is missing the PDAO token surface");
    }
    const metadataPath = path_1.default.resolve("docs/assets/pdao-token.json");
    if (!fs_1.default.existsSync(metadataPath)) {
        throw new Error("missing docs/assets/pdao-token.json");
    }
    const metadata = JSON.parse(fs_1.default.readFileSync(metadataPath, "utf8"));
    const readme = fs_1.default.readFileSync(path_1.default.resolve("README.md"), "utf8");
    const tokenDoc = fs_1.default.readFileSync(path_1.default.resolve("docs/token.md"), "utf8");
    const pdaoDoc = fs_1.default.readFileSync(path_1.default.resolve("docs/pdao-token.md"), "utf8");
    assert(metadata.name === "PDAO", "PDAO metadata name mismatch");
    assert(metadata.symbol === "PDAO", "PDAO metadata symbol mismatch");
    assert(metadata.image === "https://privatedao.org/assets/logo.png", "PDAO metadata image mismatch");
    assert(metadata.external_url === "https://privatedao.org/security/", "PDAO metadata external URL mismatch");
    assert(metadata.attributes.some((entry) => entry.trait_type === "PrivateDAO Program ID" && entry.value === proof.programId), "PDAO metadata is missing the canonical PrivateDAO program id");
    assert(metadata.attributes.some((entry) => entry.trait_type === "Mint" && entry.value === proof.pdaoToken?.mint), "PDAO metadata is missing the live mint");
    assert(metadata.properties?.category === "image", "PDAO metadata category mismatch");
    assert(Boolean(metadata.properties?.files?.some((entry) => entry.uri === "https://privatedao.org/assets/logo.png")), "PDAO metadata files are missing the canonical logo");
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
        "Mint authority: `disabled`",
    ]) {
        assert(pdaoDoc.includes(fragment), `docs/pdao-token.md is missing token surface fragment: ${fragment}`);
    }
    if (proof.pdaoToken.canonicalGovernanceDao) {
        assert(pdaoDoc.includes(proof.pdaoToken.canonicalGovernanceDao), "docs/pdao-token.md is missing canonical governance DAO reference");
    }
    if (proof.pdaoToken.mintAuthorityStatus) {
        assert(proof.pdaoToken.mintAuthorityStatus === "disabled", "proof registry must report disabled PDAO mint authority");
    }
    console.log("PDAO token surface verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
