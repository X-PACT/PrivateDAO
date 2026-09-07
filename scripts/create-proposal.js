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
 * create-proposal.ts
 * Creates a governance proposal with optional treasury action.
 *
 * Usage:
 *   yarn ts-node scripts/create-proposal.ts --dao <DAO_PDA> --title "Fund marketing: 5 SOL"
 *   yarn ts-node scripts/create-proposal.ts --dao <DAO_PDA> --title "..." \
 *     --treasury-recipient <WALLET> --treasury-amount 0.5
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
const magicblock_payments_1 = require("./lib/magicblock-payments");
async function main() {
    const { dao: daoPdaStr, title = "Allocate 5 SOL for marketing", description = "Proposal to allocate 5 SOL from treasury to fund marketing for Q1.", duration = 86400, // 24h default
    treasuryType = "sol", treasuryRecipient, treasuryAmount, treasuryMint, confidentialType, payoutAsset = "sol", settlementRecipient, payoutTotal, payoutMint, recipientCount, manifestUri, manifestHash, ciphertextHash, refheModelUri, refhePolicyHash, refheInputCiphertextHash, refheEvaluationKeyHash, magicblock, magicblockOwnerWallet, magicblockApiBase, } = (0, utils_1.parseArgs)();
    if (!daoPdaStr) {
        console.error("Error: --dao <DAO_PDA> is required");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPda = new web3_js_1.PublicKey(String(daoPdaStr));
    const dao = await program.account.dao.fetch(daoPda);
    const durationSeconds = Number(duration);
    const { address: proposerTokenAccount } = await (0, utils_1.associatedTokenAddressForMint)(provider.connection, dao.governanceToken, provider.wallet.publicKey);
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        console.error("Error: --duration must be a positive number of seconds");
        process.exit(1);
    }
    console.log(`\n📋 Creating proposal for DAO: ${dao.daoName}`);
    console.log(`   Title:    "${title}"`);
    console.log(`   Duration: ${durationSeconds}s (${(durationSeconds / 3600).toFixed(1)}h voting)`);
    console.log(`   Reveal:   ${dao.revealWindowSeconds}s (${(dao.revealWindowSeconds / 3600).toFixed(1)}h)`);
    const [proposalPda] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("proposal"),
        daoPda.toBuffer(),
        dao.proposalCount.toArrayLike(Buffer, "le", 8),
    ], program.programId);
    // Optional: attach a treasury action (SOL transfer on pass)
    let treasuryAction = null;
    if ((treasuryRecipient && !treasuryAmount) || (!treasuryRecipient && treasuryAmount) || treasuryMint) {
        if (!treasuryRecipient || treasuryAmount === undefined) {
            console.error("Error: treasury actions require both --treasury-recipient and --treasury-amount");
            process.exit(1);
        }
    }
    if (treasuryRecipient && treasuryAmount !== undefined) {
        const treasuryRecipientPk = new web3_js_1.PublicKey(String(treasuryRecipient));
        const normalizedType = String(treasuryType).toLowerCase();
        const rawAmount = Number(treasuryAmount);
        if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
            console.error("Error: --treasury-amount must be a positive number");
            process.exit(1);
        }
        if (normalizedType === "token") {
            if (!treasuryMint) {
                console.error("Error: token treasury actions require --treasury-mint <TOKEN_MINT>");
                process.exit(1);
            }
            treasuryAction = {
                actionType: { sendToken: {} },
                amountLamports: new anchor.BN(rawAmount),
                recipient: treasuryRecipientPk,
                tokenMint: new web3_js_1.PublicKey(String(treasuryMint)),
            };
            console.log(`\n   💰 Treasury action: send ${rawAmount} raw token units to ${treasuryRecipientPk.toBase58()} if passed`);
            console.log(`   Token mint: ${String(treasuryMint)}`);
        }
        else if (normalizedType === "sol") {
            if (treasuryMint) {
                console.error("Error: do not pass --treasury-mint for SOL treasury actions");
                process.exit(1);
            }
            const lamports = Math.floor(rawAmount * web3_js_1.LAMPORTS_PER_SOL);
            if (lamports <= 0) {
                console.error("Error: SOL treasury amount must be large enough to convert to lamports");
                process.exit(1);
            }
            treasuryAction = {
                actionType: { sendSol: {} },
                amountLamports: new anchor.BN(lamports),
                recipient: treasuryRecipientPk,
                tokenMint: null,
            };
            console.log(`\n   💰 Treasury action: send ${(0, utils_1.formatSol)(lamports)} to ${treasuryRecipientPk.toBase58()} if passed`);
        }
        else {
            console.error("Error: --treasury-type must be either 'sol' or 'token'");
            process.exit(1);
        }
    }
    const confidentialEnabled = Boolean(confidentialType || settlementRecipient || payoutTotal || payoutMint || recipientCount || manifestUri || manifestHash || ciphertextHash);
    if (confidentialEnabled && treasuryAction) {
        console.error("Error: confidential payout plans cannot be combined with direct treasury actions on the same proposal");
        process.exit(1);
    }
    let confidentialPayload = null;
    let refhePayload = null;
    let magicBlockPayload = null;
    if (confidentialEnabled) {
        const payoutTypeNormalized = String(confidentialType || "salary").toLowerCase();
        const assetTypeNormalized = String(payoutAsset || "sol").toLowerCase();
        const settlementRecipientPk = settlementRecipient
            ? new web3_js_1.PublicKey(String(settlementRecipient))
            : provider.wallet.publicKey;
        const count = Number(recipientCount || 1);
        const uri = String(manifestUri || "").trim();
        const rawTotal = Number(payoutTotal);
        if (!Number.isFinite(rawTotal) || rawTotal <= 0) {
            console.error("Error: confidential payout plans require --payout-total > 0");
            process.exit(1);
        }
        if (!Number.isInteger(count) || count <= 0) {
            console.error("Error: confidential payout plans require --recipient-count >= 1");
            process.exit(1);
        }
        if (!uri) {
            console.error("Error: confidential payout plans require --manifest-uri");
            process.exit(1);
        }
        if (!manifestHash || !ciphertextHash) {
            console.error("Error: confidential payout plans require both --manifest-hash and --ciphertext-hash");
            process.exit(1);
        }
        const manifestHashBytes = Buffer.from(String(manifestHash).replace(/^0x/i, ""), "hex");
        const ciphertextHashBytes = Buffer.from(String(ciphertextHash).replace(/^0x/i, ""), "hex");
        if (manifestHashBytes.length !== 32 || ciphertextHashBytes.length !== 32) {
            console.error("Error: --manifest-hash and --ciphertext-hash must both be 32-byte hex values");
            process.exit(1);
        }
        let tokenMintPk = null;
        let assetType = { sol: {} };
        let totalAmount = new anchor.BN(rawTotal);
        if (assetTypeNormalized === "token") {
            if (!payoutMint) {
                console.error("Error: token payout batches require --payout-mint <TOKEN_MINT>");
                process.exit(1);
            }
            tokenMintPk = new web3_js_1.PublicKey(String(payoutMint));
            assetType = { token: {} };
        }
        else if (assetTypeNormalized === "sol") {
            const lamports = Math.floor(rawTotal * web3_js_1.LAMPORTS_PER_SOL);
            if (lamports <= 0) {
                console.error("Error: SOL payout total must be large enough to convert to lamports");
                process.exit(1);
            }
            totalAmount = new anchor.BN(lamports);
        }
        else {
            console.error("Error: --payout-asset must be either 'sol' or 'token'");
            process.exit(1);
        }
        confidentialPayload = {
            payoutType: payoutTypeNormalized === "bonus" ? { bonus: {} } : { salary: {} },
            assetType,
            settlementRecipient: settlementRecipientPk,
            tokenMint: tokenMintPk,
            recipientCount: count,
            totalAmount,
            encryptedManifestUri: uri,
            manifestHash: [...manifestHashBytes],
            ciphertextHash: [...ciphertextHashBytes],
        };
        console.log(`\n   🔐 Confidential payout batch: ${payoutTypeNormalized}`);
        console.log(`   Asset type: ${assetTypeNormalized}`);
        console.log(`   Settlement recipient: ${settlementRecipientPk.toBase58()}`);
        console.log(`   Recipient count: ${count}`);
        console.log(`   Manifest URI: ${uri}`);
        const refheEnabled = Boolean(refheModelUri || refhePolicyHash || refheInputCiphertextHash || refheEvaluationKeyHash);
        if (refheEnabled) {
            if (!refheModelUri || !refhePolicyHash || !refheInputCiphertextHash || !refheEvaluationKeyHash) {
                console.error("Error: REFHE envelope requires --refhe-model-uri, --refhe-policy-hash, --refhe-input-ciphertext-hash, and --refhe-evaluation-key-hash");
                process.exit(1);
            }
            const parseHashHex = (value, label) => {
                const buffer = Buffer.from(String(value || "").trim().replace(/^0x/i, ""), "hex");
                if (buffer.length !== 32) {
                    console.error(`Error: ${label} must be a 32-byte hex value`);
                    process.exit(1);
                }
                return [...buffer];
            };
            const refheInput = String(refheInputCiphertextHash).replace(/^0x/i, "").toLowerCase();
            const payoutCiphertext = String(ciphertextHash).replace(/^0x/i, "").toLowerCase();
            if (refheInput !== payoutCiphertext) {
                console.error("Error: --refhe-input-ciphertext-hash must match the confidential payout --ciphertext-hash");
                process.exit(1);
            }
            refhePayload = {
                modelUri: String(refheModelUri).trim(),
                policyHash: parseHashHex(refhePolicyHash, "REFHE policy hash"),
                inputCiphertextHash: parseHashHex(refheInputCiphertextHash, "REFHE input ciphertext hash"),
                evaluationKeyHash: parseHashHex(refheEvaluationKeyHash, "REFHE evaluation key hash"),
            };
            console.log(`   REFHE model URI: ${refhePayload.modelUri}`);
        }
        const magicBlockEnabled = String(magicblock || "").trim().toLowerCase() === "enabled";
        if (magicBlockEnabled) {
            if (assetTypeNormalized !== "token" || !tokenMintPk) {
                console.error("Error: --magicblock enabled requires --payout-asset token and --payout-mint");
                process.exit(1);
            }
            const ownerWallet = magicblockOwnerWallet
                ? new web3_js_1.PublicKey(String(magicblockOwnerWallet))
                : provider.wallet.publicKey;
            const apiBase = String(magicblockApiBase || (0, magicblock_payments_1.magicBlockApiBase)()).trim();
            const cluster = (0, magicblock_payments_1.magicBlockCluster)();
            magicBlockPayload = {
                apiBase,
                cluster,
                ownerWallet,
                validator: null,
                depositAmount: totalAmount,
                privateTransferAmount: totalAmount,
                withdrawalAmount: totalAmount,
                routeHash: (0, magicblock_payments_1.magicBlockRouteHash)([
                    daoPda,
                    proposalPda,
                    ownerWallet,
                    settlementRecipientPk,
                    tokenMintPk,
                    totalAmount.toString(),
                    apiBase,
                    cluster,
                ]),
            };
            console.log(`   MagicBlock API base: ${apiBase}`);
            console.log(`   MagicBlock owner wallet: ${ownerWallet.toBase58()}`);
        }
    }
    const tx = await program.methods
        .createProposal(String(title), String(description), new anchor.BN(durationSeconds), treasuryAction)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount,
        proposer: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    let confidentialTx = null;
    if (confidentialPayload) {
        const payoutPlanPda = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPda, program.programId);
        confidentialTx = await program.methods
            .configureConfidentialPayoutPlan(confidentialPayload.payoutType, confidentialPayload.assetType, confidentialPayload.settlementRecipient, confidentialPayload.tokenMint, confidentialPayload.recipientCount, confidentialPayload.totalAmount, confidentialPayload.encryptedManifestUri, confidentialPayload.manifestHash, confidentialPayload.ciphertextHash)
            .accounts({
            dao: daoPda,
            proposal: proposalPda,
            confidentialPayoutPlan: payoutPlanPda,
            operator: provider.wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        console.log(`   Confidential payout plan: ${payoutPlanPda.toBase58()}`);
        console.log(`   Payout config tx:        ${confidentialTx}`);
        console.log(`   Payout config link:      ${(0, utils_1.solscanTxUrl)(confidentialTx)}`);
        if (magicBlockPayload) {
            const corridorPda = (0, utils_1.deriveMagicBlockPrivatePaymentCorridorPda)(proposalPda, program.programId);
            const magicBlockTx = await program.methods
                .configureMagicblockPrivatePaymentCorridor(magicBlockPayload.apiBase, magicBlockPayload.cluster, magicBlockPayload.ownerWallet, magicBlockPayload.validator, magicBlockPayload.routeHash, magicBlockPayload.depositAmount, magicBlockPayload.privateTransferAmount, magicBlockPayload.withdrawalAmount)
                .accounts({
                dao: daoPda,
                proposal: proposalPda,
                confidentialPayoutPlan: payoutPlanPda,
                magicblockPrivatePaymentCorridor: corridorPda,
                operator: provider.wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            console.log(`   MagicBlock corridor:     ${corridorPda.toBase58()}`);
            console.log(`   MagicBlock config tx:    ${magicBlockTx}`);
            console.log(`   MagicBlock config link:  ${(0, utils_1.solscanTxUrl)(magicBlockTx)}`);
        }
        if (refhePayload) {
            const refheEnvelopePda = (0, utils_1.deriveRefheEnvelopePda)(proposalPda, program.programId);
            const refheTx = await program.methods
                .configureRefheEnvelope(refhePayload.modelUri, refhePayload.policyHash, refhePayload.inputCiphertextHash, refhePayload.evaluationKeyHash)
                .accounts({
                dao: daoPda,
                proposal: proposalPda,
                confidentialPayoutPlan: payoutPlanPda,
                refheEnvelope: refheEnvelopePda,
                operator: provider.wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            console.log(`   REFHE envelope:         ${refheEnvelopePda.toBase58()}`);
            console.log(`   REFHE config tx:        ${refheTx}`);
            console.log(`   REFHE config link:      ${(0, utils_1.solscanTxUrl)(refheTx)}`);
        }
    }
    const proposal = await program.account["proposal"].fetch(proposalPda);
    console.log(`\n✅ Proposal created!`);
    console.log(`   Proposal address: ${proposalPda.toBase58()}`);
    console.log(`   Proposal ID:      ${proposal.proposalId.toString()}`);
    console.log(`   Transaction:      ${tx}`);
    console.log(`   Tx link:          ${(0, utils_1.solscanTxUrl)(tx)}`);
    console.log(`   Proposer token:   ${proposerTokenAccount.toBase58()}`);
    console.log(`   Voting ends:      ${(0, utils_1.formatTimestamp)(proposal.votingEnd.toNumber())}`);
    console.log(`   Reveal ends:      ${(0, utils_1.formatTimestamp)(proposal.revealEnd.toNumber())}`);
    console.log(`   Proposal explorer:${" "}${(0, utils_1.solscanAccountUrl)(proposalPda.toBase58())}`);
    if (confidentialTx !== null) {
        console.log(`   Confidential flow: proposal-bound encrypted payout plan configured`);
    }
    console.log(`\n   Save this:`);
    console.log(`   PROPOSAL_PDA=${proposalPda.toBase58()}`);
    console.log(`   Next: yarn commit -- --proposal ${proposalPda.toBase58()} --vote yes`);
}
main().catch(console.error);
