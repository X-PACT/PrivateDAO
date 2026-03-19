// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * list-proposals.ts
 * Read live proposal accounts for the current program and print a compact operator view.
 *
 * Usage:
 *   yarn ts-node scripts/list-proposals.ts
 *   yarn ts-node scripts/list-proposals.ts --limit 20
 *   yarn ts-node scripts/list-proposals.ts --dao <DAO_PDA>
 */
import * as anchor from "@coral-xyz/anchor";
import {
  formatDuration,
  formatTimestamp,
  parseArgs,
  proposalPhaseLabel,
  proposalStatusLabel,
  solscanAccountUrl,
  workspaceProgram,
} from "./utils";

type ProposalAccountEntry = {
  publicKey: { toBase58(): string };
  account: any;
};

async function main() {
  const { dao: daoFilter, limit = 12 } = parseArgs();

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const accounts = (await program.account.proposal.all()) as ProposalAccountEntry[];
  const now = Math.floor(Date.now() / 1000);
  const filtered = accounts
    .filter(({ account }) => !daoFilter || account.dao.toBase58() === String(daoFilter))
    .sort((a, b) => b.account.proposalId.toNumber() - a.account.proposalId.toNumber())
    .slice(0, Number(limit));

  console.log(`\n📡 PrivateDAO live proposals`);
  console.log(`   Program:  ${program.programId.toBase58()}`);
  console.log(`   Cluster:  devnet`);
  if (daoFilter) console.log(`   DAO:      ${daoFilter}`);
  console.log(`   Loaded:   ${filtered.length}`);

  if (filtered.length === 0) {
    console.log(`\n   No proposal accounts matched the current filter.`);
    return;
  }

  for (const { publicKey, account } of filtered) {
    const status = proposalStatusLabel(account.status);
    const phase = proposalPhaseLabel(account, now);
    const timing =
      phase === "Commit"
        ? `commit closes in ${formatDuration(account.votingEnd.toNumber() - now)}`
        : phase === "Reveal"
          ? `reveal closes in ${formatDuration(account.revealEnd.toNumber() - now)}`
          : phase === "Timelocked"
            ? `execute in ${formatDuration(account.executionUnlocksAt.toNumber() - now)}`
            : phase === "Executable"
              ? "ready to execute"
              : `status ${status}`;

    console.log(`\n${"═".repeat(72)}`);
    console.log(`PROP-${String(account.proposalId.toNumber()).padStart(3, "0")}  ${phase}  ${status}`);
    console.log(`${account.title}`);
    console.log(`Proposal PDA: ${publicKey.toBase58()}`);
    console.log(`DAO:          ${account.dao.toBase58()}`);
    console.log(`Commits:      ${account.commitCount.toString()}   Reveals: ${account.revealCount.toString()}`);
    console.log(`Capital:      YES ${account.yesCapital.toString()} / NO ${account.noCapital.toString()}`);
    console.log(`Community:    YES ${account.yesCommunity.toString()} / NO ${account.noCommunity.toString()}`);
    console.log(`Voting end:   ${formatTimestamp(account.votingEnd.toNumber())}`);
    console.log(`Reveal end:   ${formatTimestamp(account.revealEnd.toNumber())}`);
    console.log(`Execution:    ${formatTimestamp(account.executionUnlocksAt.toNumber())}`);
    console.log(`Next:         ${timing}`);
    console.log(`Explorer:     ${solscanAccountUrl(publicKey.toBase58())}`);
  }
}

main().catch(console.error);
