package io.xpact.privatedao.android.solana

import io.xpact.privatedao.android.model.DaoSummary
import io.xpact.privatedao.android.model.ProposalStatus
import io.xpact.privatedao.android.model.ProposalSummary
import io.xpact.privatedao.android.model.TreasuryActionType
import io.xpact.privatedao.android.model.TreasuryActionView
import io.xpact.privatedao.android.model.VotingConfig
import io.xpact.privatedao.android.model.VotingConfigLabel
import java.nio.ByteBuffer
import java.nio.ByteOrder

private class Cursor(var offset: Int)

object AccountDecoders {
    fun decodeDao(data: ByteArray, pubkey: String): DaoSummary {
        val c = Cursor(8)
        val authority = readPubkey(data, c)
        val daoName = readString(data, c)
        val governanceToken = readPubkey(data, c)
        val quorumPercentage = data[c.offset++].toInt() and 0xff
        val governanceTokenRequired = readU64(data, c)
        val revealWindowSeconds = readI64(data, c)
        val executionDelaySeconds = readI64(data, c)
        val variant = data[c.offset++].toInt() and 0xff
        val votingConfig = when (variant) {
            0 -> VotingConfig(VotingConfigLabel.TokenWeighted)
            1 -> VotingConfig(VotingConfigLabel.Quadratic)
            else -> {
                val capital = data[c.offset++].toInt() and 0xff
                val community = data[c.offset++].toInt() and 0xff
                VotingConfig(VotingConfigLabel.DualChamber, capital, community)
            }
        }
        val proposalCount = readU64(data, c)
        c.offset += 1 // bump
        return DaoSummary(
            pubkey = pubkey,
            authority = authority,
            daoName = daoName,
            governanceToken = governanceToken,
            quorumPercentage = quorumPercentage,
            governanceTokenRequired = governanceTokenRequired,
            revealWindowSeconds = revealWindowSeconds,
            executionDelaySeconds = executionDelaySeconds,
            votingConfig = votingConfig,
            proposalCount = proposalCount,
            treasuryPda = PublicKeyExt.findProgramAddress(
                listOf("treasury".toByteArray(), PublicKeyExt.toBytes(pubkey)),
                io.xpact.privatedao.android.config.PrivateDaoConfig.programId,
            ).first,
        )
    }

    fun decodeProposal(data: ByteArray, pubkey: String): ProposalSummary {
        val c = Cursor(8)
        val dao = readPubkey(data, c)
        val proposer = readPubkey(data, c)
        val proposalId = readU64(data, c)
        val title = readString(data, c)
        val description = readString(data, c)
        val status = when (data[c.offset++].toInt() and 0xff) {
            0 -> ProposalStatus.Voting
            1 -> ProposalStatus.Passed
            2 -> ProposalStatus.Failed
            3 -> ProposalStatus.Cancelled
            4 -> ProposalStatus.Vetoed
            else -> ProposalStatus.Unknown
        }
        val votingEnd = readI64(data, c)
        val revealEnd = readI64(data, c)
        val yesCapital = readU64(data, c)
        val noCapital = readU64(data, c)
        val yesCommunity = readU64(data, c)
        val noCommunity = readU64(data, c)
        val commitCount = readU64(data, c)
        val revealCount = readU64(data, c)
        val treasuryAction = readTreasuryAction(data, c)
        val executionUnlocksAt = readI64(data, c)
        val isExecuted = data[c.offset].toInt() == 1
        return ProposalSummary(
            pubkey = pubkey,
            dao = dao,
            proposer = proposer,
            proposalId = proposalId,
            title = title,
            description = description,
            status = status,
            votingEnd = votingEnd,
            revealEnd = revealEnd,
            executionUnlocksAt = executionUnlocksAt,
            isExecuted = isExecuted,
            yesCapital = yesCapital,
            noCapital = noCapital,
            yesCommunity = yesCommunity,
            noCommunity = noCommunity,
            commitCount = commitCount,
            revealCount = revealCount,
            treasuryAction = treasuryAction,
        )
    }

    private fun readTreasuryAction(data: ByteArray, c: Cursor): TreasuryActionView? {
        val present = data[c.offset++].toInt() and 0xff
        if (present == 0) return null
        val type = when (data[c.offset++].toInt() and 0xff) {
            0 -> TreasuryActionType.SendSol
            1 -> TreasuryActionType.SendToken
            else -> TreasuryActionType.CustomCpi
        }
        val amount = readU64(data, c)
        val recipient = readPubkey(data, c)
        val hasMint = data[c.offset++].toInt() and 0xff
        val tokenMint = if (hasMint == 1) readPubkey(data, c) else null
        return TreasuryActionView(type, amount, recipient, tokenMint)
    }

    private fun readPubkey(data: ByteArray, c: Cursor): String {
        val out = Base58.encode(data.copyOfRange(c.offset, c.offset + 32))
        c.offset += 32
        return out
    }

    private fun readString(data: ByteArray, c: Cursor): String {
        val len = ByteBuffer.wrap(data, c.offset, 4).order(ByteOrder.LITTLE_ENDIAN).int
        c.offset += 4
        val out = data.copyOfRange(c.offset, c.offset + len).decodeToString()
        c.offset += len
        return out
    }

    private fun readU64(data: ByteArray, c: Cursor): Long {
        val out = ByteBuffer.wrap(data, c.offset, 8).order(ByteOrder.LITTLE_ENDIAN).long
        c.offset += 8
        return out
    }

    private fun readI64(data: ByteArray, c: Cursor): Long = readU64(data, c)
}
