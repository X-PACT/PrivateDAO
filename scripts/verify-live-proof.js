"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const proof_registry_1 = require("./lib/proof-registry");
const LIVE_PROOF = path_1.default.resolve("docs/live-proof.md");
const DEVNET_CONFIG = path_1.default.resolve("docs/ranger-strategy-config.devnet.json");
function main() {
    const liveProof = fs_1.default.readFileSync(LIVE_PROOF, "utf8");
    const config = JSON.parse(fs_1.default.readFileSync(DEVNET_CONFIG, "utf8"));
    const registry = (0, proof_registry_1.loadProofRegistry)();
    assertContains(liveProof, `Program ID: \`${registry.programId}\``, "missing live program id");
    assertContains(liveProof, `- DAO: \`${registry.dao}\``, "missing live DAO address");
    assertContains(liveProof, `- Governance mint: \`${registry.governanceMint}\``, "missing live governance mint");
    assertContains(liveProof, `- Treasury PDA: \`${registry.treasury}\``, "missing live treasury PDA");
    assertContains(liveProof, `- Proposal PDA: \`${registry.proposal}\``, "missing live proposal PDA");
    for (const label of Object.keys(registry.transactions)) {
        assertContains(liveProof, `- \`${label}\``, `missing transaction label: ${label}`);
    }
    assertContains(liveProof, "- Proposal result: `Passed`", "missing finalized result evidence");
    assertContains(liveProof, "- `isExecuted = true`", "missing execution invariant evidence");
    const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
    if (!verificationAddress) {
        throw new Error("devnet strategy config is missing the verification address");
    }
    if (verificationAddress !== registry.verificationWallet) {
        throw new Error(`unexpected verification address in devnet config: ${verificationAddress}`);
    }
    console.log("Live proof verification: PASS");
}
function assertContains(body, fragment, message) {
    if (!body.includes(fragment)) {
        throw new Error(message);
    }
}
main();
