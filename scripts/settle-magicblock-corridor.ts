// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  deriveConfidentialPayoutPlanPda,
  deriveMagicBlockPrivatePaymentCorridorPda,
  parseArgs,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

async function main() {
  const {
    dao,
    proposal,
    validator,
    transferQueue,
    depositTxSignature = "",
    transferTxSignature,
    withdrawTxSignature = "",
  } = parseArgs();

  if (!dao || !proposal || !validator || !transferQueue || !transferTxSignature) {
    console.error(
      "Usage: yarn ts-node scripts/settle-magicblock-corridor.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --validator <PUBKEY> --transfer-queue <PUBKEY> --transfer-tx-signature <SIG> [--deposit-tx-signature <SIG>] [--withdraw-tx-signature <SIG>]",
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

  const tx = await program.methods
    .settleMagicblockPrivatePaymentCorridor(
      new PublicKey(String(validator)),
      new PublicKey(String(transferQueue)),
      String(depositTxSignature || "").trim(),
      String(transferTxSignature).trim(),
      String(withdrawTxSignature || "").trim(),
    )
    .accounts({
      dao: daoPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      magicblockPrivatePaymentCorridor: corridorPk,
      operator: provider.wallet.publicKey,
    })
    .rpc();

  console.log(`Settled MagicBlock corridor: ${corridorPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
