// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { deriveConfidentialPayoutPlanPda, parseArgs, workspaceProgram } from "./utils";

async function main() {
  const { proposal } = parseArgs();
  if (!proposal) {
    console.error("Usage: yarn ts-node scripts/inspect-confidential-payout.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPk = new PublicKey(String(proposal));
  const planPk = deriveConfidentialPayoutPlanPda(proposalPk, program.programId);
  const info = await provider.connection.getAccountInfo(planPk, "confirmed");
  if (!info) {
    console.log("No confidential payout plan found for this proposal.");
    process.exit(0);
  }

  const plan = await program.account["confidentialPayoutPlan"].fetch(planPk);
  console.log(JSON.stringify({
    plan: planPk.toBase58(),
    dao: plan.dao.toBase58(),
    proposal: plan.proposal.toBase58(),
    configuredBy: plan.configuredBy.toBase58(),
    payoutType: Object.keys(plan.payoutType)[0],
    assetType: Object.keys(plan.assetType)[0],
    settlementRecipient: plan.settlementRecipient.toBase58(),
    tokenMint: plan.tokenMint ? plan.tokenMint.toBase58() : null,
    recipientCount: plan.recipientCount,
    totalAmount: plan.totalAmount.toString(),
    encryptedManifestUri: plan.encryptedManifestUri,
    manifestHash: Buffer.from(plan.manifestHash).toString("hex"),
    ciphertextHash: Buffer.from(plan.ciphertextHash).toString("hex"),
    status: Object.keys(plan.status)[0],
    configuredAt: plan.configuredAt.toString(),
    fundedAt: plan.fundedAt.toString(),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
