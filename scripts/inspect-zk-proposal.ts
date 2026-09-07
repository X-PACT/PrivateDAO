import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { parseArgs, workspaceProgram } from "./utils";

async function main() {
  const { proposal: proposalStr } = parseArgs();
  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/inspect-zk-proposal.ts --proposal <PROPOSAL_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPda = new PublicKey(proposalStr);
  const proposal = await program.account["proposal"].fetch(proposalPda);
  const [policyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-policy"), proposalPda.toBuffer()],
    program.programId,
  );

  const policyInfo = await provider.connection.getAccountInfo(policyPda, "confirmed");
  let policy: any = null;
  if (policyInfo) {
    policy = await program.account["proposalZkPolicy"].fetch(policyPda);
  }

  const receipts = await Promise.all([1, 2, 3].map(async (seed) => {
    const [receiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([seed])],
      program.programId,
    );
    const info = await provider.connection.getAccountInfo(receiptPda, "confirmed");
    if (!info) {
      return {
        layer: seed === 1 ? "vote" : seed === 2 ? "delegation" : "tally",
        receipt: receiptPda.toBase58(),
        mode: "missing",
      };
    }
    const receipt = await program.account["zkVerificationReceipt"].fetch(receiptPda);
    return {
      layer: seed === 1 ? "vote" : seed === 2 ? "delegation" : "tally",
      receipt: receiptPda.toBase58(),
      mode: Object.keys(receipt.verificationMode)[0],
      verifierProgram: receipt.verifierProgram?.toBase58?.() || null,
    };
  }));

  console.log(JSON.stringify({
    proposal: proposalPda.toBase58(),
    dao: proposal.dao.toBase58(),
    policy: policy ? {
      pda: policyPda.toBase58(),
      mode: Object.keys(policy.mode)[0],
      requiredLayersMask: policy.requiredLayersMask,
      configuredBy: policy.configuredBy.toBase58(),
    } : null,
    receipts,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
