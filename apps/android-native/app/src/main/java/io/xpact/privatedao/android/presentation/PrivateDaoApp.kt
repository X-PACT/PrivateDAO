package io.xpact.privatedao.android.presentation

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import io.xpact.privatedao.android.config.PrivateDaoConfig
import io.xpact.privatedao.android.model.CommitVoteForm
import io.xpact.privatedao.android.model.CreateProposalForm
import io.xpact.privatedao.android.model.CreateDaoForm
import io.xpact.privatedao.android.model.DaoMode
import io.xpact.privatedao.android.model.ProposalPhase
import io.xpact.privatedao.android.model.ProposalSummary
import io.xpact.privatedao.android.model.RevealVoteForm
import io.xpact.privatedao.android.model.DepositTreasuryForm
import io.xpact.privatedao.android.model.SubmissionState
import io.xpact.privatedao.android.model.validationError
import io.xpact.privatedao.android.model.TreasuryActionType

private enum class Destination(val route: String, val label: String) {
    Splash("splash", "Splash"),
    Wallet("wallet", "Wallet"),
    Home("home", "Home"),
    Proposals("proposals", "Proposals"),
    Create("create", "Create"),
    Awards("awards", "Awards"),
    Settings("settings", "Settings"),
}

@Composable
fun PrivateDaoApp(
    uiState: UiState,
    onRefresh: () -> Unit,
    onConnectWallet: () -> Unit,
    onDisconnectWallet: () -> Unit,
    onSelectProposal: (String) -> Unit,
    onCreateDaoChange: ((CreateDaoForm) -> CreateDaoForm) -> Unit,
    onDepositTreasuryChange: ((DepositTreasuryForm) -> DepositTreasuryForm) -> Unit,
    onCreateProposalChange: ((CreateProposalForm) -> CreateProposalForm) -> Unit,
    onCommitVoteChange: ((CommitVoteForm) -> CommitVoteForm) -> Unit,
    onRevealVoteChange: ((RevealVoteForm) -> RevealVoteForm) -> Unit,
    onSubmitCreateProposal: () -> Unit,
    onSubmitCreateDao: () -> Unit,
    onSubmitDepositTreasury: () -> Unit,
    onSubmitCommitVote: () -> Unit,
    onSubmitRevealVote: () -> Unit,
    onSubmitFinalize: () -> Unit,
    onSubmitCancel: () -> Unit,
    onSubmitVeto: () -> Unit,
    onSubmitExecute: () -> Unit,
) {
    val navController = rememberNavController()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.errorMessage, uiState.bannerMessage) {
        uiState.errorMessage?.let { snackbarHostState.showSnackbar(it) }
        uiState.bannerMessage?.let { snackbarHostState.showSnackbar(it) }
    }

    MaterialTheme {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            bottomBar = {
                val backStack by navController.currentBackStackEntryAsState()
                val current = backStack?.destination?.route
                if (current != Destination.Splash.route) {
                    NavigationBar(containerColor = Color(0xFF0B0F18)) {
                        listOf(Destination.Home, Destination.Proposals, Destination.Create, Destination.Awards, Destination.Settings).forEach { item ->
                            NavigationBarItem(
                                selected = current == item.route,
                                onClick = { navController.navigate(item.route) },
                                icon = { Box(Modifier.size(8.dp).background(if (current == item.route) Color(0xFFFFD76B) else Color(0xFF4B5563), RoundedCornerShape(999.dp))) },
                                label = { Text(item.label) },
                            )
                        }
                    }
                }
            },
            containerColor = Color(0xFF05070C),
        ) { padding ->
            AppNavHost(
                navController = navController,
                padding = padding,
                uiState = uiState,
                onRefresh = onRefresh,
                onConnectWallet = onConnectWallet,
                onDisconnectWallet = onDisconnectWallet,
                onSelectProposal = onSelectProposal,
                onCreateDaoChange = onCreateDaoChange,
                onDepositTreasuryChange = onDepositTreasuryChange,
                onCreateProposalChange = onCreateProposalChange,
                onCommitVoteChange = onCommitVoteChange,
                onRevealVoteChange = onRevealVoteChange,
                onSubmitCreateDao = onSubmitCreateDao,
                onSubmitDepositTreasury = onSubmitDepositTreasury,
                onSubmitCreateProposal = onSubmitCreateProposal,
                onSubmitCommitVote = onSubmitCommitVote,
                onSubmitRevealVote = onSubmitRevealVote,
                onSubmitFinalize = onSubmitFinalize,
                onSubmitCancel = onSubmitCancel,
                onSubmitVeto = onSubmitVeto,
                onSubmitExecute = onSubmitExecute,
            )
        }
    }
}

