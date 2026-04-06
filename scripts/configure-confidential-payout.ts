// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { deriveConfidentialPayoutPlanPda, parseArgs, solscanTxUrl, workspaceProgram } from "./utils";

function parseHashHex(value: string | number | boolean | undefined, label: string): number[] {
  const normalized = String(value || "").trim().replace(/^0x/i, "");
  const buffer = Buffer.from(normalized, "hex");
  if (buffer.length !== 32) {
    throw new Error(`${label} must be a 32-byte hex value`);
  }
  return [...buffer];
}

async function main() {
  const {
    dao,
    proposal,
    payoutType = "salary",
    assetType = "sol",
    settlementRecipient,
    payoutTotal,
    payoutMint,
    recipientCount = 1,
    manifestUri,
    manifestHash,
    ciphertextHash,
  } = parseArgs();

  if (!dao || !proposal) {
    console.error("Usage: yarn ts-node scripts/configure-confidential-payout.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --manifest-uri <URI> --manifest-hash <HEX32> --ciphertext-hash <HEX32>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const payoutPlanPk = deriveConfidentialPayoutPlanPda(proposalPk, program.programId);
  const settlementRecipientPk = settlementRecipient
    ? new PublicKey(String(settlementRecipient))
    : provider.wallet.publicKey;
  const count = Number(recipientCount);
  const rawTotal = Number(payoutTotal);
  const uri = String(manifestUri || "").trim();

  if (!uri) {
    throw new Error("--manifest-uri is required");
  }
  if (!Number.isFinite(rawTotal) || rawTotal <= 0) {
    throw new Error("--payout-total must be a positive number");
  }
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("--recipient-count must be a positive integer");
  }

  const payoutTypeArg = String(payoutType).toLowerCase() === "bonus" ? { bonus: {} } : { salary: {} };
  let assetTypeArg: any = { sol: {} };
  let tokenMintPk: PublicKey | null = null;
  let totalAmount = new anchor.BN(Math.floor(rawTotal * LAMPORTS_PER_SOL));

  if (String(assetType).toLowerCase() === "token") {
    if (!payoutMint) {
      throw new Error("--payout-mint is required for token payout batches");
    }
    assetTypeArg = { token: {} };
    tokenMintPk = new PublicKey(String(payoutMint));
    totalAmount = new anchor.BN(rawTotal);
  }

  const tx = await program.methods
    .configureConfidentialPayoutPlan(
      payoutTypeArg,
      assetTypeArg,
      settlementRecipientPk,
      tokenMintPk,
      count,
      totalAmount,
      uri,
      parseHashHex(manifestHash, "manifest hash"),
      parseHashHex(ciphertextHash, "ciphertext hash"),
    )
    .accounts({
      dao: daoPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      operator: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Configured confidential payout plan: ${payoutPlanPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
