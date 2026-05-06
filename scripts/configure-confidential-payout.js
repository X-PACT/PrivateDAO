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
    const { dao, proposal, payoutType = "salary", assetType = "sol", settlementRecipient, payoutTotal, payoutMint, recipientCount = 1, manifestUri, manifestHash, ciphertextHash, } = (0, utils_1.parseArgs)();
    if (!dao || !proposal) {
        console.error("Usage: yarn ts-node scripts/configure-confidential-payout.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --manifest-uri <URI> --manifest-hash <HEX32> --ciphertext-hash <HEX32>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const payoutPlanPk = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPk, program.programId);
    const settlementRecipientPk = settlementRecipient
        ? new web3_js_1.PublicKey(String(settlementRecipient))
        : provider.wallet.publicKey;
    const count = Number(recipientCount);
    const rawTotal = Number(payoutTotal);
    const uri = String(manifestUri || "").trim();
    if (!uri) {
        throw new Error("--manifest-uri is required");
    }
    if (!Number.isFinite(rawTotal) || rawTotal <= 0) {
        throw new Error("--payout-total must be a positive number");
    }
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error("--recipient-count must be a positive integer");
    }
    const payoutTypeArg = String(payoutType).toLowerCase() === "bonus" ? { bonus: {} } : { salary: {} };
    let assetTypeArg = { sol: {} };
    let tokenMintPk = null;
    let totalAmount = new anchor.BN(Math.floor(rawTotal * web3_js_1.LAMPORTS_PER_SOL));
    if (String(assetType).toLowerCase() === "token") {
        if (!payoutMint) {
            throw new Error("--payout-mint is required for token payout batches");
        }
        assetTypeArg = { token: {} };
        tokenMintPk = new web3_js_1.PublicKey(String(payoutMint));
        totalAmount = new anchor.BN(rawTotal);
    }
    const tx = await program.methods
        .configureConfidentialPayoutPlan(payoutTypeArg, assetTypeArg, settlementRecipientPk, tokenMintPk, count, totalAmount, uri, parseHashHex(manifestHash, "manifest hash"), parseHashHex(ciphertextHash, "ciphertext hash"))
        .accounts({
        dao: daoPk,
        proposal: proposalPk,
        confidentialPayoutPlan: payoutPlanPk,
        operator: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Configured confidential payout plan: ${payoutPlanPk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
