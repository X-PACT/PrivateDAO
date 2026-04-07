// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  deriveDaoSecurityPolicyPda,
  deriveProposalExecutionPolicySnapshotPda,
  parseArgs,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

async function main() {
  const { dao, proposal } = parseArgs();
  if (!dao || !proposal) {
    console.error("Usage: yarn ts-node scripts/snapshot-proposal-policy-v2.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const policyPk = deriveDaoSecurityPolicyPda(daoPk, program.programId);
  const snapshotPk = deriveProposalExecutionPolicySnapshotPda(proposalPk, program.programId);

  const tx = await program.methods
    .snapshotProposalExecutionPolicy()
    .accounts({
      dao: daoPk,
      daoSecurityPolicy: policyPk,
      proposal: proposalPk,
      proposalExecutionPolicySnapshot: snapshotPk,
      operator: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Snapshotted proposal policy: ${snapshotPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
