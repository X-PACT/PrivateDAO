package io.xpact.privatedao.android.repository

import io.xpact.privatedao.android.config.PrivateDaoConfig
import io.xpact.privatedao.android.model.CommitVoteForm
import io.xpact.privatedao.android.model.CreateDaoForm
import io.xpact.privatedao.android.model.CreateProposalForm
import io.xpact.privatedao.android.model.DaoSummary
import io.xpact.privatedao.android.model.DaoMode
import io.xpact.privatedao.android.model.DashboardSnapshot
import io.xpact.privatedao.android.model.DepositTreasuryForm
import io.xpact.privatedao.android.model.ProposalActionResult
import io.xpact.privatedao.android.model.ProposalActivity
import io.xpact.privatedao.android.model.ProposalPhase
import io.xpact.privatedao.android.model.ProposalStatus
import io.xpact.privatedao.android.model.ProposalSummary
import io.xpact.privatedao.android.model.RevealVoteForm
import io.xpact.privatedao.android.model.TreasuryActionType
import io.xpact.privatedao.android.model.TreasuryActionView
import io.xpact.privatedao.android.solana.AccountDecoders
import io.xpact.privatedao.android.solana.AccountMeta
import io.xpact.privatedao.android.solana.AnchorEncoding
import io.xpact.privatedao.android.solana.Base58
import io.xpact.privatedao.android.solana.Binary
import io.xpact.privatedao.android.solana.LegacyTransactionBuilder
import io.xpact.privatedao.android.solana.PublicKeyExt
import io.xpact.privatedao.android.solana.RpcAccount
import io.xpact.privatedao.android.solana.SolanaRpcClient
import io.xpact.privatedao.android.solana.SystemAndTokenInstructions
import io.xpact.privatedao.android.solana.TransactionInstruction
import io.xpact.privatedao.android.solana.VoteCommitment
import java.util.Base64

