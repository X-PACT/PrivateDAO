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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * live-devnet-proof.ts
 * Runs a full live governance cycle against devnet in one process:
 * create DAO -> mint voting power -> deposit treasury -> create proposal ->
 * commit -> reveal -> finalize -> execute
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
const crypto = __importStar(require("crypto"));
async function waitUntil(targetUnix, label) {
    for (;;) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= targetUnix) {
            return;
        }
        const remaining = targetUnix - now;
        console.log(`   Waiting for ${label}: ${remaining}s`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 2) * 1000));
    }
}
async function main() {
    const { name = `ExecProof${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`, quorum = 51, revealWindow = 5, delay = 5, duration = 30, deposit = 0.2, treasuryAmount = 0.05, vote: voteArg = "yes", mintAmount = 1000, recipient, governanceMint: governanceMintArg, jsonOut, } = (0, utils_1.parseArgs)();
    const vote = String(voteArg).toLowerCase() !== "no";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const payer = provider.wallet.payer;
    const walletPk = provider.wallet.publicKey;
    const recipientPk = recipient ? new web3_js_1.PublicKey(String(recipient)) : walletPk;
    console.log(`\n=== PrivateDAO live devnet proof ===`);
    console.log(`Wallet:    ${walletPk.toBase58()}`);
    console.log(`Program:   ${program.programId.toBase58()}`);
    console.log(`Recipient: ${recipientPk.toBase58()}`);
    const mint = governanceMintArg
        ? new web3_js_1.PublicKey(String(governanceMintArg))
        : await (0, spl_token_1.createMint)(provider.connection, payer, walletPk, null, 6);
    const tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, mint);
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(String(name))], program.programId);
    const createDaoTx = await program.methods
        .initializeDao(String(name), Number(quorum), new anchor_1.BN(0), new anchor_1.BN(Number(revealWindow)), new anchor_1.BN(Number(delay)), { tokenWeighted: {} })
        .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    let voterTokenAccountAddress;
    let mintTx = "reused-existing-governance-balance";
    if (governanceMintArg) {
        const { address } = await (0, utils_1.associatedTokenAddressForMint)(provider.connection, mint, walletPk);
        const voterTokenAccount = await (0, spl_token_1.getAccount)(provider.connection, address, "confirmed", tokenProgram);
        if (Number(voterTokenAccount.amount) === 0) {
            throw new Error(`Existing governance mint ${mint.toBase58()} has no balance for ${walletPk.toBase58()}`);
        }
        voterTokenAccountAddress = address;
    }
    else {
        const voterAta = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, payer, mint, walletPk, false, "confirmed", undefined, tokenProgram);
        voterTokenAccountAddress = voterAta.address;
        mintTx = await (0, spl_token_1.mintTo)(provider.connection, payer, mint, voterAta.address, payer, BigInt(Number(mintAmount)) * 1000000n, [], undefined, tokenProgram);
    }
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const treasuryBeforeDeposit = await provider.connection.getBalance(treasuryPda);
    const depositLamports = Math.floor(Number(deposit) * web3_js_1.LAMPORTS_PER_SOL);
    const depositTx = await program.methods
        .depositTreasury(new anchor_1.BN(depositLamports))
        .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        depositor: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const dao = await program.account.dao.fetch(daoPda);
    const [proposalPda] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("proposal"),
        daoPda.toBuffer(),
        dao.proposalCount.toArrayLike(Buffer, "le", 8),
    ], program.programId);
    const proposalTx = await program.methods
        .createProposal("Execute flow proof", "Live devnet proof of create, commit, reveal, finalize, and execute from the repository itself.", new anchor_1.BN(Number(duration)), {
        actionType: { sendSol: {} },
        amountLamports: new anchor_1.BN(Math.floor(Number(treasuryAmount) * web3_js_1.LAMPORTS_PER_SOL)),
        recipient: recipientPk,
        tokenMint: null,
    })
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: voterTokenAccountAddress,
        proposer: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const salt = crypto.randomBytes(32);
    const commitment = (0, utils_1.computeProposalCommitment)(vote, salt, walletPk, proposalPda);
    const [voterRecordPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    const [delegationMarkerPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("delegation"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    const commitTx = await program.methods
        .commitVote([...commitment], null)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: voterRecordPda,
        delegationMarker: delegationMarkerPda,
        voterTokenAccount: voterTokenAccountAddress,
        voter: walletPk,
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    let proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.votingEnd.toNumber() + 1, "reveal phase");
    const recipientBefore = await provider.connection.getBalance(recipientPk);
    const treasuryBeforeExecute = await provider.connection.getBalance(treasuryPda);
    const revealTx = await program.methods
        .revealVote(vote, [...salt])
        .accounts({
        proposal: proposalPda,
        voterRecord: voterRecordPda,
        revealer: walletPk,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.revealEnd.toNumber() + 1, "finalize phase");
    const finalizeTx = await program.methods
        .finalizeProposal()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        finalizer: walletPk,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.executionUnlocksAt.toNumber() + 1, "execution unlock");
    const executeTx = await program.methods
        .executeProposal()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipientPk,
        treasuryTokenAccount: walletPk,
        recipientTokenAccount: walletPk,
        executor: walletPk,
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const finalProposal = await program.account.proposal.fetch(proposalPda);
    const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda);
    const recipientAfter = await provider.connection.getBalance(recipientPk);
    const payload = {
        generatedAt: new Date().toISOString(),
        mode: "test-wallet-devnet-proof",
        operatorWallet: walletPk.toBase58(),
        recipientWallet: recipientPk.toBase58(),
        programId: program.programId.toBase58(),
        dao: daoPda.toBase58(),
        governanceMint: mint.toBase58(),
        treasury: treasuryPda.toBase58(),
        proposal: proposalPda.toBase58(),
        timings: {
            votingEnd: finalProposal.votingEnd.toNumber(),
            revealEnd: finalProposal.revealEnd.toNumber(),
            executionUnlocksAt: finalProposal.executionUnlocksAt.toNumber(),
        },
        transactions: {
            createDao: createDaoTx,
            mintVoting: mintTx,
            deposit: depositTx,
            createProposal: proposalTx,
            commit: commitTx,
            reveal: revealTx,
            finalize: finalizeTx,
            execute: executeTx,
        },
        invariants: {
            status: (0, utils_1.proposalStatusLabel)(finalProposal.status),
            isExecuted: finalProposal.isExecuted,
            yesCapital: finalProposal.yesCapital.toString(),
            noCapital: finalProposal.noCapital.toString(),
            revealCount: finalProposal.revealCount.toString(),
            commitCount: finalProposal.commitCount.toString(),
            treasuryBeforeDepositLamports: treasuryBeforeDeposit,
            treasuryBeforeExecuteLamports: treasuryBeforeExecute,
            treasuryAfterExecuteLamports: treasuryAfterExecute,
            recipientBeforeLamports: recipientBefore,
            recipientAfterLamports: recipientAfter,
        },
    };
    if (jsonOut) {
        const outPath = path_1.default.resolve(String(jsonOut));
        fs_1.default.mkdirSync(path_1.default.dirname(outPath), { recursive: true });
        fs_1.default.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
        console.log(`\nJSON proof:      ${path_1.default.relative(process.cwd(), outPath)}`);
    }
    console.log(`\n=== Live proof complete ===`);
    console.log(`DAO:             ${daoPda.toBase58()}`);
    console.log(`DAO explorer:    ${(0, utils_1.solscanAccountUrl)(daoPda.toBase58())}`);
    console.log(`Mint:            ${mint.toBase58()}`);
    console.log(`Mint explorer:   ${(0, utils_1.solscanAccountUrl)(mint.toBase58())}`);
    console.log(`Treasury:        ${treasuryPda.toBase58()}`);
    console.log(`Treasury explorer: ${(0, utils_1.solscanAccountUrl)(treasuryPda.toBase58())}`);
    console.log(`Proposal:        ${proposalPda.toBase58()}`);
    console.log(`Proposal explorer: ${(0, utils_1.solscanAccountUrl)(proposalPda.toBase58())}`);
    console.log(`\nTransactions`);
    console.log(`create-dao:      ${createDaoTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(createDaoTx)}`);
    console.log(`mint-voting:     ${mintTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(mintTx)}`);
    console.log(`deposit:         ${depositTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(depositTx)}`);
    console.log(`create-proposal: ${proposalTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(proposalTx)}`);
    console.log(`commit:          ${commitTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(commitTx)}`);
    console.log(`reveal:          ${revealTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(revealTx)}`);
    console.log(`finalize:        ${finalizeTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(finalizeTx)}`);
    console.log(`execute:         ${executeTx}`);
    console.log(`                 ${(0, utils_1.solscanTxUrl)(executeTx)}`);
    console.log(`\nInvariants`);
    console.log(`status:          ${(0, utils_1.proposalStatusLabel)(finalProposal.status)}`);
    console.log(`isExecuted:      ${finalProposal.isExecuted}`);
    console.log(`yesCapital:      ${finalProposal.yesCapital.toString()}`);
    console.log(`noCapital:       ${finalProposal.noCapital.toString()}`);
    console.log(`revealCount:     ${finalProposal.revealCount.toString()} / ${finalProposal.commitCount.toString()}`);
    console.log(`votingEnd:       ${(0, utils_1.formatTimestamp)(finalProposal.votingEnd.toNumber())}`);
    console.log(`revealEnd:       ${(0, utils_1.formatTimestamp)(finalProposal.revealEnd.toNumber())}`);
    console.log(`executionUnlock: ${(0, utils_1.formatTimestamp)(finalProposal.executionUnlocksAt.toNumber())}`);
    console.log(`treasury before deposit: ${(0, utils_1.formatSol)(treasuryBeforeDeposit)}`);
    console.log(`treasury before execute: ${(0, utils_1.formatSol)(treasuryBeforeExecute)}`);
    console.log(`treasury after execute:  ${(0, utils_1.formatSol)(treasuryAfterExecute)}`);
    console.log(`recipient before: ${(0, utils_1.formatSol)(recipientBefore)}`);
    console.log(`recipient after:  ${(0, utils_1.formatSol)(recipientAfter)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
