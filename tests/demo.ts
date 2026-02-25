/**
 * demo.ts — PrivateDAO full demonstration
 *
 * Shows the complete lifecycle in one anchor test:
 *
 *   ACT 1 — DualChamber: community overcomes a large NO-voter via delegation
 *   ACT 2 — Vote delegation: delegator grants weight to alice (private)
 *   ACT 3 — Keeper auto-reveal: carol never comes online, keeper reveals
 *   ACT 4 — Cancel proposal: authority kills a bad proposal instantly
 *   ACT 5 — Timelock + execution: treasury fires after delay
 *
 * Run locally (no devnet needed):
 *   solana-test-validator --reset   (separate terminal)
 *   anchor test -- --grep "demo"
 *
 * Token design for DualChamber demo:
 *   whale:     4,000 tokens  →  capital 4,000,000,000  community √4B = 63,245
 *   alice:     1,000 tokens  (+ 2,000 delegated = 3,000 combined)
 *   bob:         900 tokens
 *   carol:       800 tokens
 *   delegator: 2,000 tokens  (delegates to alice)
 *
 *   YES capital  = 4,700,000,000  >  NO capital  = 4,000,000,000  ✓
 *   YES community = 113,056       >  NO community = 63,245         ✓
 *   DualChamber: PASSES — treasury executes
 */

import * as anchor from "@coral-xyz/anchor";
import { Program }  from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint, createAccount, mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import { assert } from "chai";
import BN from "bn.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCommitment(vote: boolean, salt: Buffer, voter: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, voter.toBuffer()]))
    .digest();
}

function randomSalt(): Buffer { return crypto.randomBytes(32); }

function isqrt(n: bigint): bigint {
  if (n === 0n) return 0n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}