@Composable
private fun AppNavHost(
    navController: NavHostController,
    padding: PaddingValues,
    uiState: UiState,
    onRefresh: () -> Unit,
    onConnectWallet: () -> Unit,
    onDisconnectWallet: () -> Unit,
    onSelectProposal: (String) -> Unit,
    onCreateDaoChange: ((CreateDaoForm) -> CreateDaoForm) -> Unit,
    onDepositTreasuryChange: ((DepositTreasuryForm) -> DepositTreasuryForm) -> Unit,
    onCreateProposalChange: ((CreateProposalForm) -> CreateProposalForm) -> Unit,
    onCommitVoteChange: ((CommitVoteForm) -> CommitVoteForm) -> Unit,
    onRevealVoteChange: ((RevealVoteForm) -> RevealVoteForm) -> Unit,
    onSubmitCreateProposal: () -> Unit,
    onSubmitCreateDao: () -> Unit,
    onSubmitDepositTreasury: () -> Unit,
    onSubmitCommitVote: () -> Unit,
    onSubmitRevealVote: () -> Unit,
    onSubmitFinalize: () -> Unit,
    onSubmitCancel: () -> Unit,
    onSubmitVeto: () -> Unit,
    onSubmitExecute: () -> Unit,
) {
    NavHost(
        navController = navController,
        startDestination = Destination.Splash.route,
        modifier = Modifier.fillMaxSize(),
    ) {
        composable(Destination.Splash.route) {
            SplashScreen {
                navController.navigate(if (uiState.wallet != null) Destination.Home.route else Destination.Wallet.route) {
                    popUpTo(Destination.Splash.route) { inclusive = true }
                }
            }
        }
        composable(Destination.Wallet.route) {
            WalletScreen(
                uiState = uiState,
                onConnect = onConnectWallet,
                onContinue = { navController.navigate(Destination.Home.route) },
                modifier = Modifier.padding(padding),
            )
        }
        composable(Destination.Home.route) {
            HomeScreen(
                uiState = uiState,
                onRefresh = onRefresh,
                onWalletAction = if (uiState.wallet == null) onConnectWallet else onDisconnectWallet,
                modifier = Modifier.padding(padding),
            )
        }
        composable(Destination.Proposals.route) {
            ProposalScreen(
                uiState = uiState,
                onSelectProposal = onSelectProposal,
                onCommitVoteChange = onCommitVoteChange,
                onRevealVoteChange = onRevealVoteChange,
                onSubmitCommitVote = onSubmitCommitVote,
                onSubmitRevealVote = onSubmitRevealVote,
                onSubmitFinalize = onSubmitFinalize,
                onSubmitCancel = onSubmitCancel,
                onSubmitVeto = onSubmitVeto,
                onSubmitExecute = onSubmitExecute,
                modifier = Modifier.padding(padding),
            )
        }
        composable(Destination.Create.route) {
            CreateProposalScreen(
                uiState = uiState,
                onCreateDaoChange = onCreateDaoChange,
                onDepositTreasuryChange = onDepositTreasuryChange,
                onChange = onCreateProposalChange,
                onSubmitCreateDao = onSubmitCreateDao,
                onSubmitDepositTreasury = onSubmitDepositTreasury,
                onSubmit = onSubmitCreateProposal,
                modifier = Modifier.padding(padding),
            )
        }
        composable(Destination.Awards.route) {
            AwardsScreen(uiState = uiState, modifier = Modifier.padding(padding))
        }
        composable(Destination.Settings.route) {
            SettingsScreen(uiState = uiState, modifier = Modifier.padding(padding))
        }
    }
}

