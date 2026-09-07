// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  deriveConfidentialPayoutPlanPda,
  deriveRefheEnvelopePda,
  parseArgs,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

function parseHashHex(value: string | number | boolean | undefined, label: string): number[] {
  const normalized = String(value || "").trim().replace(/^0x/i, "");
  const buffer = Buffer.from(normalized, "hex");
  if (buffer.length !== 32) {
    throw new Error(`${label} must be a 32-byte hex value`);
  }
  return [...buffer];
}

async function main() {
  const { dao, proposal, modelUri, policyHash, inputCiphertextHash, evaluationKeyHash } = parseArgs();

  if (!dao || !proposal || !modelUri || !policyHash || !inputCiphertextHash || !evaluationKeyHash) {
    console.error(
      "Usage: yarn ts-node scripts/configure-refhe-envelope.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --model-uri <URI> --policy-hash <HEX32> --input-ciphertext-hash <HEX32> --evaluation-key-hash <HEX32>",
    );
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const payoutPlanPk = deriveConfidentialPayoutPlanPda(proposalPk, program.programId);
  const refheEnvelopePk = deriveRefheEnvelopePda(proposalPk, program.programId);

  const tx = await program.methods
    .configureRefheEnvelope(
      String(modelUri).trim(),
      parseHashHex(policyHash, "policy hash"),
      parseHashHex(inputCiphertextHash, "input ciphertext hash"),
      parseHashHex(evaluationKeyHash, "evaluation key hash"),
    )
    .accounts({
      dao: daoPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      refheEnvelope: refheEnvelopePk,
      operator: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Configured REFHE envelope: ${refheEnvelopePk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
