package io.xpact.privatedao.android.config

object PrivateDaoConfig {
    const val appName = "PrivateDAO"
    const val tagline = "Vote Without Fear"
    const val programId = "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx"
    const val rpcUrl = "https://api.devnet.solana.com"
    const val chain = "solana:devnet"
    const val clusterLabel = "Devnet"
    const val webBaseUrl = "https://x-pact.github.io/PrivateDAO/"
    const val proofCenterUrl = "${webBaseUrl}?page=proof"
    const val judgeModeUrl = "${webBaseUrl}?page=proof&judge=1"
    const val liveProofUrl = "${webBaseUrl}docs/live-proof.md"
    const val monitoringAlertsUrl = "${webBaseUrl}docs/monitoring-alerts.md"
    const val incidentResponseUrl = "${webBaseUrl}docs/incident-response.md"
    const val reviewerFastPathUrl = "${webBaseUrl}docs/reviewer-fast-path.md"
    const val mainnetReadinessUrl = "${webBaseUrl}docs/mainnet-readiness.md"

    const val systemProgramId = "11111111111111111111111111111111"
    const val tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    const val associatedTokenProgramId = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    const val rentSysvarId = "SysvarRent111111111111111111111111111111111"

    fun accountExplorer(address: String): String = "https://solscan.io/account/$address?cluster=devnet"
    fun txExplorer(signature: String): String = "https://solscan.io/tx/$signature?cluster=devnet"
}
