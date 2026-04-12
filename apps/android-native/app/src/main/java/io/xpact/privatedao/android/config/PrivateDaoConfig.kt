package io.xpact.privatedao.android.config

object PrivateDaoConfig {
    const val appName = "PrivateDAO"
    const val tagline = "Vote Without Fear"
    const val programId = "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx"
    const val rpcUrl = "https://api.devnet.solana.com"
    const val chain = "solana:devnet"
    const val clusterLabel = "Devnet"
    const val webBaseUrl = "https://privatedao.org"
    const val proofCenterUrl = "$webBaseUrl/proof"
    const val judgeModeUrl = "$webBaseUrl/proof?judge=1"
    const val liveProofUrl = "$webBaseUrl/documents/live-proof-v3"
    const val monitoringAlertsUrl = "$webBaseUrl/documents/monitoring-alert-rules"
    const val incidentResponseUrl = "$webBaseUrl/documents/incident-response"
    const val reviewerFastPathUrl = "$webBaseUrl/documents/reviewer-fast-path"
    const val mainnetReadinessUrl = "$webBaseUrl/documents/mainnet-readiness"
    const val realDeviceRuntimeUrl = "$webBaseUrl/documents/real-device-runtime"
    const val androidSurfaceUrl = "$webBaseUrl/android"

    const val systemProgramId = "11111111111111111111111111111111"
    const val tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    const val associatedTokenProgramId = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    const val rentSysvarId = "SysvarRent111111111111111111111111111111111"

    fun accountExplorer(address: String): String = "https://solscan.io/account/$address?cluster=devnet"
    fun txExplorer(signature: String): String = "https://solscan.io/tx/$signature?cluster=devnet"
}
