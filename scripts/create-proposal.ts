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
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { parseArgs } from "./utils";

async function main() {
  const {
    dao: daoPdaStr,
    title = "Allocate 5 SOL for marketing",
    description = "Proposal to allocate 5 SOL from treasury to fund marketing for Q1.",
    duration = 86400, // 24h default
    treasuryRecipient,
    treasuryAmount,
  } = parseArgs();

  if (!daoPdaStr) {
    console.error("Error: --dao <DAO_PDA> is required");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;

  const daoPda = new PublicKey(String(daoPdaStr));
  const dao    = await program.account.dao.fetch(daoPda);

  console.log(`\n📋 Creating proposal for DAO: ${dao.daoName}`);
  console.log(`   Title:    "${title}"`);
  console.log(`   Duration: ${duration}s (${(Number(duration) / 3600).toFixed(1)}h voting)`);
  console.log(`   Reveal:   ${dao.revealWindowSeconds}s (${(dao.revealWindowSeconds / 3600).toFixed(1)}h)`);

  const [proposalPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      daoPda.toBuffer(),
      dao.proposalCount.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  // Optional: attach a treasury action (SOL transfer on pass)
  let treasuryAction = null;
  if (treasuryRecipient && treasuryAmount) {
    treasuryAction = {
      actionType: { sendSol: {} },
      amountLamports: new anchor.BN(parseFloat(String(treasuryAmount)) * LAMPORTS_PER_SOL),
      recipient: new PublicKey(String(treasuryRecipient)),
      tokenMint: null,
    };
    console.log(`\n   💰 Treasury action: send ${treasuryAmount} SOL to ${treasuryRecipient} if passed`);
  }

  const tx = await program.methods
    .createProposal(String(title), String(description), new anchor.BN(Number(duration)), treasuryAction)
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      authority: provider.wallet.publicKey,
      proposer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const proposal = await program.account.proposal.fetch(proposalPda);

  console.log(`\n✅ Proposal created!`);
  console.log(`   Proposal address: ${proposalPda.toBase58()}`);
  console.log(`   Proposal ID:      ${proposal.proposalId.toString()}`);
  console.log(`   Transaction:      ${tx}`);
  console.log(`   Voting ends:  ${new Date(proposal.votingEnd.toNumber() * 1000).toISOString()}`);
  console.log(`   Reveal ends:  ${new Date(proposal.revealEnd.toNumber() * 1000).toISOString()}`);
  console.log(`\n   Save this:`);
  console.log(`   PROPOSAL_PDA=${proposalPda.toBase58()}`);
}

main().catch(console.error);
