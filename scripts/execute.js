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
/**
 * execute.ts
 * Phase 3b: Execute a passed proposal's treasury action after timelock expires.
 *
 * Permissionless — anyone can call this after execution_unlocks_at.
 * This is the step that actually moves treasury funds.
 *
 * The separation from finalize is intentional:
 *   finalize = compute result (instant)
 *   execute  = move money (after timelock delay)
 *
 * Usage: yarn ts-node scripts/execute.ts --proposal <PDA>
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
async function main() {
    const { proposal: proposalStr } = (0, utils_1.parseArgs)();
    if (!proposalStr) {
        console.error("Usage: yarn ts-node scripts/execute.ts --proposal <PROPOSAL_PDA>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPda = new web3_js_1.PublicKey(proposalStr);
    const proposal = await program.account["proposal"].fetch(proposalPda);
    const daoPda = proposal.dao;
    const dao = await program.account["dao"].fetch(daoPda);
    const governanceTokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, dao.governanceToken);
    const now = Math.floor(Date.now() / 1000);
    const status = (0, utils_1.proposalStatusLabel)(proposal.status);
    console.log(`\n💸  Executing: "${proposal.title}"`);
    console.log(`    DAO:    ${dao.daoName}`);
    console.log(`    Status: ${status}`);
    console.log(`    Proposal: ${proposalPda.toBase58()}`);
    if (status !== "Passed") {
        console.error("❌ Proposal has not passed. Cannot execute.");
        process.exit(1);
    }
    if (proposal.isExecuted) {
        console.error("❌ Treasury action already executed.");
        process.exit(1);
    }
    const unlockAt = proposal.executionUnlocksAt.toNumber();
    if (now < unlockAt) {
        const wait = unlockAt - now;
        console.error(`⏳ Execution timelock active.`);
        console.error(`   Unlocks at: ${(0, utils_1.formatTimestamp)(unlockAt)}`);
        console.error(`   Wait: ${(0, utils_1.formatDuration)(wait)}`);
        process.exit(1);
    }
    // Derive treasury PDA
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const confidentialPayoutPlanPda = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPda, program.programId);
    const refheEnvelopePda = (0, utils_1.deriveRefheEnvelopePda)(proposalPda, program.programId);
    const magicBlockCorridorPda = (0, utils_1.deriveMagicBlockPrivatePaymentCorridorPda)(proposalPda, program.programId);
    const confidentialPlanInfo = await provider.connection.getAccountInfo(confidentialPayoutPlanPda, "confirmed");
    const confidentialPlan = confidentialPlanInfo
        ? await program.account["confidentialPayoutPlan"].fetch(confidentialPayoutPlanPda)
        : null;
    const refheEnvelopeInfo = await provider.connection.getAccountInfo(refheEnvelopePda, "confirmed");
    const refheEnvelope = refheEnvelopeInfo
        ? await program.account["refheEnvelope"].fetch(refheEnvelopePda)
        : null;
    const magicBlockCorridorInfo = await provider.connection.getAccountInfo(magicBlockCorridorPda, "confirmed");
    const magicBlockCorridor = magicBlockCorridorInfo
        ? await program.account["magicBlockPrivatePaymentCorridor"].fetch(magicBlockCorridorPda)
        : null;
    // Figure out account values for the treasury action
    let treasuryRecipient = treasuryPda;
    let treasuryTokenAccount = treasuryPda;
    let recipientTokenAccount = treasuryPda;
    let tokenProgram = governanceTokenProgram;
    let actionType = "none";
    if (confidentialPlan) {
        actionType = `confidential-${Object.keys(confidentialPlan.payoutType)[0]}`;
        treasuryRecipient = confidentialPlan.settlementRecipient;
        if (confidentialPlan.tokenMint) {
            tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, confidentialPlan.tokenMint);
            treasuryTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(confidentialPlan.tokenMint, treasuryPda, true, tokenProgram);
            recipientTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(confidentialPlan.tokenMint, treasuryRecipient, false, tokenProgram);
        }
        console.log(`\n    Action: ${actionType}`);
        console.log(`    Confidential recipients: ${confidentialPlan.recipientCount}`);
        console.log(`    Total: ${confidentialPlan.tokenMint ? confidentialPlan.totalAmount.toString() + " raw units" : (0, utils_1.formatSol)(confidentialPlan.totalAmount.toNumber())}`);
        console.log(`    Settlement recipient: ${treasuryRecipient.toBase58()}`);
        console.log(`    Manifest URI: ${confidentialPlan.encryptedManifestUri}`);
        if (refheEnvelope) {
            console.log(`    REFHE: ${Object.keys(refheEnvelope.status)[0]} via ${refheEnvelope.modelUri}`);
            console.log(`    REFHE envelope: ${refheEnvelopePda.toBase58()}`);
        }
        if (magicBlockCorridor) {
            console.log(`    MagicBlock corridor: ${Object.keys(magicBlockCorridor.status)[0]} via ${magicBlockCorridor.apiBaseUrl}`);
            console.log(`    MagicBlock corridor PDA: ${magicBlockCorridorPda.toBase58()}`);
            console.log(`    Validator: ${magicBlockCorridor.validator ? magicBlockCorridor.validator.toBase58() : "unset"}`);
            console.log(`    Transfer queue: ${magicBlockCorridor.transferQueue ? magicBlockCorridor.transferQueue.toBase58() : "unset"}`);
        }
    }
    else if (proposal.treasuryAction) {
        actionType = Object.keys(proposal.treasuryAction.actionType)[0];
        treasuryRecipient = proposal.treasuryAction.recipient;
        const { tokenMint } = proposal.treasuryAction;
        if (tokenMint) {
            tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, tokenMint);
            treasuryTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, treasuryPda, true, tokenProgram);
            recipientTokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, treasuryRecipient, false, tokenProgram);
        }
        const amt = proposal.treasuryAction.amountLamports.toNumber();
        console.log(`\n    Action: ${actionType}`);
        if (actionType === "sendSol") {
            console.log(`    Amount: ${(0, utils_1.formatSol)(amt)}`);
        }
        else if (actionType === "sendToken") {
            console.log(`    Tokens: ${amt / 1e6} (raw: ${amt})`);
            console.log(`    Treasury ATA: ${treasuryTokenAccount.toBase58()}`);
            console.log(`    Recipient ATA: ${recipientTokenAccount.toBase58()}`);
        }
        console.log(`    To: ${treasuryRecipient.toBase58()}`);
    }
    else {
        console.log(`\n    Action: none`);
        console.log(`    This proposal only flips on-chain execution state and emits the execution event path.`);
    }
    console.log(`\n    Sending transaction...`);
    const tx = confidentialPlan
        ? await program.methods
            .executeConfidentialPayoutPlan()
            .accounts({
            dao: daoPda,
            proposal: proposalPda,
            confidentialPayoutPlan: confidentialPayoutPlanPda,
            treasury: treasuryPda,
            settlementRecipient: treasuryRecipient,
            treasuryTokenAccount,
            recipientTokenAccount,
            refheEnvelope: refheEnvelopePda,
            magicblockPrivatePaymentCorridor: magicBlockCorridorPda,
            executor: provider.wallet.publicKey,
            tokenProgram,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc()
        : await program.methods
            .executeProposal()
            .accounts({
            dao: daoPda,
            proposal: proposalPda,
            treasury: treasuryPda,
            treasuryRecipient,
            treasuryTokenAccount,
            recipientTokenAccount,
            confidentialPayoutPlan: confidentialPayoutPlanPda,
            executor: provider.wallet.publicKey,
            tokenProgram,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
    console.log(`\n${"═".repeat(56)}`);
    console.log("    ✅  TREASURY ACTION EXECUTED");
    console.log(`${"═".repeat(56)}`);
    console.log(`    Transaction: ${tx}`);
    console.log(`    Action type: ${actionType}`);
    console.log(`    Explorer:    ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch(console.error);
