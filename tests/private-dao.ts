// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint, createAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, mintTo,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as crypto from "crypto";
import { assert } from "chai";
import BN from "bn.js";

// commitment = sha256(vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32)
function computeCommitment(vote: boolean, salt: Buffer, voter: PublicKey, proposal: PublicKey): Buffer {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, proposal.toBuffer(), voter.toBuffer()]))
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
      await fundWallet(v.publicKey, 0.02);
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

  it("anchors proposal-bound zk proof material on-chain", async () => {
    const [zkAnchorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-proof"), proposalPda.toBuffer(), Buffer.from([1])],
      program.programId,
    );

    const proofHash = [...crypto.randomBytes(32)];
    const publicInputsHash = [...crypto.randomBytes(32)];
    const verificationKeyHash = [...crypto.randomBytes(32)];
    const bundleHash = [...crypto.randomBytes(32)];

    await program.methods
      .anchorZkProof(
        { vote: {} },
        { groth16: {} },
        proofHash,
        publicInputsHash,
        verificationKeyHash,
        bundleHash,
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        zkProofAnchor: zkAnchorPda,
        recorder: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const anchorAccount = await program.account["zkProofAnchor"].fetch(zkAnchorPda);
    assert.equal(anchorAccount.dao.toBase58(), daoPda.toBase58());
    assert.equal(anchorAccount.proposal.toBase58(), proposalPda.toBase58());
    assert.equal(anchorAccount.recordedBy.toBase58(), voter1.publicKey.toBase58());
    assert.deepEqual(anchorAccount.proofHash, proofHash);
    assert.deepEqual(anchorAccount.publicInputsHash, publicInputsHash);
    assert.deepEqual(anchorAccount.verificationKeyHash, verificationKeyHash);
    assert.deepEqual(anchorAccount.bundleHash, bundleHash);
    console.log("  ✓ zk proof anchor recorded on-chain");
  });

  it("records a parallel on-chain zk verification receipt", async () => {
    const [zkAnchorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-proof"), proposalPda.toBuffer(), Buffer.from([1])],
      program.programId,
    );
    const [zkReceiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([1])],
      program.programId,
    );

    await program.methods
      .verifyZkProofOnChain(
        { vote: {} },
        { parallel: {} },
        voter1.publicKey,
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        zkProofAnchor: zkAnchorPda,
        zkVerificationReceipt: zkReceiptPda,
        verifier: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const receipt = await program.account["zkVerificationReceipt"].fetch(zkReceiptPda);
    assert.equal(receipt.dao.toBase58(), daoPda.toBase58());
    assert.equal(receipt.proposal.toBase58(), proposalPda.toBase58());
    assert.equal(receipt.verifiedBy.toBase58(), voter1.publicKey.toBase58());
    assert.deepEqual(receipt.verificationMode, { parallel: {} });
    assert.equal(receipt.verifierProgram.toBase58(), voter1.publicKey.toBase58());
    console.log("  ✓ parallel on-chain zk verification receipt recorded");
  });

  it("configures a proposal-level zk_enforced mode from parallel receipts", async () => {
    const layerSpecs = [
      { key: { delegation: {} }, seed: 2 },
      { key: { tally: {} }, seed: 3 },
    ];

    for (const layer of layerSpecs) {
      const [zkAnchorPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("zk-proof"), proposalPda.toBuffer(), Buffer.from([layer.seed])],
        program.programId,
      );
      const [zkReceiptPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("zk-verify"), proposalPda.toBuffer(), Buffer.from([layer.seed])],
        program.programId,
      );
      const proofHash = [...crypto.randomBytes(32)];
      const publicInputsHash = [...crypto.randomBytes(32)];
      const verificationKeyHash = [...crypto.randomBytes(32)];
      const bundleHash = [...crypto.randomBytes(32)];

      await program.methods
        .anchorZkProof(
          layer.key,
          { groth16: {} },
          proofHash,
          publicInputsHash,
          verificationKeyHash,
          bundleHash,
        )
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          zkProofAnchor: zkAnchorPda,
          recorder: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();

      await program.methods
        .verifyZkProofOnChain(
          layer.key,
          { parallel: {} },
          voter1.publicKey,
        )
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          zkProofAnchor: zkAnchorPda,
          zkVerificationReceipt: zkReceiptPda,
          verifier: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
    }

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

    await program.methods
      .configureProposalZkMode({ zkEnforced: {} })
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        proposalZkPolicy: proposalZkPolicyPda,
        voteZkReceipt: voteReceiptPda,
        delegationZkReceipt: delegationReceiptPda,
        tallyZkReceipt: tallyReceiptPda,
        operator: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const policy = await program.account["proposalZkPolicy"].fetch(proposalZkPolicyPda);
    assert.equal(policy.dao.toBase58(), daoPda.toBase58());
    assert.equal(policy.proposal.toBase58(), proposalPda.toBase58());
    assert.equal(policy.configuredBy.toBase58(), voter1.publicKey.toBase58());
    assert.deepEqual(policy.mode, { zkEnforced: {} });
    assert.equal(policy.requiredLayersMask, 7);
    console.log("  ✓ proposal-level zk_enforced mode configured from parallel receipts");
  });

  it("rejects zk_enforced mode when required receipts are missing", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [missingReceiptProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal(
        "Missing ZK receipts",
        "zk_enforced must not activate without vote, delegation, and tally verification receipts.",
        new BN(3600),
        null,
      )
      .accounts({
        dao: daoPda,
        proposal: missingReceiptProposalPda,
        proposerTokenAccount: v1Ata,
        proposer: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const [proposalZkPolicyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-policy"), missingReceiptProposalPda.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .configureProposalZkMode({ zkEnforced: {} })
        .accounts({
          dao: daoPda,
          proposal: missingReceiptProposalPda,
          proposalZkPolicy: proposalZkPolicyPda,
          voteZkReceipt: PublicKey.findProgramAddressSync(
            [Buffer.from("zk-verify"), missingReceiptProposalPda.toBuffer(), Buffer.from([1])],
            program.programId,
          )[0],
          delegationZkReceipt: PublicKey.findProgramAddressSync(
            [Buffer.from("zk-verify"), missingReceiptProposalPda.toBuffer(), Buffer.from([2])],
            program.programId,
          )[0],
          tallyZkReceipt: PublicKey.findProgramAddressSync(
            [Buffer.from("zk-verify"), missingReceiptProposalPda.toBuffer(), Buffer.from([3])],
            program.programId,
          )[0],
          operator: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected zk_enforced mode without receipts");
    } catch (err: any) {
      assert.include(err.toString(), "ZkVerificationReceiptMissing");
      console.log("  ✓ zk_enforced activation rejected when receipts are missing");
    }
  });

  it("rejects zk_enforced mode when receipts belong to another proposal", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [wrongReceiptProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal(
        "Wrong receipt binding",
        "zk_enforced must stay proposal-bound and reject receipts from another proposal.",
        new BN(3600),
        null,
      )
      .accounts({
        dao: daoPda,
        proposal: wrongReceiptProposalPda,
        proposerTokenAccount: v1Ata,
        proposer: voter1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    const [proposalZkPolicyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zk-policy"), wrongReceiptProposalPda.toBuffer()],
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

    try {
      await program.methods
        .configureProposalZkMode({ zkEnforced: {} })
        .accounts({
          dao: daoPda,
          proposal: wrongReceiptProposalPda,
          proposalZkPolicy: proposalZkPolicyPda,
          voteZkReceipt: voteReceiptPda,
          delegationZkReceipt: delegationReceiptPda,
          tallyZkReceipt: tallyReceiptPda,
          operator: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected zk_enforced mode with receipts from another proposal");
    } catch (err: any) {
      assert.include(err.toString(), "ZkVerificationReceiptMismatch");
      console.log("  ✓ zk_enforced activation rejected for cross-proposal receipts");
    }
  });

  it("rejects zk mode downgrade after zk_enforced is locked", async () => {
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

    try {
      await program.methods
        .configureProposalZkMode({ companion: {} })
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          proposalZkPolicy: proposalZkPolicyPda,
          voteZkReceipt: voteReceiptPda,
          delegationZkReceipt: delegationReceiptPda,
          tallyZkReceipt: tallyReceiptPda,
          operator: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected zk mode downgrade after zk_enforced lock");
    } catch (err: any) {
      assert.include(err.toString(), "ProposalZkModeImmutable");
      console.log("  ✓ zk_enforced policy cannot be downgraded once locked");
    }
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

  it("rejects unsupported CustomCPI treasury actions at proposal creation", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [customCpiProposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    try {
      await program.methods
        .createProposal(
          "Unsupported CustomCPI",
          "CustomCPI should remain reserved rather than pretending to execute on-chain.",
          new BN(3600),
          {
            actionType: { customCpi: {} },
            amountLamports: new BN(0),
            recipient: authority.publicKey,
            tokenMint: null,
          },
        )
        .accounts({
          dao: daoPda,
          proposal: customCpiProposalPda,
          proposerTokenAccount: authorityTokenAta,
          proposer: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have rejected unsupported CustomCPI action");
    } catch (err: any) {
      assert.include(err.toString(), "UnsupportedTreasuryAction");
      console.log("  ✓ unsupported CustomCPI action rejected");
    }
  });

  it("allows voters to commit — tally stays hidden", async () => {
    salt1 = randomSalt(); salt2 = randomSalt(); salt3 = randomSalt();

    const commitment1 = computeCommitment(true,  salt1, voter1.publicKey, proposalPda);
    const commitment2 = computeCommitment(true,  salt2, voter2.publicKey, proposalPda);
    const commitment3 = computeCommitment(false, salt3, voter3.publicKey, proposalPda);

    for (const [voter, ata, commitment] of [
      [voter1, v1Ata, commitment1],
      [voter2, v2Ata, commitment2],
      [voter3, v3Ata, commitment3],
    ] as [Keypair, PublicKey, Buffer][]) {
      const [vrPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      const [delegationMarkerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("delegation"), proposalPda.toBuffer(), voter.publicKey.toBuffer()],
        program.programId,
      );
      await program.methods
        .commitVote([...commitment], null)
        .accounts({
          dao: daoPda, proposal: proposalPda,
          voterRecord: vrPda, delegationMarker: delegationMarkerPda, voterTokenAccount: ata,
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
    const [zeroDelegationMarkerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalPda.toBuffer(), zeroVoter.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .commitVote([...computeCommitment(true, randomSalt(), zeroVoter.publicKey, proposalPda)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          voterRecord: zeroVotePda,
          delegationMarker: zeroDelegationMarkerPda,
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
          voterRecord: vrPda,
          delegationMarker: PublicKey.findProgramAddressSync(
            [Buffer.from("delegation"), proposalPda.toBuffer(), voter1.publicKey.toBuffer()],
            program.programId,
          )[0],
          voterTokenAccount: v1Ata,
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
      .commitVote([...computeCommitment(true, salt, payloadVoter.publicKey, payloadProposalPda)], null)
      .accounts({
        dao: daoPda,
        proposal: payloadProposalPda,
        voterRecord: payloadVotePda,
        delegationMarker: PublicKey.findProgramAddressSync(
          [Buffer.from("delegation"), payloadProposalPda.toBuffer(), payloadVoter.publicKey.toBuffer()],
          program.programId,
        )[0],
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
      .commitVote([...computeCommitment(true, salt, voter.publicKey, proposalForAuthPda)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalForAuthPda,
        voterRecord: voteRecordPda,
        delegationMarker: PublicKey.findProgramAddressSync(
          [Buffer.from("delegation"), proposalForAuthPda.toBuffer(), voter.publicKey.toBuffer()],
          program.programId,
        )[0],
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

  it("clears keeper reveal authority after a successful keeper reveal", async () => {
    const voter = Keypair.generate();
    const keeper = Keypair.generate();
    for (const wallet of [voter, keeper]) {
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
    const [proposalForKeeperPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Keeper reveal cleanup", "Successful keeper reveal should clear stored keeper authority.", new BN(5), null)
      .accounts({
        dao: daoPda,
        proposal: proposalForKeeperPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const salt = randomSalt();
    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalForKeeperPda.toBuffer(), voter.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...computeCommitment(true, salt, voter.publicKey, proposalForKeeperPda)], keeper.publicKey)
      .accounts({
        dao: daoPda,
        proposal: proposalForKeeperPda,
        voterRecord: voteRecordPda,
        delegationMarker: PublicKey.findProgramAddressSync(
          [Buffer.from("delegation"), proposalForKeeperPda.toBuffer(), voter.publicKey.toBuffer()],
          program.programId,
        )[0],
        voterTokenAccount: voterAta,
        voter: voter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    const beforeReveal = await program.account["voterRecord"].fetch(voteRecordPda);
    assert.equal(beforeReveal.voterRevealAuthority.toBase58(), keeper.publicKey.toBase58());

    const created = await program.account["proposal"].fetch(proposalForKeeperPda);
    await new Promise((resolve) => setTimeout(resolve, Math.max(created.votingEnd.toNumber() - Math.floor(Date.now() / 1000), 0) * 1000 + 1200));

    await program.methods
      .revealVote(true, [...salt])
      .accounts({ proposal: proposalForKeeperPda, voterRecord: voteRecordPda, revealer: keeper.publicKey })
      .signers([keeper])
      .rpc();

    const afterReveal = await program.account["voterRecord"].fetch(voteRecordPda);
    assert.isTrue(afterReveal.hasRevealed);
    assert.isNull(afterReveal.voterRevealAuthority);
    console.log("  ✓ keeper authority cleared after successful keeper reveal");
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
        .commitVote([...computeCommitment(true, randomSalt(), reuseVoter.publicKey, proposalB)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalB,
          voterRecord: voteRecordForA,
          delegationMarker: PublicKey.findProgramAddressSync(
            [Buffer.from("delegation"), proposalB.toBuffer(), reuseVoter.publicKey.toBuffer()],
            program.programId,
          )[0],
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
          directVoteMarker: PublicKey.findProgramAddressSync(
            [Buffer.from("vote"), selfDelegateProposalPda.toBuffer(), voter1.publicKey.toBuffer()],
            program.programId,
          )[0],
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

  it("rejects delegation after the same wallet already committed directly", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalForOverlapPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Direct vote first", "Delegation must fail once a direct vote record exists.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalForOverlapPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const overlapSalt = randomSalt();
    const [overlapVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalForOverlapPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );
    const [overlapDelegationMarker] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalForOverlapPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );
    const [overlapDelegationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalForOverlapPda.toBuffer(), voter1.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...computeCommitment(true, overlapSalt, voter1.publicKey, proposalForOverlapPda)], null)
      .accounts({
        dao: daoPda,
        proposal: proposalForOverlapPda,
        voterRecord: overlapVotePda,
        delegationMarker: overlapDelegationMarker,
        voterTokenAccount: v1Ata,
        voter: voter1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter1])
      .rpc();

    try {
      await program.methods
        .delegateVote(voter2.publicKey)
        .accounts({
          dao: daoPda,
          proposal: proposalForOverlapPda,
          delegation: overlapDelegationPda,
          directVoteMarker: overlapVotePda,
          delegatorTokenAccount: v1Ata,
          delegator: voter1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter1])
        .rpc();
      assert.fail("Should have rejected delegation after direct commit");
    } catch (err: any) {
      assert.include(err.toString(), "DirectVoteAlreadyCommitted");
      console.log("  ✓ delegation rejected after direct commit");
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
        directVoteMarker: directVoteRecordPda,
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
        .commitDelegatedVote([...computeCommitment(true, wrongSalt, voter3.publicKey, delegatedProposalPda)], null)
        .accounts({
          dao: daoPda,
          proposal: delegatedProposalPda,
          delegation: delegationPda,
          delegatorVoteMarker: directVoteRecordPda,
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
        directVoteMarker: PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), proposalA.toBuffer(), voter2.publicKey.toBuffer()],
          program.programId,
        )[0],
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
        .commitDelegatedVote([...computeCommitment(true, delegatedSalt, voter1.publicKey, proposalB)], null)
        .accounts({
          dao: daoPda,
          proposal: proposalB,
          delegation: delegationForA,
          delegatorVoteMarker: PublicKey.findProgramAddressSync(
            [Buffer.from("vote"), proposalB.toBuffer(), voter2.publicKey.toBuffer()],
            program.programId,
          )[0],
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

  it("rejects direct commit when the same wallet already delegated for the proposal", async () => {
    const dao = await program.account["dao"].fetch(daoPda);
    const [proposalForDelegationConflictPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), daoPda.toBuffer(), dao.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Delegation first", "Direct commit must fail while a delegation marker exists.", new BN(3600), null)
      .accounts({
        dao: daoPda,
        proposal: proposalForDelegationConflictPda,
        proposerTokenAccount: authorityTokenAta,
        proposer: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [delegationConflictPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposalForDelegationConflictPda.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId,
    );
    const [delegationConflictVotePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalForDelegationConflictPda.toBuffer(), voter2.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .delegateVote(voter1.publicKey)
      .accounts({
        dao: daoPda,
        proposal: proposalForDelegationConflictPda,
        delegation: delegationConflictPda,
        directVoteMarker: delegationConflictVotePda,
        delegatorTokenAccount: v2Ata,
        delegator: voter2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter2])
      .rpc();

    try {
      await program.methods
        .commitVote(
          [...computeCommitment(true, randomSalt(), voter2.publicKey, proposalForDelegationConflictPda)],
          null,
        )
        .accounts({
          dao: daoPda,
          proposal: proposalForDelegationConflictPda,
          voterRecord: delegationConflictVotePda,
          delegationMarker: delegationConflictPda,
          voterTokenAccount: v2Ata,
          voter: voter2.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter2])
        .rpc();
      assert.fail("Should have rejected direct commit after delegation");
    } catch (err: any) {
      assert.include(err.toString(), "DelegationOverlap");
      console.log("  ✓ direct commit rejected after delegation");
    }
  });

  it("accepts a Token-2022 governance mint for DAO creation and commit flow", async () => {
    const token2022Name = `PDAO2022-${Date.now()}`;
    const governanceMint2022 = await createMint(
      provider.connection,
      authority.payer,
      authority.publicKey,
      null,
      6,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const authority2022Ata = getAssociatedTokenAddressSync(
      governanceMint2022,
      authority.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          authority.publicKey,
          authority2022Ata,
          authority.publicKey,
          governanceMint2022,
          TOKEN_2022_PROGRAM_ID,
        ),
      ),
      [],
    );
    await mintTo(
      provider.connection,
      authority.payer,
      governanceMint2022,
      authority2022Ata,
      authority.payer,
      1_000_000n,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const voter2022 = Keypair.generate();
    const fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: voter2022.publicKey,
        lamports: Math.round(0.01 * LAMPORTS_PER_SOL),
      }),
    );
    await provider.sendAndConfirm(fundTx, []);

    const voter2022Ata = getAssociatedTokenAddressSync(
      governanceMint2022,
      voter2022.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    await provider.sendAndConfirm(
      new Transaction().add(
        createAssociatedTokenAccountInstruction(
          authority.publicKey,
          voter2022Ata,
          voter2022.publicKey,
          governanceMint2022,
          TOKEN_2022_PROGRAM_ID,
        ),
      ),
      [],
    );
    await mintTo(
      provider.connection,
      authority.payer,
      governanceMint2022,
      voter2022Ata,
      authority.payer,
      500_000_000n,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const [dao2022Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao"), authority.publicKey.toBuffer(), Buffer.from(token2022Name)],
      program.programId,
    );

    await program.methods
      .initializeDao(
        token2022Name,
        51,
        new BN(0),
        new BN(3600),
        new BN(10),
        { tokenWeighted: {} },
      )
      .accounts({
        dao: dao2022Pda,
        governanceToken: governanceMint2022,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const dao2022 = await program.account["dao"].fetch(dao2022Pda);
    const [proposal2022Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), dao2022Pda.toBuffer(), dao2022.proposalCount.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );

    await program.methods
      .createProposal("Token-2022 proposal", "Token-2022 governance accounts should work end-to-end.", new BN(3600), null)
      .accounts({
        dao: dao2022Pda,
        proposal: proposal2022Pda,
        proposerTokenAccount: voter2022Ata,
        proposer: voter2022.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter2022])
      .rpc();

    const [vote2022Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposal2022Pda.toBuffer(), voter2022.publicKey.toBuffer()],
      program.programId,
    );
    const [delegation2022Marker] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegation"), proposal2022Pda.toBuffer(), voter2022.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .commitVote([...computeCommitment(true, randomSalt(), voter2022.publicKey, proposal2022Pda)], null)
      .accounts({
        dao: dao2022Pda,
        proposal: proposal2022Pda,
        voterRecord: vote2022Pda,
        delegationMarker: delegation2022Marker,
        voterTokenAccount: voter2022Ata,
        voter: voter2022.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter2022])
      .rpc();

    const committed = await program.account["proposal"].fetch(proposal2022Pda);
    assert.equal(committed.commitCount.toString(), "1");
    console.log("  ✓ Token-2022 governance mint accepted by DAO and commit flow");
  });

  it("verifies commitment math — deterministic + vote/salt sensitive", () => {
    const vote = true;
    const salt = Buffer.from("a".repeat(32));
    const key  = Keypair.generate().publicKey;

    const proposal = Keypair.generate().publicKey;
    const otherProposal = Keypair.generate().publicKey;
    const c1 = computeCommitment(vote, salt, key, proposal);
    const c2 = computeCommitment(vote, salt, key, proposal);
    const c3 = computeCommitment(false, salt, key, proposal);
    const c4 = computeCommitment(vote, Buffer.from("b".repeat(32)), key, proposal);
    const c5 = computeCommitment(vote, salt, key, otherProposal);

    assert.deepEqual(c1, c2,    "same inputs → same commitment");
    assert.notDeepEqual(c1, c3, "different vote → different commitment");
    assert.notDeepEqual(c1, c4, "different salt → different commitment");
    assert.notDeepEqual(c1, c5, "different proposal → different commitment");
    console.log("  ✓ commitment: deterministic, vote-sensitive, salt-sensitive");
  });
});
