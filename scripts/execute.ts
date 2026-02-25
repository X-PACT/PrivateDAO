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
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { parseArgs, formatSol, formatTimestamp } from "./utils";

async function main() {
  const { proposal: proposalStr } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/execute.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;

  const proposalPda = new PublicKey(proposalStr);
  const proposal    = await program.account.proposal.fetch(proposalPda);
  const daoPda      = proposal.dao;
  const dao         = await program.account.dao.fetch(daoPda);
  const now         = Math.floor(Date.now() / 1000);
  const status      = JSON.stringify(proposal.status);

  console.log(`\n💸  Executing: "${proposal.title}"`);
  console.log(`    DAO:    ${dao.daoName}`);
  console.log(`    Status: ${status}`);

  if (!status.includes("passed") && !status.includes("Passed")) {
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
    console.error(`   Wait: ${Math.floor(wait/3600)}h ${Math.floor((wait%3600)/60)}m ${wait%60}s`);
    process.exit(1);
  }

  // Derive treasury PDA
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), daoPda.toBuffer()],
    program.programId,
  );

  // Figure out account values for the treasury action
  const dummy = Keypair.generate().publicKey;
  let treasuryRecipient      = dummy;
  let treasuryTokenAccount   = dummy;
  let recipientTokenAccount  = dummy;

  if (proposal.treasuryAction) {
    treasuryRecipient = proposal.treasuryAction.recipient;
    const { tokenMint } = proposal.treasuryAction;
    if (tokenMint) {
      treasuryTokenAccount  = await getAssociatedTokenAddress(tokenMint, treasuryPda, true);
      recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, treasuryRecipient);
    }

    const amt = proposal.treasuryAction.amountLamports.toNumber();
    const type = Object.keys(proposal.treasuryAction.actionType)[0];
    console.log(`\n    Action: ${type}`);
    if (type === "sendSol") {
      console.log(`    Amount: ${formatSol(amt)}`);
    } else if (type === "sendToken") {
      console.log(`    Tokens: ${amt / 1e6} (raw: ${amt})`);
    }
    console.log(`    To: ${treasuryRecipient.toBase58()}`);
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
      tokenProgram:           TOKEN_PROGRAM_ID,
      systemProgram:          SystemProgram.programId,
    })
    .rpc();

  console.log(`\n${"═".repeat(56)}`);
  console.log("    ✅  TREASURY ACTION EXECUTED");
  console.log(`${"═".repeat(56)}`);
  console.log(`    Transaction: ${tx}`);
  console.log(`    Explorer:    https://solscan.io/tx/${tx}?cluster=devnet`);
}

main().catch(console.error);
