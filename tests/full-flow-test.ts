// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
 *
 * full-flow-test.ts
 *
 * End-to-end test: DAO → proposal → commit (3 voters) → reveal → finalize → execute
 *
 * Uses on-chain timestamp gating against proposal phase boundaries.
 * No fixed sleep windows are used for commit/reveal/finalize transitions.
 *
 * Run: anchor test -- --grep "Full flow"
 */
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint, createAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, mintTo,
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
function txExplorer(signature: string, rpcEndpoint: string): string {
  return rpcEndpoint.includes("devnet")
    ? `https://solscan.io/tx/${signature}?cluster=devnet`
    : `local-validator tx: ${signature}`;
}
function logTx(label: string, signature: string, rpcEndpoint: string): void {
  console.log(`  [tx] ${label}: ${txExplorer(signature, rpcEndpoint)}`);
}

async function currentUnixTimestamp(connection: anchor.web3.Connection): Promise<number> {
  const slot = await connection.getSlot("processed");
  const blockTime = await connection.getBlockTime(slot);
  return blockTime ?? Math.floor(Date.now() / 1000);
}

async function waitForUnixTimestamp(
  connection: anchor.web3.Connection,
  targetUnixTs: number,
  label: string,
): Promise<void> {
  const timeoutMs = 120_000;
  const started = Date.now();
  while ((Date.now() - started) < timeoutMs) {
    const now = await currentUnixTimestamp(connection);
    if (now >= targetUnixTs) return;
    await sleep(400);
  }
  throw new Error(`Timeout waiting for ${label} at unix ${targetUnixTs}`);
}

