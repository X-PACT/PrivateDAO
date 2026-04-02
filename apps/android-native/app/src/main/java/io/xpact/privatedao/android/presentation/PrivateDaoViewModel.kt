package io.xpact.privatedao.android.presentation

import android.app.Application
import androidx.activity.result.ActivityResultLauncher
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import io.xpact.privatedao.android.config.PrivateDaoConfig
import io.xpact.privatedao.android.data.StoredVoteEnvelope
import io.xpact.privatedao.android.data.VoteEnvelopeStore
import io.xpact.privatedao.android.model.AwardEntry
import io.xpact.privatedao.android.model.CommitVoteForm
import io.xpact.privatedao.android.model.ConnectedWallet
import io.xpact.privatedao.android.model.CreateProposalForm
import io.xpact.privatedao.android.model.DaoSummary
import io.xpact.privatedao.android.model.ProposalActivity
import io.xpact.privatedao.android.model.ProposalActionResult
import io.xpact.privatedao.android.model.ProposalPhase
import io.xpact.privatedao.android.model.ProposalStatus
import io.xpact.privatedao.android.model.ProposalSummary
import io.xpact.privatedao.android.model.RevealVoteForm
import io.xpact.privatedao.android.model.SubmissionState
import io.xpact.privatedao.android.repository.PrivateDaoRepository
import io.xpact.privatedao.android.solana.Binary
import io.xpact.privatedao.android.solana.SolanaRpcClient
import io.xpact.privatedao.android.wallet.MobileWalletAdapterManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class PrivateDaoViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = PrivateDaoRepository(SolanaRpcClient(PrivateDaoConfig.rpcUrl))
    private val walletManager = MobileWalletAdapterManager(application)
    private val voteEnvelopeStore = VoteEnvelopeStore(application)

    private val _uiState = MutableStateFlow(
        UiState(
            wallet = walletManager.restoreSession(),
            isWalletAvailable = walletManager.isWalletEndpointAvailable(),
        )
    )
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching { repository.loadDashboard() }
                .onSuccess { snapshot ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            proposals = snapshot.proposals,
                            daos = snapshot.daos,
                            createProposalForm = it.createProposalForm.copy(
                                daoPubkey = it.createProposalForm.daoPubkey.ifBlank { snapshot.daos.firstOrNull()?.pubkey.orEmpty() },
                            ),
                        )
                    }
                    uiState.value.selectedProposalPubkey?.let(::selectProposal)
                }
                .onFailure { error ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = error.message ?: "Failed loading devnet data") }
                }
        }
    }

    fun connectWallet(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        viewModelScope.launch {
            runWalletOperation {
                val wallet = walletManager.authorize(launcher)
                _uiState.update { state ->
                    state.copy(
                        wallet = wallet,
                        bannerMessage = "Wallet connected: ${wallet.publicKeyBase58.take(4)}…${wallet.publicKeyBase58.takeLast(4)}",
                    )
                }
            }
        }
    }

    fun disconnectWallet(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val current = uiState.value.wallet ?: return
        viewModelScope.launch {
            runWalletOperation {
                walletManager.deauthorize(launcher, current)
                _uiState.update { it.copy(wallet = null, bannerMessage = "Wallet disconnected") }
            }
        }
    }

    fun selectProposal(proposalPubkey: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(selectedProposalPubkey = proposalPubkey, isLoadingActivity = true) }
            runCatching {
                val proposal = repository.loadProposal(proposalPubkey)
                val activity = repository.loadActivity(proposalPubkey)
                proposal to activity
            }.onSuccess { (proposal, activity) ->
                val saved = uiState.value.wallet?.publicKeyBase58?.let { voteEnvelopeStore.load(proposal.pubkey, it) }
                _uiState.update {
                    it.copy(
                        selectedProposal = proposal,
                        proposalActivity = activity,
                        isLoadingActivity = false,
                        createProposalForm = it.createProposalForm.copy(daoPubkey = proposal.dao),
                        revealVoteForm = saved?.let { env ->
                            it.revealVoteForm.copy(voteYes = env.voteYes, saltHex = env.saltHex, voterPubkeyOverride = "")
                        } ?: it.revealVoteForm,
                    )
                }
            }.onFailure { error ->
                _uiState.update { it.copy(isLoadingActivity = false, errorMessage = error.message ?: "Failed loading proposal detail") }
            }
        }
    }

    fun updateCreateProposalForm(transform: (CreateProposalForm) -> CreateProposalForm) {
        _uiState.update { it.copy(createProposalForm = transform(it.createProposalForm)) }
    }

    fun updateCommitVoteForm(transform: (CommitVoteForm) -> CommitVoteForm) {
        _uiState.update { it.copy(commitVoteForm = transform(it.commitVoteForm)) }
    }

    fun updateRevealVoteForm(transform: (RevealVoteForm) -> RevealVoteForm) {
        _uiState.update { it.copy(revealVoteForm = transform(it.revealVoteForm)) }
    }

    fun submitCreateProposal(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val wallet = uiState.value.wallet ?: return setError("Connect a wallet first.")
        viewModelScope.launch {
            runSubmission {
                val tx = repository.buildCreateProposalTransaction(wallet.publicKeyBase58, uiState.value.createProposalForm)
                walletManager.signAndSendSingleTransaction(launcher, wallet, tx).toResult()
            }
            refresh()
        }
    }

    fun submitCommitVote(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val wallet = uiState.value.wallet ?: return setError("Connect a wallet first.")
        val proposal = uiState.value.selectedProposal ?: return setError("Select a proposal first.")
        viewModelScope.launch {
            runSubmission {
                val (tx, salt) = repository.buildCommitTransaction(wallet.publicKeyBase58, proposal, uiState.value.commitVoteForm)
                val signature = walletManager.signAndSendSingleTransaction(launcher, wallet, tx)
                voteEnvelopeStore.save(
                    StoredVoteEnvelope(
                        proposalPubkey = proposal.pubkey,
                        voterPubkey = wallet.publicKeyBase58,
                        voteYes = uiState.value.commitVoteForm.voteYes,
                        saltHex = Binary.hex(salt),
                    )
                )
                _uiState.update {
                    it.copy(
                        revealVoteForm = it.revealVoteForm.copy(
                            voteYes = uiState.value.commitVoteForm.voteYes,
                            saltHex = Binary.hex(salt),
                        ),
                        bannerMessage = "Commit submitted. Salt saved locally for reveal.",
                    )
                }
                signature.toResult()
            }
            selectProposal(proposal.pubkey)
        }
    }

    fun submitRevealVote(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val wallet = uiState.value.wallet ?: return setError("Connect a wallet first.")
        val proposal = uiState.value.selectedProposal ?: return setError("Select a proposal first.")
        viewModelScope.launch {
            runSubmission {
                val tx = repository.buildRevealTransaction(wallet.publicKeyBase58, proposal, uiState.value.revealVoteForm)
                walletManager.signAndSendSingleTransaction(launcher, wallet, tx).toResult()
            }
            selectProposal(proposal.pubkey)
        }
    }

    fun submitFinalize(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val wallet = uiState.value.wallet ?: return setError("Connect a wallet first.")
        val proposal = uiState.value.selectedProposal ?: return setError("Select a proposal first.")
        viewModelScope.launch {
            runSubmission {
                val tx = repository.buildFinalizeTransaction(wallet.publicKeyBase58, proposal)
                walletManager.signAndSendSingleTransaction(launcher, wallet, tx).toResult()
            }
            selectProposal(proposal.pubkey)
        }
    }

    fun submitExecute(launcher: ActivityResultLauncher<MobileWalletAdapterManager.StartMobileWalletAdapterActivity.CreateParams>) {
        val wallet = uiState.value.wallet ?: return setError("Connect a wallet first.")
        val proposal = uiState.value.selectedProposal ?: return setError("Select a proposal first.")
        viewModelScope.launch {
            runSubmission {
                val tx = repository.buildExecuteTransaction(wallet.publicKeyBase58, proposal)
                walletManager.signAndSendSingleTransaction(launcher, wallet, tx).toResult()
            }
            selectProposal(proposal.pubkey)
        }
    }

    private suspend fun runWalletOperation(block: suspend () -> Unit) {
        _uiState.update { it.copy(walletBusy = true, errorMessage = null) }
        try {
            block()
        } catch (error: Throwable) {
            setError(error.message ?: "Wallet operation failed")
        }
        _uiState.update { it.copy(walletBusy = false) }
    }

    private suspend fun runSubmission(block: suspend () -> ProposalActionResult) {
        _uiState.update { it.copy(submissionState = SubmissionState.InFlight, errorMessage = null) }
        try {
            val result = block()
            _uiState.update {
                it.copy(
                    submissionState = SubmissionState.Success(result),
                    bannerMessage = "Submitted: ${result.signature.take(6)}…${result.signature.takeLast(6)}",
                )
            }
        } catch (error: Throwable) {
            _uiState.update {
                it.copy(
                    submissionState = SubmissionState.Failure(error.message ?: "Transaction failed"),
                    errorMessage = error.message,
                )
            }
        }
    }

    private fun setError(message: String) {
        _uiState.update { it.copy(errorMessage = message) }
    }

    private fun String.toResult(): ProposalActionResult = ProposalActionResult(
        signature = this,
        explorerUrl = PrivateDaoConfig.txExplorer(this),
    )
}

