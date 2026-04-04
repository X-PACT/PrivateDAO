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
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { formatDuration, parseArgs, formatSol, formatTimestamp, proposalStatusLabel, resolveTokenProgramForMint, solscanTxUrl, workspaceProgram } from "./utils";

async function main() {
  const { proposal: proposalStr } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/execute.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPda = new PublicKey(proposalStr);
  const proposal    = await program.account["proposal"].fetch(proposalPda);
  const daoPda      = proposal.dao;
  const dao         = await program.account["dao"].fetch(daoPda);
  const governanceTokenProgram = await resolveTokenProgramForMint(provider.connection, dao.governanceToken);
  const now         = Math.floor(Date.now() / 1000);
  const status      = proposalStatusLabel(proposal.status);

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
    console.error(`   Unlocks at: ${formatTimestamp(unlockAt)}`);
    console.error(`   Wait: ${formatDuration(wait)}`);
    process.exit(1);
  }

  // Derive treasury PDA
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), daoPda.toBuffer()],
    program.programId,
  );

  // Figure out account values for the treasury action
  let treasuryRecipient      = treasuryPda;
  let treasuryTokenAccount   = treasuryPda;
  let recipientTokenAccount  = treasuryPda;
  let tokenProgram           = governanceTokenProgram;
  let actionType = "none";

  if (proposal.treasuryAction) {
    actionType = Object.keys(proposal.treasuryAction.actionType)[0];
    treasuryRecipient = proposal.treasuryAction.recipient;
    const { tokenMint } = proposal.treasuryAction;
    if (tokenMint) {
      tokenProgram = await resolveTokenProgramForMint(provider.connection, tokenMint);
      treasuryTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryPda, true, tokenProgram);
      recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryRecipient, false, tokenProgram);
    }

    const amt = proposal.treasuryAction.amountLamports.toNumber();
    console.log(`\n    Action: ${actionType}`);
    if (actionType === "sendSol") {
      console.log(`    Amount: ${formatSol(amt)}`);
    } else if (actionType === "sendToken") {
      console.log(`    Tokens: ${amt / 1e6} (raw: ${amt})`);
      console.log(`    Treasury ATA: ${treasuryTokenAccount.toBase58()}`);
      console.log(`    Recipient ATA: ${recipientTokenAccount.toBase58()}`);
    }
    console.log(`    To: ${treasuryRecipient.toBase58()}`);
  } else {
    console.log(`\n    Action: none`);
    console.log(`    This proposal only flips on-chain execution state and emits the execution event path.`);
  }

  console.log(`\n    Sending transaction...`);

  const tx = await program.methods
    .executeProposal()
    .accounts({
      dao:                    daoPda,
      proposal:               proposalPda,
      treasury:               treasuryPda,
      treasuryRecipient,
      treasuryTokenAccount,
      recipientTokenAccount,
      executor:               provider.wallet.publicKey,
      tokenProgram,
      systemProgram:          SystemProgram.programId,
    })
    .rpc();

  console.log(`\n${"═".repeat(56)}`);
  console.log("    ✅  TREASURY ACTION EXECUTED");
  console.log(`${"═".repeat(56)}`);
  console.log(`    Transaction: ${tx}`);
  console.log(`    Action type: ${actionType}`);
  console.log(`    Explorer:    ${solscanTxUrl(tx)}`);
}

main().catch(console.error);
