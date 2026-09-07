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
 * delegate-vote.ts
 * Delegate your token weight to another address for a specific proposal.
 *
 * The delegatee will commit and reveal using your combined weight.
 * The vote stays private — neither you nor anyone else sees the tally
 * until after reveal_end.
 *
 * Usage:
 *   yarn ts-node scripts/delegate-vote.ts \
 *     --proposal <PROPOSAL_PDA> \
 *     --delegatee <DELEGATEE_PUBKEY>
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
async function main() {
    const { proposal: proposalStr, delegatee: delegateeStr } = (0, utils_1.parseArgs)();
    if (!proposalStr || !delegateeStr) {
        console.error("Usage: yarn ts-node scripts/delegate-vote.ts --proposal <PDA> --delegatee <PUBKEY>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPda = new web3_js_1.PublicKey(proposalStr);
    const delegateePk = new web3_js_1.PublicKey(delegateeStr);
    const proposal = await program.account["proposal"].fetch(proposalPda);
    const dao = await program.account["dao"].fetch(proposal.dao);
    const now = Math.floor(Date.now() / 1000);
    if (now >= proposal.votingEnd.toNumber()) {
        console.error("❌ Voting period is over. Cannot delegate.");
        process.exit(1);
    }
    // Get delegator's token account
    const tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, dao.governanceToken);
    const delegatorAta = await (0, spl_token_1.getAssociatedTokenAddress)(dao.governanceToken, provider.wallet.publicKey, false, tokenProgram);
    const ataInfo = await (0, spl_token_1.getAccount)(provider.connection, delegatorAta, "confirmed", tokenProgram);
    const balance = Number(ataInfo.amount) / 1000000;
    console.log(`\n🤝 Delegating vote`);
    console.log(`   Proposal:  "${proposal.title}"`);
    console.log(`   Delegator: ${provider.wallet.publicKey.toBase58()}`);
    console.log(`   Delegatee: ${delegateePk.toBase58()}`);
    console.log(`   Your balance: ${balance.toLocaleString()} tokens`);
    console.log(`   Voting ends: ${(0, utils_1.formatTimestamp)(proposal.votingEnd.toNumber())}`);
    const [delegationPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("delegation"), proposalPda.toBuffer(), provider.wallet.publicKey.toBuffer()], program.programId);
    const [directVoteRecordPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("vote"), proposalPda.toBuffer(), provider.wallet.publicKey.toBuffer()], program.programId);
    const directVoteRecord = await provider.connection.getAccountInfo(directVoteRecordPda, "confirmed");
    if (directVoteRecord) {
        console.error("❌ This wallet already has a direct vote record for the proposal. Refusing delegation to avoid double-counting risk.");
        process.exit(1);
    }
    const tx = await program.methods
        .delegateVote(delegateePk)
        .accounts({
        dao: proposal.dao,
        proposal: proposalPda,
        delegation: delegationPda,
        directVoteMarker: directVoteRecordPda,
        delegatorTokenAccount: delegatorAta,
        delegator: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`\n✅ Delegation created!`);
    console.log(`   Delegation PDA: ${delegationPda.toBase58()}`);
    console.log(`   Transaction:    ${tx}`);
    console.log(`   Tx link:        ${(0, utils_1.solscanTxUrl)(tx)}`);
    console.log(`\n   The delegatee should now call:`);
    console.log(`   yarn ts-node scripts/commit-vote.ts --proposal ${proposalStr} --vote yes --delegator ${provider.wallet.publicKey.toBase58()}`);
}
main().catch(console.error);
