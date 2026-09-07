"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// SPDX-License-Identifier: AGPL-3.0-or-later
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
function hex32(value) {
    const raw = String(value || "").replace(/^0x/, "");
    if (!/^[0-9a-fA-F]{64}$/.test(raw))
        throw new Error(`Expected 32-byte hex value, got: ${value}`);
    return Buffer.from(raw, "hex");
}
function evidenceKind(kind) {
    switch (String(kind || "threshold").toLowerCase()) {
        case "refhe":
            return { refheAttested: {} };
        case "magicblock":
            return { magicBlockAttested: {} };
        case "verifier":
            return { verifierCpiReceipt: {} };
        case "threshold":
            return { thresholdAttestation: {} };
        default:
            throw new Error("Unsupported --kind. Use refhe, magicblock, verifier, or threshold");
    }
}
async function main() {
    const { dao, proposal, kind = "threshold", settlementId, evidenceHash } = (0, utils_1.parseArgs)();
    if (!dao || !proposal || !settlementId || !evidenceHash) {
        console.error("Usage: yarn ts-node scripts/record-settlement-evidence-v2.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --kind <refhe|magicblock|verifier|threshold> --settlement-id <HEX32> --evidence-hash <HEX32>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const payoutPlanPk = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPk, program.programId);
    const policyPk = (0, utils_1.deriveDaoSecurityPolicyPda)(daoPk, program.programId);
    const settlementIdBytes = hex32(settlementId);
    const evidencePk = (0, utils_1.deriveSettlementEvidencePda)(proposalPk, payoutPlanPk, settlementIdBytes, program.programId);
    const plan = await program.account["confidentialPayoutPlan"].fetch(payoutPlanPk);
    const payoutFieldsHash = (0, utils_1.canonicalPayoutFieldsHash)(daoPk, proposalPk, payoutPlanPk, plan);
    const tx = await program.methods
        .recordSettlementEvidenceV2(evidenceKind(kind), [...settlementIdBytes], [...hex32(evidenceHash)], [...payoutFieldsHash])
        .accounts({
        dao: daoPk,
        daoSecurityPolicy: policyPk,
        proposal: proposalPk,
        confidentialPayoutPlan: payoutPlanPk,
        settlementEvidence: evidencePk,
        recorder: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Recorded V2 settlement evidence: ${evidencePk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
