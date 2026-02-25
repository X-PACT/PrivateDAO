// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * commit-vote.ts
 * Phase 1: Commit a private vote to a proposal.
 *
 * Your vote is sealed in a sha256 hash. Nobody — not validators, not
 * explorers, not the DAO admin — can see how you voted until reveal phase.
 *
 * Your salt is saved to ~/.privatedao/salts/<proposal_pda>.json
 * Keep this file safe. You need it to reveal later.
 *
 * Usage:
 *   yarn ts-node scripts/commit-vote.ts --proposal <PDA> --vote yes
 *   # With a keeper authorized to reveal on your behalf:
 *   yarn ts-node scripts/commit-vote.ts --proposal <PDA> --vote no --keeper <KEEPER_PUBKEY>
 *   # Commit with delegated weight (you are the delegatee):
 *   yarn ts-node scripts/commit-vote.ts --proposal <PDA> --vote yes --delegator <DELEGATOR_PUBKEY>
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { parseArgs, formatTimestamp } from "./utils";

function computeCommitment(vote: boolean, salt: Buffer, voter: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, voter.toBuffer()]))
    .digest();
}

async function main() {
  const {
    proposal: proposalStr,
    vote: voteStr   = "yes",
    keeper: keeperStr,
    delegator: delegatorStr,
  } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/commit-vote.ts --proposal <PDA> --vote yes|no");
    process.exit(1);
  }

  const vote = voteStr.toString().toLowerCase() === "yes";

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;

  const proposalPda = new PublicKey(proposalStr);
  const proposal    = await program.account.proposal.fetch(proposalPda);
  const dao         = await program.account.dao.fetch(proposal.dao);
  const now         = Math.floor(Date.now() / 1000);

  if (now >= proposal.votingEnd.toNumber()) {
    console.error("❌ Voting period has ended.");
    process.exit(1);
  }

  const keeperPk  = keeperStr   ? new PublicKey(keeperStr)   : null;
  const delegatorPk = delegatorStr ? new PublicKey(delegatorStr) : null;

  // Get voter's token account
  const voterAta = await getAssociatedTokenAddress(
    dao.governanceToken,
    provider.wallet.publicKey,
  );

  // Generate random salt
  const salt       = crypto.randomBytes(32);
  const commitment = computeCommitment(vote, salt, provider.wallet.publicKey);

  console.log(`\n🔐 Committing private vote`);
  console.log(`   Proposal: "${proposal.title}"`);
  console.log(`   Vote:     ${vote ? "✅ YES" : "❌ NO"} (hidden until reveal)`);
  console.log(`   Voter:    ${provider.wallet.publicKey.toBase58()}`);
  if (keeperPk) console.log(`   Keeper:   ${keeperPk.toBase58()} (can reveal on your behalf)`);
  if (delegatorPk) console.log(`   Delegator: ${delegatorPk.toBase58()} (combining weights)`);
  console.log(`   Voting closes: ${formatTimestamp(proposal.votingEnd.toNumber())}`);

  const [voterRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalPda.toBuffer(), provider.wallet.publicKey.toBuffer()],
    program.programId,
  );

  let tx: string;

  if (delegatorPk) {
    // Commit with delegated weight (commit_delegated_vote)
    const [delegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalPda.toBuffer(), delegatorPk.toBuffer()],
      program.programId,
    );

    tx = await program.methods
      .commitDelegatedVote([...commitment], keeperPk)
      .accounts({
        dao:                    proposal.dao,
        proposal:               proposalPda,
        delegation:             delegationPda,
        voterRecord:            voterRecordPda,
        delegateeTokenAccount:  voterAta,
        delegatee:              provider.wallet.publicKey,
        systemProgram:          SystemProgram.programId,
      })
      .rpc();
  } else {
    // Standard commit
    tx = await program.methods
      .commitVote([...commitment], keeperPk)
      .accounts({
        dao:                proposal.dao,
        proposal:           proposalPda,
        voterRecord:        voterRecordPda,
        voterTokenAccount:  voterAta,
        voter:              provider.wallet.publicKey,
        tokenProgram:       TOKEN_PROGRAM_ID,
        systemProgram:      SystemProgram.programId,
      })
      .rpc();
  }

  // Save salt to disk — required for reveal
  const saltDir  = path.join(os.homedir(), ".privatedao", "salts");
  const saltFile = path.join(saltDir, `${proposalStr}.json`);
  fs.mkdirSync(saltDir, { recursive: true });
  fs.writeFileSync(saltFile, JSON.stringify({
    proposal:    proposalStr,
    voter:       provider.wallet.publicKey.toBase58(),
    vote,
    salt:        salt.toString("hex"),
    commitment:  commitment.toString("hex"),
    timestamp:   new Date().toISOString(),
  }, null, 2));

  const updated = await program.account.proposal.fetch(proposalPda);

  console.log(`\n✅ Vote committed!`);
  console.log(`   Transaction:  ${tx}`);
  console.log(`   Salt saved:   ${saltFile}`);
  console.log(`   Total commits: ${updated.commitCount}`);
  console.log(`   Tally visible: NO — ${updated.yesCapital} YES / ${updated.noCapital} NO (all zeros until reveal ✓)`);
  console.log(`\n   Reveal after: ${formatTimestamp(updated.votingEnd.toNumber())}`);
  console.log(`   yarn ts-node scripts/reveal-vote.ts --proposal ${proposalStr}`);
  console.log(`\n   ⚠️  Keep your salt file safe. Without it you cannot reveal!`);
  console.log(`   Backup: ${saltFile}`);
}

main().catch(console.error);
