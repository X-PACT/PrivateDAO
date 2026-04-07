// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { deriveDaoSecurityPolicyPda, parseArgs, solscanTxUrl, workspaceProgram } from "./utils";

function attestorArray(raw: unknown, fallback: PublicKey): PublicKey[] {
  const values = raw
    ? String(raw).split(",").map((value) => value.trim()).filter(Boolean).map((value) => new PublicKey(value))
    : [fallback];
  if (values.length < 1 || values.length > 5) throw new Error("Provide 1-5 attestors");
  while (values.length < 5) values.push(PublicKey.default);
  return values;
}

async function main() {
  const {
    dao,
    mode = "strict",
    proofAttestors,
    proofThreshold = 1,
    settlementAttestors,
    settlementThreshold = 1,
    proofTtlSeconds = 3600,
    settlementTtlSeconds = 3600,
  } = parseArgs();

  if (!dao) {
    console.error("Usage: yarn ts-node scripts/configure-security-policy-v2.ts --dao <DAO_PDA> [--proof-attestors <CSV>] [--settlement-attestors <CSV>]");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const daoPk = new PublicKey(String(dao));
  const policyPk = deriveDaoSecurityPolicyPda(daoPk, program.programId);
  const resolvedMode = String(mode) === "compat" ? { compatibilityRequired: {} } : { strictRequired: {} };
  const proof = attestorArray(proofAttestors, provider.wallet.publicKey);
  const settlement = attestorArray(settlementAttestors, provider.wallet.publicKey);

  const tx = await program.methods
    .initializeDaoSecurityPolicy(
      resolvedMode,
      { thresholdAttestedRequired: {} },
      { thresholdAttestedRequired: {} },
      { noCancelAfterParticipation: {} },
      proof,
      Number(proof.filter((key) => !key.equals(PublicKey.default)).length),
      Number(proofThreshold),
      settlement,
      Number(settlement.filter((key) => !key.equals(PublicKey.default)).length),
      Number(settlementThreshold),
      new anchor.BN(Number(proofTtlSeconds)),
      new anchor.BN(Number(settlementTtlSeconds)),
    )
    .accounts({
      dao: daoPk,
      daoSecurityPolicy: policyPk,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Configured security policy: ${policyPk.toBase58()}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: ${solscanTxUrl(tx)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