@Composable
private fun SplashScreen(onDone: () -> Unit) {
    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(900L)
        onDone()
    }
    Box(
        modifier = Modifier.fillMaxSize().background(Color(0xFF05070C)),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("PrivateDAO", color = Color.White, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text("Vote Without Fear", color = Color(0xFFFFD76B), style = MaterialTheme.typography.titleMedium)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun WalletScreen(uiState: UiState, onConnect: () -> Unit, onContinue: () -> Unit, modifier: Modifier = Modifier) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Android-native wallet flow") },
            )
        },
        containerColor = Color.Transparent,
    ) { inner ->
        Column(
            modifier = modifier.fillMaxSize().padding(inner).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            HeroCard(
                title = "Android-first by design",
                body = "PrivateDAO uses Kotlin native + Solana Mobile Wallet Adapter because Android is the official mobile dApp path for Solana wallets today.",
            )
            HeroCard(
                title = "Wallet state",
                body = when {
                    uiState.wallet != null -> "Connected to ${uiState.wallet.publicKeyBase58}"
                    !uiState.isWalletAvailable -> "No compatible Mobile Wallet Adapter wallet was detected on this Android device."
                    else -> "Phantom / Solflare-style Android wallet connection is ready through MWA."
                },
            )
            Button(onClick = onConnect, enabled = uiState.isWalletAvailable && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                Text(if (uiState.wallet == null) "Connect wallet" else "Reconnect wallet")
            }
            OutlinedButton(onClick = onContinue, enabled = uiState.wallet != null, modifier = Modifier.fillMaxWidth()) {
                Text("Continue to dashboard")
            }
        }
    }
}

@Composable
private fun HomeScreen(uiState: UiState, onRefresh: () -> Unit, onWalletAction: () -> Unit, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                shape = RoundedCornerShape(28.dp),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(listOf(Color(0xFF7A5300), Color(0xFFFFD76B), Color(0xFFB68017))),
                            RoundedCornerShape(28.dp),
                        )
                        .padding(22.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("🏆 1st Place — Superteam Earn", color = Color(0xFF1A1200), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                        Text("Rebuild production backend systems as on-chain Rust programs", color = Color(0xFF322100))
                    }
                }
            }
        }
        item {
            HeroCard(
                title = "Devnet governance surface",
                body = "The Android app mirrors the current web product: live DAO/proposal reads, commit-reveal voting, finalize, execute, tx signatures, and explorer links.",
                actions = {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(onClick = onRefresh) { Text("Refresh") }
                        OutlinedButton(onClick = onWalletAction) {
                            Text(if (uiState.wallet == null) "Connect" else "Disconnect")
                        }
                    }
                },
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("DAOs", uiState.daos.size.toString(), Modifier.weight(1f))
                MetricCard("Proposals", uiState.proposals.size.toString(), Modifier.weight(1f))
                MetricCard("Network", PrivateDaoConfig.clusterLabel, Modifier.weight(1f))
            }
        }
        item {
            HeroCard(
                title = "Current live proof",
                body = uiState.selectedProposal?.let {
                    "Selected proposal ${it.proposalId} is in ${uiState.proposalPhase(it)} phase with ${it.commitCount} commits and ${it.revealCount} reveals."
                } ?: "Select a proposal to see phase-specific governance actions and transaction proofs.",
            )
        }
        item {
            ReviewerOpsCard(
                title = "Reviewer and runtime ops",
                body = "Open the same reviewer surfaces used by the web product: proof center, judge mode, monitoring alerts, incident response, and the reviewer fast path.",
            )
        }
        item {
            SubmissionStateCard(uiState = uiState)
        }
    }
}

@Composable
private fun ProposalScreen(
    uiState: UiState,
    onSelectProposal: (String) -> Unit,
    onCommitVoteChange: ((CommitVoteForm) -> CommitVoteForm) -> Unit,
    onRevealVoteChange: ((RevealVoteForm) -> RevealVoteForm) -> Unit,
    onSubmitCommitVote: () -> Unit,
    onSubmitRevealVote: () -> Unit,
    onSubmitFinalize: () -> Unit,
    onSubmitCancel: () -> Unit,
    onSubmitVeto: () -> Unit,
    onSubmitExecute: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            HeroCard(
                title = "Live proposal feed",
                body = "This is the Android-native counterpart of the current product. Proposal accounts are read directly from the same devnet program and decoded with the same account layout.",
            )
        }
        items(uiState.proposals) { proposal ->
            ProposalCard(
                proposal = proposal,
                phase = uiState.proposalPhase(proposal),
                selected = uiState.selectedProposalPubkey == proposal.pubkey,
                onClick = { onSelectProposal(proposal.pubkey) },
            )
        }
        uiState.selectedProposal?.let { proposal ->
            item {
                ProposalDetailCard(
                    proposal = proposal,
                    phase = uiState.proposalPhase(proposal),
                    uiState = uiState,
                    onCommitVoteChange = onCommitVoteChange,
                    onRevealVoteChange = onRevealVoteChange,
                    onSubmitCommitVote = onSubmitCommitVote,
                    onSubmitRevealVote = onSubmitRevealVote,
                    onSubmitFinalize = onSubmitFinalize,
                    onSubmitCancel = onSubmitCancel,
                    onSubmitVeto = onSubmitVeto,
                    onSubmitExecute = onSubmitExecute,
                )
            }
        }
        item {
            SubmissionStateCard(uiState = uiState)
        }
    }
}

