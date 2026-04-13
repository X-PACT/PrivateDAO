package io.xpact.privatedao.android.solana

import net.i2p.crypto.eddsa.spec.EdDSANamedCurveTable
import net.i2p.crypto.eddsa.spec.EdDSAPublicKeySpec
import java.security.MessageDigest

data class AccountMeta(
    val publicKey: String,
    val isSigner: Boolean,
    val isWritable: Boolean,
)

object PublicKeyExt {
    private val pdaMarker = "ProgramDerivedAddress".toByteArray()
    private val ed25519Spec = EdDSANamedCurveTable.getByName(EdDSANamedCurveTable.ED_25519)

    fun toBytes(base58: String): ByteArray = Base58.decode(base58)

    fun findProgramAddress(seeds: List<ByteArray>, programId: String): Pair<String, Int> {
        for (bump in 255 downTo 0) {
            val candidate = createProgramAddress(seeds + byteArrayOf(bump.toByte()), programId)
            if (candidate != null) return candidate to bump
        }
        error("Unable to derive PDA for provided seeds")
    }

    fun createProgramAddress(seeds: List<ByteArray>, programId: String): String? {
        val buffer = ArrayList<ByteArray>(seeds.size + 2)
        buffer.addAll(seeds)
        buffer.add(toBytes(programId))
        buffer.add(pdaMarker)
        val hash = Binary.sha256(Binary.concat(*buffer.toTypedArray()))
        return if (isOnCurve(hash)) null else Base58.encode(hash)
    }

    fun deriveAssociatedTokenAddress(owner: String, mint: String, tokenProgramId: String, associatedProgramId: String): String {
        return findProgramAddress(
            listOf(toBytes(owner), toBytes(tokenProgramId), toBytes(mint)),
            associatedProgramId,
        ).first
    }

    fun createWithSeed(base: String, seed: String, ownerProgramId: String): String {
        require(seed.toByteArray().size <= 32) { "Seed must be at most 32 bytes" }
        val digest = MessageDigest.getInstance("SHA-256").digest(
            Binary.concat(
                toBytes(base),
                seed.toByteArray(),
                toBytes(ownerProgramId),
            )
        )
        return Base58.encode(digest)
    }

    private fun isOnCurve(candidate: ByteArray): Boolean {
        return try {
            EdDSAPublicKeySpec(candidate, ed25519Spec)
            true
        } catch (_: Throwable) {
            false
        }
    }
}
