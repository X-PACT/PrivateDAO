// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * create-proposal.ts
 * Creates a governance proposal with optional treasury action.
 *
 * Usage:
 *   yarn ts-node scripts/create-proposal.ts --dao <DAO_PDA> --title "Fund marketing: 5 SOL"
 *   yarn ts-node scripts/create-proposal.ts --dao <DAO_PDA> --title "..." \
 *     --treasury-recipient <WALLET> --treasury-amount 0.5
 */
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  associatedTokenAddressForMint,
  deriveConfidentialPayoutPlanPda,
  deriveRefheEnvelopePda,
  formatSol,
  formatTimestamp,
  parseArgs,
  solscanAccountUrl,
  solscanTxUrl,
  workspaceProgram,
} from "./utils";

async function main() {
  const {
    dao: daoPdaStr,
    title = "Allocate 5 SOL for marketing",
    description = "Proposal to allocate 5 SOL from treasury to fund marketing for Q1.",
    duration = 86400, // 24h default
    treasuryType = "sol",
    treasuryRecipient,
    treasuryAmount,
    treasuryMint,
    confidentialType,
    payoutAsset = "sol",
    settlementRecipient,
    payoutTotal,
    payoutMint,
    recipientCount,
    manifestUri,
    manifestHash,
    ciphertextHash,
    refheModelUri,
    refhePolicyHash,
    refheInputCiphertextHash,
    refheEvaluationKeyHash,
  } = parseArgs();

  if (!daoPdaStr) {
    console.error("Error: --dao <DAO_PDA> is required");
    process.exit(1);
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = workspaceProgram();

  const daoPda = new PublicKey(String(daoPdaStr));
  const dao    = await program.account.dao.fetch(daoPda);
  const durationSeconds = Number(duration);
  const { address: proposerTokenAccount } = await associatedTokenAddressForMint(
    provider.connection,
    dao.governanceToken,
    provider.wallet.publicKey,
  );

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    console.error("Error: --duration must be a positive number of seconds");
    process.exit(1);
  }

  console.log(`\n📋 Creating proposal for DAO: ${dao.daoName}`);
  console.log(`   Title:    "${title}"`);
  console.log(`   Duration: ${durationSeconds}s (${(durationSeconds / 3600).toFixed(1)}h voting)`);
  console.log(`   Reveal:   ${dao.revealWindowSeconds}s (${(dao.revealWindowSeconds / 3600).toFixed(1)}h)`);

  const [proposalPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      daoPda.toBuffer(),
      dao.proposalCount.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  // Optional: attach a treasury action (SOL transfer on pass)
  let treasuryAction = null;
  if ((treasuryRecipient && !treasuryAmount) || (!treasuryRecipient && treasuryAmount) || treasuryMint) {
    if (!treasuryRecipient || treasuryAmount === undefined) {
      console.error("Error: treasury actions require both --treasury-recipient and --treasury-amount");
      process.exit(1);
    }
  }

  if (treasuryRecipient && treasuryAmount !== undefined) {
    const treasuryRecipientPk = new PublicKey(String(treasuryRecipient));
    const normalizedType = String(treasuryType).toLowerCase();
    const rawAmount = Number(treasuryAmount);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      console.error("Error: --treasury-amount must be a positive number");
      process.exit(1);
    }

    if (normalizedType === "token") {
      if (!treasuryMint) {
        console.error("Error: token treasury actions require --treasury-mint <TOKEN_MINT>");
        process.exit(1);
      }
      treasuryAction = {
        actionType: { sendToken: {} },
        amountLamports: new anchor.BN(rawAmount),
        recipient: treasuryRecipientPk,
        tokenMint: new PublicKey(String(treasuryMint)),
      };
      console.log(`\n   💰 Treasury action: send ${rawAmount} raw token units to ${treasuryRecipientPk.toBase58()} if passed`);
      console.log(`   Token mint: ${String(treasuryMint)}`);
    } else if (normalizedType === "sol") {
      if (treasuryMint) {
        console.error("Error: do not pass --treasury-mint for SOL treasury actions");
        process.exit(1);
      }
      const lamports = Math.floor(rawAmount * LAMPORTS_PER_SOL);
      if (lamports <= 0) {
        console.error("Error: SOL treasury amount must be large enough to convert to lamports");
        process.exit(1);
      }
      treasuryAction = {
        actionType: { sendSol: {} },
        amountLamports: new anchor.BN(lamports),
        recipient: treasuryRecipientPk,
        tokenMint: null,
      };
      console.log(`\n   💰 Treasury action: send ${formatSol(lamports)} to ${treasuryRecipientPk.toBase58()} if passed`);
    } else {
      console.error("Error: --treasury-type must be either 'sol' or 'token'");
      process.exit(1);
    }
  }

  const confidentialEnabled = Boolean(
    confidentialType || settlementRecipient || payoutTotal || payoutMint || recipientCount || manifestUri || manifestHash || ciphertextHash,
  );
  if (confidentialEnabled && treasuryAction) {
    console.error("Error: confidential payout plans cannot be combined with direct treasury actions on the same proposal");
    process.exit(1);
  }

  let confidentialPayload: null | {
    payoutType: any;
    assetType: any;
    settlementRecipient: PublicKey;
    tokenMint: PublicKey | null;
    recipientCount: number;
    totalAmount: any;
    encryptedManifestUri: string;
    manifestHash: number[];
    ciphertextHash: number[];
  } = null;
  let refhePayload: null | {
    modelUri: string;
    policyHash: number[];
    inputCiphertextHash: number[];
    evaluationKeyHash: number[];
  } = null;

  if (confidentialEnabled) {
    const payoutTypeNormalized = String(confidentialType || "salary").toLowerCase();
    const assetTypeNormalized = String(payoutAsset || "sol").toLowerCase();
    const settlementRecipientPk = settlementRecipient
      ? new PublicKey(String(settlementRecipient))
      : provider.wallet.publicKey;
    const count = Number(recipientCount || 1);
    const uri = String(manifestUri || "").trim();
    const rawTotal = Number(payoutTotal);

    if (!Number.isFinite(rawTotal) || rawTotal <= 0) {
      console.error("Error: confidential payout plans require --payout-total > 0");
      process.exit(1);
    }
    if (!Number.isInteger(count) || count <= 0) {
      console.error("Error: confidential payout plans require --recipient-count >= 1");
      process.exit(1);
    }
    if (!uri) {
      console.error("Error: confidential payout plans require --manifest-uri");
      process.exit(1);
    }
    if (!manifestHash || !ciphertextHash) {
      console.error("Error: confidential payout plans require both --manifest-hash and --ciphertext-hash");
      process.exit(1);
    }

    const manifestHashBytes = Buffer.from(String(manifestHash).replace(/^0x/i, ""), "hex");
    const ciphertextHashBytes = Buffer.from(String(ciphertextHash).replace(/^0x/i, ""), "hex");
    if (manifestHashBytes.length !== 32 || ciphertextHashBytes.length !== 32) {
      console.error("Error: --manifest-hash and --ciphertext-hash must both be 32-byte hex values");
      process.exit(1);
    }

    let tokenMintPk: PublicKey | null = null;
    let assetType: any = { sol: {} };
    let totalAmount = new anchor.BN(rawTotal);

    if (assetTypeNormalized === "token") {
      if (!payoutMint) {
        console.error("Error: token payout batches require --payout-mint <TOKEN_MINT>");
        process.exit(1);
      }
      tokenMintPk = new PublicKey(String(payoutMint));
      assetType = { token: {} };
    } else if (assetTypeNormalized === "sol") {
      const lamports = Math.floor(rawTotal * LAMPORTS_PER_SOL);
      if (lamports <= 0) {
        console.error("Error: SOL payout total must be large enough to convert to lamports");
        process.exit(1);
      }
      totalAmount = new anchor.BN(lamports);
    } else {
      console.error("Error: --payout-asset must be either 'sol' or 'token'");
      process.exit(1);
    }

    confidentialPayload = {
      payoutType: payoutTypeNormalized === "bonus" ? { bonus: {} } : { salary: {} },
      assetType,
      settlementRecipient: settlementRecipientPk,
      tokenMint: tokenMintPk,
      recipientCount: count,
      totalAmount,
      encryptedManifestUri: uri,
      manifestHash: [...manifestHashBytes],
      ciphertextHash: [...ciphertextHashBytes],
    };

    console.log(`\n   🔐 Confidential payout batch: ${payoutTypeNormalized}`);
    console.log(`   Asset type: ${assetTypeNormalized}`);
    console.log(`   Settlement recipient: ${settlementRecipientPk.toBase58()}`);
    console.log(`   Recipient count: ${count}`);
    console.log(`   Manifest URI: ${uri}`);

    const refheEnabled = Boolean(refheModelUri || refhePolicyHash || refheInputCiphertextHash || refheEvaluationKeyHash);
    if (refheEnabled) {
      if (!refheModelUri || !refhePolicyHash || !refheInputCiphertextHash || !refheEvaluationKeyHash) {
        console.error("Error: REFHE envelope requires --refhe-model-uri, --refhe-policy-hash, --refhe-input-ciphertext-hash, and --refhe-evaluation-key-hash");
        process.exit(1);
      }
      const parseHashHex = (value: string | number | boolean | undefined, label: string) => {
        const buffer = Buffer.from(String(value || "").trim().replace(/^0x/i, ""), "hex");
        if (buffer.length !== 32) {
          console.error(`Error: ${label} must be a 32-byte hex value`);
          process.exit(1);
        }
        return [...buffer];
      };
      const refheInput = String(refheInputCiphertextHash).replace(/^0x/i, "").toLowerCase();
      const payoutCiphertext = String(ciphertextHash).replace(/^0x/i, "").toLowerCase();
      if (refheInput !== payoutCiphertext) {
        console.error("Error: --refhe-input-ciphertext-hash must match the confidential payout --ciphertext-hash");
        process.exit(1);
      }
      refhePayload = {
        modelUri: String(refheModelUri).trim(),
        policyHash: parseHashHex(refhePolicyHash, "REFHE policy hash"),
        inputCiphertextHash: parseHashHex(refheInputCiphertextHash, "REFHE input ciphertext hash"),
        evaluationKeyHash: parseHashHex(refheEvaluationKeyHash, "REFHE evaluation key hash"),
      };
      console.log(`   REFHE model URI: ${refhePayload.modelUri}`);
    }
  }

  const tx = await program.methods
    .createProposal(String(title), String(description), new anchor.BN(durationSeconds), treasuryAction)
    .accounts({
      dao: daoPda,
      proposal: proposalPda,
      proposerTokenAccount,
      proposer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  let confidentialTx: string | null = null;
  if (confidentialPayload) {
    const payoutPlanPda = deriveConfidentialPayoutPlanPda(proposalPda, program.programId);
    confidentialTx = await program.methods
      .configureConfidentialPayoutPlan(
        confidentialPayload.payoutType,
        confidentialPayload.assetType,
        confidentialPayload.settlementRecipient,
        confidentialPayload.tokenMint,
        confidentialPayload.recipientCount,
        confidentialPayload.totalAmount,
        confidentialPayload.encryptedManifestUri,
        confidentialPayload.manifestHash,
        confidentialPayload.ciphertextHash,
      )
      .accounts({
        dao: daoPda,
        proposal: proposalPda,
        confidentialPayoutPlan: payoutPlanPda,
        operator: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`   Confidential payout plan: ${payoutPlanPda.toBase58()}`);
    console.log(`   Payout config tx:        ${confidentialTx}`);
    console.log(`   Payout config link:      ${solscanTxUrl(confidentialTx!)}`);

    if (refhePayload) {
      const refheEnvelopePda = deriveRefheEnvelopePda(proposalPda, program.programId);
      const refheTx = await program.methods
        .configureRefheEnvelope(
          refhePayload.modelUri,
          refhePayload.policyHash,
          refhePayload.inputCiphertextHash,
          refhePayload.evaluationKeyHash,
        )
        .accounts({
          dao: daoPda,
          proposal: proposalPda,
          confidentialPayoutPlan: payoutPlanPda,
          refheEnvelope: refheEnvelopePda,
          operator: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(`   REFHE envelope:         ${refheEnvelopePda.toBase58()}`);
      console.log(`   REFHE config tx:        ${refheTx}`);
      console.log(`   REFHE config link:      ${solscanTxUrl(refheTx)}`);
    }
  }

  const proposal = await program.account["proposal"].fetch(proposalPda);

  console.log(`\n✅ Proposal created!`);
  console.log(`   Proposal address: ${proposalPda.toBase58()}`);
  console.log(`   Proposal ID:      ${proposal.proposalId.toString()}`);
  console.log(`   Transaction:      ${tx}`);
  console.log(`   Tx link:          ${solscanTxUrl(tx)}`);
  console.log(`   Proposer token:   ${proposerTokenAccount.toBase58()}`);
  console.log(`   Voting ends:      ${formatTimestamp(proposal.votingEnd.toNumber())}`);
  console.log(`   Reveal ends:      ${formatTimestamp(proposal.revealEnd.toNumber())}`);
  console.log(`   Proposal explorer:${" "}${solscanAccountUrl(proposalPda.toBase58())}`);
  if (confidentialTx !== null) {
    console.log(`   Confidential flow: proposal-bound encrypted payout plan configured`);
  }
  console.log(`\n   Save this:`);
  console.log(`   PROPOSAL_PDA=${proposalPda.toBase58()}`);
  console.log(`   Next: yarn commit -- --proposal ${proposalPda.toBase58()} --vote yes`);
}

main().catch(console.error);