@Composable
private fun CreateProposalScreen(
    uiState: UiState,
    onCreateDaoChange: ((CreateDaoForm) -> CreateDaoForm) -> Unit,
    onDepositTreasuryChange: ((DepositTreasuryForm) -> DepositTreasuryForm) -> Unit,
    onChange: ((CreateProposalForm) -> CreateProposalForm) -> Unit,
    onSubmitCreateDao: () -> Unit,
    onSubmitDepositTreasury: () -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            HeroCard(
                title = "Create DAO",
                body = "This Android-native path bootstraps the governance mint and initializes the DAO from the same wallet, matching the repo’s devnet-first bootstrap flow.",
            )
        }
        item {
            FormTextField("DAO name", uiState.createDaoForm.daoName) { value ->
                onCreateDaoChange { it.copy(daoName = value) }
            }
        }
        item {
            FormTextField("Quorum percentage", uiState.createDaoForm.quorumPercentage.toString()) { value ->
                onCreateDaoChange { it.copy(quorumPercentage = value.toIntOrNull() ?: it.quorumPercentage) }
            }
        }
        item {
            FormTextField("Reveal window (seconds)", uiState.createDaoForm.revealWindowSeconds.toString()) { value ->
                onCreateDaoChange { it.copy(revealWindowSeconds = value.toLongOrNull() ?: it.revealWindowSeconds) }
            }
        }
        item {
            FormTextField("Execution delay (seconds)", uiState.createDaoForm.executionDelaySeconds.toString()) { value ->
                onCreateDaoChange { it.copy(executionDelaySeconds = value.toLongOrNull() ?: it.executionDelaySeconds) }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedButton(onClick = { onCreateDaoChange { it.copy(mode = DaoMode.TokenWeighted) } }, modifier = Modifier.weight(1f)) { Text("Token") }
                OutlinedButton(onClick = { onCreateDaoChange { it.copy(mode = DaoMode.Quadratic) } }, modifier = Modifier.weight(1f)) { Text("Quadratic") }
                OutlinedButton(onClick = { onCreateDaoChange { it.copy(mode = DaoMode.DualChamber) } }, modifier = Modifier.weight(1f)) { Text("Dual") }
            }
        }
        item {
            Button(onClick = onSubmitCreateDao, enabled = uiState.wallet != null && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                Text("Create DAO in wallet")
            }
        }
        uiState.createDaoForm.validationError()?.let { message ->
            item { ValidationCard(message) }
        }
        item {
            HeroCard(
                title = "Deposit treasury",
                body = "Treasury funding remains a separate on-chain step, exactly like the current repo scripts.",
            )
        }
        item {
            FormTextField("DAO PDA for deposit", uiState.depositTreasuryForm.daoPubkey) { value ->
                onDepositTreasuryChange { it.copy(daoPubkey = value) }
            }
        }
        item {
            FormTextField("Deposit amount SOL", uiState.depositTreasuryForm.amountSol) { value ->
                onDepositTreasuryChange { it.copy(amountSol = value) }
            }
        }
        item {
            Button(onClick = onSubmitDepositTreasury, enabled = uiState.wallet != null && !uiState.walletBusy && uiState.depositTreasuryForm.daoPubkey.isNotBlank(), modifier = Modifier.fillMaxWidth()) {
                Text("Deposit treasury in wallet")
            }
        }
        uiState.depositTreasuryForm.validationError()?.let { message ->
            item { ValidationCard(message) }
        }
        item {
            HeroCard(
                title = "Create proposal",
                body = "Faithful to the repo: proposal creation is not authority-only. Any wallet holding the DAO governance token can submit a proposal on-chain.",
            )
        }
        item {
            FormTextField("DAO PDA", uiState.createProposalForm.daoPubkey) { value ->
                onChange { it.copy(daoPubkey = value) }
            }
        }
        item {
            FormTextField("Title", uiState.createProposalForm.title) { value ->
                onChange { it.copy(title = value) }
            }
        }
        item {
            FormTextField("Description", uiState.createProposalForm.description, minLines = 4) { value ->
                onChange { it.copy(description = value) }
            }
        }
        item {
            FormTextField("Voting duration (seconds)", uiState.createProposalForm.durationSeconds.toString()) { value ->
                onChange { it.copy(durationSeconds = value.toLongOrNull() ?: it.durationSeconds) }
            }
        }
        item {
            FormTextField("Treasury recipient (optional)", uiState.createProposalForm.treasuryRecipient) { value ->
                onChange { it.copy(treasuryRecipient = value) }
            }
        }
        item {
            FormTextField("Treasury amount (SOL or raw token units)", uiState.createProposalForm.treasuryAmountSol) { value ->
                onChange { it.copy(treasuryAmountSol = value) }
            }
        }
        item {
            FormTextField("Treasury mint (token actions only)", uiState.createProposalForm.treasuryMint) { value ->
                onChange { it.copy(treasuryMint = value) }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedButton(onClick = { onChange { it.copy(treasuryType = TreasuryActionType.SendSol) } }, modifier = Modifier.weight(1f)) { Text("Send SOL") }
                OutlinedButton(onClick = { onChange { it.copy(treasuryType = TreasuryActionType.SendToken) } }, modifier = Modifier.weight(1f)) { Text("Send Token") }
            }
        }
        item {
            Button(
                onClick = onSubmit,
                enabled = uiState.wallet != null && !uiState.walletBusy && uiState.createProposalForm.validationError() == null,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Create proposal in wallet")
            }
        }
        uiState.createProposalForm.validationError()?.let { message ->
            item { ValidationCard(message) }
        }
        item {
            ReviewerOpsCard(
                title = "Execution and reviewer links",
                body = "Use the Android-native create surface without losing the proof layer. These links stay aligned with the main repo’s live proof, monitoring, and reviewer docs.",
            )
        }
        item {
            SubmissionStateCard(uiState = uiState)
        }
    }
}