describe("Full flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as any;
  const payer   = (provider.wallet as anchor.Wallet).payer;

  const V_SECS = 5;   // voting window
  const R_SECS = 8;   // reveal window
  const E_SECS = 5;   // execution timelock
  const EXECUTE_LAMPORTS = 100_000;         // 0.0001 SOL
  const SECOND_EXECUTE_LAMPORTS = 50_000;   // 0.00005 SOL
  const TREASURY_SEED_LAMPORTS = 5_000_000; // 0.005 SOL

  it("commit → reveal → finalize → execute (TokenWeighted)", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    // Setup
    const [alice, bob, carol, recipient] = Array.from({length: 4}, () => Keypair.generate());
    for (const w of [alice, bob, carol, recipient]) {
      await fundWallet(w.publicKey, 0.005);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);

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
      .rpc()
      .then(sig => {
        logTx("initializeDao", sig, provider.connection.rpcEndpoint);
        return sig;
      });

    // 2. Create proposal with SOL treasury action
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()], program.programId,
    );
    const treasurySeedSig = await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );
    logTx("seedTreasury", treasurySeedSig, provider.connection.rpcEndpoint);

    const createProposalSig = await program.methods
      .createProposal(
        "Test: fund 0.0001 SOL",
        "Full flow integration test proposal.",
        new BN(V_SECS),
        {
          actionType:     { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient:      recipient.publicKey,
          tokenMint:      null,
        },
      )
      .accounts({
        dao: daoPda, proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    logTx("createProposal", createProposalSig, provider.connection.rpcEndpoint);

    // 3. Commit phase — alice YES, bob YES, carol NO
    const salts = { alice: rng(), bob: rng(), carol: rng() };
    const votes  = { alice: true, bob: true, carol: false };

    for (const [voter, ata] of [[alice, aliceAta], [bob, bobAta], [carol, carolAta]] as [Keypair, PublicKey][]) {
      const name    = voter === alice ? "alice" : voter === bob ? "bob" : "carol";
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      const commitSig = await program.methods
        .commitVote([...commitment(votes[name], salts[name], voter.publicKey)], null)
        .accounts({
          dao: daoPda, proposal: proposalPda,
          voterRecord: vrPda, voterTokenAccount: ata,
          voter: voter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
      logTx(`commit:${name}`, commitSig, provider.connection.rpcEndpoint);
    }

    const pAfterCommit = await program.account["proposal"].fetch(proposalPda);
    assert.equal(pAfterCommit.yesCapital.toNumber(), 0, "tally must be hidden during commit phase");
    assert.equal(pAfterCommit.commitCount.toNumber(), 3);
    console.log("  [commit] 3 votes. Tally: YES=0/NO=0 (hidden ✓)");
    await waitForUnixTimestamp(
      provider.connection,
      pAfterCommit.votingEnd.toNumber(),
      "voting_end",
    );

    // 4. Reveal phase
    for (const [voter] of [[alice], [bob], [carol]] as [Keypair][]) {
      const name    = voter === alice ? "alice" : voter === bob ? "bob" : "carol";
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      const revealSig = await program.methods
        .revealVote(votes[name], [...salts[name]])
        .accounts({ proposal: proposalPda, voterRecord: vrPda, revealer: voter.publicKey })
        .signers([voter])
        .rpc();
      logTx(`reveal:${name}`, revealSig, provider.connection.rpcEndpoint);
    }

    try {
      await program.methods
        .revealVote(votes.alice, [...salts.alice])
        .accounts({ proposal: proposalPda, voterRecord: PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), proposalPda.toBuffer(), alice.publicKey.toBuffer()],
          program.programId,
        )[0], revealer: alice.publicKey })
        .signers([alice])
        .rpc();
      assert.fail("double reveal must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "AlreadyRevealed");
    }

    const pAfterReveal = await program.account["proposal"].fetch(proposalPda);
    // alice 1000 + bob 500 YES, carol 100 NO (all × 1e6 decimals)
    assert.equal(pAfterReveal.yesCapital.toNumber(), 1_500_000_000);
    assert.equal(pAfterReveal.noCapital.toNumber(),   100_000_000);
    assert.equal(pAfterReveal.revealCount.toNumber(), 3);
    console.log(`  [reveal] YES=${pAfterReveal.yesCapital} / NO=${pAfterReveal.noCapital}`);
    await waitForUnixTimestamp(
      provider.connection,
      pAfterReveal.revealEnd.toNumber(),
      "reveal_end",
    );

    // 5. Finalize
    const finalizeSig = await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
      .rpc();
    logTx("finalizeProposal", finalizeSig, provider.connection.rpcEndpoint);

    const pFinal = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue("passed" in pFinal.status, "proposal must pass: alice+bob outweigh carol");
    console.log(`  [finalize] PASSED ✓  Timelock: ${E_SECS}s`);
    await waitForUnixTimestamp(
      provider.connection,
      pFinal.executionUnlocksAt.toNumber(),
      "execution_unlocks_at",
    );

    // 6. Execute — send lamports from treasury to recipient
    const balBefore = await provider.connection.getBalance(recipient.publicKey);
    const treasuryBefore = await provider.connection.getBalance(treasuryPda);
    const executeSig = await program.methods
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
    logTx("executeProposal", executeSig, provider.connection.rpcEndpoint);

    const balAfter = await provider.connection.getBalance(recipient.publicKey);
    const treasuryAfter = await provider.connection.getBalance(treasuryPda);
    const sent     = (balAfter - balBefore) / LAMPORTS_PER_SOL;
    assert.approximately(sent, EXECUTE_LAMPORTS / LAMPORTS_PER_SOL, 0.00001, "treasury must send configured SOL amount");
    assert.equal(
      treasuryBefore - treasuryAfter,
      EXECUTE_LAMPORTS,
      "treasury lamports must decrease by the executed SOL amount",
    );

    const pExec = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue(pExec.isExecuted, "isExecuted flag must be set");
    assert.isTrue("passed" in pExec.status, "status must remain passed after successful execution");
    assert.equal(
      pExec.executionUnlocksAt.toNumber(),
      pFinal.executionUnlocksAt.toNumber(),
      "execution unlock timestamp must remain stable after execution",
    );
    console.log(`  [execute] Treasury sent ${sent.toFixed(4)} SOL ✓`);

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda, proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject a second execution");
    } catch (err: any) {
      assert.include(err.toString(), "AlreadyExecuted");
    }

    // 7. Security regression: executor cannot redirect treasury recipient
    const attacker = Keypair.generate();
    const daoAfterFirst = await program.account["dao"].fetch(daoPda);
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
          amountLamports: new BN(SECOND_EXECUTE_LAMPORTS),
          recipient:      recipient.publicKey,
          tokenMint:      null,
        },
      )
      .accounts({
        dao: daoPda, proposal: proposal2Pda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
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

    const proposal2AfterCommit = await program.account["proposal"].fetch(proposal2Pda);
    await waitForUnixTimestamp(
      provider.connection,
      proposal2AfterCommit.votingEnd.toNumber(),
      "second_voting_end",
    );
    await program.methods
      .revealVote(true, [...secondSalt])
      .accounts({ proposal: proposal2Pda, voterRecord: aliceSecondVote, revealer: alice.publicKey })
      .signers([alice])
      .rpc();
    const proposal2AfterReveal = await program.account["proposal"].fetch(proposal2Pda);
    await waitForUnixTimestamp(
      provider.connection,
      proposal2AfterReveal.revealEnd.toNumber(),
      "second_reveal_end",
    );

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposal2Pda, finalizer: payer.publicKey })
      .rpc();
    const proposal2AfterFinalize = await program.account["proposal"].fetch(proposal2Pda);
    await waitForUnixTimestamp(
      provider.connection,
      proposal2AfterFinalize.executionUnlocksAt.toNumber(),
      "second_execution_unlocks_at",
    );

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
      SECOND_EXECUTE_LAMPORTS / LAMPORTS_PER_SOL,
      0.00001,
      "treasury execution should only succeed for the configured recipient",
    );

    console.log(`  [security] Recipient substitution blocked ✓`);
    console.log(`  ✅ Full flow complete`);

  }).timeout(120_000);

  it("rejects invalid lifecycle transitions and phase boundary violations", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voter = Keypair.generate();
    const lateVoter = Keypair.generate();
    const recipient = Keypair.generate();
    for (const wallet of [voter, lateVoter, recipient]) {
      await fundWallet(wallet.publicKey, 0.01);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);

    const voterAta = await createAccount(provider.connection, payer, mint, voter.publicKey);
    const lateVoterAta = await createAccount(provider.connection, payer, mint, lateVoter.publicKey);
    await mintTo(provider.connection, payer, mint, voterAta, payer, 1_000_000_000n);
    await mintTo(provider.connection, payer, mint, lateVoterAta, payer, 1_000_000_000n);

    const daoName = `LifecycleGuards-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );

    await program.methods
      .initializeDao(
        daoName,
        51,
        new BN(0),
        new BN(4),
        new BN(4),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );

    const seedTreasurySig = await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );
    logTx("seedTreasury:guards", seedTreasurySig, provider.connection.rpcEndpoint);

    await program.methods
      .createProposal(
        "Lifecycle guard proposal",
        "Reject invalid phase transitions.",
        new BN(4),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [voterRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .revealVote(true, [...rng()])
        .accounts({ proposal: proposalPda, voterRecord: voterRecordPda, revealer: voter.publicKey })
        .signers([voter])
        .rpc();
      assert.fail("reveal before commit must be rejected");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("AccountNotInitialized") || msg.includes("not initialized") || msg.includes("does not exist"),
        `unexpected error: ${msg}`,
      );
    }

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute before finalize must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "ProposalNotPassed");
    }

    const commitSalt = rng();
    await program.methods
      .commitVote([...commitment(true, commitSalt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: voterRecordPda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    try {
      await program.methods
        .revealVote(true, [...commitSalt])
        .accounts({ proposal: proposalPda, voterRecord: voterRecordPda, revealer: voter.publicKey })
        .signers([voter])
        .rpc();
      assert.fail("reveal before voting end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "RevealTooEarly");
    }

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
        .rpc();
      assert.fail("finalize before reveal window end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "RevealStillOpen");
    }

    await waitForUnixTimestamp(provider.connection, afterCommit.votingEnd.toNumber(), "guards_voting_end");

    const [lateVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), lateVoter.publicKey.toBuffer()],
      program.programId,
    );
    try {
      await program.methods
        .commitVote([...commitment(true, rng(), lateVoter.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          voterRecord: lateVotePda,
          voterTokenAccount: lateVoterAta,
          voter: lateVoter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([lateVoter])
        .rpc();
      assert.fail("commit after voting end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "VotingClosed");
    }

    await program.methods
      .revealVote(true, [...commitSalt])
      .accounts({ proposal: proposalPda, voterRecord: voterRecordPda, revealer: voter.publicKey })
      .signers([voter])
      .rpc();

    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
        .rpc();
      assert.fail("finalize before reveal end must still be rejected after reveals");
    } catch (err: any) {
      assert.include(err.toString(), "RevealStillOpen");
    }

    const afterReveal = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterReveal.revealEnd.toNumber(), "guards_reveal_end");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
      .rpc();

    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
        .rpc();
      assert.fail("finalize from an invalid state must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "AlreadyFinalized");
    }

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute before timelock unlock must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "ExecutionTimelockActive");
    }

    const finalized = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, finalized.executionUnlocksAt.toNumber(), "guards_execute_at");

    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }).timeout(120_000);

  it("rejects late reveal and keeps failed proposals non-executable", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voter = Keypair.generate();
    const recipient = Keypair.generate();
    for (const wallet of [voter, recipient]) {
      await fundWallet(wallet.publicKey, 0.01);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const voterAta = await createAccount(provider.connection, payer, mint, voter.publicKey);
    await mintTo(provider.connection, payer, mint, voterAta, payer, 1_000_000_000n);

    const daoName = `LateReveal-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );

    await program.methods
      .initializeDao(
        daoName,
        51,
        new BN(0),
        new BN(3),
        new BN(2),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Late reveal should fail",
        "Proposal should fail if no valid reveals arrive before reveal_end.",
        new BN(3),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const salt = rng();
    const [votePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, salt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: votePda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterCommit.revealEnd.toNumber(), "late_reveal_end");

    try {
      await program.methods
        .revealVote(true, [...salt])
        .accounts({ proposal: proposalPda, voterRecord: votePda, revealer: voter.publicKey })
        .signers([voter])
        .rpc();
      assert.fail("reveal after reveal window must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "RevealClosed");
    }

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
      .rpc();

    const failed = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue("failed" in failed.status, "proposal with no valid reveals should fail finalization");
    assert.equal(failed.revealCount.toNumber(), 0, "late reveal must not mutate reveal count");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("failed proposal must not execute");
    } catch (err: any) {
      assert.include(err.toString(), "ProposalNotPassed");
    }
  }).timeout(120_000);

  it("rejects unsafe SendToken execution account wiring", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voter = Keypair.generate();
    const recipient = Keypair.generate();
    const attacker = Keypair.generate();
    await fundWallet(voter.publicKey, 0.01);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const voterAta = await createAccount(provider.connection, payer, mint, voter.publicKey);
    await mintTo(provider.connection, payer, mint, voterAta, payer, 1_000_000_000n);

    const daoName = `TokenGuard-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );

    await program.methods
      .initializeDao(
        daoName,
        51,
        new BN(0),
        new BN(5),
        new BN(1),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );
    const treasuryTokenAccount = getAssociatedTokenAddressSync(
      mint,
      treasuryPda,
      true,
    );
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          treasuryTokenAccount,
          treasuryPda,
          mint,
        ),
      ),
      [],
    );
    const recipientTokenAccount = await createAccount(provider.connection, payer, mint, recipient.publicKey);
    const attackerTokenAccount = await createAccount(provider.connection, payer, mint, attacker.publicKey);
    await mintTo(provider.connection, payer, mint, treasuryTokenAccount, payer, 500_000_000n);

    await program.methods
      .createProposal(
        "Send governance token",
        "Token execution should reject mismatched recipient accounts.",
        new BN(5),
        {
          actionType: { sendToken: {} },
          amountLamports: new BN(100_000_000),
          recipient: recipient.publicKey,
          tokenMint: mint,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const voteSalt = rng();
    const [votePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, voteSalt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: votePda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterCommit.votingEnd.toNumber(), "token_guard_voting_end");

    await program.methods
      .revealVote(true, [...voteSalt])
      .accounts({ proposal: proposalPda, voterRecord: votePda, revealer: voter.publicKey })
      .signers([voter])
      .rpc();

    const afterReveal = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterReveal.revealEnd.toNumber(), "token_guard_reveal_end");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: payer.publicKey })
      .rpc();

    const finalized = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, finalized.executionUnlocksAt.toNumber(), "token_guard_execute_at");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount,
          recipientTokenAccount: attackerTokenAccount,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject recipient token owner mismatch");
    } catch (err: any) {
      assert.include(err.toString(), "RecipientOwnerMismatch");
    }

    const proposalAfterOwnerFailure = await program.account["proposal"].fetch(proposalPda);
    assert.isFalse(proposalAfterOwnerFailure.isExecuted, "failed token execution must not set isExecuted");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount,
          recipientTokenAccount: treasuryTokenAccount,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject duplicate token accounts");
    } catch (err: any) {
      assert.include(err.toString(), "DuplicateTokenAccounts");
    }

    const proposalAfterDuplicateFailure = await program.account["proposal"].fetch(proposalPda);
    assert.isFalse(proposalAfterDuplicateFailure.isExecuted, "duplicate-account failure must leave proposal unexecuted");

    const wrongMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const wrongMintRecipientTokenAccount = await createAccount(provider.connection, payer, wrongMint, recipient.publicKey);

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount,
          recipientTokenAccount: wrongMintRecipientTokenAccount,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject recipient token mint mismatch");
    } catch (err: any) {
      assert.include(err.toString(), "InvalidTokenMint");
    }

    const wrongTreasuryMintAccount = await createAccount(provider.connection, payer, wrongMint, treasuryPda, true);

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: wrongTreasuryMintAccount,
          recipientTokenAccount,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject treasury token mint mismatch");
    } catch (err: any) {
      assert.include(err.toString(), "InvalidTokenMint");
    }

    const payerOwnedSourceToken = await createAccount(provider.connection, payer, mint, payer.publicKey);
    await mintTo(provider.connection, payer, mint, payerOwnedSourceToken, payer, 100_000_000n);

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: payerOwnedSourceToken,
          recipientTokenAccount,
          executor: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("execute must reject a treasury token source not owned by the treasury PDA");
    } catch (err: any) {
      assert.include(err.toString(), "InvalidTreasuryTokenAuthority");
    }

    const recipientBefore = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount,
        recipientTokenAccount,
        executor: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const recipientAfter = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
    assert.equal(
      Number(recipientAfter.value.amount) - Number(recipientBefore.value.amount),
      100_000_000,
      "token treasury execution should succeed only with the configured recipient token account",
    );
  }).timeout(120_000);

  it("rejects finalize with a mismatched dao context and preserves proposal state", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voter = Keypair.generate();
    await fundWallet(voter.publicKey, 0.01);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const voterAta = await createAccount(provider.connection, payer, mint, voter.publicKey);
    await mintTo(provider.connection, payer, mint, voterAta, payer, 1_000_000_000n);

    const primaryDaoName = `FinalizeBinding-${Date.now()}`;
    const secondaryDaoName = `${primaryDaoName}-other`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(primaryDaoName)],
      program.programId,
    );
    const [wrongDaoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(secondaryDaoName)],
      program.programId,
    );

    for (const daoName of [primaryDaoName, secondaryDaoName]) {
      const [dao] = PublicKey.findProgramAddressSync(
        [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
        program.programId,
      );
      await program.methods
        .initializeDao(
          daoName,
          51,
          new BN(0),
          new BN(3),
          new BN(1),
          { tokenWeighted: {} },
        )
        .accounts({
          dao,
          governanceToken: mint,
          authority: payer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Finalize binding guard",
        "Finalize should reject mismatched DAO context.",
        new BN(3),
        null,
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const voteSalt = rng();
    const [votePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, voteSalt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: votePda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterCommit.votingEnd.toNumber(), "finalize_binding_voting_end");

    await program.methods
      .revealVote(true, [...voteSalt])
      .accounts({ proposal: proposalPda, voterRecord: votePda, revealer: voter.publicKey })
      .signers([voter])
      .rpc();

    const afterReveal = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterReveal.revealEnd.toNumber(), "finalize_binding_reveal_end");

    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: wrongDaoPda, proposal: proposalPda, finalizer: voter.publicKey })
        .signers([voter])
        .rpc();
      assert.fail("finalize must reject mismatched dao/proposal pairing");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("ConstraintSeeds") || msg.includes("ConstraintHasOne") || msg.includes("has one constraint"),
        `unexpected error: ${msg}`,
      );
    }

    const proposalAfterFailedFinalize = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue("voting" in proposalAfterFailedFinalize.status, "failed finalize must leave proposal in voting state");
    assert.equal(proposalAfterFailedFinalize.executionUnlocksAt.toNumber(), 0, "failed finalize must not set execute unlock");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: voter.publicKey })
      .signers([voter])
      .rpc();

    const finalized = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue("passed" in finalized.status, "proposal should finalize once the correct dao context is supplied");
  }).timeout(120_000);

  it("rejects execute with a treasury PDA from another dao and leaves execution state unchanged", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voter = Keypair.generate();
    const recipient = Keypair.generate();
    await fundWallet(voter.publicKey, 0.01);
    await fundWallet(recipient.publicKey, 0.01);

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const voterAta = await createAccount(provider.connection, payer, mint, voter.publicKey);
    await mintTo(provider.connection, payer, mint, voterAta, payer, 1_000_000_000n);

    const primaryDaoName = `ExecuteBinding-${Date.now()}`;
    const secondaryDaoName = `${primaryDaoName}-other`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(primaryDaoName)],
      program.programId,
    );
    const [wrongDaoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(secondaryDaoName)],
      program.programId,
    );

    await program.methods
      .initializeDao(
        primaryDaoName,
        51,
        new BN(0),
        new BN(3),
        new BN(1),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .initializeDao(
        secondaryDaoName,
        51,
        new BN(0),
        new BN(3),
        new BN(1),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: wrongDaoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );
    const [wrongTreasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), wrongDaoPda.toBuffer()],
      program.programId,
    );

    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );
    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: wrongTreasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Execute treasury binding guard",
        "Treasury PDA must belong to the same DAO as the proposal.",
        new BN(3),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const voteSalt = rng();
    const [votePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, voteSalt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: votePda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterCommit.votingEnd.toNumber(), "execute_binding_voting_end");

    await program.methods
      .revealVote(true, [...voteSalt])
      .accounts({ proposal: proposalPda, voterRecord: votePda, revealer: voter.publicKey })
      .signers([voter])
      .rpc();

    const afterReveal = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, afterReveal.revealEnd.toNumber(), "execute_binding_reveal_end");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: voter.publicKey })
      .signers([voter])
      .rpc();

    const finalized = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, finalized.executionUnlocksAt.toNumber(), "execute_binding_unlock");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: wrongTreasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: wrongTreasuryPda,
          recipientTokenAccount: wrongTreasuryPda,
          executor: recipient.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([recipient])
        .rpc();
      assert.fail("execute must reject a treasury PDA that belongs to another dao");
    } catch (err: any) {
      assert.include(err.toString(), "ConstraintSeeds");
    }

    const proposalAfterFailedExecute = await program.account["proposal"].fetch(proposalPda);
    assert.isFalse(proposalAfterFailedExecute.isExecuted, "failed execute must not set isExecuted");
    assert.isTrue("passed" in proposalAfterFailedExecute.status, "failed execute must not mutate passed status");

    const treasuryBefore = await provider.connection.getBalance(treasuryPda);
    const recipientBefore = await provider.connection.getBalance(recipient.publicKey);

    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: recipient.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([recipient])
      .rpc();

    const proposalAfterSuccess = await program.account["proposal"].fetch(proposalPda);
    const treasuryAfter = await provider.connection.getBalance(treasuryPda);
    const recipientAfter = await provider.connection.getBalance(recipient.publicKey);

    assert.isTrue(proposalAfterSuccess.isExecuted, "correct treasury binding should allow execution");
    assert.equal(treasuryBefore - treasuryAfter, EXECUTE_LAMPORTS, "treasury delta must match executed SOL amount");
    assert.isAtLeast(recipientAfter - recipientBefore, EXECUTE_LAMPORTS, "recipient must receive the executed SOL amount");
  }).timeout(120_000);

  it("enforces exact before/after phase boundaries for commit, reveal, finalize, and execute", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const [alice, bob, recipient] = Array.from({ length: 3 }, () => Keypair.generate());
    for (const wallet of [alice, bob, recipient]) {
      await fundWallet(wallet.publicKey, 0.01);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const aliceAta = await createAccount(provider.connection, payer, mint, alice.publicKey);
    const bobAta = await createAccount(provider.connection, payer, mint, bob.publicKey);
    await mintTo(provider.connection, payer, mint, aliceAta, payer, 1_000_000_000n);
    await mintTo(provider.connection, payer, mint, bobAta, payer, 1_000_000_000n);

    const daoName = `Boundary-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );
    await program.methods
      .initializeDao(
        daoName,
        51,
        new BN(0),
        new BN(3),
        new BN(2),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Boundary guard",
        "Phase edges should behave exactly as intended.",
        new BN(4),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const saltAlice = rng();
    const saltBob = rng();
    const [aliceVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), alice.publicKey.toBuffer()],
      program.programId,
    );
    const [bobVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), bob.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...commitment(true, saltAlice, alice.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: aliceVotePda,
        voterTokenAccount: aliceAta,
        voter: alice.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    const created = await program.account["proposal"].fetch(proposalPda);
    await waitForUnixTimestamp(provider.connection, created.votingEnd.toNumber() - 1, "boundary_commit_last_second");

    await program.methods
      .commitVote([...commitment(true, saltBob, bob.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: bobVotePda,
        voterTokenAccount: bobAta,
        voter: bob.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bob])
      .rpc();

    const afterLastSecondCommit = await program.account["proposal"].fetch(proposalPda);
    assert.equal(afterLastSecondCommit.commitCount.toNumber(), 2, "commit should still work immediately before voting end");

    try {
      await program.methods
        .revealVote(true, [...saltAlice])
        .accounts({ proposal: proposalPda, voterRecord: aliceVotePda, revealer: alice.publicKey })
        .signers([alice])
        .rpc();
      assert.fail("reveal before voting end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "RevealTooEarly");
    }

    await waitForUnixTimestamp(provider.connection, created.votingEnd.toNumber(), "boundary_reveal_open");

    try {
      await program.methods
        .commitVote([...commitment(false, rng(), bob.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          voterRecord: bobVotePda,
          voterTokenAccount: bobAta,
          voter: bob.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([bob])
        .rpc();
      assert.fail("commit at/after voting end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "VotingClosed");
    }

    await program.methods
      .revealVote(true, [...saltAlice])
      .accounts({ proposal: proposalPda, voterRecord: aliceVotePda, revealer: alice.publicKey })
      .signers([alice])
      .rpc();

    await program.methods
      .revealVote(true, [...saltBob])
      .accounts({ proposal: proposalPda, voterRecord: bobVotePda, revealer: bob.publicKey })
      .signers([bob])
      .rpc();

    const afterReveal = await program.account["proposal"].fetch(proposalPda);
    assert.equal(afterReveal.revealCount.toNumber(), 2, "reveal should open exactly at voting end");

    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: daoPda, proposal: proposalPda, finalizer: recipient.publicKey })
        .signers([recipient])
        .rpc();
      assert.fail("finalize before reveal end must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "RevealStillOpen");
    }

    await waitForUnixTimestamp(provider.connection, afterReveal.revealEnd.toNumber(), "boundary_finalize_open");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: recipient.publicKey })
      .signers([recipient])
      .rpc();

    const finalized = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue("passed" in finalized.status, "finalize should open exactly at reveal end");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: recipient.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([recipient])
        .rpc();
      assert.fail("execute before unlock must be rejected");
    } catch (err: any) {
      assert.include(err.toString(), "ExecutionTimelockActive");
    }

    await waitForUnixTimestamp(provider.connection, finalized.executionUnlocksAt.toNumber(), "boundary_execute_open");

    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: recipient.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([recipient])
      .rpc();

    const executed = await program.account["proposal"].fetch(proposalPda);
    assert.isTrue(executed.isExecuted, "execute should open exactly at unlock boundary");
  }).timeout(120_000);

  it("preserves lifecycle invariants and atomicity across failed and successful transitions", async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const [alice, bob, recipient] = Array.from({ length: 3 }, () => Keypair.generate());
    for (const wallet of [alice, bob, recipient]) {
      await fundWallet(wallet.publicKey, 0.01);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    const payerTokenAta = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          payerTokenAta,
          payer.publicKey,
          mint,
        ),
      ),
      [],
    );
    await mintTo(provider.connection, payer, mint, payerTokenAta, payer, 1_000_000n);
    const aliceAta = await createAccount(provider.connection, payer, mint, alice.publicKey);
    const bobAta = await createAccount(provider.connection, payer, mint, bob.publicKey);
    await mintTo(provider.connection, payer, mint, aliceAta, payer, 1_000_000_000n);
    await mintTo(provider.connection, payer, mint, bobAta, payer, 1_000_000_000n);

    const daoName = `Invariant-${Date.now()}`;
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );
    const [wrongDaoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(`${daoName}-other`)],
      program.programId,
    );
    const [wrongTreasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), wrongDaoPda.toBuffer()],
      program.programId,
    );

    await program.methods
      .initializeDao(
        daoName,
        51,
        new BN(0),
        new BN(3),
        new BN(2),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await program.methods
      .initializeDao(
        `${daoName}-other`,
        51,
        new BN(0),
        new BN(3),
        new BN(2),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: wrongDaoPda,
        governanceToken: mint,
        authority: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: treasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );
    await provider.sendAndConfirm(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: wrongTreasuryPda,
          lamports: TREASURY_SEED_LAMPORTS,
        }),
      ),
      [],
    );

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Invariant guard",
        "Failed paths must never advance the lifecycle.",
        new BN(4),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const saltAlice = rng();
    const saltBob = rng();
    const [aliceVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), alice.publicKey.toBuffer()],
      program.programId,
    );
    const [bobVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), bob.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...commitment(true, saltAlice, alice.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: aliceVotePda,
        voterTokenAccount: aliceAta,
        voter: alice.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();
    await program.methods
      .commitVote([...commitment(false, saltBob, bob.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        voterRecord: bobVotePda,
        voterTokenAccount: bobAta,
        voter: bob.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([bob])
      .rpc();

    const afterCommit = await program.account["proposal"].fetch(proposalPda);
    const beforeFailedFinalize = {
      statusVoting: "voting" in afterCommit.status,
      commitCount: afterCommit.commitCount.toNumber(),
      revealCount: afterCommit.revealCount.toNumber(),
      unlock: afterCommit.executionUnlocksAt.toNumber(),
      yesCapital: afterCommit.yesCapital.toString(),
      noCapital: afterCommit.noCapital.toString(),
      isExecuted: afterCommit.isExecuted,
    };

    try {
      await program.methods
        .finalizeProposal()
        .accounts({ dao: daoPda, proposal: proposalPda, finalizer: recipient.publicKey })
        .signers([recipient])
        .rpc();
      assert.fail("finalize before reveal end must fail");
    } catch (err: any) {
      assert.include(err.toString(), "RevealStillOpen");
    }

    const afterFailedFinalize = await program.account["proposal"].fetch(proposalPda);
    assert.equal("voting" in afterFailedFinalize.status, beforeFailedFinalize.statusVoting);
    assert.equal(afterFailedFinalize.commitCount.toNumber(), beforeFailedFinalize.commitCount);
    assert.equal(afterFailedFinalize.revealCount.toNumber(), beforeFailedFinalize.revealCount);
    assert.equal(afterFailedFinalize.executionUnlocksAt.toNumber(), beforeFailedFinalize.unlock);
    assert.equal(afterFailedFinalize.yesCapital.toString(), beforeFailedFinalize.yesCapital);
    assert.equal(afterFailedFinalize.noCapital.toString(), beforeFailedFinalize.noCapital);
    assert.equal(afterFailedFinalize.isExecuted, beforeFailedFinalize.isExecuted);

    await waitForUnixTimestamp(provider.connection, afterCommit.votingEnd.toNumber(), "invariant_reveal_open");
    await program.methods
      .revealVote(true, [...saltAlice])
      .accounts({ proposal: proposalPda, voterRecord: aliceVotePda, revealer: alice.publicKey })
      .signers([alice])
      .rpc();
    await program.methods
      .revealVote(false, [...saltBob])
      .accounts({ proposal: proposalPda, voterRecord: bobVotePda, revealer: bob.publicKey })
      .signers([bob])
      .rpc();

    const afterReveals = await program.account["proposal"].fetch(proposalPda);
    const aliceVoteRecord = await program.account["voterRecord"].fetch(aliceVotePda);
    const bobVoteRecord = await program.account["voterRecord"].fetch(bobVotePda);
    assert.isTrue(aliceVoteRecord.hasCommitted && aliceVoteRecord.hasRevealed, "revealed implies committed for alice");
    assert.isTrue(bobVoteRecord.hasCommitted && bobVoteRecord.hasRevealed, "revealed implies committed for bob");
    assert.isAtMost(afterReveals.revealCount.toNumber(), afterReveals.commitCount.toNumber(), "reveals must not exceed commits");

    await waitForUnixTimestamp(provider.connection, afterReveals.revealEnd.toNumber(), "invariant_finalize_open");
    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposalPda, finalizer: recipient.publicKey })
      .signers([recipient])
      .rpc();

    const finalized = await program.account["proposal"].fetch(proposalPda);
    assert.isFalse(finalized.isExecuted, "successful finalize alone must not set isExecuted");
    assert.isTrue("failed" in finalized.status, "tied vote should finalize to failed");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          treasury: treasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: treasuryPda,
          recipientTokenAccount: treasuryPda,
          executor: recipient.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([recipient])
        .rpc();
      assert.fail("failed proposal must never execute");
    } catch (err: any) {
      assert.include(err.toString(), "ProposalNotPassed");
    }

    const failedProposal = await program.account["proposal"].fetch(proposalPda);
    assert.isFalse(failedProposal.isExecuted, "failed execute path must not set isExecuted");
    assert.isTrue("failed" in failedProposal.status, "failed proposal must not regress to an earlier state");

    const [successProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), new BN(1).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    await program.methods
      .createProposal(
        "Invariant success path",
        "Only successful execute may set isExecuted.",
        new BN(4),
        {
          actionType: { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient: recipient.publicKey,
          tokenMint: null,
        },
      )
      .accounts({
        dao: daoPda,
        proposal: successProposalPda,
        proposerTokenAccount: payerTokenAta,
        proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const successSalt = rng();
    const [successVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), successProposalPda.toBuffer(), alice.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...commitment(true, successSalt, alice.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: successProposalPda,
        voterRecord: successVotePda,
        voterTokenAccount: aliceAta,
        voter: alice.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    const successAfterCommit = await program.account["proposal"].fetch(successProposalPda);
    await waitForUnixTimestamp(provider.connection, successAfterCommit.votingEnd.toNumber(), "invariant_success_reveal_open");
    await program.methods
      .revealVote(true, [...successSalt])
      .accounts({ proposal: successProposalPda, voterRecord: successVotePda, revealer: alice.publicKey })
      .signers([alice])
      .rpc();

    const successAfterReveal = await program.account["proposal"].fetch(successProposalPda);
    await waitForUnixTimestamp(provider.connection, successAfterReveal.revealEnd.toNumber(), "invariant_success_finalize_open");
    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: successProposalPda, finalizer: recipient.publicKey })
      .signers([recipient])
      .rpc();

    const successFinalized = await program.account["proposal"].fetch(successProposalPda);
    assert.isTrue("passed" in successFinalized.status, "single yes vote should pass");
    assert.isFalse(successFinalized.isExecuted, "passed proposal must still be unexecuted before execute");

    try {
      await program.methods
        .executeProposal()
        .accounts({
          dao: daoPda,
          proposal: successProposalPda,
          treasury: wrongTreasuryPda,
          treasuryRecipient: recipient.publicKey,
          treasuryTokenAccount: wrongTreasuryPda,
          recipientTokenAccount: wrongTreasuryPda,
          executor: recipient.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([recipient])
        .rpc();
      assert.fail("miswired execute must fail");
    } catch (err: any) {
      assert.include(err.toString(), "ConstraintSeeds");
    }

    const afterFailedSuccessExecute = await program.account["proposal"].fetch(successProposalPda);
    assert.isFalse(afterFailedSuccessExecute.isExecuted, "failed execute must not advance lifecycle");
    assert.isTrue("passed" in afterFailedSuccessExecute.status, "failed execute must preserve passed status");
    assert.equal(afterFailedSuccessExecute.executionUnlocksAt.toNumber(), successFinalized.executionUnlocksAt.toNumber(), "failed execute must preserve unlock timestamp");

    const treasuryBefore = await provider.connection.getBalance(treasuryPda);
    const recipientBefore = await provider.connection.getBalance(recipient.publicKey);

    await waitForUnixTimestamp(provider.connection, successFinalized.executionUnlocksAt.toNumber(), "invariant_success_execute_open");
    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda,
        proposal: successProposalPda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: recipient.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([recipient])
      .rpc();

    const successExecuted = await program.account["proposal"].fetch(successProposalPda);
    const treasuryAfter = await provider.connection.getBalance(treasuryPda);
    const recipientAfter = await provider.connection.getBalance(recipient.publicKey);
    assert.isTrue(successExecuted.isExecuted, "successful execute is the only path that sets isExecuted");
    assert.isTrue("passed" in successExecuted.status, "executed proposal remains finalized, not regressed");
    assert.equal(treasuryBefore - treasuryAfter, EXECUTE_LAMPORTS, "successful execute must move exactly the intended amount");
    assert.isAtLeast(recipientAfter - recipientBefore, EXECUTE_LAMPORTS, "recipient balance must increase only on successful execute");
  }).timeout(120_000);
});
