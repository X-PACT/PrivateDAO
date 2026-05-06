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
function parseMode(mode) {
    const normalized = String(mode || "zk_enforced").toLowerCase();
    if (normalized === "companion")
        return { companion: {} };
    if (normalized === "parallel")
        return { parallel: {} };
    if (normalized === "zk_enforced" || normalized === "zk-enforced")
        return { zkEnforced: {} };
    throw new Error(`Unsupported zk mode: ${mode}`);
}
async function main() {
    const { proposal: proposalStr, mode } = (0, utils_1.parseArgs)();
    if (!proposalStr) {
        console.error("Usage: yarn ts-node scripts/configure-zk-proposal-mode.ts --proposal <PROPOSAL_PDA> [--mode companion|parallel|zk_enforced]");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPda = new web3_js_1.PublicKey(proposalStr);
    const proposal = await program.account["proposal"].fetch(proposalPda);
    const daoPda = proposal.dao;
    const [proposalZkPolicyPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-policy"), proposalPda.toBuffer()], program.programId);
    const [voteReceiptPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([1])], program.programId);
    const [delegationReceiptPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([2])], program.programId);
    const [tallyReceiptPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([3])], program.programId);
    const selectedMode = parseMode(mode);
    const tx = await program.methods
        .configureProposalZkMode(selectedMode)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposalZkPolicy: proposalZkPolicyPda,
        voteZkReceipt: voteReceiptPda,
        delegationZkReceipt: delegationReceiptPda,
        tallyZkReceipt: tallyReceiptPda,
        operator: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`Configured proposal zk mode for ${proposalPda.toBase58()}`);
    console.log(`Policy PDA: ${proposalZkPolicyPda.toBase58()}`);
    console.log(`Mode: ${Object.keys(selectedMode)[0]}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
