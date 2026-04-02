package io.xpact.privatedao.android.repository

import io.xpact.privatedao.android.config.PrivateDaoConfig
import io.xpact.privatedao.android.model.CommitVoteForm
import io.xpact.privatedao.android.model.CreateProposalForm
import io.xpact.privatedao.android.model.DaoSummary
import io.xpact.privatedao.android.model.DashboardSnapshot
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
                type = TreasuryActionType.SendSol,
                amountLamports = (form.treasuryAmountSol.toDouble() * 1_000_000_000L).toLong(),
                recipient = it,
                tokenMint = null,
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

    suspend fun buildExecuteTransaction(walletPubkey: String, proposal: ProposalSummary): ByteArray {
        val dao = proposal.daoSummary ?: loadDao(proposal.dao)
        val treasury = dao.treasuryPda
        val action = proposal.treasuryAction
        if (action?.type == TreasuryActionType.SendToken) {
            error("Android native execute currently supports SendSol and CustomCPI-equivalent recipient signaling only")
        }
        val recipient = action?.recipient ?: treasury
        val data = AnchorEncoding.discriminator("execute_proposal")
        val instruction = TransactionInstruction(
            programId = PrivateDaoConfig.programId,
            accounts = listOf(
                AccountMeta(dao.pubkey, isSigner = false, isWritable = false),
                AccountMeta(proposal.pubkey, isSigner = false, isWritable = true),
                AccountMeta(treasury, isSigner = false, isWritable = true),
                AccountMeta(recipient, isSigner = false, isWritable = true),
                AccountMeta(treasury, isSigner = false, isWritable = true),
                AccountMeta(treasury, isSigner = false, isWritable = true),
                AccountMeta(walletPubkey, isSigner = true, isWritable = true),
                AccountMeta(PrivateDaoConfig.tokenProgramId, isSigner = false, isWritable = false),
                AccountMeta(PrivateDaoConfig.systemProgramId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
        return LegacyTransactionBuilder.build(walletPubkey, rpcClient.getLatestBlockhash(), listOf(instruction))
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
}
