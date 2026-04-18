package io.xpact.privatedao.android.config

import io.xpact.privatedao.android.model.BillingSku
import io.xpact.privatedao.android.model.PrivacyPolicyKey
import io.xpact.privatedao.android.model.PrivacyPolicyOption

object PrivateDaoConfig {
    const val appName = "PrivateDAO"
    const val tagline = "Vote Without Fear"
    const val programId = "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx"
    const val rpcUrl = "https://api.devnet.solana.com"
    const val chain = "solana:devnet"
    const val clusterLabel = "Devnet"
    const val devnetBillingReceiveAddress = "AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c"

    const val systemProgramId = "11111111111111111111111111111111"
    const val memoProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
    const val tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    const val associatedTokenProgramId = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    const val rentSysvarId = "SysvarRent111111111111111111111111111111111"

    val privacyPolicies = listOf(
        PrivacyPolicyOption(
            key = PrivacyPolicyKey.ReviewerVisible,
            title = "Reviewer-visible proof",
            tech = "ZK anchors + explorer evidence",
            summary = "Best when a judge, buyer, or community reviewer must follow public hashes while protected inputs stay abstracted.",
        ),
        PrivacyPolicyOption(
            key = PrivacyPolicyKey.CommitteePrivate,
            title = "Committee-private voting",
            tech = "Commit-reveal + ZK voting",
            summary = "Best when vote intent should stay hidden until reveal while final execution remains auditable on Devnet.",
        ),
        PrivacyPolicyOption(
            key = PrivacyPolicyKey.ConfidentialPayout,
            title = "Confidential treasury payout",
            tech = "REFHE + MagicBlock corridors",
            summary = "Best for payroll, grants, rewards, and vendor payouts where amount logic and intent need stronger protection.",
        ),
        PrivacyPolicyOption(
            key = PrivacyPolicyKey.SelectiveDisclosure,
            title = "Selective disclosure",
            tech = "Custody trail + narrow reviewer window",
            summary = "Best when a reviewer needs a bounded view into the action without opening every internal operating detail.",
        ),
    )

    val devnetBillingSkus = listOf(
        BillingSku(
            key = "wallet-onboarding",
            title = "Wallet-first onboarding lane",
            amountSol = 0.003,
            memoLabel = "WALLET_ONBOARDING",
            summary = "A small Devnet charge that proves a normal visitor can pay from the wallet and inspect the chain result.",
        ),
        BillingSku(
            key = "governance-cycle",
            title = "Governance cycle rehearsal",
            amountSol = 0.005,
            memoLabel = "GOVERNANCE_REHEARSAL",
            summary = "A commercial rehearsal for proposal creation, voting operations, and proof-linked review.",
        ),
        BillingSku(
            key = "privacy-packet",
            title = "Privacy packet lane",
            amountSol = 0.007,
            memoLabel = "PRIVACY_PACKET",
            summary = "A Devnet signal that reviewer-grade privacy and proof can be tied to an on-chain payment event.",
        ),
        BillingSku(
            key = "confidential-payout",
            title = "Confidential payout rehearsal",
            amountSol = 0.01,
            memoLabel = "CONFIDENTIAL_PAYOUT",
            summary = "A larger Devnet rehearsal for the confidential treasury path before later contractized billing rails are introduced.",
        ),
    )

    fun accountExplorer(address: String): String = "https://solscan.io/account/$address?cluster=devnet"
    fun txExplorer(signature: String): String = "https://solscan.io/tx/$signature?cluster=devnet"
}
