// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  deriveConfidentialPayoutPlanPda,
  deriveMagicBlockPrivatePaymentCorridorPda,
  parseArgs,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";
import { magicBlockApiBase, magicBlockCluster, magicBlockRouteHash } from "./lib/magicblock-payments";

async function main() {
  const {
    dao,
    proposal,
    ownerWallet,
    payoutMint,
    depositAmount,
    privateTransferAmount,
    withdrawalAmount,
    apiBase,
    cluster,
    validator,
  } = parseArgs();

  if (!dao || !proposal || !ownerWallet || !payoutMint || !depositAmount || !privateTransferAmount || !withdrawalAmount) {
    console.error(
      "Usage: yarn ts-node scripts/configure-magicblock-corridor.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --owner-wallet <PUBKEY> --payout-mint <MINT> --deposit-amount <RAW> --private-transfer-amount <RAW> --withdrawal-amount <RAW> [--validator <PUBKEY>] [--api-base <URL>] [--cluster devnet]",
    );
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const payoutPlanPk = deriveConfidentialPayoutPlanPda(proposalPk, program.programId);
  const corridorPk = deriveMagicBlockPrivatePaymentCorridorPda(proposalPk, program.programId);
  const ownerPk = new PublicKey(String(ownerWallet));
  const mintPk = new PublicKey(String(payoutMint));
  const validatorPk = validator ? new PublicKey(String(validator)) : null;
  const resolvedApiBase = String(apiBase || magicBlockApiBase()).trim();
  const resolvedCluster = String(cluster || magicBlockCluster()).trim();
  const routeHash = magicBlockRouteHash([
    proposalPk,
    ownerPk,
    mintPk,
    depositAmount,
    privateTransferAmount,
    withdrawalAmount,
    resolvedCluster,
    resolvedApiBase,
  ]);

  const tx = await program.methods
    .configureMagicblockPrivatePaymentCorridor(
      resolvedApiBase,
      resolvedCluster,
      ownerPk,
      validatorPk,
      routeHash,
      new anchor.BN(Number(depositAmount)),
      new anchor.BN(Number(privateTransferAmount)),
      new anchor.BN(Number(withdrawalAmount)),
    )
    .accounts({
      dao: daoPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      magicblockPrivatePaymentCorridor: corridorPk,
      operator: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Configured MagicBlock corridor: ${corridorPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
