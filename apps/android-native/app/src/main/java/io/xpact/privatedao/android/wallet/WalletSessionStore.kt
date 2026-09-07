package io.xpact.privatedao.android.wallet

import android.content.Context
import io.xpact.privatedao.android.model.ConnectedWallet

class WalletSessionStore(context: Context) {
    private val prefs = context.getSharedPreferences("privatedao_wallet", Context.MODE_PRIVATE)

    fun save(wallet: ConnectedWallet) {
        prefs.edit()
            .putString("public_key", wallet.publicKeyBase58)
            .putString("auth_token", wallet.authToken)
            .putString("wallet_uri", wallet.walletUriBase)
            .putString("label", wallet.accountLabel)
            .apply()
    }

    fun load(): ConnectedWallet? {
        val publicKey = prefs.getString("public_key", null) ?: return null
        val authToken = prefs.getString("auth_token", null) ?: return null
        return ConnectedWallet(
            accountLabel = prefs.getString("label", null) ?: publicKey,
            publicKeyBase58 = publicKey,
            authToken = authToken,
            walletUriBase = prefs.getString("wallet_uri", null),
        )
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