@Composable
private fun AwardsScreen(uiState: UiState, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            HeroCard(
                title = "Awards & credibility",
                body = "The Android app keeps the same proof surface as the main project, including verified recognition and live devnet explorer references.",
            )
        }
        items(uiState.awards) { award ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF10141D)),
                shape = RoundedCornerShape(22.dp),
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(award.title, color = Color(0xFFFFD76B), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(award.challenge, color = Color.White)
                    Text("${award.platform} • ${award.dateLabel}", color = Color(0xFFADB8C7))
                }
            }
        }
    }
}

@Composable
private fun SettingsScreen(uiState: UiState, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            HeroCard(
                title = "Environment",
                body = "Devnet is the default mobile environment. The app is structured for a future mainnet switch without changing protocol semantics, but production cutover still requires reviewer evidence, monitoring, and explicit custody closure.",
            )
        }
        item { SettingsRow("Program ID", PrivateDaoConfig.programId) }
        item { SettingsRow("RPC", PrivateDaoConfig.rpcUrl) }
        item { SettingsRow("Explorer", "Solscan devnet links") }
        item { SettingsRow("Wallet", uiState.wallet?.publicKeyBase58 ?: "Not connected") }
        item {
            ReviewerOpsCard(
                title = "Mainnet and reviewer runbooks",
                body = "These links expose the proof-first packet expected before any real-funds cutover: live proof, monitoring alerts, incident response, mainnet readiness, and the condensed reviewer path.",
            )
        }
        item {
            SubmissionStateCard(uiState = uiState)
        }
    }
}

@Composable
private fun ProposalCard(proposal: ProposalSummary, phase: ProposalPhase, selected: Boolean, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = if (selected) Color(0xFF101825) else Color(0xFF0D1118)),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
    ) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                AssistChip(
                    onClick = {},
                    label = { Text(phase.name) },
                    colors = AssistChipDefaults.assistChipColors(containerColor = Color(0x1FFFD76B), labelColor = Color(0xFFFFD76B)),
                )
                Text("Proposal #${proposal.proposalId}", color = Color(0xFF91A3B8))
            }
            Text(proposal.title, color = Color.White, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(proposal.description, color = Color(0xFFADB8C7), maxLines = 3, overflow = TextOverflow.Ellipsis)
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                SmallMetric("Commits", proposal.commitCount.toString())
                SmallMetric("Reveals", proposal.revealCount.toString())
                SmallMetric("YES", proposal.yesCapital.toString())
            }
        }
    }
}

