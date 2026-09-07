// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { deriveRefheEnvelopePda, parseArgs, workspaceProgram } from "./utils";

async function main() {
  const { proposal } = parseArgs();
  if (!proposal) {
    console.error("Usage: yarn ts-node scripts/inspect-refhe-envelope.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const proposalPk = new PublicKey(String(proposal));
  const envelopePk = deriveRefheEnvelopePda(proposalPk, program.programId);
  const envelope = await program.account.refheEnvelope.fetchNullable(envelopePk);

  if (!envelope) {
    console.log(`No REFHE envelope found for proposal ${proposalPk.toBase58()}`);
    return;
  }

  console.log(
    JSON.stringify(
      {
        pubkey: envelopePk.toBase58(),
        dao: envelope.dao.toBase58(),
        proposal: envelope.proposal.toBase58(),
        payoutPlan: envelope.payoutPlan.toBase58(),
        configuredBy: envelope.configuredBy.toBase58(),
        settledBy: envelope.settledBy ? envelope.settledBy.toBase58() : null,
        modelUri: envelope.modelUri,
        policyHash: Buffer.from(envelope.policyHash).toString("hex"),
        inputCiphertextHash: Buffer.from(envelope.inputCiphertextHash).toString("hex"),
        evaluationKeyHash: Buffer.from(envelope.evaluationKeyHash).toString("hex"),
        resultCiphertextHash: Buffer.from(envelope.resultCiphertextHash).toString("hex"),
        resultCommitmentHash: Buffer.from(envelope.resultCommitmentHash).toString("hex"),
        proofBundleHash: Buffer.from(envelope.proofBundleHash).toString("hex"),
        verifierProgram: envelope.verifierProgram ? envelope.verifierProgram.toBase58() : null,
        status: Object.keys(envelope.status)[0],
        configuredAt: envelope.configuredAt.toString(),
        settledAt: envelope.settledAt.toString(),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
