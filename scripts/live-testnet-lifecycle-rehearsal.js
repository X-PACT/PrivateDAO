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
 * Runs a narrow, production-style Testnet rehearsal:
 * create DAO -> create proposal -> commit -> reveal -> finalize -> execute -> verify treasury movement.
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const bn_js_1 = __importDefault(require("bn.js"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
const REPORT_DATE = "2026-04-18";
const OUTPUT_JSON = path.join("docs", `testnet-lifecycle-rehearsal-${REPORT_DATE}.json`);
const OUTPUT_MD = path.join("docs", `testnet-lifecycle-rehearsal-${REPORT_DATE}.md`);
const VOTING_SECONDS = 5;
const REVEAL_SECONDS = 5;
const EXECUTION_DELAY_SECONDS = 0;
const TREASURY_DEPOSIT_LAMPORTS = 30000000;
const TREASURY_TRANSFER_LAMPORTS = 5000000;
function testnetTxUrl(signature) {
    return `https://solscan.io/tx/${signature}?cluster=testnet`;
}
function testnetAccountUrl(address) {
    return `https://solscan.io/account/${address}?cluster=testnet`;
}
function redactRpcUrl(url) {
    try {
        const parsed = new URL(url);
        if (parsed.search)
            parsed.search = "?redacted=true";
        return parsed.toString();
    }
    catch {
        return url.includes("api_key=") ? url.replace(/api_key=[^&]+/i, "api_key=REDACTED") : url;
    }
}
async function withRetry(label, fn, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const result = await fn();
            if (typeof result === "string") {
                console.log(`   ${label}: ${result}`);
            }
            else {
                console.log(`   ${label}: ok`);
            }
            return result;
        }
        catch (error) {
            lastError = error;
            console.error(`   ${label}: failed attempt ${attempt}/${attempts}`);
            if (attempt < attempts) {
                await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
            }
        }
    }
    throw lastError;
}
async function waitUntil(targetUnix, label) {
    const targetSeconds = typeof targetUnix === "number" ? targetUnix : targetUnix.toNumber();
    for (;;) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= targetSeconds)
            return;
        const remaining = targetSeconds - now;
        console.log(`   waiting for ${label}: ${remaining}s`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 2) * 1000));
    }
}
function addTx(steps, label, signature) {
    steps.push({ label, signature, explorer: testnetTxUrl(signature) });
    return signature;
}
function assertInvariant(condition, message) {
    if (!condition)
        throw new Error(`Invariant failed: ${message}`);
}
async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const payer = provider.wallet.payer;
    const walletPk = provider.wallet.publicKey;
    if (!payer) {
        throw new Error("ANCHOR_WALLET must resolve to a local keypair for the Testnet rehearsal.");
    }
    const endpoint = provider.connection.rpcEndpoint;
    if (!endpoint.toLowerCase().includes("testnet")) {
        throw new Error(`Refusing to run Testnet rehearsal against non-testnet RPC: ${redactRpcUrl(endpoint)}`);
    }
    const startedAt = new Date().toISOString();
    const txs = [];
    const operatorBalanceBefore = await provider.connection.getBalance(walletPk, "confirmed");
    console.log("\nPrivateDAO Testnet lifecycle rehearsal");
    console.log(`   Program:  ${program.programId.toBase58()}`);
    console.log(`   Operator: ${walletPk.toBase58()}`);
    console.log(`   RPC:      ${redactRpcUrl(endpoint)}`);
    const governanceMint = await withRetry("create governance mint", () => (0, spl_token_1.createMint)(provider.connection, payer, walletPk, null, 6));
    const authorityTokenAccount = await withRetry("create authority governance ATA", () => (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, payer, governanceMint, walletPk));
    addTx(txs, "mint governance voting power", await withRetry("mint governance voting power", () => (0, spl_token_1.mintTo)(provider.connection, payer, governanceMint, authorityTokenAccount.address, payer, 1000000000)));
    const daoName = `TestnetDAO-${Date.now().toString(36).slice(-6)}`;
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(daoName)], program.programId);
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const recipient = web3_js_1.Keypair.generate();
    addTx(txs, "fund recipient system account", await withRetry("fund recipient system account", () => provider.sendAndConfirm(new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: walletPk,
        toPubkey: recipient.publicKey,
        lamports: Math.round(0.002 * web3_js_1.LAMPORTS_PER_SOL),
    })), [])));
    addTx(txs, "create DAO", await withRetry("create DAO", () => program.methods
        .initializeDao(daoName, 51, new bn_js_1.default(0), new bn_js_1.default(REVEAL_SECONDS), new bn_js_1.default(EXECUTION_DELAY_SECONDS), { tokenWeighted: {} })
        .accounts({
        dao: daoPda,
        governanceToken: governanceMint,
        authority: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc()));
    const dao = await program.account.dao.fetch(daoPda);
    const [proposalPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)], program.programId);
    addTx(txs, "create treasury proposal", await withRetry("create treasury proposal", () => program.methods
        .createProposal("Testnet treasury execution rehearsal", "Full Testnet rehearsal for create, commit, reveal, finalize, execute, and treasury verification.", new bn_js_1.default(VOTING_SECONDS), {
        actionType: { sendSol: {} },
        amountLamports: new bn_js_1.default(TREASURY_TRANSFER_LAMPORTS),
        recipient: recipient.publicKey,
        tokenMint: null,
    })
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: authorityTokenAccount.address,
        proposer: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc()));
    addTx(txs, "deposit treasury", await withRetry("deposit treasury", () => program.methods
        .depositTreasury(new bn_js_1.default(TREASURY_DEPOSIT_LAMPORTS))
        .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        depositor: walletPk,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc()));
    const salt = crypto.randomBytes(32);
    const commitment = (0, utils_1.computeProposalCommitment)(true, salt, walletPk, proposalPda);
    const [voteRecordPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    const [delegationMarkerPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("delegation"), proposalPda.toBuffer(), walletPk.toBuffer()], program.programId);
    addTx(txs, "commit vote", await withRetry("commit vote", () => program.methods
        .commitVote([...commitment], null)
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        delegationMarker: delegationMarkerPda,
        voterTokenAccount: authorityTokenAccount.address,
        voter: walletPk,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc()));
    let proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.votingEnd, "reveal phase");
    addTx(txs, "reveal vote", await withRetry("reveal vote", () => program.methods
        .revealVote(true, [...salt])
        .accounts({
        proposal: proposalPda,
        voterRecord: voteRecordPda,
        revealer: walletPk,
    })
        .rpc()));
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.revealEnd, "finalize phase");
    addTx(txs, "finalize proposal", await withRetry("finalize proposal", () => program.methods
        .finalizeProposal()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        finalizer: walletPk,
    })
        .rpc()));
    proposal = await program.account.proposal.fetch(proposalPda);
    await waitUntil(proposal.executionUnlocksAt, "execution unlock");
    const treasuryBeforeExecute = await provider.connection.getBalance(treasuryPda, "confirmed");
    const recipientBeforeExecute = await provider.connection.getBalance(recipient.publicKey, "confirmed");
    addTx(txs, "execute proposal", await withRetry("execute proposal", () => program.methods
        .executeProposal()
        .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        confidentialPayoutPlan: web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("payout-plan"), proposalPda.toBuffer()], program.programId)[0],
        executor: walletPk,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc()));
    const finalProposal = await program.account.proposal.fetch(proposalPda);
    const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda, "confirmed");
    const recipientAfterExecute = await provider.connection.getBalance(recipient.publicKey, "confirmed");
    const operatorBalanceAfter = await provider.connection.getBalance(walletPk, "confirmed");
    const treasuryDelta = treasuryBeforeExecute - treasuryAfterExecute;
    const recipientDelta = recipientAfterExecute - recipientBeforeExecute;
    assertInvariant((0, utils_1.proposalStatusLabel)(finalProposal.status) === "Passed", "proposal status should be Passed");
    assertInvariant(finalProposal.isExecuted === true, "proposal should be executed");
    assertInvariant(treasuryDelta === TREASURY_TRANSFER_LAMPORTS, "treasury should lose exact transfer lamports");
    assertInvariant(recipientDelta === TREASURY_TRANSFER_LAMPORTS, "recipient should gain exact transfer lamports");
    const report = {
        generatedAt: new Date().toISOString(),
        startedAt,
        network: "testnet",
        rpcEndpoint: redactRpcUrl(endpoint),
        programId: program.programId.toBase58(),
        operator: walletPk.toBase58(),
        daoName,
        accounts: {
            dao: daoPda.toBase58(),
            governanceMint: governanceMint.toBase58(),
            authorityTokenAccount: authorityTokenAccount.address.toBase58(),
            proposal: proposalPda.toBase58(),
            voteRecord: voteRecordPda.toBase58(),
            delegationMarker: delegationMarkerPda.toBase58(),
            treasury: treasuryPda.toBase58(),
            recipient: recipient.publicKey.toBase58(),
        },
        accountExplorers: {
            dao: testnetAccountUrl(daoPda.toBase58()),
            proposal: testnetAccountUrl(proposalPda.toBase58()),
            treasury: testnetAccountUrl(treasuryPda.toBase58()),
            recipient: testnetAccountUrl(recipient.publicKey.toBase58()),
        },
        transactions: txs,
        verification: {
            proposalStatus: (0, utils_1.proposalStatusLabel)(finalProposal.status),
            isExecuted: finalProposal.isExecuted,
            commitCount: finalProposal.commitCount.toString(),
            revealCount: finalProposal.revealCount.toString(),
            yesCapital: finalProposal.yesCapital.toString(),
            treasuryBeforeExecuteLamports: treasuryBeforeExecute,
            treasuryAfterExecuteLamports: treasuryAfterExecute,
            treasuryDeltaLamports: treasuryDelta,
            recipientBeforeExecuteLamports: recipientBeforeExecute,
            recipientAfterExecuteLamports: recipientAfterExecute,
            recipientDeltaLamports: recipientDelta,
            expectedTransferLamports: TREASURY_TRANSFER_LAMPORTS,
            operatorBalanceBeforeLamports: operatorBalanceBefore,
            operatorBalanceAfterLamports: operatorBalanceAfter,
        },
    };
    fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(OUTPUT_MD, [
        `# Testnet Lifecycle Rehearsal - ${REPORT_DATE}`,
        "",
        "PrivateDAO completed a full Solana Testnet lifecycle rehearsal from the deployed Testnet program.",
        "",
        "## Summary",
        "",
        `- Network: \`${report.network}\``,
        `- Program: \`${report.programId}\``,
        `- Operator: \`${report.operator}\``,
        `- DAO: \`${report.accounts.dao}\``,
        `- Proposal: \`${report.accounts.proposal}\``,
        `- Treasury: \`${report.accounts.treasury}\``,
        `- Recipient: \`${report.accounts.recipient}\``,
        `- Result: \`${report.verification.proposalStatus}\``,
        `- Executed: \`${String(report.verification.isExecuted)}\``,
        "",
        "## Transaction Hashes",
        "",
        ...report.transactions.map((tx) => `- ${tx.label}: [\`${tx.signature}\`](${tx.explorer})`),
        "",
        "## Treasury Verification",
        "",
        `- Treasury before execute: \`${report.verification.treasuryBeforeExecuteLamports}\` lamports`,
        `- Treasury after execute: \`${report.verification.treasuryAfterExecuteLamports}\` lamports`,
        `- Treasury delta: \`${report.verification.treasuryDeltaLamports}\` lamports`,
        `- Recipient before execute: \`${report.verification.recipientBeforeExecuteLamports}\` lamports`,
        `- Recipient after execute: \`${report.verification.recipientAfterExecuteLamports}\` lamports`,
        `- Recipient delta: \`${report.verification.recipientDeltaLamports}\` lamports`,
        `- Expected transfer: \`${report.verification.expectedTransferLamports}\` lamports`,
        "",
        "## Explorer Links",
        "",
        `- DAO: ${report.accountExplorers.dao}`,
        `- Proposal: ${report.accountExplorers.proposal}`,
        `- Treasury: ${report.accountExplorers.treasury}`,
        `- Recipient: ${report.accountExplorers.recipient}`,
        "",
        "## Verification Boundary",
        "",
        "This rehearsal proves the standard Testnet governance and SOL treasury execution path. It does not replace Devnet browser-wallet evidence or custody/multisig evidence.",
        "",
    ].join("\n"));
    console.log(`\nWrote ${OUTPUT_JSON}`);
    console.log(`Wrote ${OUTPUT_MD}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
