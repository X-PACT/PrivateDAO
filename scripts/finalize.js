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
 * finalize.ts
 * Phase 3a: Finalize a proposal after the reveal window closes.
 *
 * Permissionless — anyone can call this. Computes pass/fail based on
 * the DAO's VotingConfig. If passed, starts the execution timelock.
 *
 * After calling this, wait for the timelock to expire, then run:
 *   yarn ts-node scripts/execute.ts --proposal <PDA>
 *
 * Usage: yarn ts-node scripts/finalize.ts --proposal <PDA>
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
async function main() {
    const { proposal: proposalStr } = (0, utils_1.parseArgs)();
    if (!proposalStr) {
        console.error("Usage: yarn ts-node scripts/finalize.ts --proposal <PROPOSAL_PDA>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPda = new web3_js_1.PublicKey(proposalStr);
    const proposal = await program.account["proposal"].fetch(proposalPda);
    const daoPda = proposal.dao;
    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalZkPolicyPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-policy"), proposalPda.toBuffer()], program.programId);
    const proposalZkPolicyInfo = await provider.connection.getAccountInfo(proposalZkPolicyPda, "confirmed");
    const now = Math.floor(Date.now() / 1000);
    console.log(`\n⚖️  Finalizing: "${proposal.title}"`);
    console.log(`   DAO:      ${dao.daoName}`);
    console.log(`   Commits:  ${proposal.commitCount}  |  Reveals: ${proposal.revealCount}`);
    if (now < proposal.revealEnd.toNumber()) {
        const rem = proposal.revealEnd.toNumber() - now;
        console.error(`\n⏳ Reveal window still open. Closes in ${(0, utils_1.formatDuration)(rem)}`);
        process.exit(1);
    }
    const tx = proposalZkPolicyInfo
        ? await program.methods
            .finalizeZkEnforcedProposal()
            .accounts({
            dao: daoPda,
            proposal: proposalPda,
            proposalZkPolicy: proposalZkPolicyPda,
            finalizer: provider.wallet.publicKey,
        })
            .rpc()
        : await program.methods
            .finalizeProposal()
            .accounts({
            dao: daoPda,
            proposal: proposalPda,
            finalizer: provider.wallet.publicKey,
        })
            .rpc();
    const final = await program.account.proposal.fetch(proposalPda);
    const status = (0, utils_1.proposalStatusLabel)(final.status);
    const passed = status === "Passed";
    const quorumPct = Math.round((final.revealCount.toNumber() / Math.max(final.commitCount.toNumber(), 1)) * 100);
    console.log(`\n${"═".repeat(56)}`);
    console.log(passed ? "   ✅  PROPOSAL PASSED" : "   ❌  PROPOSAL FAILED");
    console.log(`${"═".repeat(56)}`);
    console.log(`   Capital  YES / NO: ${final.yesCapital} / ${final.noCapital}`);
    console.log(`   Community YES / NO: ${final.yesCommunity} / ${final.noCommunity}`);
    console.log(`   Reveal rate: ${quorumPct}% (${final.revealCount}/${final.commitCount})`);
    console.log(`   Transaction: ${tx}`);
    console.log(`   Tx link: ${(0, utils_1.solscanTxUrl)(tx)}`);
    if (proposalZkPolicyInfo) {
        console.log(`   ZK mode: zk_enforced (${proposalZkPolicyPda.toBase58()})`);
    }
    if (passed) {
        const unlockAt = final.executionUnlocksAt.toNumber();
        if (unlockAt > now) {
            const wait = unlockAt - now;
            console.log(`\n   ⏳ Execution timelock: ${(0, utils_1.formatDuration)(wait)} remaining`);
            console.log(`   Unlocks at: ${(0, utils_1.formatTimestamp)(unlockAt)}`);
        }
        else {
            console.log(`\n   ✅ Timelock expired — ready to execute immediately`);
        }
        console.log(`   Next: yarn ts-node scripts/execute.ts --proposal ${proposalStr}`);
    }
}
main().catch(console.error);
