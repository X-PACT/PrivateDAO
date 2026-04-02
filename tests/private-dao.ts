// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint, createAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import { assert } from "chai";
import BN from "bn.js";

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
  const program   = anchor.workspace.PrivateDao as any;
  const authority = provider.wallet as anchor.Wallet;

  const DAO_NAME = "TestDAO";
  let governanceMint: PublicKey;
  let voter1 = Keypair.generate();
  let voter2 = Keypair.generate();
  let voter3 = Keypair.generate();
  let authorityTokenAta: PublicKey;
  let v1Ata: PublicKey, v2Ata: PublicKey, v3Ata: PublicKey;
  let daoPda: PublicKey;
  let proposalPda: PublicKey;
  let salt1: Buffer, salt2: Buffer, salt3: Buffer;

  before(async () => {
    async function fundWallet(pubkey: PublicKey, sol: number): Promise<void> {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: authority.publicKey,
          toPubkey: pubkey,
          lamports: Math.round(sol * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    for (const v of [voter1, voter2, voter3]) {
      await fundWallet(v.publicKey, 0.005);
    }

    governanceMint = await createMint(
      provider.connection, authority.payer, authority.publicKey, null, 6,
    );

    authorityTokenAta = getAssociatedTokenAddressSync(governanceMint, authority.publicKey);
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          authority.publicKey,
          authorityTokenAta,
          authority.publicKey,
          governanceMint,
        ),
      ),
      [],
    );

    v1Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter1.publicKey);
    v2Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter2.publicKey);
    v3Ata = await createAccount(provider.connection, authority.payer, governanceMint, voter3.publicKey);

    await mintTo(provider.connection, authority.payer, governanceMint, v1Ata, authority.payer, 1_000_000_000n);
    await mintTo(provider.connection, authority.payer, governanceMint, v2Ata, authority.payer,   500_000_000n);
    await mintTo(provider.connection, authority.payer, governanceMint, v3Ata, authority.payer,   100_000_000n);
    await mintTo(provider.connection, authority.payer, governanceMint, authorityTokenAta, authority.payer, 1_000_000n);

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
        new BN(0),            // no minimum tokens
        new BN(3600),         // 1h reveal window
        new BN(86400),        // 24h execution timelock
        { tokenWeighted: {} },
      )
      .accounts({
        dao: daoPda, governanceToken: governanceMint,
        authority: authority.publicKey, systemProgram: SystemProgram.programId,
      })
      .rpc();

    const dao = await program.account["dao"].fetch(daoPda);
    assert.equal(dao.daoName, DAO_NAME);
    assert.equal(dao.quorumPercentage, 51);
    assert.equal(dao.proposalCount.toString(), "0");
    console.log("  ✓ DAO initialized");
  });

  it("allows a governance token holder to create a proposal", async () => {
    const dao = await program.account["dao"].fetch(daoPda);

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
        proposerTokenAccount: v1Ata, proposer: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const p = await program.account["proposal"].fetch(proposalPda);
    assert.equal(p.title, "Allocate 10 SOL for marketing");
    assert.equal(p.proposer.toBase58(), voter1.publicKey.toBase58());
    assert.equal(p.commitCount.toString(), "0");
    console.log("  ✓ Token holder created proposal");
  });

  it("rejects invalid treasury action configuration", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
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
          proposerTokenAccount: authorityTokenAta,
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

    const p = await program.account["proposal"].fetch(proposalPda);
    assert.equal(p.commitCount.toString(), "3");
    assert.equal(p.yesCapital.toString(), "0");
    assert.equal(p.noCapital.toString(),  "0");
    console.log("  ✓ 3 votes committed — tally: YES=0 / NO=0 (hidden)");
  });

  it("rejects commit from a zero-balance governance account", async () => {
    const zeroVoter = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: zeroVoter.publicKey,
        lamports: Math.round(0.005 * LAMPORTS_PER_SOL),
      }),
    );
    await provider.sendAndConfirm(tx, []);

    const zeroAta = await createAccount(provider.connection, authority.payer, governanceMint, zeroVoter.publicKey);
    const [zeroVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalPda.toBuffer(), zeroVoter.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .commitVote([...computeCommitment(true, randomSalt(), zeroVoter.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          voterRecord: zeroVotePda,
          voterTokenAccount: zeroAta,
          voter: zeroVoter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([zeroVoter])
        .rpc();
      assert.fail("Should have rejected zero-balance commit");
    } catch (err: any) {
      const msg = err.toString();
      assert.include(msg, "InsufficientTokens");
      console.log("  ✓ zero-balance commit rejected");
    }
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
      const msg = err.toString();
      assert.isTrue(
        msg.includes("AlreadyCommitted")
          || msg.includes("already committed")
          || msg.includes("0x1779")
          || msg.includes("already in use")
          || msg.includes("custom program error: 0x0"),
        `unexpected error: ${msg}`,
      );
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

  it("rejects reveal with mismatched vote payload", async () => {
    const payloadVoter = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: payloadVoter.publicKey,
        lamports: Math.round(0.005 * LAMPORTS_PER_SOL),
      }),
    );
    await provider.sendAndConfirm(tx, []);

    const payloadAta = await createAccount(provider.connection, authority.payer, governanceMint, payloadVoter.publicKey);
    await mintTo(provider.connection, authority.payer, governanceMint, payloadAta, authority.payer, 250_000_000n);

    const dao = await program.account["dao"].fetch(daoPda);
    const [payloadProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Reveal payload guard", "Wrong vote payload must fail commitment verification.", new BN(5), null)
      .accounts({
        dao: daoPda,
        proposal: payloadProposalPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const salt = randomSalt();
    const [payloadVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), payloadProposalPda.toBuffer(), payloadVoter.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...computeCommitment(true, salt, payloadVoter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: payloadProposalPda,
        voterRecord: payloadVotePda,
        voterTokenAccount: payloadAta,
        voter: payloadVoter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([payloadVoter])
      .rpc();

    const created = await program.account["proposal"].fetch(payloadProposalPda);
    await new Promise((resolve) => setTimeout(resolve, Math.max(created.votingEnd.toNumber() - Math.floor(Date.now() / 1000), 0) * 1000 + 1200));

    try {
      await program.methods
        .revealVote(false, [...salt])
        .accounts({ proposal: payloadProposalPda, voterRecord: payloadVotePda, revealer: payloadVoter.publicKey })
        .signers([payloadVoter])
        .rpc();
      assert.fail("Should have rejected reveal with mismatched vote payload");
    } catch (err: any) {
      assert.include(err.toString(), "CommitmentMismatch");
      console.log("  ✓ mismatched reveal payload rejected");
    }
  });

  it("rejects reveal by an unauthorized signer", async () => {
    const voter = Keypair.generate();
    const attacker = Keypair.generate();
    for (const wallet of [voter, attacker]) {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: authority.publicKey,
          toPubkey: wallet.publicKey,
          lamports: Math.round(0.005 * LAMPORTS_PER_SOL),
        }),
      );
      await provider.sendAndConfirm(tx, []);
    }

    const voterAta = await createAccount(provider.connection, authority.payer, governanceMint, voter.publicKey);
    await mintTo(provider.connection, authority.payer, governanceMint, voterAta, authority.payer, 250_000_000n);

    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalForAuthPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Unauthorized reveal", "Only voter or keeper should reveal.", new BN(5), null)
      .accounts({
        dao: daoPda,
        proposal: proposalForAuthPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const salt = randomSalt();
    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalForAuthPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .commitVote([...computeCommitment(true, salt, voter.publicKey)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalForAuthPda,
        voterRecord: voteRecordPda,
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const created = await program.account["proposal"].fetch(proposalForAuthPda);
    await new Promise((resolve) => setTimeout(resolve, Math.max(created.votingEnd.toNumber() - Math.floor(Date.now() / 1000), 0) * 1000 + 1200));

    try {
      await program.methods
        .revealVote(true, [...salt])
        .accounts({ proposal: proposalForAuthPda, voterRecord: voteRecordPda, revealer: attacker.publicKey })
        .signers([attacker])
        .rpc();
      assert.fail("Should have rejected reveal by unauthorized signer");
    } catch (err: any) {
      assert.include(err.toString(), "NotAuthorizedToReveal");
      console.log("  ✓ unauthorized reveal rejected");
    }
  });

  it("rejects voter-record reuse across proposals", async () => {
    const reuseVoter = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: reuseVoter.publicKey,
        lamports: Math.round(0.005 * LAMPORTS_PER_SOL),
      }),
    );
    await provider.sendAndConfirm(tx, []);

    const reuseAta = await createAccount(provider.connection, authority.payer, governanceMint, reuseVoter.publicKey);
    await mintTo(provider.connection, authority.payer, governanceMint, reuseAta, authority.payer, 250_000_000n);

    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalA] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    await program.methods
      .createProposal("Proposal A", "Voter record belongs only to this proposal.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalA,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const daoAfterA = await program.account["dao"].fetch(daoPda);
    const [proposalB] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), daoAfterA.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    await program.methods
      .createProposal("Proposal B", "Cross-proposal voter-record substitution must fail.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalB,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [voteRecordForA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalA.toBuffer(), reuseVoter.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .commitVote([...computeCommitment(true, randomSalt(), reuseVoter.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalB,
          voterRecord: voteRecordForA,
          voterTokenAccount: reuseAta,
          voter: reuseVoter.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([reuseVoter])
        .rpc();
      assert.fail("Should have rejected voter-record reuse across proposals");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("ConstraintSeeds") || msg.includes("seeds constraint"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ voter-record reuse across proposals rejected");
    }
  });

  it("can cancel a proposal during voting", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [cancelPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Cancel me", "Test cancel.", new BN(3600), null)
      .accounts({
        dao: daoPda, proposal: cancelPda,
        proposerTokenAccount: authorityTokenAta, proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .cancelProposal()
      .accounts({ dao: daoPda, proposal: cancelPda, authority: authority.publicKey })
      .rpc();

    const p = await program.account["proposal"].fetch(cancelPda);
    assert.isTrue("cancelled" in p.status, "status should be cancelled");
    console.log("  ✓ proposal cancelled successfully");
  });

  it("rejects zero-value treasury deposit", async () => {
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), daoPda.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .depositTreasury(new BN(0))
        .accounts({
          dao: daoPda,
          treasury: treasuryPda,
          depositor: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have rejected zero-value deposit");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("InvalidTreasuryAction") || msg.includes("custom program error"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ zero-value treasury deposit rejected");
    }
  });

  it("rejects self-delegation", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [selfDelegateProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Self delegation", "Delegators must not be able to double-count themselves.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: selfDelegateProposalPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [delegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), selfDelegateProposalPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .delegateVote(voter1.publicKey)
        .accounts({
          dao: daoPda,
          proposal: selfDelegateProposalPda,
          delegation: delegationPda,
          delegatorTokenAccount: v1Ata,
          delegator: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected self-delegation");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("SelfDelegationNotAllowed") || msg.includes("InvalidDelegatee"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ self-delegation rejected");
    }
  });

  it("rejects delegated commit from a non-delegatee", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [delegatedProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Delegation guard", "Only the declared delegatee may consume delegated voting power.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: delegatedProposalPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [delegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), delegatedProposalPda.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .delegateVote(voter1.publicKey)
      .accounts({
        dao: daoPda,
        proposal: delegatedProposalPda,
        delegation: delegationPda,
        delegatorTokenAccount: v2Ata,
        delegator: voter2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter2])
      .rpc();

    const wrongSalt = randomSalt();
    const [wrongDelegateVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), delegatedProposalPda.toBuffer(), voter3.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .commitDelegatedVote([...computeCommitment(true, wrongSalt, voter3.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: delegatedProposalPda,
          delegation: delegationPda,
          voterRecord: wrongDelegateVotePda,
          delegateeTokenAccount: v3Ata,
          delegatee: voter3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter3])
        .rpc();
      assert.fail("Should have rejected delegated commit from a non-delegatee");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("NotDelegatee") || msg.includes("ConstraintRaw"),
        `unexpected error: ${msg}`,
      );
      console.log("  ✓ delegated vote misuse rejected for non-delegatee");
    }
  });

  it("rejects delegated commit with a delegation record from another proposal", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalA] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Delegation source proposal", "Delegation must stay bound to the proposal it was created for.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalA,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const daoAfterA = await program.account["dao"].fetch(daoPda);
    const [proposalB] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), daoAfterA.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Delegation target proposal", "Cross-proposal delegation substitution must fail.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalB,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [delegationForA] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalA.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .delegateVote(voter1.publicKey)
      .accounts({
        dao: daoPda,
        proposal: proposalA,
        delegation: delegationForA,
        delegatorTokenAccount: v2Ata,
        delegator: voter2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter2])
      .rpc();

    const [voteRecordForB] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalB.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );
    const delegatedSalt = randomSalt();

    try {
      await program.methods
        .commitDelegatedVote([...computeCommitment(true, delegatedSalt, voter1.publicKey)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalB,
          delegation: delegationForA,
          voterRecord: voteRecordForB,
          delegateeTokenAccount: v1Ata,
          delegatee: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected delegated commit using a delegation PDA from another proposal");
    } catch (err: any) {
      const msg = err.toString();
      assert.isTrue(
        msg.includes("ConstraintSeeds") || msg.includes("WrongProposal") || msg.includes("seeds constraint"),
        `unexpected error: ${msg}`,
      );
    }

    const delegation = await program.account["voteDelegation"].fetch(delegationForA);
    assert.isFalse(delegation.isUsed, "failed delegated commit must not consume the delegation");
    console.log("  ✓ delegation record stayed proposal-bound");
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
