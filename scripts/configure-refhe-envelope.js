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
function parseHashHex(value, label) {
    const normalized = String(value || "").trim().replace(/^0x/i, "");
    const buffer = Buffer.from(normalized, "hex");
    if (buffer.length !== 32) {
        throw new Error(`${label} must be a 32-byte hex value`);
    }
    return [...buffer];
}
async function main() {
    const { dao, proposal, modelUri, policyHash, inputCiphertextHash, evaluationKeyHash } = (0, utils_1.parseArgs)();
    if (!dao || !proposal || !modelUri || !policyHash || !inputCiphertextHash || !evaluationKeyHash) {
        console.error("Usage: yarn ts-node scripts/configure-refhe-envelope.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --model-uri <URI> --policy-hash <HEX32> --input-ciphertext-hash <HEX32> --evaluation-key-hash <HEX32>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const payoutPlanPk = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPk, program.programId);
    const refheEnvelopePk = (0, utils_1.deriveRefheEnvelopePda)(proposalPk, program.programId);
    const tx = await program.methods
        .configureRefheEnvelope(String(modelUri).trim(), parseHashHex(policyHash, "policy hash"), parseHashHex(inputCiphertextHash, "input ciphertext hash"), parseHashHex(evaluationKeyHash, "evaluation key hash"))
        .accounts({
        dao: daoPk,
        proposal: proposalPk,
        confidentialPayoutPlan: payoutPlanPk,
        refheEnvelope: refheEnvelopePk,
        operator: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Configured REFHE envelope: ${refheEnvelopePk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