@Composable
private fun ProposalDetailCard(
    proposal: ProposalSummary,
    phase: ProposalPhase,
    uiState: UiState,
    onCommitVoteChange: ((CommitVoteForm) -> CommitVoteForm) -> Unit,
    onRevealVoteChange: ((RevealVoteForm) -> RevealVoteForm) -> Unit,
    onSubmitCommitVote: () -> Unit,
    onSubmitRevealVote: () -> Unit,
    onSubmitFinalize: () -> Unit,
    onSubmitCancel: () -> Unit,
    onSubmitVeto: () -> Unit,
    onSubmitExecute: () -> Unit,
) {
    val authorityPubkey = proposal.daoSummary?.authority
    val isAuthorityWallet = uiState.wallet?.publicKeyBase58 == authorityPubkey && authorityPubkey != null
    Card(shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF0F131D))) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Proposal proof", color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            SettingsRow("Proposal", proposal.pubkey)
            SettingsRow("DAO", proposal.dao)
            SettingsRow("Phase", phase.name)
            SettingsRow("Status", proposal.status.name)
            SettingsRow("Explorer", PrivateDaoConfig.accountExplorer(proposal.pubkey))
            proposal.daoSummary?.let {
                SettingsRow("DAO authority", it.authority)
                SettingsRow("Execution delay", "${it.executionDelaySeconds}s")
                SettingsRow("Authority wallet", if (isAuthorityWallet) "Connected" else "Not connected")
            }
            proposal.treasuryAction?.let {
                SettingsRow("Treasury action", "${it.type} → ${it.recipient}")
            }
            ProposalExecutionPacketCard(proposal = proposal, phase = phase)
            RuntimeContinuityCard(proposal = proposal, phase = phase)
            if (phase == ProposalPhase.Commit && isAuthorityWallet) {
                Button(onClick = onSubmitCancel, enabled = !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                    Text("Cancel in authority wallet")
                }
            }
            if (phase == ProposalPhase.Commit) {
                FormTextField("Keeper pubkey (optional)", uiState.commitVoteForm.keeperPubkey) { value ->
                    onCommitVoteChange { it.copy(keeperPubkey = value) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(onClick = { onCommitVoteChange { it.copy(voteYes = true) } }, modifier = Modifier.weight(1f)) { Text("Vote YES") }
                    OutlinedButton(onClick = { onCommitVoteChange { it.copy(voteYes = false) } }, modifier = Modifier.weight(1f)) { Text("Vote NO") }
                }
                Button(onClick = onSubmitCommitVote, enabled = uiState.wallet != null && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                    Text("Commit vote in wallet")
                }
            }
            if (phase == ProposalPhase.Reveal) {
                FormTextField("Salt hex", uiState.revealVoteForm.saltHex) { value ->
                    onRevealVoteChange { it.copy(saltHex = value) }
                }
                FormTextField("Voter override (keeper reveal)", uiState.revealVoteForm.voterPubkeyOverride) { value ->
                    onRevealVoteChange { it.copy(voterPubkeyOverride = value) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(onClick = { onRevealVoteChange { it.copy(voteYes = true) } }, modifier = Modifier.weight(1f)) { Text("Reveal YES") }
                    OutlinedButton(onClick = { onRevealVoteChange { it.copy(voteYes = false) } }, modifier = Modifier.weight(1f)) { Text("Reveal NO") }
                }
                Button(onClick = onSubmitRevealVote, enabled = uiState.wallet != null && uiState.revealVoteForm.saltHex.isNotBlank() && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                    Text("Reveal in wallet")
                }
            }
            if (phase == ProposalPhase.ReadyToFinalize) {
                Button(onClick = onSubmitFinalize, enabled = uiState.wallet != null && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                    Text("Finalize in wallet")
                }
            }
            if (phase == ProposalPhase.Timelocked) {
                ValidationCard("This proposal passed but is still inside the timelock window. Execution stays blocked until the unlock time clears.")
                if (isAuthorityWallet) {
                    Button(onClick = onSubmitVeto, enabled = !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                        Text("Veto in authority wallet")
                    }
                }
            }
            if (phase == ProposalPhase.Executable) {
                Button(onClick = onSubmitExecute, enabled = uiState.wallet != null && !uiState.walletBusy, modifier = Modifier.fillMaxWidth()) {
                    Text("Execute in wallet")
                }
            }
            if (phase == ProposalPhase.Commit) {
                uiState.commitVoteForm.validationError()?.let { ValidationCard(it) }
            }
            if (phase == ProposalPhase.Reveal) {
                uiState.revealVoteForm.validationError()?.let { ValidationCard(it) }
            }
            ReviewerOpsCard(
                title = "Proof and runtime continuity",
                body = "Keep the selected proposal tied to proof center, judge mode, live proof, monitoring alerts, and incident response while you operate from Android.",
            )
            if (uiState.proposalActivity.isNotEmpty()) {
                Text("Recent activity", color = Color.White, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                uiState.proposalActivity.take(5).forEach { activity ->
                    Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF111A27))) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(activity.signature, color = Color(0xFF9CC7FF), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(activity.explorerUrl, color = Color(0xFFADB8C7), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(activity.statusLabel, color = Color.White)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProposalExecutionPacketCard(proposal: ProposalSummary, phase: ProposalPhase) {
    val treasuryAction = proposal.treasuryAction
    val treasurySummary = when {
        treasuryAction == null -> "No treasury action is attached to this proposal."
        treasuryAction.type == TreasuryActionType.SendToken -> {
            val mint = treasuryAction.tokenMint ?: "Unknown mint"
            "Token payout of ${treasuryAction.amountLamports} raw units to ${treasuryAction.recipient}. Recipient ATA must already exist for mint $mint."
        }
        treasuryAction.type == TreasuryActionType.SendSol ->
            "SOL payout of ${formatSolAmount(treasuryAction.amountLamports)} to ${treasuryAction.recipient}."
        else -> "Custom CPI action routed to ${treasuryAction.recipient}."
    }

    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF111A27))) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Execution packet", color = Color.White, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(
                "Operate from the same proposal payload the web app uses: current phase, authority context, execution delay, recipient, and payout shape stay visible before signing.",
                color = Color(0xFFADB8C7),
            )
            Text("Phase: ${phase.name}", color = Color.White)
            Text(treasurySummary, color = Color(0xFFADB8C7))
            proposal.treasuryAction?.tokenMint?.let { mint ->
                Text("Token mint: $mint", color = Color.White)
            }
        }
    }
}

