// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { deriveMagicBlockPrivatePaymentCorridorPda, parseArgs, workspaceProgram } from "./utils";

async function main() {
  const { proposal } = parseArgs();
  if (!proposal) {
    console.error("Usage: yarn ts-node scripts/inspect-magicblock-corridor.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const proposalPk = new PublicKey(String(proposal));
  const corridorPk = deriveMagicBlockPrivatePaymentCorridorPda(proposalPk, program.programId);
  const corridor = await program.account.magicBlockPrivatePaymentCorridor.fetchNullable(corridorPk);

  if (!corridor) {
    console.log(`No MagicBlock corridor found for proposal ${proposalPk.toBase58()}`);
    return;
  }

  console.log(JSON.stringify({
    pubkey: corridorPk.toBase58(),
    dao: corridor.dao.toBase58(),
    proposal: corridor.proposal.toBase58(),
    payoutPlan: corridor.payoutPlan.toBase58(),
    configuredBy: corridor.configuredBy.toBase58(),
    settledBy: corridor.settledBy ? corridor.settledBy.toBase58() : null,
    apiBaseUrl: corridor.apiBaseUrl,
    cluster: corridor.cluster,
    ownerWallet: corridor.ownerWallet.toBase58(),
    settlementWallet: corridor.settlementWallet.toBase58(),
    tokenMint: corridor.tokenMint.toBase58(),
    validator: corridor.validator ? corridor.validator.toBase58() : null,
    transferQueue: corridor.transferQueue ? corridor.transferQueue.toBase58() : null,
    routeHash: Buffer.from(corridor.routeHash).toString("hex"),
    depositAmount: corridor.depositAmount.toString(),
    privateTransferAmount: corridor.privateTransferAmount.toString(),
    withdrawalAmount: corridor.withdrawalAmount.toString(),
    depositTxSignature: corridor.depositTxSignature,
    transferTxSignature: corridor.transferTxSignature,
    withdrawTxSignature: corridor.withdrawTxSignature,
    status: Object.keys(corridor.status)[0],
    configuredAt: corridor.configuredAt.toString(),
    settledAt: corridor.settledAt.toString(),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
