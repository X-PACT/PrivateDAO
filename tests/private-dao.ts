// Copyright (c) 2026 X-PACT. MIT License.
import * as anchor from "@coral-xyz/anchor";
import { Program, BN }  from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  createMint, createAccount, mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import { assert } from "chai";

// commitment = sha256(vote_byte || salt_32 || voter_pubkey_32)
function computeCommitment(vote: boolean, salt: Buffer, voter: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, voter.toBuffer()]))
    .digest();
}

function randomSalt(): Buffer { return crypto.randomBytes(32); }

describe("PrivateDAO", () => {
  const provider  = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program   = anchor.workspace.PrivateDao as Program<any>;
  const authority = provider.wallet as anchor.Wallet;

  const DAO_NAME = "TestDAO";
  let governanceMint: PublicKey;
  let voter1 = Keypair.generate();
  let voter2 = Keypair.generate();
  let voter3 = Keypair.generate();
  let v1Ata: PublicKey, v2Ata: PublicKey, v3Ata: PublicKey;
  let daoPda: PublicKey;
  let proposalPda: PublicKey;
  let salt1: Buffer, salt2: Buffer, salt3: Buffer;

  before(async () => {
    for (const v of [voter1, voter2, voter3]) {
      const sig = await provider.connection.requestAirdrop(v.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    }

    governanceMint = await createMint(
      provider.connection, authority.payer, authority.publicKey, null, 6,
    );

    v1Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter1.publicKey);
    v2Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter2.publicKey);
    v3Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter3.publicKey);

    await mintTo(provider.connection, authority.payer, governanceMint, v1Ata, authority.payer, 1_000_000_000n);
    await mintTo(provider.connection, authority.payer, governanceMint, v2Ata, authority.payer,   500_000_000n);
    await mintTo(provider.connection, authority.payer, governanceMint, v3Ata, authority.payer,   100_000_000n);

    [daoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), authority.publicKey.toBuffer(), Buffer.from(DAO_NAME)],
      program.programId,
    );
  });

  it("initializes a DAO (TokenWeighted mode)", async () => {
    await program.methods
      .initializeDao(
        DAO_NAME,
        51,                   // 51% quorum
        0,                    // no minimum tokens
        3600,                 // 1h reveal window
        86400,                // 24h execution timelock
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda, governanceToken: governanceMint,
        authority: authority.publicKey, systemProgram: SystemProgram.programId,
      })
      .rpc();

    const dao = await program.account.dao.fetch(daoPda);
    assert.equal(dao.daoName, DAO_NAME);
    assert.equal(dao.quorumPercentage, 51);
    assert.equal(dao.proposalCount.toString(), "0");
    console.log("  ✓ DAO initialized");
  });

  it("creates a proposal", async () => {
    const dao = await program.account.dao.fetch(daoPda);

    [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal(
        "Allocate 10 SOL for marketing",
        "Proposal to fund community marketing for Q1 2026.",
        new BN(3600),
        null,
      )
      .accounts({
        dao: daoPda, proposal: proposalPda,
        authority: authority.publicKey, proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const p = await program.account.proposal.fetch(proposalPda);
    assert.equal(p.title, "Allocate 10 SOL for marketing");
    assert.equal(p.commitCount.toString(), "0");
    console.log("  ✓ Proposal created");
  });

  it("rejects invalid treasury action configuration", async () => {
    const dao = await program.account.dao.fetch(daoPda);
    const [invalidProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    try {
      await program.methods
        .createProposal(
          "Invalid token action",
          "SendToken without token mint must fail.",
          new BN(3600),
          {
            actionType: { sendToken: {} },
            amountLamports: new BN(1),
            recipient: authority.publicKey,
            tokenMint: null,
          },
        )
        .accounts({
          dao: daoPda,
          proposal: invalidProposalPda,
          authority: authority.publicKey,
          proposer: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have rejected invalid treasury action");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("TokenMintRequired") || msg.includes("InvalidTreasuryAction"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ invalid treasury action rejected");
    }
  });

  it("allows voters to commit — tally stays hidden", async () => {
    salt1 = randomSalt(); salt2 = randomSalt(); salt3 = randomSalt();

    const commitment1 = computeCommitment(true,  salt1, voter1.publicKey);
    const commitment2 = computeCommitment(true,  salt2, voter2.publicKey);
    const commitment3 = computeCommitment(false, salt3, voter3.publicKey);

    for (const [voter, ata, commitment] of [
      [voter1, v1Ata, commitment1],
      [voter2, v2Ata, commitment2],
      [voter3, v3Ata, commitment3],
    ] as [Keypair, PublicKey, Buffer][]) {
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      await program.methods
        .commitVote([...commitment], null)
        .accounts({
          dao: daoPda, proposal: proposalPda,
          voterRecord: vrPda, voterTokenAccount: ata,
          voter: voter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
    }

    const p = await program.account.proposal.fetch(proposalPda);
    assert.equal(p.commitCount.toString(), "3");
    assert.equal(p.yesCapital.toString(), "0");
    assert.equal(p.noCapital.toString(),  "0");
    console.log("  ✓ 3 votes committed — tally: YES=0 / NO=0 (hidden)");
  });

  it("rejects double-commit", async () => {
    const [vrPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );
    try {
      await program.methods
        .commitVote([...randomSalt()], null)
        .accounts({
          dao: daoPda, proposal: proposalPda,
          voterRecord: vrPda, voterTokenAccount: v1Ata,
          voter: voter1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected double commit");
    } catch (err: any) {
      assert.include(err.toString(), "AlreadyCommitted");
      console.log("  ✓ double-commit rejected");
    }
  });

  it("rejects reveal with wrong salt", async () => {
    const [vrPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );
    try {
      await program.methods
        .revealVote(true, [...randomSalt()])
        .accounts({ proposal: proposalPda, voterRecord: vrPda, revealer: voter1.publicKey })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("RevealTooEarly") || msg.includes("CommitmentMismatch"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ invalid reveal rejected (RevealTooEarly or CommitmentMismatch)");
    }
  });

  it("can cancel a proposal during voting", async () => {
    const dao = await program.account.dao.fetch(daoPda);
    const [cancelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Cancel me", "Test cancel.", new BN(3600), null)
      .accounts({
        dao: daoPda, proposal: cancelPda,
        authority: authority.publicKey, proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .cancelProposal()
      .accounts({ dao: daoPda, proposal: cancelPda, authority: authority.publicKey })
      .rpc();

    const p = await program.account.proposal.fetch(cancelPda);
    assert.isTrue("cancelled" in p.status, "status should be cancelled");
    console.log("  ✓ proposal cancelled successfully");
  });

  it("verifies commitment math — deterministic + vote/salt sensitive", () => {
    const vote = true;
    const salt = Buffer.from("a".repeat(32));
    const key  = Keypair.generate().publicKey;

    const c1 = computeCommitment(vote, salt, key);
    const c2 = computeCommitment(vote, salt, key);
    const c3 = computeCommitment(false, salt, key);
    const c4 = computeCommitment(vote, Buffer.from("b".repeat(32)), key);

    assert.deepEqual(c1, c2,    "same inputs → same commitment");
    assert.notDeepEqual(c1, c3, "different vote → different commitment");
    assert.notDeepEqual(c1, c4, "different salt → different commitment");
    console.log("  ✓ commitment: deterministic, vote-sensitive, salt-sensitive");
  });
});
