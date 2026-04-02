// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * live-devnet-proof.ts
 * Runs a full live governance cycle against devnet in one process:
 * create DAO -> mint voting power -> deposit treasury -> create proposal ->
 * commit -> reveal -> finalize -> execute
 */
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import * as crypto from "crypto";
import {
  formatSol,
  formatTimestamp,
  parseArgs,
  proposalStatusLabel,
  solscanAccountUrl,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

function computeCommitment(vote: boolean, salt: Buffer, voter: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, voter.toBuffer()]))
    .digest();
}

async function waitUntil(targetUnix: number, label: string) {
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
  const {
    name = `ExecProof${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    quorum = 51,
    revealWindow = 5,
    delay = 5,
    duration = 30,
    deposit = 0.2,
    treasuryAmount = 0.05,
    vote: voteArg = "yes",
    mintAmount = 1000,
    recipient,
  } = parseArgs();

  const vote = String(voteArg).toLowerCase() !== "no";
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const payer = (provider.wallet as anchor.Wallet).payer;
  const walletPk = provider.wallet.publicKey;
  const recipientPk = recipient ? new PublicKey(String(recipient)) : walletPk;

  console.log(`\n=== PrivateDAO live devnet proof ===`);
  console.log(`Wallet:    ${walletPk.toBase58()}`);
  console.log(`Program:   ${program.programId.toBase58()}`);
  console.log(`Recipient: ${recipientPk.toBase58()}`);

  const mint = await createMint(
    provider.connection,
    payer,
    walletPk,
    null,
    6,
  );

  const [daoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), walletPk.toBuffer(), Buffer.from(String(name))],
    program.programId,
  );
  const createDaoTx = await program.methods
    .initializeDao(
      String(name),
      Number(quorum),
      new BN(0),
      new BN(Number(revealWindow)),
      new BN(Number(delay)),
      { tokenWeighted: {} },
    )
    .accounts({
      dao: daoPda,
      governanceToken: mint,
      authority: walletPk,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const voterAta = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    payer,
    mint,
    walletPk,
  );
  const mintTx = await mintTo(
    provider.connection,
    payer,
    mint,
    voterAta.address,
    payer,
    BigInt(Number(mintAmount)) * 1_000_000n,
  );

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), daoPda.toBuffer()],
    program.programId,
  );
  const treasuryBeforeDeposit = await provider.connection.getBalance(treasuryPda);
  const depositLamports = Math.floor(Number(deposit) * LAMPORTS_PER_SOL);
  const depositTx = await program.methods
    .depositTreasury(new BN(depositLamports))
    .accounts({
      dao: daoPda,
      treasury: treasuryPda,
      depositor: walletPk,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const dao = await program.account.dao.fetch(daoPda);
  const [proposalPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      daoPda.toBuffer(),
      dao.proposalCount.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );
  const proposalTx = await program.methods
    .createProposal(
      "Execute flow proof",
      "Live devnet proof of create, commit, reveal, finalize, and execute from the repository itself.",
      new BN(Number(duration)),
      {
        actionType: { sendSol: {} },
        amountLamports: new BN(Math.floor(Number(treasuryAmount) * LAMPORTS_PER_SOL)),
        recipient: recipientPk,
        tokenMint: null,
      },
    )
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      proposerTokenAccount: voterAta.address,
      proposer: walletPk,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const salt = crypto.randomBytes(32);
  const commitment = computeCommitment(vote, salt, walletPk);
  const [voterRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalPda.toBuffer(), walletPk.toBuffer()],
    program.programId,
  );
  const commitTx = await program.methods
    .commitVote([...commitment], null)
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      voterRecord: voterRecordPda,
      voterTokenAccount: voterAta.address,
      voter: walletPk,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
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
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const finalProposal = await program.account.proposal.fetch(proposalPda);
  const treasuryAfterExecute = await provider.connection.getBalance(treasuryPda);
  const recipientAfter = await provider.connection.getBalance(recipientPk);

  console.log(`\n=== Live proof complete ===`);
  console.log(`DAO:             ${daoPda.toBase58()}`);
  console.log(`DAO explorer:    ${solscanAccountUrl(daoPda.toBase58())}`);
  console.log(`Mint:            ${mint.toBase58()}`);
  console.log(`Mint explorer:   ${solscanAccountUrl(mint.toBase58())}`);
  console.log(`Treasury:        ${treasuryPda.toBase58()}`);
  console.log(`Treasury explorer: ${solscanAccountUrl(treasuryPda.toBase58())}`);
  console.log(`Proposal:        ${proposalPda.toBase58()}`);
  console.log(`Proposal explorer: ${solscanAccountUrl(proposalPda.toBase58())}`);
  console.log(`\nTransactions`);
  console.log(`create-dao:      ${createDaoTx}`);
  console.log(`                 ${solscanTxUrl(createDaoTx)}`);
  console.log(`mint-voting:     ${mintTx}`);
  console.log(`                 ${solscanTxUrl(mintTx)}`);
  console.log(`deposit:         ${depositTx}`);
  console.log(`                 ${solscanTxUrl(depositTx)}`);
  console.log(`create-proposal: ${proposalTx}`);
  console.log(`                 ${solscanTxUrl(proposalTx)}`);
  console.log(`commit:          ${commitTx}`);
  console.log(`                 ${solscanTxUrl(commitTx)}`);
  console.log(`reveal:          ${revealTx}`);
  console.log(`                 ${solscanTxUrl(revealTx)}`);
  console.log(`finalize:        ${finalizeTx}`);
  console.log(`                 ${solscanTxUrl(finalizeTx)}`);
  console.log(`execute:         ${executeTx}`);
  console.log(`                 ${solscanTxUrl(executeTx)}`);
  console.log(`\nInvariants`);
  console.log(`status:          ${proposalStatusLabel(finalProposal.status)}`);
  console.log(`isExecuted:      ${finalProposal.isExecuted}`);
  console.log(`yesCapital:      ${finalProposal.yesCapital.toString()}`);
  console.log(`noCapital:       ${finalProposal.noCapital.toString()}`);
  console.log(`revealCount:     ${finalProposal.revealCount.toString()} / ${finalProposal.commitCount.toString()}`);
  console.log(`votingEnd:       ${formatTimestamp(finalProposal.votingEnd.toNumber())}`);
  console.log(`revealEnd:       ${formatTimestamp(finalProposal.revealEnd.toNumber())}`);
  console.log(`executionUnlock: ${formatTimestamp(finalProposal.executionUnlocksAt.toNumber())}`);
  console.log(`treasury before deposit: ${formatSol(treasuryBeforeDeposit)}`);
  console.log(`treasury before execute: ${formatSol(treasuryBeforeExecute)}`);
  console.log(`treasury after execute:  ${formatSol(treasuryAfterExecute)}`);
  console.log(`recipient before: ${formatSol(recipientBefore)}`);
  console.log(`recipient after:  ${formatSol(recipientAfter)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
