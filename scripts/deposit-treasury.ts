/**
 * deposit-treasury.ts
 * Deposit SOL into a DAO's on-chain treasury PDA.
 *
 * The treasury PDA (seeds = ["treasury", dao_pubkey]) is the source of funds
 * for all treasury actions that pass through governance. Anyone can deposit.
 *
 * Usage:
 *   yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 1.0
 *   yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 0.5
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { parseArgs, formatSol } from "./utils";

async function main() {
  const { dao: daoPdaStr, amount = 0.1 } = parseArgs();

  if (!daoPdaStr) {
    console.error("Error: --dao <DAO_PDA> is required");
    console.error("Usage: yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 1.0");
    process.exit(1);
  }

  const lamports = Math.floor(parseFloat(String(amount)) * LAMPORTS_PER_SOL);
  if (lamports <= 0) {
    console.error("Error: --amount must be a positive SOL amount (e.g. --amount 1.0)");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;

  const daoPda = new PublicKey(String(daoPdaStr));
  const dao    = await program.account.dao.fetch(daoPda);

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), daoPda.toBuffer()],
    program.programId,
  );

  const balanceBefore = await provider.connection.getBalance(treasuryPda);

  console.log(`\n💰 Depositing ${formatSol(lamports)} into treasury`);
  console.log(`   DAO:      ${dao.daoName}`);
  console.log(`   Treasury: ${treasuryPda.toBase58()}`);
  console.log(`   Depositor: ${provider.wallet.publicKey.toBase58()}`);
  console.log(`   Treasury balance before: ${formatSol(balanceBefore)}`);

  const tx = await program.methods
    .depositTreasury(new anchor.BN(lamports))
    .accounts({
      dao: daoPda,
      treasury: treasuryPda,
      depositor: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const balanceAfter = await provider.connection.getBalance(treasuryPda);

  console.log(`\n✅ Deposit successful!`);
  console.log(`   Transaction: ${tx}`);
  console.log(`   Treasury balance after: ${formatSol(balanceAfter)}`);
  console.log(`   Explorer: https://solscan.io/account/${treasuryPda.toBase58()}?cluster=devnet`);
}

main().catch(console.error);
