// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
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
  const {
    dao,
    proposal,
    resultCiphertextHash,
    resultCommitmentHash,
    proofBundleHash,
    verifierProgram,
  } = parseArgs();

  if (!dao || !proposal || !resultCiphertextHash || !resultCommitmentHash || !proofBundleHash || !verifierProgram) {
    console.error(
      "Usage: yarn ts-node scripts/settle-refhe-envelope.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --result-ciphertext-hash <HEX32> --result-commitment-hash <HEX32> --proof-bundle-hash <HEX32> --verifier-program <PROGRAM_ID>",
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
    .settleRefheEnvelope(
      parseHashHex(resultCiphertextHash, "result ciphertext hash"),
      parseHashHex(resultCommitmentHash, "result commitment hash"),
      parseHashHex(proofBundleHash, "proof bundle hash"),
      new PublicKey(String(verifierProgram)),
    )
    .accounts({
      dao: daoPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      refheEnvelope: refheEnvelopePk,
      operator: provider.wallet.publicKey,
    })
    .rpc();

  console.log(`Settled REFHE envelope: ${refheEnvelopePk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
