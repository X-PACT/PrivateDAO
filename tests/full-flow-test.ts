/**
 * Copyright (c) 2026 X-PACT. MIT License.
 *
 * full-flow-test.ts
 *
 * End-to-end test: DAO → proposal → commit (3 voters) → reveal → finalize → execute
 *
 * Uses real time.sleep() — periods are kept short (5s voting, 8s reveal, 5s timelock)
 * so the full test runs in ~30 seconds on localnet.
 *
 * Run: anchor test -- --grep "Full flow"
 */
import * as anchor from "@coral-xyz/anchor";
import { Program }  from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint, createAccount, mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import { assert } from "chai";
import BN from "bn.js";

function commitment(vote: boolean, salt: Buffer, voter: PublicKey): Buffer {
  return crypto.createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, voter.toBuffer()]))
    .digest();
}

function rng(): Buffer { return crypto.randomBytes(32); }
function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

describe("Full flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;
  const payer   = (provider.wallet as anchor.Wallet).payer;

  const V_SECS = 5;   // voting window
  const R_SECS = 8;   // reveal window
  const E_SECS = 5;   // execution timelock

  it("commit → reveal → finalize → execute (TokenWeighted)", async () => {

    // Setup
    const [alice, bob, carol, recipient] = Array.from({length: 4}, () => Keypair.generate());
    for (const w of [alice, bob, carol]) {
      const s = await provider.connection.requestAirdrop(w.publicKey, 2 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(s);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

    async function fund(owner: Keypair, tokens: number) {
      const ata = await createAccount(provider.connection, payer, mint, owner.publicKey);
      await mintTo(provider.connection, payer, mint, ata, payer, BigInt(tokens) * 1_000_000n);
      return ata;
    }

    const aliceAta = await fund(alice, 1000);
    const bobAta   = await fund(bob,    500);
    const carolAta = await fund(carol,  100);

    const DAO_NAME = `TestDAO-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(DAO_NAME)],
      program.programId,
    );

    // 1. Create DAO
    await program.methods
      .initializeDao(
        DAO_NAME,
        51,
        new BN(0),
        new BN(R_SECS),
        new BN(E_SECS),
        { tokenWeighted: {} },
      )
      .accounts({ dao: daoPda, governanceToken: mint, authority: payer.publicKey, systemProgram: SystemProgram.programId })
      .rpc();

    // 2. Create proposal with SOL treasury action
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()], program.programId,
    );
    const tSig = await provider.connection.requestAirdrop(treasuryPda, LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(tSig);

    await program.methods
      .createProposal(
        "Test: fund 0.05 SOL",
        "Full flow integration test proposal.",
        new BN(V_SECS),
        {
          actionType:     { sendSol: {} },
          amountLamports: new BN(0.05 * LAMPORTS_PER_SOL),
          recipient:      recipient.publicKey,
          tokenMint:      null,
        },
      )
      .accounts({
        dao: daoPda, proposal: proposalPda,
        authority: payer.publicKey, proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // 3. Commit phase — alice YES, bob YES, carol NO
    const salts = { alice: rng(), bob: rng(), carol: rng() };
    const votes  = { alice: true, bob: true, carol: false };

    for (const [voter, ata] of [[alice, aliceAta], [bob, bobAta], [carol, carolAta]] as [Keypair, PublicKey][]) {
      const name    = voter === alice ? "alice" : voter === bob ? "bob" : "carol";
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      await program.methods
        .commitVote([...commitment(votes[name], salts[name], voter.publicKey)], null)
        .accounts({
          dao: daoPda, proposal: proposalPda,
          voterRecord: vrPda, voterTokenAccount: ata,
          voter: voter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
    }

    const pAfterCommit = await program.account.proposal.fetch(proposalPda);
    assert.equal(pAfterCommit.yesCapital.toNumber(), 0, "tally must be hidden during commit phase");
    assert.equal(pAfterCommit.commitCount.toNumber(), 3);
    console.log(`  [commit] 3 votes. Tally: YES=0/NO=0 (hidden ✓)  Waiting ${V_SECS + 1}s...`);
    await sleep((V_SECS + 1) * 1000);

    // 4. Reveal phase
    for (const [voter] of [[alice], [bob], [carol]] as [Keypair][]) {
      const name    = voter === alice ? "alice" : voter === bob ? "bob" : "carol";
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      await program.methods
        .revealVote(votes[name], [...salts[name]])
        .accounts({ proposal: proposalPda, voterRecord: vrPda, revealer: voter.publicKey })
        .signers([voter])
        .rpc();
    }

    const pAfterReveal = await program.account.proposal.fetch(proposalPda);
    // alice 1000 + bob 500 YES, carol 100 NO (all × 1e6 decimals)
    assert.equal(pAfterReveal.yesCapital.toNumber(), 1_500_000_000);
    assert.equal(pAfterReveal.noCapital.toNumber(),   100_000_000);
    assert.equal(pAfterReveal.revealCount.toNumber(), 3);
    console.log(`  [reveal] YES=${pAfterReveal.yesCapital} / NO=${pAfterReveal.noCapital}  Waiting ${R_SECS + 1}s...`);
    await sleep((R_SECS + 1) * 1000);

    // 5. Finalize
    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
      .rpc();

    const pFinal = await program.account.proposal.fetch(proposalPda);
    assert.isTrue("passed" in pFinal.status, "proposal must pass: alice+bob outweigh carol");
    console.log(`  [finalize] PASSED ✓  Timelock: ${E_SECS}s  Waiting ${E_SECS + 1}s...`);
    await sleep((E_SECS + 1) * 1000);

    // 6. Execute — send 0.05 SOL from treasury to recipient
    const balBefore = await provider.connection.getBalance(recipient.publicKey);
    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda, proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        // For SendSol actions, pass treasury as dummy for the two token accounts
        treasuryTokenAccount:  treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balAfter = await provider.connection.getBalance(recipient.publicKey);
    const sent     = (balAfter - balBefore) / LAMPORTS_PER_SOL;
    assert.approximately(sent, 0.05, 0.001, "treasury must send 0.05 SOL");

    const pExec = await program.account.proposal.fetch(proposalPda);
    assert.isTrue(pExec.isExecuted, "isExecuted flag must be set");
    console.log(`  [execute] Treasury sent ${sent.toFixed(4)} SOL ✓`);

    // 7. Security regression: executor cannot redirect treasury recipient
    const attacker = Keypair.generate();
    const daoAfterFirst = await program.account.dao.fetch(daoPda);
    const [proposal2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), daoAfterFirst.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal(
        "Test: guard recipient integrity",
        "Executor must not override proposal recipient.",
        new BN(V_SECS),
        {
          actionType:     { sendSol: {} },
          amountLamports: new BN(0.01 * LAMPORTS_PER_SOL),
          recipient:      recipient.publicKey,
          tokenMint:      null,
        },
      )
      .accounts({
        dao: daoPda, proposal: proposal2Pda,
        authority: payer.publicKey, proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const secondSalt = rng();
    const [aliceSecondVote] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal2Pda.toBuffer(), alice.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, secondSalt, alice.publicKey)], null)
      .accounts({
        dao: daoPda, proposal: proposal2Pda,
        voterRecord: aliceSecondVote, voterTokenAccount: aliceAta,
        voter: alice.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    await sleep((V_SECS + 1) * 1000);
    await program.methods
      .revealVote(true, [...secondSalt])
      .accounts({ proposal: proposal2Pda, voterRecord: aliceSecondVote, revealer: alice.publicKey })
      .signers([alice])
      .rpc();
    await sleep((R_SECS + 1) * 1000);

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposal2Pda, finalizer: payer.publicKey })
      .rpc();
    await sleep((E_SECS + 1) * 1000);

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda, proposal: proposal2Pda,
          treasury: treasuryPda,
          treasuryRecipient: attacker.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject recipient substitution");
    } catch (err: any) {
      assert.include(err.toString(), "TreasuryRecipientMismatch");
    }

    const recipientBeforeGuarded = await provider.connection.getBalance(recipient.publicKey);
    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda, proposal: proposal2Pda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .rpc();

    const recipientAfterGuarded = await provider.connection.getBalance(recipient.publicKey);
    assert.approximately(
      (recipientAfterGuarded - recipientBeforeGuarded) / LAMPORTS_PER_SOL,
      0.01,
      0.001,
      "treasury execution should only succeed for the configured recipient",
    );

    console.log(`  [security] Recipient substitution blocked ✓`);
    console.log(`  ✅ Full flow complete`);

  }).timeout(120_000);
});