@Composable
private fun RuntimeContinuityCard(proposal: ProposalSummary, phase: ProposalPhase) {
    val summary = when (phase) {
        ProposalPhase.Commit -> "The proposal is still in commit phase. Keep reviewer proof and authority context attached before the vote locks."
        ProposalPhase.Reveal -> "Reveal is active. This is the right moment to keep proof, explorer continuity, and follow-up monitoring paths visible."
        ProposalPhase.ReadyToFinalize -> "Voting windows are closed. Finalization should stay attached to proof and runtime evidence, not just a signature."
        ProposalPhase.Timelocked -> "The proposal passed but remains timelocked. Monitoring, incident response, and runtime evidence should stay attached until execution unlocks."
        ProposalPhase.Executable -> "Execution is open. Treat this as an operator surface: treasury preview, monitoring rules, and proof continuity should remain one tap away."
        ProposalPhase.Executed -> "Execution is complete. Keep explorer proof, runtime evidence, and monitoring follow-up attached to the result."
        ProposalPhase.Cancelled -> "The proposal was cancelled by authority. Preserve reviewer continuity and the cancellation trail."
        ProposalPhase.Vetoed -> "The proposal was vetoed during timelock. Preserve authority context and reviewer evidence for the veto decision."
        ProposalPhase.Failed -> "The proposal failed the governance path. Preserve proof and activity context for post-mortem review."
        ProposalPhase.Finalized -> "The proposal is finalized. Continue from proof and monitoring surfaces for reviewer-safe verification."
    }

    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF111A27))) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Runtime continuity", color = Color.White, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(summary, color = Color(0xFFADB8C7))
            ReviewLinkRow(
                "Proof center" to PrivateDaoConfig.proofCenterUrl,
                "Live proof V3" to PrivateDaoConfig.liveProofUrl,
            )
            ReviewLinkRow(
                "Monitoring rules" to PrivateDaoConfig.monitoringAlertsUrl,
                "Real-device runtime" to PrivateDaoConfig.realDeviceRuntimeUrl,
            )
            ReviewLinkRow(
                "Incident response" to PrivateDaoConfig.incidentResponseUrl,
                "Android web surface" to PrivateDaoConfig.androidSurfaceUrl,
            )
        }
    }
}

