/**
 * delegate-vote.ts
 * Delegate your token weight to another address for a specific proposal.
 *
 * The delegatee will commit and reveal using your combined weight.
 * The vote stays private — neither you nor anyone else sees the tally
 * until after reveal_end.
 *
 * Usage:
 *   yarn ts-node scripts/delegate-vote.ts \
 *     --proposal <PROPOSAL_PDA> \
 *     --delegatee <DELEGATEE_PUBKEY>
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey, SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import { parseArgs, formatTimestamp } from "./utils";

async function main() {
  const { proposal: proposalStr, delegatee: delegateeStr } = parseArgs();

  if (!proposalStr || !delegateeStr) {
    console.error("Usage: yarn ts-node scripts/delegate-vote.ts --proposal <PDA> --delegatee <PUBKEY>");
    process.exit(1);
  }

  const provider   = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program    = anchor.workspace.PrivateDao as Program<any>;

  const proposalPda  = new PublicKey(proposalStr);
  const delegateePk  = new PublicKey(delegateeStr);
  const proposal     = await program.account.proposal.fetch(proposalPda);
  const dao          = await program.account.dao.fetch(proposal.dao);
  const now          = Math.floor(Date.now() / 1000);

  if (now >= proposal.votingEnd.toNumber()) {
    console.error("❌ Voting period is over. Cannot delegate.");
    process.exit(1);
  }

  // Get delegator's token account
  const delegatorAta = await getAssociatedTokenAddress(
    dao.governanceToken,
    provider.wallet.publicKey,
  );
  const ataInfo = await getAccount(provider.connection, delegatorAta);
  const balance = Number(ataInfo.amount) / 1_000_000;

  console.log(`\n🤝 Delegating vote`);
  console.log(`   Proposal:  "${proposal.title}"`);
  console.log(`   Delegator: ${provider.wallet.publicKey.toBase58()}`);
  console.log(`   Delegatee: ${delegateePk.toBase58()}`);
  console.log(`   Your balance: ${balance.toLocaleString()} tokens`);
  console.log(`   Voting ends: ${formatTimestamp(proposal.votingEnd.toNumber())}`);

  const [delegationPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegation"), proposalPda.toBuffer(), provider.wallet.publicKey.toBuffer()],
    program.programId,
  );

  const tx = await program.methods
    .delegateVote(delegateePk)
    .accounts({
      dao:                   proposal.dao,
      proposal:              proposalPda,
      delegation:            delegationPda,
      delegatorTokenAccount: delegatorAta,
      delegator:             provider.wallet.publicKey,
      systemProgram:         SystemProgram.programId,
    })
    .rpc();

  console.log(`\n✅ Delegation created!`);
  console.log(`   Delegation PDA: ${delegationPda.toBase58()}`);
  console.log(`   Transaction:    ${tx}`);
  console.log(`\n   The delegatee should now call:`);
  console.log(`   yarn ts-node scripts/commit-vote.ts --proposal ${proposalStr} --vote yes --delegator ${provider.wallet.publicKey.toBase58()}`);
}

main().catch(console.error);
