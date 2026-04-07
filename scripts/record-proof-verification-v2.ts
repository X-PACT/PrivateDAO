// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  canonicalProposalPayloadHash,
  deriveDaoSecurityPolicyPda,
  deriveProposalProofVerificationPda,
  parseArgs,
  proofDomainSeparator,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

function hex32(value: unknown, fallback?: Buffer): number[] {
  if (!value && fallback) return [...fallback];
  const raw = String(value || "").replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error(`Expected 32-byte hex value, got: ${value}`);
  return [...Buffer.from(raw, "hex")];
}

async function main() {
  const { dao, proposal, payloadHash, proofHash, publicInputsHash, verificationKeyHash } = parseArgs();
  if (!dao || !proposal || !proofHash || !publicInputsHash || !verificationKeyHash) {
    console.error(
      "Usage: yarn ts-node scripts/record-proof-verification-v2.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --proof-hash <HEX32> --public-inputs-hash <HEX32> --verification-key-hash <HEX32> [--payload-hash <HEX32>]",
    );
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const daoPk = new PublicKey(String(dao));
  const proposalPk = new PublicKey(String(proposal));
  const policyPk = deriveDaoSecurityPolicyPda(daoPk, program.programId);
  const proofVerificationPk = deriveProposalProofVerificationPda(proposalPk, program.programId);
  const defaultPayloadHash = canonicalProposalPayloadHash(daoPk, proposalPk);

  const tx = await program.methods
    .recordProofVerificationV2(
      { thresholdAttestation: {} },
      hex32(payloadHash, defaultPayloadHash),
      hex32(proofHash),
      hex32(publicInputsHash),
      hex32(verificationKeyHash),
      [...proofDomainSeparator(daoPk, proposalPk)],
    )
    .accounts({
      dao: daoPk,
      daoSecurityPolicy: policyPk,
      proposal: proposalPk,
      proposalProofVerification: proofVerificationPk,
      recorder: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Recorded V2 proof verification: ${proofVerificationPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