@Composable
private fun ReviewerOpsCard(title: String, body: String) {
    HeroCard(
        title = title,
        body = body,
        actions = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ReviewLinkRow(
                    "Proof center" to PrivateDaoConfig.proofCenterUrl,
                    "Judge mode" to PrivateDaoConfig.judgeModeUrl,
                )
                ReviewLinkRow(
                    "Live proof" to PrivateDaoConfig.liveProofUrl,
                    "Monitoring alerts" to PrivateDaoConfig.monitoringAlertsUrl,
                )
                ReviewLinkRow(
                    "Incident response" to PrivateDaoConfig.incidentResponseUrl,
                    "Reviewer fast path" to PrivateDaoConfig.reviewerFastPathUrl,
                )
                ReviewLinkRow(
                    "Mainnet readiness" to PrivateDaoConfig.mainnetReadinessUrl,
                )
            }
        },
    )
}

@Composable
private fun ReviewLinkRow(vararg links: Pair<String, String>) {
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
        links.forEach { (label, url) ->
            LinkButton(
                label = label,
                url = url,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun LinkButton(label: String, url: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    OutlinedButton(
        onClick = {
            context.startActivity(
                Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
        },
        modifier = modifier,
    ) {
        Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun ValidationCard(message: String) {
    Card(shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF2A1414))) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Validation gate", color = Color(0xFFFFD76B), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Text(message, color = Color.White)
        }
    }
}

@Composable
private fun SubmissionStateCard(uiState: UiState) {
    when (val submission = uiState.submissionState) {
        SubmissionState.Idle -> Unit
        SubmissionState.InFlight -> HeroCard(
            title = "Submission in flight",
            body = "The wallet operation is still running. Wait for the signature before retrying or switching phases.",
        )
        is SubmissionState.Failure -> ValidationCard(submission.message)
        is SubmissionState.Success -> HeroCard(
            title = "Latest execution proof",
            body = "Latest wallet submission succeeded. Keep the signature and explorer link attached to any reviewer or operator handoff.",
            actions = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    ReviewLinkRow("Explorer tx" to submission.result.explorerUrl)
                    ReviewLinkRow(
                        "Proof center" to PrivateDaoConfig.proofCenterUrl,
                        "Live proof V3" to PrivateDaoConfig.liveProofUrl,
                    )
                    ReviewLinkRow(
                        "Monitoring rules" to PrivateDaoConfig.monitoringAlertsUrl,
                        "Real-device runtime" to PrivateDaoConfig.realDeviceRuntimeUrl,
                    )
                }
            },
        )
    }
}

private fun formatSolAmount(lamports: Long): String {
    val sol = lamports.toDouble() / 1_000_000_000.0
    return if (sol >= 1.0) String.format("%.4f SOL", sol) else String.format("%.6f SOL", sol)
}

@Composable
private fun HeroCard(title: String, body: String, actions: @Composable (() -> Unit)? = null) {
    Card(shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF0D1118))) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(body, color = Color(0xFFADB8C7))
            actions?.invoke()
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, colors = CardDefaults.cardColors(containerColor = Color(0xFF10141D)), shape = RoundedCornerShape(22.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(label, color = Color(0xFF91A3B8))
            Text(value, color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun SmallMetric(label: String, value: String) {
    Column {
        Text(label, color = Color(0xFF91A3B8), style = MaterialTheme.typography.labelSmall)
        Text(value, color = Color.White)
    }
}

@Composable
private fun SettingsRow(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label.uppercase(), color = Color(0xFF91A3B8), style = MaterialTheme.typography.labelSmall)
        Text(value, color = Color.White)
    }
}

@Composable
private fun FormTextField(label: String, value: String, minLines: Int = 1, onValueChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        minLines = minLines,
        label = { Text(label) },
    )
}
