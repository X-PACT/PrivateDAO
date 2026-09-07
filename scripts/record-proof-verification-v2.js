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
function hex32(value, fallback) {
    if (!value && fallback)
        return [...fallback];
    const raw = String(value || "").replace(/^0x/, "");
    if (!/^[0-9a-fA-F]{64}$/.test(raw))
        throw new Error(`Expected 32-byte hex value, got: ${value}`);
    return [...Buffer.from(raw, "hex")];
}
async function main() {
    const { dao, proposal, payloadHash, proofHash, publicInputsHash, verificationKeyHash } = (0, utils_1.parseArgs)();
    if (!dao || !proposal || !proofHash || !publicInputsHash || !verificationKeyHash) {
        console.error("Usage: yarn ts-node scripts/record-proof-verification-v2.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --proof-hash <HEX32> --public-inputs-hash <HEX32> --verification-key-hash <HEX32> [--payload-hash <HEX32>]");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const policyPk = (0, utils_1.deriveDaoSecurityPolicyPda)(daoPk, program.programId);
    const proofVerificationPk = (0, utils_1.deriveProposalProofVerificationPda)(proposalPk, program.programId);
    const defaultPayloadHash = (0, utils_1.canonicalProposalPayloadHash)(daoPk, proposalPk);
    const tx = await program.methods
        .recordProofVerificationV2({ thresholdAttestation: {} }, hex32(payloadHash, defaultPayloadHash), hex32(proofHash), hex32(publicInputsHash), hex32(verificationKeyHash), [...(0, utils_1.proofDomainSeparator)(daoPk, proposalPk)])
        .accounts({
        dao: daoPk,
        daoSecurityPolicy: policyPk,
        proposal: proposalPk,
        proposalProofVerification: proofVerificationPk,
        recorder: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Recorded V2 proof verification: ${proofVerificationPk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
