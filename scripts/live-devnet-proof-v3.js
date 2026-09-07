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
 * live-devnet-proof-v3.ts
 * Runs two real Devnet flows against the deployed program:
 * 1. Governance Hardening V3 lifecycle with token-supply quorum and dedicated rebate vault
 * 2. Settlement Hardening V3 lifecycle with strict settlement snapshot and evidence-gated execution
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
function randomHash() {
    return [...crypto_1.default.randomBytes(32)];
}
async function waitUntil(targetUnix, label) {
    for (;;) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= targetUnix)
            return;
        const remaining = targetUnix - now;
        console.log(`   Waiting for ${label}: ${remaining}s`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 2) * 1000));
    }
}
function shortDaoSuffix(prefix, tag) {
    const compact = `${prefix}-${tag}-${Date.now().toString(36).slice(-4)}`;
    return compact.slice(0, 24);
}
async function fundEphemeralWallet(provider, payer, recipient, lamports) {
    const tx = await provider.sendAndConfirm(new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: recipient,
        lamports,
    })), [payer]);
    return tx;
}
async function runGovernanceV3Flow(params) {
    const { provider, program, payer, walletPk, mint, tokenProgram, voterTokenAccountAddress, namePrefix, depositSol, treasuryAmountSol, quorum, durationSeconds, revealWindowSeconds, executionDelaySeconds, } = params;
    const governanceRecipient = web3_js_1.Keypair.generate();
    await fundEphemeralWallet(provider, payer, governanceRecipient.publicKey, Math.round(0.005 * web3_js_1.LAMPORTS_PER_SOL));
    const daoName = shortDaoSuffix(namePrefix, "gv3");
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(daoName)], program.programId);
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const [governancePolicyPda] = [(0, utils_1.deriveDaoGovernancePolicyV3Pda)(daoPda, program.programId)];
    const [revealRebateVaultPda] = [(0, utils_1.deriveRevealRebateVaultV3Pda)(daoPda, program.programId)];
    const createDaoTx = await program.methods
        .initializeDao(daoName, quorum, new anchor_1.BN(0), new anchor_1.BN(revealWindowSeconds), new anchor_1.BN(executionDelaySeconds), { tokenWeighted: {} })
        .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 create DAO: ${createDaoTx}`);
    const governancePolicyTx = await program.methods
        .initializeDaoGovernancePolicyV3({ tokenSupplyParticipation: {} }, { dedicatedVaultRequired: {} }, new anchor_1.BN(1000000))
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const fundVaultTx = await program.methods
        .fundRevealRebateVaultV3(new anchor_1.BN(2000000))
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        revealRebateVault: revealRebateVaultPda,
        funder: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const depositTx = await program.methods
        .depositTreasury(new anchor_1.BN(Math.floor(depositSol * web3_js_1.LAMPORTS_PER_SOL)))
        .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        depositor: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const dao = await program.account.dao.fetch(daoPda);
    const [proposalPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)], program.programId);
    const createProposalTx = await program.methods
        .createProposal("Governance Hardening V3 live proof", "Live Devnet proof for token-supply quorum, dedicated reveal rebate vault, and V3 finalize path.", new anchor_1.BN(durationSeconds), {
        actionType: { sendSol: {} },
        amountLamports: new anchor_1.BN(Math.floor(treasuryAmountSol * web3_js_1.LAMPORTS_PER_SOL)),
        recipient: governanceRecipient.publicKey,
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
    const governanceSnapshotPda = (0, utils_1.deriveProposalGovernancePolicySnapshotV3Pda)(proposalPda, program.programId);
    const snapshotTx = await program.methods
        .snapshotProposalGovernancePolicyV3()
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        proposal: proposalPda,
        governanceToken: mint,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        operator: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const salt = crypto_1.default.randomBytes(32);
    const commitment = (0, utils_1.computeProposalCommitment)(true, salt, walletPk, proposalPda);
    const [voteRecordPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    const [delegationMarkerPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("delegation"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    const commitTx = await program.methods
        .commitVote([...commitment], null)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        delegationMarker: delegationMarkerPda,
        voterTokenAccount: voterTokenAccountAddress,
        voter: walletPk,
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    let proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.votingEnd.toNumber() + 1, "governance V3 reveal phase");
    const revealVaultBefore = await provider.connection.getBalance(revealRebateVaultPda);
    const recipientBefore = await provider.connection.getBalance(governanceRecipient.publicKey);
    const treasuryBeforeExecute = await provider.connection.getBalance(treasuryPda);
    const revealTx = await program.methods
        .revealVoteV3(true, [...salt])
        .accounts({
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        revealRebateVault: revealRebateVaultPda,
        revealer: walletPk,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.revealEnd.toNumber() + 1, "governance V3 finalize phase");
    const finalizeTx = await program.methods
        .finalizeProposalV3()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        finalizer: walletPk,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.executionUnlocksAt.toNumber() + 1, "governance V3 execution unlock");
    const executeTx = await program.methods
        .executeProposal()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        executor: walletPk,
        treasuryRecipient: governanceRecipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        confidentialPayoutPlan: web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("payout-plan"), proposalPda.toBuffer()], program.programId)[0],
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const finalProposal = await program.account.proposal.fetch(proposalPda);
    const governanceSnapshot = await program.account.proposalGovernancePolicySnapshotV3.fetch(governanceSnapshotPda);
    const revealVaultAfter = await provider.connection.getBalance(revealRebateVaultPda);
    const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda);
    const recipientAfter = await provider.connection.getBalance(governanceRecipient.publicKey);
    return {
        dao: daoPda.toBase58(),
        governanceMint: mint.toBase58(),
        treasury: treasuryPda.toBase58(),
        proposal: proposalPda.toBase58(),
        governancePolicy: governancePolicyPda.toBase58(),
        governanceSnapshot: governanceSnapshotPda.toBase58(),
        revealRebateVault: revealRebateVaultPda.toBase58(),
        recipientWallet: governanceRecipient.publicKey.toBase58(),
        timings: {
            votingEnd: finalProposal.votingEnd.toNumber(),
            revealEnd: finalProposal.revealEnd.toNumber(),
            executionUnlocksAt: finalProposal.executionUnlocksAt.toNumber(),
        },
        transactions: {
            createDao: createDaoTx,
            initializeGovernancePolicyV3: governancePolicyTx,
            fundRevealRebateVaultV3: fundVaultTx,
            deposit: depositTx,
            createProposal: createProposalTx,
            snapshotGovernancePolicyV3: snapshotTx,
            commit: commitTx,
            revealV3: revealTx,
            finalizeV3: finalizeTx,
            execute: executeTx,
        },
        invariants: {
            status: (0, utils_1.proposalStatusLabel)(finalProposal.status),
            isExecuted: finalProposal.isExecuted,
            eligibleCapital: governanceSnapshot.eligibleCapital.toString(),
            yesCapital: finalProposal.yesCapital.toString(),
            revealCount: finalProposal.revealCount.toString(),
            commitCount: finalProposal.commitCount.toString(),
            revealVaultBeforeLamports: revealVaultBefore,
            revealVaultAfterLamports: revealVaultAfter,
            treasuryBeforeExecuteLamports: treasuryBeforeExecute,
            treasuryAfterExecuteLamports: treasuryAfterExecute,
            recipientBeforeLamports: recipientBefore,
            recipientAfterLamports: recipientAfter,
        },
    };
}
async function runSettlementV3Flow(params) {
    const { provider, program, walletPk, mint, tokenProgram, voterTokenAccountAddress, namePrefix, } = params;
    const attestors = [walletPk, web3_js_1.PublicKey.default, web3_js_1.PublicKey.default, web3_js_1.PublicKey.default, web3_js_1.PublicKey.default];
    const settlementRecipient = web3_js_1.Keypair.generate();
    const fundRecipientTx = await provider.sendAndConfirm(new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: walletPk,
        toPubkey: settlementRecipient.publicKey,
        lamports: Math.round(0.005 * web3_js_1.LAMPORTS_PER_SOL),
    })), []);
    const daoName = shortDaoSuffix(namePrefix, "sv3");
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(daoName)], program.programId);
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const securityPolicyPda = (0, utils_1.deriveDaoSecurityPolicyPda)(daoPda, program.programId);
    const governancePolicyPda = (0, utils_1.deriveDaoGovernancePolicyV3Pda)(daoPda, program.programId);
    const settlementPolicyPda = (0, utils_1.deriveDaoSettlementPolicyV3Pda)(daoPda, program.programId);
    const revealRebateVaultPda = (0, utils_1.deriveRevealRebateVaultV3Pda)(daoPda, program.programId);
    const createDaoTx = await program.methods
        .initializeDao(daoName, 51, new anchor_1.BN(0), new anchor_1.BN(6), new anchor_1.BN(0), { tokenWeighted: {} })
        .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const initSecurityPolicyTx = await program.methods
        .initializeDaoSecurityPolicy({ strictRequired: {} }, { thresholdAttestedRequired: {} }, { strictRequired: {} }, { noCancelAfterParticipation: {} }, attestors, 1, 1, attestors, 1, 1, new anchor_1.BN(3600), new anchor_1.BN(3600))
        .accounts({
        dao: daoPda,
        daoSecurityPolicy: securityPolicyPda,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 init security policy: ${initSecurityPolicyTx}`);
    const initGovernancePolicyTx = await program.methods
        .initializeDaoGovernancePolicyV3({ tokenSupplyParticipation: {} }, { dedicatedVaultRequired: {} }, new anchor_1.BN(1000000))
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 init governance policy: ${initGovernancePolicyTx}`);
    const fundVaultTx = await program.methods
        .fundRevealRebateVaultV3(new anchor_1.BN(2000000))
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        revealRebateVault: revealRebateVaultPda,
        funder: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 fund rebate vault: ${fundVaultTx}`);
    const initSettlementPolicyTx = await program.methods
        .initializeDaoSettlementPolicyV3(new anchor_1.BN(0), new anchor_1.BN(60000000), true, false)
        .accounts({
        dao: daoPda,
        daoSettlementPolicyV3: settlementPolicyPda,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 init settlement policy: ${initSettlementPolicyTx}`);
    const dao = await program.account.dao.fetch(daoPda);
    const [proposalPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)], program.programId);
    const createProposalTx = await program.methods
        .createProposal("Settlement Hardening V3 live proof", "Execute a confidential payout only after REFHE settlement and strict settlement evidence.", new anchor_1.BN(8), null)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: voterTokenAccountAddress,
        proposer: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 create proposal: ${createProposalTx}`);
    const payoutPlanPda = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("payout-plan"), proposalPda.toBuffer()], program.programId)[0];
    const refheEnvelopePda = (0, utils_1.deriveRefheEnvelopePda)(proposalPda, program.programId);
    const magicblockCorridorPda = (0, utils_1.deriveMagicBlockPrivatePaymentCorridorPda)(proposalPda, program.programId);
    const governanceSnapshotPda = (0, utils_1.deriveProposalGovernancePolicySnapshotV3Pda)(proposalPda, program.programId);
    const settlementSnapshotPda = (0, utils_1.deriveProposalSettlementPolicySnapshotV3Pda)(proposalPda, program.programId);
    const manifestHash = randomHash();
    const ciphertextHash = randomHash();
    const configurePayoutTx = await program.methods
        .configureConfidentialPayoutPlan({ salary: {} }, { sol: {} }, settlementRecipient.publicKey, null, 2, new anchor_1.BN(50000000), "box://privatedao/live-proof-v3/salary-epoch-1", manifestHash, ciphertextHash)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        operator: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 configure payout: ${configurePayoutTx}`);
    const configureRefheTx = await program.methods
        .configureRefheEnvelope("box://privatedao/live-proof-v3/refhe-epoch-1", randomHash(), ciphertextHash, randomHash())
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        refheEnvelope: refheEnvelopePda,
        operator: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 configure REFHE: ${configureRefheTx}`);
    const snapshotGovernanceTx = await program.methods
        .snapshotProposalGovernancePolicyV3()
        .accounts({
        dao: daoPda,
        daoGovernancePolicyV3: governancePolicyPda,
        proposal: proposalPda,
        governanceToken: mint,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        operator: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 snapshot governance: ${snapshotGovernanceTx}`);
    const snapshotSettlementTx = await program.methods
        .snapshotProposalSettlementPolicyV3()
        .accounts({
        dao: daoPda,
        daoSettlementPolicyV3: settlementPolicyPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        proposalSettlementPolicySnapshotV3: settlementSnapshotPda,
        operator: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 snapshot settlement: ${snapshotSettlementTx}`);
    const depositTx = await program.methods
        .depositTreasury(new anchor_1.BN(100000000))
        .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        depositor: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 deposit treasury: ${depositTx}`);
    const salt = crypto_1.default.randomBytes(32);
    const commitment = (0, utils_1.computeProposalCommitment)(true, salt, walletPk, proposalPda);
    const voteRecordPda = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId)[0];
    const delegationMarkerPda = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("delegation"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId)[0];
    const commitTx = await program.methods
        .commitVote([...commitment], null)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        delegationMarker: delegationMarkerPda,
        voterTokenAccount: voterTokenAccountAddress,
        voter: walletPk,
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    console.log(`   Settlement V3 commit: ${commitTx}`);
    let proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.votingEnd.toNumber() + 1, "settlement V3 reveal phase");
    const revealVaultBefore = await provider.connection.getBalance(revealRebateVaultPda);
    const recipientBefore = await provider.connection.getBalance(settlementRecipient.publicKey);
    const treasuryBeforeExecute = await provider.connection.getBalance(treasuryPda);
    const revealTx = await program.methods
        .revealVoteV3(true, [...salt])
        .accounts({
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        revealRebateVault: revealRebateVaultPda,
        revealer: walletPk,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.revealEnd.toNumber() + 1, "settlement V3 finalize phase");
    const finalizeTx = await program.methods
        .finalizeProposalV3()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposalGovernancePolicySnapshotV3: governanceSnapshotPda,
        finalizer: walletPk,
    })
        .rpc();
    const settleRefheTx = await program.methods
        .settleRefheEnvelope(randomHash(), randomHash(), randomHash(), program.programId)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        refheEnvelope: refheEnvelopePda,
        operator: walletPk,
    })
        .rpc();
    const payoutPlan = await program.account.confidentialPayoutPlan.fetch(payoutPlanPda);
    const settlementId = crypto_1.default.randomBytes(32);
    const settlementEvidencePda = (0, utils_1.deriveSettlementEvidencePda)(proposalPda, payoutPlanPda, settlementId, program.programId);
    const settlementConsumptionPda = (0, utils_1.deriveSettlementConsumptionRecordPda)(settlementEvidencePda, program.programId);
    const payoutFieldsHash = (0, utils_1.canonicalPayoutFieldsHash)(daoPda, proposalPda, payoutPlanPda, payoutPlan);
    const recordSettlementEvidenceTx = await program.methods
        .recordSettlementEvidenceV2({ refheAttested: {} }, [...settlementId], randomHash(), [...payoutFieldsHash])
        .accounts({
        dao: daoPda,
        daoSecurityPolicy: securityPolicyPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        settlementEvidence: settlementEvidencePda,
        recorder: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    proposal = await program.account.proposal.fetch(proposalPda);
    if (proposal.executionUnlocksAt.toNumber() > 0) {
        await waitUntil(proposal.executionUnlocksAt.toNumber() + 1, "settlement V3 execution unlock");
    }
    const executeTx = await program.methods
        .executeConfidentialPayoutPlanV3()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        proposalSettlementPolicySnapshotV3: settlementSnapshotPda,
        settlementEvidence: settlementEvidencePda,
        settlementConsumptionRecord: settlementConsumptionPda,
        treasury: treasuryPda,
        executor: walletPk,
        settlementRecipient: settlementRecipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        refheEnvelope: refheEnvelopePda,
        magicblockPrivatePaymentCorridor: magicblockCorridorPda,
        tokenProgram,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const finalProposal = await program.account.proposal.fetch(proposalPda);
    const finalPayoutPlan = await program.account.confidentialPayoutPlan.fetch(payoutPlanPda);
    const governanceSnapshot = await program.account.proposalGovernancePolicySnapshotV3.fetch(governanceSnapshotPda);
    const settlementEvidence = await program.account.settlementEvidence.fetch(settlementEvidencePda);
    const settlementConsumptionRecord = await program.account.settlementConsumptionRecord.fetch(settlementConsumptionPda);
    const revealVaultAfter = await provider.connection.getBalance(revealRebateVaultPda);
    const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda);
    const recipientAfter = await provider.connection.getBalance(settlementRecipient.publicKey);
    return {
        dao: daoPda.toBase58(),
        treasury: treasuryPda.toBase58(),
        proposal: proposalPda.toBase58(),
        governancePolicy: governancePolicyPda.toBase58(),
        governanceSnapshot: governanceSnapshotPda.toBase58(),
        revealRebateVault: revealRebateVaultPda.toBase58(),
        securityPolicy: securityPolicyPda.toBase58(),
        settlementPolicy: settlementPolicyPda.toBase58(),
        settlementSnapshot: settlementSnapshotPda.toBase58(),
        payoutPlan: payoutPlanPda.toBase58(),
        refheEnvelope: refheEnvelopePda.toBase58(),
        magicblockCorridor: magicblockCorridorPda.toBase58(),
        settlementEvidence: settlementEvidencePda.toBase58(),
        settlementConsumptionRecord: settlementConsumptionPda.toBase58(),
        settlementRecipient: settlementRecipient.publicKey.toBase58(),
        timings: {
            votingEnd: finalProposal.votingEnd.toNumber(),
            revealEnd: finalProposal.revealEnd.toNumber(),
            executionUnlocksAt: finalProposal.executionUnlocksAt.toNumber(),
        },
        transactions: {
            fundRecipient: fundRecipientTx,
            createDao: createDaoTx,
            initializeSecurityPolicyV2: initSecurityPolicyTx,
            initializeGovernancePolicyV3: initGovernancePolicyTx,
            fundRevealRebateVaultV3: fundVaultTx,
            initializeSettlementPolicyV3: initSettlementPolicyTx,
            createProposal: createProposalTx,
            configureConfidentialPayoutPlan: configurePayoutTx,
            configureRefheEnvelope: configureRefheTx,
            snapshotGovernancePolicyV3: snapshotGovernanceTx,
            snapshotSettlementPolicyV3: snapshotSettlementTx,
            deposit: depositTx,
            commit: commitTx,
            revealV3: revealTx,
            finalizeV3: finalizeTx,
            settleRefheEnvelope: settleRefheTx,
            recordSettlementEvidenceV2: recordSettlementEvidenceTx,
            executeV3: executeTx,
        },
        invariants: {
            status: (0, utils_1.proposalStatusLabel)(finalProposal.status),
            isExecuted: finalProposal.isExecuted,
            payoutStatus: JSON.stringify(finalPayoutPlan.status),
            eligibleCapital: governanceSnapshot.eligibleCapital.toString(),
            revealCount: finalProposal.revealCount.toString(),
            commitCount: finalProposal.commitCount.toString(),
            revealVaultBeforeLamports: revealVaultBefore,
            revealVaultAfterLamports: revealVaultAfter,
            treasuryBeforeExecuteLamports: treasuryBeforeExecute,
            treasuryAfterExecuteLamports: treasuryAfterExecute,
            recipientBeforeLamports: recipientBefore,
            recipientAfterLamports: recipientAfter,
            evidenceStatus: JSON.stringify(settlementEvidence.status),
            evidenceConsumed: settlementConsumptionRecord.evidence.equals(settlementEvidencePda),
        },
    };
}
async function main() {
    const { name = `V3Proof${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`, quorum = 51, deposit = 0.2, treasuryAmount = 0.05, mintAmount = 1000, governanceMint: governanceMintArg, jsonOut, } = (0, utils_1.parseArgs)();
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const payer = provider.wallet.payer;
    const walletPk = provider.wallet.publicKey;
    console.log(`\n=== PrivateDAO live devnet proof V3 ===`);
    console.log(`Wallet:    ${walletPk.toBase58()}`);
    console.log(`Program:   ${program.programId.toBase58()}`);
    const mint = governanceMintArg
        ? new web3_js_1.PublicKey(String(governanceMintArg))
        : await (0, spl_token_1.createMint)(provider.connection, payer, walletPk, null, 6);
    const tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, mint);
    const voterAta = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, payer, mint, walletPk, false, "confirmed", undefined, tokenProgram);
    if (!governanceMintArg) {
        await (0, spl_token_1.mintTo)(provider.connection, payer, mint, voterAta.address, payer, BigInt(Number(mintAmount)) * 1000000n, [], undefined, tokenProgram);
    }
    const governanceV3 = await runGovernanceV3Flow({
        provider,
        program,
        payer,
        walletPk,
        mint,
        tokenProgram,
        voterTokenAccountAddress: voterAta.address,
        namePrefix: String(name),
        depositSol: Number(deposit),
        treasuryAmountSol: Number(treasuryAmount),
        quorum: Number(quorum),
        durationSeconds: 8,
        revealWindowSeconds: 6,
        executionDelaySeconds: 5,
    });
    const settlementV3 = await runSettlementV3Flow({
        provider,
        program,
        walletPk,
        mint,
        tokenProgram,
        voterTokenAccountAddress: voterAta.address,
        namePrefix: String(name),
    });
    const payload = {
        generatedAt: new Date().toISOString(),
        mode: "test-wallet-devnet-proof-v3",
        operatorWallet: walletPk.toBase58(),
        programId: program.programId.toBase58(),
        governanceV3,
        settlementV3,
    };
    if (jsonOut) {
        const outPath = path_1.default.resolve(String(jsonOut));
        fs_1.default.mkdirSync(path_1.default.dirname(outPath), { recursive: true });
        fs_1.default.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
        console.log(`\nJSON proof:      ${path_1.default.relative(process.cwd(), outPath)}`);
    }
    console.log(`\n=== Live proof V3 complete ===`);
    console.log(`Governance V3 DAO:       ${governanceV3.dao}`);
    console.log(`                         ${(0, utils_1.solscanAccountUrl)(governanceV3.dao)}`);
    console.log(`Governance V3 Proposal:  ${governanceV3.proposal}`);
    console.log(`                         ${(0, utils_1.solscanAccountUrl)(governanceV3.proposal)}`);
    console.log(`Governance V3 Execute:   ${governanceV3.transactions.execute}`);
    console.log(`                         ${(0, utils_1.solscanTxUrl)(governanceV3.transactions.execute)}`);
    console.log(`Settlement V3 DAO:       ${settlementV3.dao}`);
    console.log(`                         ${(0, utils_1.solscanAccountUrl)(settlementV3.dao)}`);
    console.log(`Settlement V3 Proposal:  ${settlementV3.proposal}`);
    console.log(`                         ${(0, utils_1.solscanAccountUrl)(settlementV3.proposal)}`);
    console.log(`Settlement V3 Execute:   ${settlementV3.transactions.executeV3}`);
    console.log(`                         ${(0, utils_1.solscanTxUrl)(settlementV3.transactions.executeV3)}`);
    console.log(`Governance recipient delta: ${(0, utils_1.formatSol)(governanceV3.invariants.recipientAfterLamports - governanceV3.invariants.recipientBeforeLamports)}`);
    console.log(`Settlement recipient delta: ${(0, utils_1.formatSol)(settlementV3.invariants.recipientAfterLamports - settlementV3.invariants.recipientBeforeLamports)}`);
    console.log(`Governance unlock: ${(0, utils_1.formatTimestamp)(governanceV3.timings.executionUnlocksAt)}`);
    console.log(`Settlement unlock: ${(0, utils_1.formatTimestamp)(settlementV3.timings.executionUnlocksAt)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
