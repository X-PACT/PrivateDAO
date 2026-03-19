// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * reveal-vote.ts
 * Phase 2: Reveal your committed vote after voting ends.
 *
 * Reads your saved salt from ~/.privatedao/salts/<proposal>-<voter>.json,
 * recomputes the commitment, and proves it to the chain.
 * You receive 0.001 SOL rebate for revealing.
 *
 * You can also reveal on behalf of another voter if they authorized
 * you as their keeper when committing.
 *
 * Usage:
 *   yarn ts-node scripts/reveal-vote.ts --proposal <PDA>
 *   yarn ts-node scripts/reveal-vote.ts --proposal <PDA> --voter <VOTER_PUBKEY>
 */
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import { formatDuration, parseArgs, formatTimestamp, legacySaltPath, saltPath, solscanTxUrl, workspaceProgram } from "./utils";

async function main() {
  const { proposal: proposalStr, voter: voterStr } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/reveal-vote.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPda = new PublicKey(proposalStr);

  // The voter whose record we're revealing — default is yourself.
  // When you're a keeper revealing on behalf of someone, pass --voter <their_pubkey>
  const voterPubkey = voterStr
    ? new PublicKey(voterStr)
    : provider.wallet.publicKey;

  const canonicalSaltFile = saltPath(proposalStr, voterPubkey);
  const fallbackSaltFile = legacySaltPath(proposalStr);
  const selectedSaltFile = fs.existsSync(canonicalSaltFile)
    ? canonicalSaltFile
    : fallbackSaltFile;

  if (!fs.existsSync(selectedSaltFile)) {
    console.error(`\n❌ Salt file not found: ${canonicalSaltFile}`);
    if (canonicalSaltFile !== fallbackSaltFile) {
      console.error(`   Legacy fallback checked: ${fallbackSaltFile}`);
    }
    console.error(`   This file is saved automatically when you commit a vote.`);
    console.error(`   If you are a keeper, you need the voter's salt to reveal for them.`);
    process.exit(1);
  }

  const saved = JSON.parse(fs.readFileSync(selectedSaltFile, "utf-8"));
  if (saved.voter && saved.voter !== voterPubkey.toBase58()) {
    console.error(`\n❌ Salt file voter mismatch.`);
    console.error(`   Expected voter: ${voterPubkey.toBase58()}`);
    console.error(`   Salt file has:  ${saved.voter}`);
    console.error(`   Use the voter-specific salt file or recommit from the intended wallet.`);
    process.exit(1);
  }
  const { vote }  = saved;
  const salt      = Buffer.from(saved.salt, "hex");

  const proposal  = await program.account["proposal"].fetch(proposalPda);
  const now       = Math.floor(Date.now() / 1000);

  console.log(`\n🔓 Revealing vote for: "${proposal.title}"`);
  console.log(`   Voter:    ${voterPubkey.toBase58()}`);
  console.log(`   Revealer: ${provider.wallet.publicKey.toBase58()}`);
  console.log(`   Vote:     ${vote ? "✅ YES" : "❌ NO"} (from saved salt)`);

  if (now < proposal.votingEnd.toNumber()) {
    const rem = proposal.votingEnd.toNumber() - now;
    console.error(`\n❌ Voting still open. Reveal starts in ${formatDuration(rem)}`);
    process.exit(1);
  }

  if (now >= proposal.revealEnd.toNumber()) {
    console.error(`\n❌ Reveal window closed. Vote cannot be counted.`);
    process.exit(1);
  }

  const revealRem = proposal.revealEnd.toNumber() - now;
  console.log(`\n   Reveal window closes in: ${formatDuration(revealRem)}`);
  console.log(`   (${formatTimestamp(proposal.revealEnd.toNumber())})`);

  const [voterRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), proposalPda.toBuffer(), voterPubkey.toBuffer()],
    program.programId,
  );

  const balanceBefore = await provider.connection.getBalance(provider.wallet.publicKey);

  const tx = await program.methods
    .revealVote(vote, [...salt])
    .accounts({
      proposal:    proposalPda,
      voterRecord: voterRecordPda,
      revealer:    provider.wallet.publicKey, // voter or keeper — both valid
    })
    .rpc();

  const balanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);
  const rebate       = (balanceAfter - balanceBefore + 5000) / 1e9; // +5000 for tx fee approx

  const updated = await program.account["proposal"].fetch(proposalPda);

  console.log(`\n✅ Vote revealed!`);
  console.log(`   Transaction:   ${tx}`);
  console.log(`   Tx link:       ${solscanTxUrl(tx)}`);
  console.log(`   Salt file:     ${selectedSaltFile}`);
  console.log(`   SOL rebate:    +0.001 SOL configured (revealer receives rebate when paid)`);
  console.log(`   Reveals so far: ${updated.revealCount} / ${updated.commitCount}`);
  console.log(`   Capital  YES/NO: ${updated.yesCapital} / ${updated.noCapital}`);
  console.log(`   Community YES/NO: ${updated.yesCommunity} / ${updated.noCommunity}`);
  console.log(`\n   Finalize after: ${formatTimestamp(updated.revealEnd.toNumber())}`);
  console.log(`   yarn ts-node scripts/finalize.ts --proposal ${proposalStr}`);
}

main().catch(console.error);
