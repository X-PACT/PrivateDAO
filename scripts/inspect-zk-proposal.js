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
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
async function main() {
    const { proposal: proposalStr } = (0, utils_1.parseArgs)();
    if (!proposalStr) {
        console.error("Usage: yarn ts-node scripts/inspect-zk-proposal.ts --proposal <PROPOSAL_PDA>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPda = new web3_js_1.PublicKey(proposalStr);
    const proposal = await program.account["proposal"].fetch(proposalPda);
    const [policyPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-policy"), proposalPda.toBuffer()], program.programId);
    const policyInfo = await provider.connection.getAccountInfo(policyPda, "confirmed");
    let policy = null;
    if (policyInfo) {
        policy = await program.account["proposalZkPolicy"].fetch(policyPda);
    }
    const receipts = await Promise.all([1, 2, 3].map(async (seed) => {
        const [receiptPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([seed])], program.programId);
        const info = await provider.connection.getAccountInfo(receiptPda, "confirmed");
        if (!info) {
            return {
                layer: seed === 1 ? "vote" : seed === 2 ? "delegation" : "tally",
                receipt: receiptPda.toBase58(),
                mode: "missing",
            };
        }
        const receipt = await program.account["zkVerificationReceipt"].fetch(receiptPda);
        return {
            layer: seed === 1 ? "vote" : seed === 2 ? "delegation" : "tally",
            receipt: receiptPda.toBase58(),
            mode: Object.keys(receipt.verificationMode)[0],
            verifierProgram: receipt.verifierProgram?.toBase58?.() || null,
        };
    }));
    console.log(JSON.stringify({
        proposal: proposalPda.toBase58(),
        dao: proposal.dao.toBase58(),
        policy: policy ? {
            pda: policyPda.toBase58(),
            mode: Object.keys(policy.mode)[0],
            requiredLayersMask: policy.requiredLayersMask,
            configuredBy: policy.configuredBy.toBase58(),
        } : null,
        receipts,
    }, null, 2));
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
