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
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { formatSol, formatTimestamp, parseArgs, solscanAccountUrl, solscanTxUrl, workspaceProgram } from "./utils";

async function main() {
  const {
    dao: daoPdaStr,
    title = "Allocate 5 SOL for marketing",
    description = "Proposal to allocate 5 SOL from treasury to fund marketing for Q1.",
    duration = 86400, // 24h default
    treasuryType = "sol",
    treasuryRecipient,
    treasuryAmount,
    treasuryMint,
  } = parseArgs();

  if (!daoPdaStr) {
    console.error("Error: --dao <DAO_PDA> is required");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const daoPda = new PublicKey(String(daoPdaStr));
  const dao    = await program.account.dao.fetch(daoPda);
  const durationSeconds = Number(duration);
  const proposerTokenAccount = getAssociatedTokenAddressSync(
    dao.governanceToken,
    provider.wallet.publicKey,
    false,
    TOKEN_PROGRAM_ID,
  );

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    console.error("Error: --duration must be a positive number of seconds");
    process.exit(1);
  }

  console.log(`\n📋 Creating proposal for DAO: ${dao.daoName}`);
  console.log(`   Title:    "${title}"`);
  console.log(`   Duration: ${durationSeconds}s (${(durationSeconds / 3600).toFixed(1)}h voting)`);
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
  if ((treasuryRecipient && !treasuryAmount) || (!treasuryRecipient && treasuryAmount) || treasuryMint) {
    if (!treasuryRecipient || treasuryAmount === undefined) {
      console.error("Error: treasury actions require both --treasury-recipient and --treasury-amount");
      process.exit(1);
    }
  }

  if (treasuryRecipient && treasuryAmount !== undefined) {
    const treasuryRecipientPk = new PublicKey(String(treasuryRecipient));
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
        tokenMint: new PublicKey(String(treasuryMint)),
      };
      console.log(`\n   💰 Treasury action: send ${rawAmount} raw token units to ${treasuryRecipientPk.toBase58()} if passed`);
      console.log(`   Token mint: ${String(treasuryMint)}`);
    } else if (normalizedType === "sol") {
      if (treasuryMint) {
        console.error("Error: do not pass --treasury-mint for SOL treasury actions");
        process.exit(1);
      }
      const lamports = Math.floor(rawAmount * LAMPORTS_PER_SOL);
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
      console.log(`\n   💰 Treasury action: send ${formatSol(lamports)} to ${treasuryRecipientPk.toBase58()} if passed`);
    } else {
      console.error("Error: --treasury-type must be either 'sol' or 'token'");
      process.exit(1);
    }
  }

  const tx = await program.methods
    .createProposal(String(title), String(description), new anchor.BN(durationSeconds), treasuryAction)
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      proposerTokenAccount,
      proposer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const proposal = await program.account["proposal"].fetch(proposalPda);

  console.log(`\n✅ Proposal created!`);
  console.log(`   Proposal address: ${proposalPda.toBase58()}`);
  console.log(`   Proposal ID:      ${proposal.proposalId.toString()}`);
  console.log(`   Transaction:      ${tx}`);
  console.log(`   Tx link:          ${solscanTxUrl(tx)}`);
  console.log(`   Proposer token:   ${proposerTokenAccount.toBase58()}`);
  console.log(`   Voting ends:      ${formatTimestamp(proposal.votingEnd.toNumber())}`);
  console.log(`   Reveal ends:      ${formatTimestamp(proposal.revealEnd.toNumber())}`);
  console.log(`   Proposal explorer:${" "}${solscanAccountUrl(proposalPda.toBase58())}`);
  console.log(`\n   Save this:`);
  console.log(`   PROPOSAL_PDA=${proposalPda.toBase58()}`);
  console.log(`   Next: yarn commit -- --proposal ${proposalPda.toBase58()} --vote yes`);
}

main().catch(console.error);
