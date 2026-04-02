package io.xpact.privatedao.android.solana

import kotlin.random.Random

object VoteCommitment {
    fun randomSalt32(): ByteArray = Random.Default.nextBytes(32)

    fun compute(voteYes: Boolean, salt32: ByteArray, voterPublicKey: String): ByteArray {
        require(salt32.size == 32) { "Salt must be exactly 32 bytes" }
        val voteByte = byteArrayOf(if (voteYes) 1 else 0)
        return Binary.sha256(
            Binary.concat(voteByte, salt32, PublicKeyExt.toBytes(voterPublicKey)),
        )
    }
}
