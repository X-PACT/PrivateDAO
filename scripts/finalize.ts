// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * finalize.ts
 * Phase 3a: Finalize a proposal after the reveal window closes.
 *
 * Permissionless — anyone can call this. Computes pass/fail based on
 * the DAO's VotingConfig. If passed, starts the execution timelock.
 *
 * After calling this, wait for the timelock to expire, then run:
 *   yarn ts-node scripts/execute.ts --proposal <PDA>
 *
 * Usage: yarn ts-node scripts/finalize.ts --proposal <PDA>
 */
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { formatDuration, parseArgs, formatTimestamp, proposalStatusLabel, solscanTxUrl, workspaceProgram } from "./utils";

async function main() {
  const { proposal: proposalStr } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/finalize.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPda = new PublicKey(proposalStr);
  const proposal    = await program.account["proposal"].fetch(proposalPda);
  const daoPda      = proposal.dao;
  const dao         = await program.account["dao"].fetch(daoPda);
  const [proposalZkPolicyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-policy"), proposalPda.toBuffer()],
    program.programId,
  );
  const proposalZkPolicyInfo = await provider.connection.getAccountInfo(proposalZkPolicyPda, "confirmed");
  const now         = Math.floor(Date.now() / 1000);

  console.log(`\n⚖️  Finalizing: "${proposal.title}"`);
  console.log(`   DAO:      ${dao.daoName}`);
  console.log(`   Commits:  ${proposal.commitCount}  |  Reveals: ${proposal.revealCount}`);

  if (now < proposal.revealEnd.toNumber()) {
    const rem = proposal.revealEnd.toNumber() - now;
    console.error(`\n⏳ Reveal window still open. Closes in ${formatDuration(rem)}`);
    process.exit(1);
  }

  const tx = proposalZkPolicyInfo
    ? await program.methods
        .finalizeZkEnforcedProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          proposalZkPolicy: proposalZkPolicyPda,
          finalizer: provider.wallet.publicKey,
        })
        .rpc()
    : await program.methods
        .finalizeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          finalizer: provider.wallet.publicKey,
        })
        .rpc();

  const final   = await program.account.proposal.fetch(proposalPda);
  const status  = proposalStatusLabel(final.status);
  const passed  = status === "Passed";
  const quorumPct = Math.round(
    (final.revealCount.toNumber() / Math.max(final.commitCount.toNumber(), 1)) * 100
  );

  console.log(`\n${"═".repeat(56)}`);
  console.log(passed ? "   ✅  PROPOSAL PASSED" : "   ❌  PROPOSAL FAILED");
  console.log(`${"═".repeat(56)}`);
  console.log(`   Capital  YES / NO: ${final.yesCapital} / ${final.noCapital}`);
  console.log(`   Community YES / NO: ${final.yesCommunity} / ${final.noCommunity}`);
  console.log(`   Reveal rate: ${quorumPct}% (${final.revealCount}/${final.commitCount})`);
  console.log(`   Transaction: ${tx}`);
  console.log(`   Tx link: ${solscanTxUrl(tx)}`);
  if (proposalZkPolicyInfo) {
    console.log(`   ZK mode: zk_enforced (${proposalZkPolicyPda.toBase58()})`);
  }

  if (passed) {
    const unlockAt = final.executionUnlocksAt.toNumber();
    if (unlockAt > now) {
      const wait = unlockAt - now;
      console.log(`\n   ⏳ Execution timelock: ${formatDuration(wait)} remaining`);
      console.log(`   Unlocks at: ${formatTimestamp(unlockAt)}`);
    } else {
      console.log(`\n   ✅ Timelock expired — ready to execute immediately`);
    }
    console.log(`   Next: yarn ts-node scripts/execute.ts --proposal ${proposalStr}`);
  }
}

main().catch(console.error);
