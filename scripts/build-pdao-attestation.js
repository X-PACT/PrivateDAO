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
    const metadataPath = path_1.default.resolve("docs/assets/pdao-token.json");
    if (!fs_1.default.existsSync(metadataPath)) {
        throw new Error("missing docs/assets/pdao-token.json");
    }
    const metadataBody = fs_1.default.readFileSync(metadataPath);
    const metadata = JSON.parse(metadataBody.toString("utf8"));
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
            mintAuthorityStatus: proof.pdaoToken.mintAuthorityStatus ?? "unknown",
            canonicalGovernanceDao: proof.pdaoToken.canonicalGovernanceDao ?? null,
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
            explanation: "PrivateDAO has one canonical governance program id. The separate Token-2022 program id belongs to the PDAO mint surface and is expected.",
        },
        verificationDocs: [
            "docs/token.md",
            "docs/pdao-token.md",
            "docs/assets/pdao-token.json",
            "docs/devnet-release-manifest.md",
            "docs/proof-registry.json",
        ],
    };
    const outPath = path_1.default.resolve("docs/pdao-attestation.generated.json");
    fs_1.default.writeFileSync(outPath, JSON.stringify(attestation, null, 2) + "\n");
    console.log(`Wrote PDAO attestation: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function sha256Hex(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
main();
