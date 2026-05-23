// SPDX-License-Identifier: AGPL-3.0-or-later
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { deriveTreasuryOperatorAuthorityPda, parseArgs, solscanTxUrl, workspaceProgram } from "./utils";

async function main() {
  const { dao } = parseArgs();
  if (!dao) {
    console.error("Usage: npm run initialize:treasury-operator-authority -- --dao <DAO_PDA>");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();
  const daoPk = new PublicKey(String(dao));
  const authority = provider.wallet.publicKey;
  const treasuryOperatorAuthority = deriveTreasuryOperatorAuthorityPda(daoPk, program.programId);

  const tx = await program.methods
    .initializeTreasuryOperatorAuthority()
    .accounts({
      dao: daoPk,
      treasuryOperatorAuthority,
      authority,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const readout = await program.account.treasuryOperatorAuthority.fetch(treasuryOperatorAuthority);
  console.log(JSON.stringify({
    dao: daoPk.toBase58(),
    treasuryOperatorAuthority: treasuryOperatorAuthority.toBase58(),
    authority: readout.authority.toBase58(),
    signature: tx,
    explorer: solscanTxUrl(tx),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