data class UiState(
    val isLoading: Boolean = false,
    val walletBusy: Boolean = false,
    val isLoadingActivity: Boolean = false,
    val isWalletAvailable: Boolean = false,
    val wallet: ConnectedWallet? = null,
    val proposals: List<ProposalSummary> = emptyList(),
    val daos: List<DaoSummary> = emptyList(),
    val selectedProposalPubkey: String? = null,
    val selectedProposal: ProposalSummary? = null,
    val proposalActivity: List<ProposalActivity> = emptyList(),
    val createProposalForm: CreateProposalForm = CreateProposalForm(),
    val commitVoteForm: CommitVoteForm = CommitVoteForm(),
    val revealVoteForm: RevealVoteForm = RevealVoteForm(),
    val submissionState: SubmissionState = SubmissionState.Idle,
    val errorMessage: String? = null,
    val bannerMessage: String? = null,
    val awards: List<AwardEntry> = listOf(
        AwardEntry(
            title = "1st Place — Superteam Earn",
            challenge = "Rebuild production backend systems as on-chain Rust programs",
            platform = "Superteam Poland",
            dateLabel = "March 2026",
        )
    ),
) {
    fun proposalPhase(proposal: ProposalSummary): ProposalPhase {
        val now = System.currentTimeMillis() / 1000
        if (proposal.isExecuted) return ProposalPhase.Executed
        return when (proposal.status) {
            ProposalStatus.Cancelled -> ProposalPhase.Cancelled
            ProposalStatus.Vetoed -> ProposalPhase.Vetoed
            ProposalStatus.Failed -> ProposalPhase.Failed
            ProposalStatus.Passed -> if (now < proposal.executionUnlocksAt) ProposalPhase.Timelocked else ProposalPhase.Executable
            ProposalStatus.Voting -> if (now < proposal.votingEnd) ProposalPhase.Commit else if (now < proposal.revealEnd) ProposalPhase.Reveal else ProposalPhase.ReadyToFinalize
            else -> ProposalPhase.Finalized
        }
    }
}
