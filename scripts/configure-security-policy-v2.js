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
function attestorArray(raw, fallback) {
    const values = raw
        ? String(raw).split(",").map((value) => value.trim()).filter(Boolean).map((value) => new web3_js_1.PublicKey(value))
        : [fallback];
    if (values.length < 1 || values.length > 5)
        throw new Error("Provide 1-5 attestors");
    while (values.length < 5)
        values.push(web3_js_1.PublicKey.default);
    return values;
}
async function main() {
    const { dao, mode = "strict", proofAttestors, proofThreshold = 1, settlementAttestors, settlementThreshold = 1, proofTtlSeconds = 3600, settlementTtlSeconds = 3600, } = (0, utils_1.parseArgs)();
    if (!dao) {
        console.error("Usage: yarn ts-node scripts/configure-security-policy-v2.ts --dao <DAO_PDA> [--proof-attestors <CSV>] [--settlement-attestors <CSV>]");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const policyPk = (0, utils_1.deriveDaoSecurityPolicyPda)(daoPk, program.programId);
    const resolvedMode = String(mode) === "compat" ? { compatibilityRequired: {} } : { strictRequired: {} };
    const proof = attestorArray(proofAttestors, provider.wallet.publicKey);
    const settlement = attestorArray(settlementAttestors, provider.wallet.publicKey);
    const tx = await program.methods
        .initializeDaoSecurityPolicy(resolvedMode, { thresholdAttestedRequired: {} }, { thresholdAttestedRequired: {} }, { noCancelAfterParticipation: {} }, proof, Number(proof.filter((key) => !key.equals(web3_js_1.PublicKey.default)).length), Number(proofThreshold), settlement, Number(settlement.filter((key) => !key.equals(web3_js_1.PublicKey.default)).length), Number(settlementThreshold), new anchor.BN(Number(proofTtlSeconds)), new anchor.BN(Number(settlementTtlSeconds)))
        .accounts({
        dao: daoPk,
        daoSecurityPolicy: policyPk,
        authority: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Configured security policy: ${policyPk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
