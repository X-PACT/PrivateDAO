package io.xpact.privatedao.android.model

data class ConnectedWallet(
    val accountLabel: String,
    val publicKeyBase58: String,
    val authToken: String,
    val walletUriBase: String?,
)

data class DaoSummary(
    val pubkey: String,
    val authority: String,
    val daoName: String,
    val governanceToken: String,
    val quorumPercentage: Int,
    val governanceTokenRequired: Long,
    val revealWindowSeconds: Long,
    val executionDelaySeconds: Long,
    val votingConfig: VotingConfig,
    val proposalCount: Long,
    val treasuryPda: String,
)

enum class VotingConfigLabel { TokenWeighted, Quadratic, DualChamber }

data class VotingConfig(
    val label: VotingConfigLabel,
    val capitalThreshold: Int? = null,
    val communityThreshold: Int? = null,
)

enum class ProposalStatus {
    Voting,
    Passed,
    Failed,
    Cancelled,
    Vetoed,
    Unknown,
}

enum class ProposalPhase {
    Commit,
    Reveal,
    ReadyToFinalize,
    Timelocked,
    Executable,
    Executed,
    Failed,
    Cancelled,
    Vetoed,
    Finalized,
}

enum class TreasuryActionType {
    SendSol,
    SendToken,
    CustomCpi,
}

data class TreasuryActionView(
    val type: TreasuryActionType,
    val amountLamports: Long,
    val recipient: String,
    val tokenMint: String?,
)

enum class PrivacyPolicyKey {
    ReviewerVisible,
    CommitteePrivate,
    ConfidentialPayout,
    SelectiveDisclosure,
}

data class PrivacyPolicyOption(
    val key: PrivacyPolicyKey,
    val title: String,
    val tech: String,
    val summary: String,
)

data class BillingSku(
    val key: String,
    val title: String,
    val amountSol: Double,
    val memoLabel: String,
    val summary: String,
)

data class ProposalSummary(
    val pubkey: String,
    val dao: String,
    val proposer: String,
    val proposalId: Long,
    val title: String,
    val description: String,
    val status: ProposalStatus,
    val votingEnd: Long,
    val revealEnd: Long,
    val executionUnlocksAt: Long,
    val isExecuted: Boolean,
    val yesCapital: Long,
    val noCapital: Long,
    val yesCommunity: Long,
    val noCommunity: Long,
    val commitCount: Long,
    val revealCount: Long,
    val treasuryAction: TreasuryActionView?,
    val daoSummary: DaoSummary? = null,
)

data class ProposalActionResult(
    val signature: String,
    val explorerUrl: String,
)

data class ProposalActivity(
    val signature: String,
    val explorerUrl: String,
    val slot: Long,
    val statusLabel: String,
    val memo: String?,
    val blockTimeSeconds: Long?,
)

data class DashboardSnapshot(
    val proposals: List<ProposalSummary>,
    val daos: List<DaoSummary>,
)

data class AwardEntry(
    val title: String,
    val challenge: String,
    val platform: String,
    val dateLabel: String,
)

data class CreateProposalForm(
    val daoPubkey: String = "",
    val title: String = "Fund community work",
    val description: String = "Proposal to allocate treasury funds through the live PrivateDAO governance flow.",
    val durationSeconds: Long = 30,
    val treasuryRecipient: String = "",
    val treasuryAmountSol: String = "0.05",
    val treasuryType: TreasuryActionType = TreasuryActionType.SendSol,
    val treasuryMint: String = "",
)

enum class DaoMode {
    TokenWeighted,
    Quadratic,
    DualChamber,
}

data class CreateDaoForm(
    val daoName: String = "PrivateDAO Live",
    val quorumPercentage: Int = 51,
    val revealWindowSeconds: Long = 3600,
    val executionDelaySeconds: Long = 86400,
    val mode: DaoMode = DaoMode.TokenWeighted,
)

data class DepositTreasuryForm(
    val daoPubkey: String = "",
    val amountSol: String = "0.2",
)

data class CommitVoteForm(
    val voteYes: Boolean = true,
    val keeperPubkey: String = "",
)

data class RevealVoteForm(
    val voteYes: Boolean = true,
    val saltHex: String = "",
    val voterPubkeyOverride: String = "",
)

sealed interface SubmissionState {
    data object Idle : SubmissionState
    data object InFlight : SubmissionState
    data class Success(val result: ProposalActionResult) : SubmissionState
    data class Failure(val message: String) : SubmissionState
}
