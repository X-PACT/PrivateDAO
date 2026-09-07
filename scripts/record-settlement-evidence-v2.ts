// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  canonicalPayoutFieldsHash,
  deriveConfidentialPayoutPlanPda,
  deriveDaoSecurityPolicyPda,
  deriveSettlementEvidencePda,
  parseArgs,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

function hex32(value: unknown): Buffer {
  const raw = String(value || "").replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error(`Expected 32-byte hex value, got: ${value}`);
  return Buffer.from(raw, "hex");
}

function evidenceKind(kind: unknown) {
  switch (String(kind || "threshold").toLowerCase()) {
    case "refhe":
      return { refheAttested: {} };
    case "magicblock":
      return { magicBlockAttested: {} };
    case "verifier":
      return { verifierCpiReceipt: {} };
    case "threshold":
      return { thresholdAttestation: {} };
    default:
      throw new Error("Unsupported --kind. Use refhe, magicblock, verifier, or threshold");
  }
}

async function main() {
  const { dao, proposal, kind = "threshold", settlementId, evidenceHash } = parseArgs();
  if (!dao || !proposal || !settlementId || !evidenceHash) {
    console.error(
      "Usage: yarn ts-node scripts/record-settlement-evidence-v2.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --kind <refhe|magicblock|verifier|threshold> --settlement-id <HEX32> --evidence-hash <HEX32>",
    );
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const payoutPlanPk = deriveConfidentialPayoutPlanPda(proposalPk, program.programId);
  const policyPk = deriveDaoSecurityPolicyPda(daoPk, program.programId);
  const settlementIdBytes = hex32(settlementId);
  const evidencePk = deriveSettlementEvidencePda(proposalPk, payoutPlanPk, settlementIdBytes, program.programId);
  const plan = await program.account["confidentialPayoutPlan"].fetch(payoutPlanPk);
  const payoutFieldsHash = canonicalPayoutFieldsHash(daoPk, proposalPk, payoutPlanPk, plan);

  const tx = await program.methods
    .recordSettlementEvidenceV2(
      evidenceKind(kind),
      [...settlementIdBytes],
      [...hex32(evidenceHash)],
      [...payoutFieldsHash],
    )
    .accounts({
      dao: daoPk,
      daoSecurityPolicy: policyPk,
      proposal: proposalPk,
      confidentialPayoutPlan: payoutPlanPk,
      settlementEvidence: evidencePk,
      recorder: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Recorded V2 settlement evidence: ${evidencePk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
