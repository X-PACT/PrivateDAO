import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { parseArgs, workspaceProgram } from "./utils";

function parseMode(mode: string | undefined) {
  const normalized = String(mode || "zk_enforced").toLowerCase();
  if (normalized === "companion") return { companion: {} };
  if (normalized === "parallel") return { parallel: {} };
  if (normalized === "zk_enforced" || normalized === "zk-enforced") return { zkEnforced: {} };
  throw new Error(`Unsupported zk mode: ${mode}`);
}

async function main() {
  const { proposal: proposalStr, mode } = parseArgs();

  if (!proposalStr) {
    console.error("Usage: yarn ts-node scripts/configure-zk-proposal-mode.ts --proposal <PROPOSAL_PDA> [--mode companion|parallel|zk_enforced]");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const proposalPda = new PublicKey(proposalStr);
  const proposal = await program.account["proposal"].fetch(proposalPda);
  const daoPda = proposal.dao;

  const [proposalZkPolicyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-policy"), proposalPda.toBuffer()],
    program.programId,
  );
  const [voteReceiptPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([1])],
    program.programId,
  );
  const [delegationReceiptPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([2])],
    program.programId,
  );
  const [tallyReceiptPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([3])],
    program.programId,
  );

  const selectedMode = parseMode(mode);
  const tx = await program.methods
    .configureProposalZkMode(selectedMode)
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      proposalZkPolicy: proposalZkPolicyPda,
      voteZkReceipt: voteReceiptPda,
      delegationZkReceipt: delegationReceiptPda,
      tallyZkReceipt: tallyReceiptPda,
      operator: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`Configured proposal zk mode for ${proposalPda.toBase58()}`);
  console.log(`Policy PDA: ${proposalZkPolicyPda.toBase58()}`);
  console.log(`Mode: ${Object.keys(selectedMode)[0]}`);
  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
