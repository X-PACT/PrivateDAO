package io.xpact.privatedao.android.solana

import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest

object Binary {
    fun sha256(bytes: ByteArray): ByteArray = MessageDigest.getInstance("SHA-256").digest(bytes)

    fun concat(vararg parts: ByteArray): ByteArray {
        val total = parts.sumOf { it.size }
        val out = ByteArray(total)
        var offset = 0
        parts.forEach { part ->
            System.arraycopy(part, 0, out, offset, part.size)
            offset += part.size
        }
        return out
    }

    fun u32Le(value: Int): ByteArray = ByteBuffer.allocate(4).order(ByteOrder.LITTLE_ENDIAN).putInt(value).array()
    fun u64Le(value: Long): ByteArray = ByteBuffer.allocate(8).order(ByteOrder.LITTLE_ENDIAN).putLong(value).array()
    fun i64Le(value: Long): ByteArray = u64Le(value)
    fun bool(value: Boolean): ByteArray = byteArrayOf(if (value) 1 else 0)
    fun string(value: String): ByteArray = concat(u32Le(value.toByteArray().size), value.toByteArray())

    fun shortVec(value: Int): ByteArray {
        var rem = value
        val bytes = ArrayList<Byte>()
        while (true) {
            var elem = rem and 0x7f
            rem = rem ushr 7
            if (rem == 0) {
                bytes += elem.toByte()
                break
            }
            elem = elem or 0x80
            bytes += elem.toByte()
        }
        return bytes.toByteArray()
    }

    fun hex(bytes: ByteArray): String = bytes.joinToString("") { "%02x".format(it) }

    fun hexToBytes(value: String): ByteArray {
        val clean = value.trim().removePrefix("0x")
        require(clean.length % 2 == 0) { "Hex string must have even length" }
        return clean.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
    }
}
