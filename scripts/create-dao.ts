/**
 * create-dao.ts
 * Creates a new PrivateDAO on devnet (or localnet).
 *
 * Usage:
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51 --mode dual
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51 --mode quadratic
 *
 * Modes: token (default), quadratic, dual
 * --delay N  execution delay in seconds after passing (default 86400 = 24h)
 * --reveal-window N  reveal window in seconds (default 3600 = 1h)
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import { parseArgs } from "./utils";

async function main() {
  const {
    name = "TestDAO",
    quorum = 51,
    revealWindow = 3600,
    mode = "token",
    delay = 86400,
  } = parseArgs();

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;

  // Build the VotingConfig based on --mode flag
  let votingConfig: any;
  if (mode === "quadratic") {
    votingConfig = { quadratic: {} };
  } else if (mode === "dual") {
    votingConfig = { dualChamber: { capitalThreshold: 50, communityThreshold: 50 } };
  } else {
    votingConfig = { tokenWeighted: {} };
  }

  console.log(`\n🔐 PrivateDAO — Creating DAO: "${name}"`);
  console.log(`   Mode:          ${mode}`);
  console.log(`   Quorum:        ${quorum}%`);
  console.log(`   Reveal window: ${revealWindow}s (${(Number(revealWindow) / 3600).toFixed(1)}h)`);
  console.log(`   Exec delay:    ${delay}s (${(Number(delay) / 3600).toFixed(1)}h timelock)`);
  console.log(`   Authority:     ${provider.wallet.publicKey.toBase58()}`);

  const mint = await createMint(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    provider.wallet.publicKey,
    null,
    6,
  );
  console.log(`\n   Governance token: ${mint.toBase58()}`);

  const [daoPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao"), provider.wallet.publicKey.toBuffer(), Buffer.from(String(name))],
    program.programId,
  );

  const tx = await program.methods
    .initializeDao(
      String(name),
      Number(quorum),
      0,
      new anchor.BN(Number(revealWindow)),
      new anchor.BN(Number(delay)),
      votingConfig,
    )
    .accounts({
      dao:             daoPda,
      governanceToken: mint,
      authority:       provider.wallet.publicKey,
      systemProgram:   SystemProgram.programId,
    })
    .rpc();

  const dao = await program.account.dao.fetch(daoPda);

  console.log(`\n✅ DAO created!`);
  console.log(`   DAO address:      ${daoPda.toBase58()}`);
  console.log(`   Governance token: ${mint.toBase58()}`);
  console.log(`   Tx:               ${tx}`);
  console.log(`\n   Save these for next steps:`);
  console.log(`   DAO_PDA=${daoPda.toBase58()}`);
  console.log(`   GOVERNANCE_MINT=${mint.toBase58()}`);
  console.log(`\n   Explorer: https://solscan.io/account/${daoPda.toBase58()}?cluster=devnet`);
}

main().catch(console.error);
