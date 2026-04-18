// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Runs a narrow, production-style Testnet rehearsal:
 * create DAO -> create proposal -> commit -> reveal -> finalize -> execute -> verify treasury movement.
 */
import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  computeProposalCommitment,
  proposalStatusLabel,
  workspaceProgram,
} from "./utils";

const REPORT_DATE = "2026-04-18";
const OUTPUT_JSON = path.join("docs", `testnet-lifecycle-rehearsal-${REPORT_DATE}.json`);
const OUTPUT_MD = path.join("docs", `testnet-lifecycle-rehearsal-${REPORT_DATE}.md`);
const VOTING_SECONDS = 5;
const REVEAL_SECONDS = 5;
const EXECUTION_DELAY_SECONDS = 0;
const TREASURY_DEPOSIT_LAMPORTS = 30_000_000;
const TREASURY_TRANSFER_LAMPORTS = 5_000_000;

type TxStep = {
  label: string;
  signature: string;
  explorer: string;
};

function testnetTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=testnet`;
}

function testnetAccountUrl(address: string): string {
  return `https://solscan.io/account/${address}?cluster=testnet`;
}

function redactRpcUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.search) parsed.search = "?redacted=true";
    return parsed.toString();
  } catch {
    return url.includes("api_key=") ? url.replace(/api_key=[^&]+/i, "api_key=REDACTED") : url;
  }
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await fn();
      if (typeof result === "string") {
        console.log(`   ${label}: ${result}`);
      } else {
        console.log(`   ${label}: ok`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`   ${label}: failed attempt ${attempt}/${attempts}`);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1_500 * attempt));
      }
    }
  }
  throw lastError;
}

async function waitUntil(targetUnix: { toNumber(): number } | number, label: string): Promise<void> {
  const targetSeconds = typeof targetUnix === "number" ? targetUnix : targetUnix.toNumber();
  for (;;) {
    const now = Math.floor(Date.now() / 1000);
    if (now >= targetSeconds) return;
    const remaining = targetSeconds - now;
    console.log(`   waiting for ${label}: ${remaining}s`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 2) * 1000));
  }
}

function addTx(steps: TxStep[], label: string, signature: string): string {
  steps.push({ label, signature, explorer: testnetTxUrl(signature) });
  return signature;
}

function assertInvariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invariant failed: ${message}`);
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = workspaceProgram();
  const payer = (provider.wallet as anchor.Wallet).payer as Keypair | undefined;
  const walletPk = provider.wallet.publicKey;

  if (!payer) {
    throw new Error("ANCHOR_WALLET must resolve to a local keypair for the Testnet rehearsal.");
  }

  const endpoint = provider.connection.rpcEndpoint;
  if (!endpoint.toLowerCase().includes("testnet")) {
    throw new Error(`Refusing to run Testnet rehearsal against non-testnet RPC: ${redactRpcUrl(endpoint)}`);
  }

  const startedAt = new Date().toISOString();
  const txs: TxStep[] = [];
  const operatorBalanceBefore = await provider.connection.getBalance(walletPk, "confirmed");

  console.log("\nPrivateDAO Testnet lifecycle rehearsal");
  console.log(`   Program:  ${program.programId.toBase58()}`);
  console.log(`   Operator: ${walletPk.toBase58()}`);
  console.log(`   RPC:      ${redactRpcUrl(endpoint)}`);

  const governanceMint = await withRetry("create governance mint", () =>
    createMint(provider.connection, payer, walletPk, null, 6),
  );

  const authorityTokenAccount = await withRetry("create authority governance ATA", () =>
    getOrCreateAssociatedTokenAccount(provider.connection, payer, governanceMint, walletPk),
  );

  addTx(
    txs,
    "mint governance voting power",
    await withRetry("mint governance voting power", () =>
      mintTo(
        provider.connection,
        payer,
        governanceMint,
        authorityTokenAccount.address,
        payer,
        1_000_000_000,
      ),
    ),
  );

  const daoName = `TestnetDAO-${Date.now().toString(36).slice(-6)}`;
  const [daoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(daoName)],
    program.programId,
  );
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), daoPda.toBuffer()],
    program.programId,
  );
  const recipient = Keypair.generate();

  addTx(
    txs,
    "fund recipient system account",
    await withRetry("fund recipient system account", () =>
      provider.sendAndConfirm(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: walletPk,
            toPubkey: recipient.publicKey,
            lamports: Math.round(0.002 * LAMPORTS_PER_SOL),
          }),
        ),
        [],
      ),
    ),
  );

  addTx(
    txs,
    "create DAO",
    await withRetry("create DAO", () =>
      program.methods
        .initializeDao(
          daoName,
          51,
          new BN(0),
          new BN(REVEAL_SECONDS),
          new BN(EXECUTION_DELAY_SECONDS),
          { tokenWeighted: {} },
        )
        .accounts({
          dao: daoPda,
          governanceToken: governanceMint,
          authority: walletPk,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    ),
  );

  const dao = await program.account.dao.fetch(daoPda);
  const [proposalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
    program.programId,
  );

  addTx(
    txs,
    "create treasury proposal",
    await withRetry("create treasury proposal", () =>
      program.methods
        .createProposal(
          "Testnet treasury execution rehearsal",
          "Full Testnet rehearsal for create, commit, reveal, finalize, execute, and treasury verification.",
          new BN(VOTING_SECONDS),
          {
            actionType: { sendSol: {} },
            amountLamports: new BN(TREASURY_TRANSFER_LAMPORTS),
            recipient: recipient.publicKey,
            tokenMint: null,
          },
        )
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          proposerTokenAccount: authorityTokenAccount.address,
          proposer: walletPk,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    ),
  );

  addTx(
    txs,
    "deposit treasury",
    await withRetry("deposit treasury", () =>
      program.methods
        .depositTreasury(new BN(TREASURY_DEPOSIT_LAMPORTS))
        .accounts({
          dao: daoPda,
          treasury: treasuryPda,
          depositor: walletPk,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    ),
  );

  const salt = crypto.randomBytes(32);
  const commitment = computeProposalCommitment(true, salt, walletPk, proposalPda);
  const [voteRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()],
    program.programId,
  );
  const [delegationMarkerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegation"), proposalPda.toBuffer(), walletPk.toBuffer()],
    program.programId,
  );

  addTx(
    txs,
    "commit vote",
    await withRetry("commit vote", () =>
      program.methods
        .commitVote([...commitment], null)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          voterRecord: voteRecordPda,
          delegationMarker: delegationMarkerPda,
          voterTokenAccount: authorityTokenAccount.address,
          voter: walletPk,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    ),
  );

  let proposal = await program.account.proposal.fetch(proposalPda);
  await waitUntil(proposal.votingEnd, "reveal phase");

  addTx(
    txs,
    "reveal vote",
    await withRetry("reveal vote", () =>
      program.methods
        .revealVote(true, [...salt])
        .accounts({
          proposal: proposalPda,
          voterRecord: voteRecordPda,
          revealer: walletPk,
        })
        .rpc(),
    ),
  );

  proposal = await program.account.proposal.fetch(proposalPda);
  await waitUntil(proposal.revealEnd, "finalize phase");

  addTx(
    txs,
    "finalize proposal",
    await withRetry("finalize proposal", () =>
      program.methods
        .finalizeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          finalizer: walletPk,
        })
        .rpc(),
    ),
  );

  proposal = await program.account.proposal.fetch(proposalPda);
  await waitUntil(proposal.executionUnlocksAt, "execution unlock");

  const treasuryBeforeExecute = await provider.connection.getBalance(treasuryPda, "confirmed");
  const recipientBeforeExecute = await provider.connection.getBalance(recipient.publicKey, "confirmed");

  addTx(
    txs,
    "execute proposal",
    await withRetry("execute proposal", () =>
      program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          confidentialPayoutPlan: PublicKey.findProgramAddressSync(
            [Buffer.from("payout-plan"), proposalPda.toBuffer()],
            program.programId,
          )[0],
          executor: walletPk,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    ),
  );

  const finalProposal = await program.account.proposal.fetch(proposalPda);
  const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda, "confirmed");
  const recipientAfterExecute = await provider.connection.getBalance(recipient.publicKey, "confirmed");
  const operatorBalanceAfter = await provider.connection.getBalance(walletPk, "confirmed");

  const treasuryDelta = treasuryBeforeExecute - treasuryAfterExecute;
  const recipientDelta = recipientAfterExecute - recipientBeforeExecute;

  assertInvariant(proposalStatusLabel(finalProposal.status) === "Passed", "proposal status should be Passed");
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
      proposalStatus: proposalStatusLabel(finalProposal.status),
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
  fs.writeFileSync(
    OUTPUT_MD,
    [
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
    ].join("\n"),
  );

  console.log(`\nWrote ${OUTPUT_JSON}`);
  console.log(`Wrote ${OUTPUT_MD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