function section(label: string) {
  const w = 62;
  const pad = Math.floor((w - label.length - 2) / 2);
  console.log("\n" + "─".repeat(pad) + " " + label + " " + "─".repeat(w - pad - label.length - 2));
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
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

// ── Demo ──────────────────────────────────────────────────────────────────────

describe("demo", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PrivateDao as Program<any>;
  const payer   = (provider.wallet as anchor.Wallet).payer;
  const EXECUTE_LAMPORTS = 100_000;         // 0.0001 SOL
  const TREASURY_SEED_LAMPORTS = 2_000_000; // 0.002 SOL

  it("Full lifecycle: DualChamber + Delegation + Keeper + Cancel + Timelock", async () => {
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

    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║  PrivateDAO — Full Demo                                      ║");
    console.log("║  DualChamber · Delegation · Keeper · Cancel · Timelock      ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");

    // ── Wallets ───────────────────────────────────────────────────────────
    section("Wallets & tokens");

    const whale     = Keypair.generate();
    const alice     = Keypair.generate();
    const bob       = Keypair.generate();
    const carol     = Keypair.generate(); // keeper reveals for her
    const delegator = Keypair.generate(); // delegates weight to alice
    const keeper    = Keypair.generate(); // auto-reveals carol's vote
    const recipient = Keypair.generate(); // receives SOL on treasury execute

    for (const w of [whale, alice, bob, carol, delegator, keeper]) {
      await fundWallet(w.publicKey, 0.005);
    }

    const mint = await createMint(provider.connection, payer, payer.publicKey, null, 6);

    async function mintTokens(owner: Keypair, amount: number): Promise<PublicKey> {
      const ata = await createAccount(provider.connection, payer, mint, owner.publicKey);
      await mintTo(provider.connection, payer, mint, ata, payer, BigInt(amount) * 1_000_000n);
      return ata;
    }

    // Token distribution designed so DualChamber passes:
    //   Community YES (alice_combined + bob + carol) > Community NO (whale)
    //   Capital   YES (alice_combined + bob + carol) > Capital   NO (whale)
    const whaleAta     = await mintTokens(whale,    4_000); // large NO voter
    const aliceAta     = await mintTokens(alice,    1_000);
    const bobAta       = await mintTokens(bob,        900);
    const carolAta     = await mintTokens(carol,      800);
    const delegatorAta = await mintTokens(delegator, 2_000); // delegates to alice

    const SCALE = 1_000_000n;
    const wW = Number(isqrt(4_000n  * SCALE));
    const aW = Number(isqrt(1_000n  * SCALE));
    const bW = Number(isqrt(900n    * SCALE));
    const cW = Number(isqrt(800n    * SCALE));
    const dW = Number(isqrt(2_000n  * SCALE));
    const aliceCombinedW = Number(isqrt(1_000n * SCALE)) + Number(isqrt(2_000n * SCALE));

    console.log(`  ${"Voter".padEnd(12)} ${"Tokens".padStart(8)} ${"Quad weight".padStart(12)} ${"Vote".padStart(6)}`);
    console.log(`  ${"─".repeat(42)}`);
    console.log(`  ${"whale".padEnd(12)} ${"4,000".padStart(8)} ${wW.toString().padStart(12)}    NO`);
    console.log(`  ${"alice".padEnd(12)} ${"1,000".padStart(8)} ${aW.toString().padStart(12)}   YES`);
    console.log(`  ${"bob".padEnd(12)} ${"900".padStart(8)} ${bW.toString().padStart(12)}   YES`);
    console.log(`  ${"carol".padEnd(12)} ${"800".padStart(8)} ${cW.toString().padStart(12)}   YES`);
    console.log(`  ${"delegator".padEnd(12)} ${"2,000".padStart(8)} ${dW.toString().padStart(12)}  →alice`);
    console.log(`  ${"─".repeat(42)}`);
    console.log(`  Alice (combined w/ delegation):`);
    console.log(`    capital   YES = ${(3000).toLocaleString()} tokens  >  NO = ${(4000).toLocaleString()} tokens? No — total YES = 4,700`);
    console.log(`    community YES = ${(aliceCombinedW + bW + cW).toLocaleString()}  >  NO = ${wW.toLocaleString()} ✓`);

    // ── DAO: DualChamber mode ─────────────────────────────────────────────
    section("ACT 1: Create DualChamber DAO");

    const daoName = "PrivateDAO-Demo";
    const [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), payer.publicKey.toBuffer(), Buffer.from(daoName)],
      program.programId,
    );

    await program.methods
      .initializeDao(
        daoName,
        51,                    // 51% quorum
        new BN(0),             // any token holder can vote
        new BN(8),      // 8s reveal window (short for demo)
        new BN(5),      // 5s execution timelock (short for demo)
        { dualChamber: { capitalThreshold: 50, communityThreshold: 50 } },
      )
      .accounts({
        dao: daoPda, governanceToken: mint,
        authority: payer.publicKey, systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`  DAO: ${daoPda.toBase58().slice(0,16)}...`);
    console.log(`  Mode: DualChamber (capital ≥50% AND community ≥50% must both pass)`);
    console.log(`  Timelock: 5s after finalize before funds can move`);

    // ── Create proposal with treasury action ──────────────────────────────
    section("Create proposal + fund treasury");

    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
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

    const [proposal1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8)],
      program.programId,
    );

    const VOTING_SECS = 5;

    await program.methods
      .createProposal(
        "Fund community grant — 0.0001 SOL",
        "Allocate 0.0001 SOL from treasury to community education fund.",
        new BN(VOTING_SECS),
        {
          actionType:     { sendSol: {} },
          amountLamports: new BN(EXECUTE_LAMPORTS),
          recipient:      recipient.publicKey,
          tokenMint:      null,
        },
      )
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        authority: payer.publicKey, proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`  Proposal: ${proposal1Pda.toBase58().slice(0,16)}...`);
    console.log(`  Treasury: send ${(EXECUTE_LAMPORTS / LAMPORTS_PER_SOL).toFixed(4)} SOL to recipient when passed + timelock expires`);
    console.log(`  Treasury PDA: ${treasuryPda.toBase58().slice(0,16)}... (funded ${(TREASURY_SEED_LAMPORTS / LAMPORTS_PER_SOL).toFixed(4)} SOL)`);

    // ── ACT 2: Delegation delegator → alice ───────────────────────────────
    section("ACT 2: Vote delegation (delegator → alice, private)");

    const [delegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposal1Pda.toBuffer(), delegator.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .delegateVote(alice.publicKey)
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        delegation: delegationPda,
        delegatorTokenAccount: delegatorAta,
        delegator: delegator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([delegator])
      .rpc();

    console.log(`  delegator (2,000 tokens) → alice (1,000 tokens)`);
    console.log(`  alice commits with combined: 3,000 tokens capital weight`);
    console.log(`  community weight: √1,000,000,000 + √2,000,000,000 = ${aliceCombinedW.toLocaleString()}`);
    console.log(`  delegation is private — commitment still hidden from everyone`);

    // ── Phase 1: COMMIT ───────────────────────────────────────────────────
    section("Phase 1: COMMIT — tally shows 0/0 throughout");

    const salts: Record<string, Buffer> = {};
    const votes: Record<string, boolean> = {
      alice: true, bob: true, carol: true, whale: false,
    };

    // Alice commits with delegation (combined capital + community weight)
    salts.alice = randomSalt();
    const [aliceRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal1Pda.toBuffer(), alice.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitDelegatedVote([...makeCommitment(votes.alice, salts.alice, alice.publicKey)], null)
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        delegation: delegationPda,
        voterRecord: aliceRecordPda,
        delegateeTokenAccount: aliceAta,
        delegatee: alice.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([alice])
      .rpc();

    // Bob commits normally
    salts.bob = randomSalt();
    const [bobRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal1Pda.toBuffer(), bob.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...makeCommitment(votes.bob, salts.bob, bob.publicKey)], null)
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        voterRecord: bobRecordPda, voterTokenAccount: bobAta,
        voter: bob.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .signers([bob])
      .rpc();

    // Carol commits — authorizes keeper to reveal on her behalf (ACT 3)
    salts.carol = randomSalt();
    const [carolRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal1Pda.toBuffer(), carol.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...makeCommitment(votes.carol, salts.carol, carol.publicKey)], keeper.publicKey)
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        voterRecord: carolRecordPda, voterTokenAccount: carolAta,
        voter: carol.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .signers([carol])
      .rpc();

    // Whale commits NO — large holder trying to block the proposal
    salts.whale = randomSalt();
    const [whaleRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal1Pda.toBuffer(), whale.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...makeCommitment(votes.whale, salts.whale, whale.publicKey)], null)
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        voterRecord: whaleRecordPda, voterTokenAccount: whaleAta,
        voter: whale.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
      })
      .signers([whale])
      .rpc();

    const pCommit = await program.account.proposal.fetch(proposal1Pda);
    assert.equal(pCommit.yesCapital.toNumber(), 0, "tally must be hidden during voting");
    assert.equal(pCommit.noCapital.toNumber(), 0,  "tally must be hidden during voting");
    assert.equal(pCommit.commitCount.toNumber(), 4);
    console.log(`  4 votes committed.  Tally: YES=0 / NO=0  (hidden ✓)`);
    console.log(`  — No whale watching. No bandwagon effect. —`);
    await waitForUnixTimestamp(
      provider.connection,
      pCommit.votingEnd.toNumber(),
      "demo_voting_end",
    );

    // ── Phase 2: REVEAL ───────────────────────────────────────────────────
    section("Phase 2: REVEAL — ACT 3: keeper reveals for carol");

    for (const [name, voterKp, recordPda, revealer] of [
      ["alice",  alice,  aliceRecordPda,  alice],
      ["bob",    bob,    bobRecordPda,    bob],
      ["carol",  carol,  carolRecordPda,  keeper], // keeper reveals — carol never came online
      ["whale",  whale,  whaleRecordPda,  whale],
    ] as [string, Keypair, PublicKey, Keypair][]) {
      await program.methods
        .revealVote(votes[name], [...salts[name]])
        .accounts({
          proposal:    proposal1Pda,
          voterRecord: recordPda,
          revealer:    revealer.publicKey,
        })
        .signers([revealer])
        .rpc();

      const pRev = await program.account.proposal.fetch(proposal1Pda);
      const revealerLabel = name === "carol" ? "KEEPER (carol offline)" : name;
      console.log(
        `  ${name.padEnd(8)} revealed by ${revealerLabel.padEnd(24)}` +
        ` Capital YES/NO: ${pRev.yesCapital.toString().padStart(12)}/${pRev.noCapital.toString().padStart(12)}`
      );
    }

    const pAfterReveal = await program.account.proposal.fetch(proposal1Pda);
    console.log(`\n  ── Final tally ──`);
    console.log(`  Capital chamber:   YES = ${pAfterReveal.yesCapital.toNumber().toLocaleString().padStart(14)}  NO = ${pAfterReveal.noCapital.toNumber().toLocaleString().padStart(13)}`);
    console.log(`  Community chamber: YES = ${pAfterReveal.yesCommunity.toNumber().toLocaleString().padStart(14)}  NO = ${pAfterReveal.noCommunity.toNumber().toLocaleString().padStart(13)}`);
    await waitForUnixTimestamp(
      provider.connection,
      pAfterReveal.revealEnd.toNumber(),
      "demo_reveal_end",
    );

    // ── Phase 3a: FINALIZE ────────────────────────────────────────────────
    section("Phase 3a: FINALIZE — compute result + start timelock");

    await program.methods
      .finalizeProposal()
      .accounts({ dao: daoPda, proposal: proposal1Pda, finalizer: payer.publicKey })
      .rpc();

    const pFinal = await program.account.proposal.fetch(proposal1Pda);
    const passed = "passed" in pFinal.status;
    console.log(`  Result: ${passed ? "✅ PASSED" : "❌ FAILED"}`);

    assert.isTrue(passed, "DualChamber should pass: community overcame the large NO-voter");

    const wait = Math.max(0, pFinal.executionUnlocksAt.toNumber() - Math.floor(Date.now() / 1000));
    console.log(`  Timelock: ${wait}s remaining until execution unlocks`);
    await waitForUnixTimestamp(
      provider.connection,
      pFinal.executionUnlocksAt.toNumber(),
      "demo_execution_unlocks_at",
    );

    // ── Phase 3b: EXECUTE ─────────────────────────────────────────────────
    section("Phase 3b: EXECUTE — treasury fires after timelock (ACT 5)");

    const recipientBefore = await provider.connection.getBalance(recipient.publicKey);

    await program.methods
      .executeProposal()
      .accounts({
        dao: daoPda, proposal: proposal1Pda,
        treasury: treasuryPda,
        treasuryRecipient: recipient.publicKey,
        // For SendSol actions, these token accounts are unused — pass treasury as dummy
        treasuryTokenAccount: treasuryPda,
        recipientTokenAccount: treasuryPda,
        executor: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const recipientAfter  = await provider.connection.getBalance(recipient.publicKey);
    const transferred     = (recipientAfter - recipientBefore) / LAMPORTS_PER_SOL;
    assert.approximately(transferred, EXECUTE_LAMPORTS / LAMPORTS_PER_SOL, 0.00001, "treasury should send configured SOL amount");
    console.log(`  ✅ Treasury sent ${transferred.toFixed(4)} SOL to recipient`);

    const pExec = await program.account.proposal.fetch(proposal1Pda);
    assert.isTrue(pExec.isExecuted, "isExecuted flag must be set");

    // ── ACT 4: CANCEL ─────────────────────────────────────────────────────
    section("ACT 4: Cancel proposal (authority safety mechanism)");

    const [proposal2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), new BN(1).toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal(
        "Proposal with a critical bug",
        "Created by mistake — authority cancels it before any votes are cast.",
        new BN(3600),
        null,
      )
      .accounts({
        dao: daoPda, proposal: proposal2Pda,
        authority: payer.publicKey, proposer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .cancelProposal()
      .accounts({ dao: daoPda, proposal: proposal2Pda, authority: payer.publicKey })
      .rpc();

    const p2 = await program.account.proposal.fetch(proposal2Pda);
    assert.isTrue("cancelled" in p2.status, "proposal must be cancelled");
    console.log(`  ✅ Proposal cancelled. No votes can be cast on cancelled proposals.`);

    // ── Summary ───────────────────────────────────────────────────────────
    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║  DEMO COMPLETE — ALL ASSERTIONS PASSED                      ║");
    console.log("║                                                              ║");
    console.log("║  ✓ DualChamber — capital + community chambers               ║");
    console.log("║  ✓ Commit-reveal — tally was 0/0 throughout voting          ║");
    console.log("║  ✓ Vote delegation — delegator weight combined privately     ║");
    console.log("║  ✓ Keeper auto-reveal — carol never came online              ║");
    console.log("║  ✓ Timelock — treasury waited 5s before executing           ║");
    console.log("║  ✓ Cancel proposal — authority killed bad proposal           ║");
    console.log("║  ✓ Treasury executed — configured SOL amount sent            ║");
    console.log("║                                                              ║");
    console.log("║  No vote buying. No intimidation. No front-running.         ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

  }).timeout(120_000);
});
