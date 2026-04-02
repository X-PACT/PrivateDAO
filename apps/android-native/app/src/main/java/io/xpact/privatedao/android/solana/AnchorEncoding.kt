package io.xpact.privatedao.android.solana

import io.xpact.privatedao.android.model.TreasuryActionType
import io.xpact.privatedao.android.model.TreasuryActionView

object AnchorEncoding {
    fun discriminator(name: String): ByteArray =
        Binary.sha256("global:$name".toByteArray()).copyOfRange(0, 8)

    fun optionPubkey(base58: String?): ByteArray =
        if (base58.isNullOrBlank()) byteArrayOf(0) else byteArrayOf(1) + PublicKeyExt.toBytes(base58)

    fun optionTreasuryAction(action: TreasuryActionView?): ByteArray {
        if (action == null) return byteArrayOf(0)
        val actionTypeIndex = when (action.type) {
            TreasuryActionType.SendSol -> 0
            TreasuryActionType.SendToken -> 1
            TreasuryActionType.CustomCpi -> 2
        }
        val mintBytes = if (action.tokenMint == null) byteArrayOf(0) else byteArrayOf(1) + PublicKeyExt.toBytes(action.tokenMint)
        return byteArrayOf(1) +
            byteArrayOf(actionTypeIndex.toByte()) +
            Binary.u64Le(action.amountLamports) +
            PublicKeyExt.toBytes(action.recipient) +
            mintBytes
    }
}
