"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const proof_registry_1 = require("./lib/proof-registry");
const README = path_1.default.resolve("README.md");
const LIVE_PROOF = path_1.default.resolve("docs/live-proof.md");
const LIVE_PROOF_V3 = path_1.default.resolve("docs/test-wallet-live-proof-v3.generated.md");
const GOVERNANCE_V3 = path_1.default.resolve("docs/governance-hardening-v3.md");
const SETTLEMENT_V3 = path_1.default.resolve("docs/settlement-hardening-v3.md");
const MANIFEST = path_1.default.resolve("docs/devnet-release-manifest.md");
const DEVNET_CONFIG = path_1.default.resolve("docs/ranger-strategy-config.devnet.json");
const BUNDLE = path_1.default.resolve("docs/ranger-submission-bundle.generated.md");
function main() {
    const readme = fs_1.default.readFileSync(README, "utf8");
    const liveProof = fs_1.default.readFileSync(LIVE_PROOF, "utf8");
    const liveProofV3 = fs_1.default.readFileSync(LIVE_PROOF_V3, "utf8");
    const governanceV3 = fs_1.default.readFileSync(GOVERNANCE_V3, "utf8");
    const settlementV3 = fs_1.default.readFileSync(SETTLEMENT_V3, "utf8");
    const manifest = fs_1.default.readFileSync(MANIFEST, "utf8");
    const bundle = fs_1.default.readFileSync(BUNDLE, "utf8");
    const config = JSON.parse(fs_1.default.readFileSync(DEVNET_CONFIG, "utf8"));
    const registry = (0, proof_registry_1.loadProofRegistry)();
    for (const value of [
        registry.programId,
        registry.deployTx,
        registry.verificationWallet,
        registry.dao,
        registry.governanceMint,
        registry.treasury,
        registry.proposal,
        ...Object.values(registry.transactions),
    ]) {
        assertContains(manifest, value, `manifest missing expected value: ${value}`);
    }
    assertContains(readme, registry.programId, "README missing canonical program id");
    assertContains(liveProof, registry.programId, "live proof missing canonical program id");
    assertContains(liveProof, registry.deployTx, "live proof missing canonical deploy transaction");
    assertContains(liveProof, registry.dao, "live proof missing canonical DAO");
    assertContains(liveProof, registry.treasury, "live proof missing canonical treasury PDA");
    assertContains(liveProof, registry.proposal, "live proof missing canonical proposal PDA");
    assertContains(bundle, registry.verificationWallet, "generated bundle missing verification wallet");
    assertContains(manifest, "test-wallet-live-proof-v3.generated.md", "manifest missing V3 proof reference");
    assertContains(manifest, "governance-hardening-v3.md", "manifest missing governance V3 reference");
    assertContains(manifest, "settlement-hardening-v3.md", "manifest missing settlement V3 reference");
    assertContains(bundle, "docs/test-wallet-live-proof-v3.generated.md", "generated bundle missing V3 proof reference");
    assertContains(bundle, "docs/governance-hardening-v3.md", "generated bundle missing governance V3 reference");
    assertContains(bundle, "docs/settlement-hardening-v3.md", "generated bundle missing settlement V3 reference");
    assertContains(governanceV3, "test-wallet-live-proof-v3.generated.md", "governance V3 doc missing proof link");
    assertContains(settlementV3, "test-wallet-live-proof-v3.generated.md", "settlement V3 doc missing proof link");
    assertContains(liveProofV3, "Governance Hardening V3", "V3 live proof missing governance hardening note");
    assertContains(liveProofV3, "Settlement Hardening V3", "V3 live proof missing settlement hardening note");
    const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
    if (verificationAddress !== registry.verificationWallet) {
        throw new Error(`unexpected verification wallet in devnet config: ${verificationAddress}`);
    }
    console.log("Release manifest verification: PASS");
}
function assertContains(body, fragment, message) {
    if (!body.includes(fragment)) {
        throw new Error(message);
    }
}
main();