class PrivateDaoRepository(
    private val rpcClient: SolanaRpcClient,
) {
    suspend fun loadDashboard(): DashboardSnapshot {
        val programAccounts = rpcClient.getProgramAccounts(PrivateDaoConfig.programId)
        val daos = programAccounts.mapNotNull { decodeDaoOrNull(it) }
        val daoMap = daos.associateBy { it.pubkey }
        val proposals = programAccounts.mapNotNull { decodeProposalOrNull(it) }
            .sortedByDescending { it.proposalId }
            .map { it.copy(daoSummary = daoMap[it.dao]) }
        return DashboardSnapshot(proposals = proposals, daos = daos.sortedBy { it.daoName.lowercase() })
    }

    suspend fun loadProposal(proposalPubkey: String): ProposalSummary {
        val info = rpcClient.getAccountInfo(proposalPubkey) ?: error("Proposal account not found")
        val proposal = AccountDecoders.decodeProposal(decodeAccountData(info.data), proposalPubkey)
        val daoInfo = rpcClient.getAccountInfo(proposal.dao) ?: error("DAO account not found")
        val dao = AccountDecoders.decodeDao(decodeAccountData(daoInfo.data), proposal.dao)
        return proposal.copy(daoSummary = dao)
    }

    suspend fun loadActivity(proposalPubkey: String): List<ProposalActivity> {
        return rpcClient.getSignaturesForAddress(proposalPubkey).map { entry ->
            ProposalActivity(
                signature = entry.signature,
                explorerUrl = PrivateDaoConfig.txExplorer(entry.signature),
                slot = entry.slot,
                statusLabel = if (entry.err == null) "Confirmed" else "Failed",
                memo = entry.memo,
                blockTimeSeconds = entry.blockTime,
            )
        }
    }

    suspend fun buildCreateProposalTransaction(
        walletPubkey: String,
        form: CreateProposalForm,
    ): ByteArray {
        val dao = loadDao(form.daoPubkey)
        val proposalPda = PublicKeyExt.findProgramAddress(
            listOf(
                "proposal".toByteArray(),
                PublicKeyExt.toBytes(dao.pubkey),
                Binary.u64Le(dao.proposalCount),
            ),
            PrivateDaoConfig.programId,
        ).first
        val proposerAta = PublicKeyExt.deriveAssociatedTokenAddress(
            owner = walletPubkey,
            mint = dao.governanceToken,
            tokenProgramId = PrivateDaoConfig.tokenProgramId,
            associatedProgramId = PrivateDaoConfig.associatedTokenProgramId,
        )
        val treasuryAction = form.treasuryRecipient.takeIf { it.isNotBlank() }?.let {
            TreasuryActionView(
                type = form.treasuryType,
                amountLamports = if (form.treasuryType == TreasuryActionType.SendToken) {
                    form.treasuryAmountSol.toLongOrNull() ?: 0L
                } else {
                    (form.treasuryAmountSol.toDouble() * 1_000_000_000L).toLong()
                },
                recipient = it,
                tokenMint = form.treasuryMint.takeIf { mint -> mint.isNotBlank() },
            )
        }

        val data = Binary.concat(
            AnchorEncoding.discriminator("create_proposal"),
            Binary.string(form.title),
            Binary.string(form.description),
            Binary.i64Le(form.durationSeconds),
            AnchorEncoding.optionTreasuryAction(treasuryAction),
        )
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = true),
                AccountMeta(proposalPda, isSigner = false, isWritable = true),
                AccountMeta(proposerAta, isSigner = false, isWritable = false),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildCommitTransaction(
        walletPubkey: String,
        proposal: ProposalSummary,
        form: CommitVoteForm,
    ): Pair<ByteArray, ByteArray> {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val voterRecord = PublicKeyExt.findProgramAddress(
            listOf(
                "vote".toByteArray(),
                PublicKeyExt.toBytes(proposal.pubkey),
                PublicKeyExt.toBytes(walletPubkey),
            ),
            PrivateDaoConfig.programId,
        ).first
        val voterAta = PublicKeyExt.deriveAssociatedTokenAddress(
            owner = walletPubkey,
            mint = dao.governanceToken,
            tokenProgramId = PrivateDaoConfig.tokenProgramId,
            associatedProgramId = PrivateDaoConfig.associatedTokenProgramId,
        )
        val salt = VoteCommitment.randomSalt32()
        val commitment = VoteCommitment.compute(form.voteYes, salt, walletPubkey)
        val data = Binary.concat(
            AnchorEncoding.discriminator("commit_vote"),
            commitment,
            AnchorEncoding.optionPubkey(form.keeperPubkey.takeIf { it.isNotBlank() }),
        )
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(voterRecord, isSigner = false, isWritable = true),
                AccountMeta(voterAta, isSigner = false, isWritable = false),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.tokenProgramId, isSigner = false, isWritable = false),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction)) to salt
    }

    suspend fun buildRevealTransaction(
        walletPubkey: String,
        proposal: ProposalSummary,
        form: RevealVoteForm,
    ): ByteArray {
        val voter = form.voterPubkeyOverride.takeIf { it.isNotBlank() } ?: walletPubkey
        val voterRecord = PublicKeyExt.findProgramAddress(
            listOf(
                "vote".toByteArray(),
                PublicKeyExt.toBytes(proposal.pubkey),
                PublicKeyExt.toBytes(voter),
            ),
            PrivateDaoConfig.programId,
        ).first
        val data = Binary.concat(
            AnchorEncoding.discriminator("reveal_vote"),
            Binary.bool(form.voteYes),
            Binary.hexToBytes(form.saltHex),
        )
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(voterRecord, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildFinalizeTransaction(walletPubkey: String, proposal: ProposalSummary): ByteArray {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val data = AnchorEncoding.discriminator("finalize_proposal")
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildCancelTransaction(walletPubkey: String, proposal: ProposalSummary): ByteArray {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val data = AnchorEncoding.discriminator("cancel_proposal")
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildVetoTransaction(walletPubkey: String, proposal: ProposalSummary): ByteArray {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val data = AnchorEncoding.discriminator("veto_proposal")
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildExecuteTransaction(walletPubkey: String, proposal: ProposalSummary): ByteArray {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val treasury = dao.treasuryPda
        val action = proposal.treasuryAction
        val recipient = action?.recipient ?: treasury
        val treasuryTokenAccount = if (action?.type == TreasuryActionType.SendToken) {
            PublicKeyExt.deriveAssociatedTokenAddress(
                owner = treasury,
                mint = requireNotNull(action.tokenMint),
                tokenProgramId = PrivateDaoConfig.tokenProgramId,
                associatedProgramId = PrivateDaoConfig.associatedTokenProgramId,
            )
        } else treasury
        val recipientTokenAccount = if (action?.type == TreasuryActionType.SendToken) {
            PublicKeyExt.deriveAssociatedTokenAddress(
                owner = recipient,
                mint = requireNotNull(action.tokenMint),
                tokenProgramId = PrivateDaoConfig.tokenProgramId,
                associatedProgramId = PrivateDaoConfig.associatedTokenProgramId,
            )
        } else treasury
        val data = AnchorEncoding.discriminator("execute_proposal")
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(treasury, isSigner = false, isWritable = true),
                AccountMeta(recipient, isSigner = false, isWritable = true),
                AccountMeta(treasuryTokenAccount, isSigner = false, isWritable = true),
                AccountMeta(recipientTokenAccount, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.tokenProgramId, isSigner = false, isWritable = false),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
    }

    suspend fun buildCreateDaoTransaction(
        walletPubkey: String,
        form: CreateDaoForm,
    ): Pair<ByteArray, String> {
        val mintSeed = buildMintSeed(form.daoName)
        val mintPubkey = PublicKeyExt.createWithSeed(
            base = walletPubkey,
            seed = mintSeed,
            ownerProgramId = PrivateDaoConfig.tokenProgramId,
        )
        val daoPda = PublicKeyExt.findProgramAddress(
            listOf("dao".toByteArray(), PublicKeyExt.toBytes(walletPubkey), form.daoName.toByteArray()),
            PrivateDaoConfig.programId,
        ).first
        val mintRent = runCatching {
            rpcClient.getMinimumBalanceForRentExemption(PrivateDaoConfig.mintAccountSpace)
        }.getOrDefault(PrivateDaoConfig.mintRentExemptionLamports)
        val votingConfig = when (form.mode) {
            DaoMode.TokenWeighted -> byteArrayOf(0)
            DaoMode.Quadratic -> byteArrayOf(1)
            DaoMode.DualChamber -> byteArrayOf(2, 50, 50)
        }

        val initializeDaoIx = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(daoPda, isSigner = false, isWritable = true),
                AccountMeta(mintPubkey, isSigner = false, isWritable = false),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = Binary.concat(
                AnchorEncoding.discriminator("initialize_dao"),
                Binary.string(form.daoName),
                byteArrayOf(form.quorumPercentage.toByte()),
                Binary.u64Le(0),
                Binary.i64Le(form.revealWindowSeconds),
                Binary.i64Le(form.executionDelaySeconds),
                votingConfig,
            ),
        )

        val instructions = listOf(
            SystemAndTokenInstructions.createAccountWithSeed(
                payer = walletPubkey,
                newAccount = mintPubkey,
                base = walletPubkey,
                seed = mintSeed,
                lamports = mintRent,
                ownerProgramId = PrivateDaoConfig.tokenProgramId,
            ),
            SystemAndTokenInstructions.initializeMint(
                mint = mintPubkey,
                mintAuthority = walletPubkey,
            ),
            initializeDaoIx,
        )

        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), instructions) to daoPda
    }

    suspend fun buildDepositTreasuryTransaction(
        walletPubkey: String,
        form: DepositTreasuryForm,
    ): Pair<ByteArray, String> {
        val dao = loadDao(form.daoPubkey)
        val lamports = (form.amountSol.toDouble() * 1_000_000_000L).toLong()
        require(lamports > 0) { "Deposit amount must be greater than zero" }
        val data = Binary.concat(
            AnchorEncoding.discriminator("deposit_treasury"),
            Binary.u64Le(lamports),
        )
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(dao.treasuryPda, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction)) to dao.treasuryPda
    }

    fun computeProposalPhase(proposal: ProposalSummary, nowSeconds: Long = System.currentTimeMillis() / 1000): ProposalPhase {
        if (proposal.isExecuted) return ProposalPhase.Executed
        return when (proposal.status) {
            ProposalStatus.Cancelled -> ProposalPhase.Cancelled
            ProposalStatus.Vetoed -> ProposalPhase.Vetoed
            ProposalStatus.Failed -> ProposalPhase.Failed
            ProposalStatus.Passed -> if (nowSeconds < proposal.executionUnlocksAt) ProposalPhase.Timelocked else ProposalPhase.Executable
            ProposalStatus.Voting -> when {
                nowSeconds < proposal.votingEnd -> ProposalPhase.Commit
                nowSeconds < proposal.revealEnd -> ProposalPhase.Reveal
                else -> ProposalPhase.ReadyToFinalize
            }
            else -> ProposalPhase.Finalized
        }
    }

    private suspend fun loadDao(daoPubkey: String): DaoSummary {
        val info = rpcClient.getAccountInfo(daoPubkey) ?: error("DAO account not found")
        return AccountDecoders.decodeDao(decodeAccountData(info.data), daoPubkey)
    }

    private fun decodeDaoOrNull(account: RpcAccount): DaoSummary? = runCatching {
        if (account.account.space != 210) return null
        AccountDecoders.decodeDao(decodeAccountData(account.account.data), account.pubkey)
    }.getOrNull()

    private fun decodeProposalOrNull(account: RpcAccount): ProposalSummary? = runCatching {
        if (account.account.space != 1390) return null
        AccountDecoders.decodeProposal(decodeAccountData(account.account.data), account.pubkey)
    }.getOrNull()

    private fun decodeAccountData(data: List<String>): ByteArray =
        Base64.getDecoder().decode(data.first())

    private fun buildMintSeed(daoName: String): String {
        val normalized = daoName.lowercase().replace(Regex("[^a-z0-9]"), "")
        val prefix = if (normalized.isBlank()) "privatedao" else normalized.take(12)
        val suffix = Binary.hex(Binary.sha256(daoName.toByteArray())).take(12)
        return "mint-$prefix-$suffix".take(32)
    }
}
