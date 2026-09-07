package io.xpact.privatedao.android.solana

import java.math.BigInteger

object Base58 {
    private const val ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    private val indexes = IntArray(128) { -1 }.apply {
        ALPHABET.forEachIndexed { index, c -> this[c.code] = index }
    }

    fun decode(value: String): ByteArray {
        if (value.isBlank()) return ByteArray(0)
        var num = BigInteger.ZERO
        val radix = BigInteger.valueOf(58)
        value.forEach { char ->
            val idx = if (char.code < indexes.size) indexes[char.code] else -1
            require(idx >= 0) { "Invalid base58 character: $char" }
            num = num.multiply(radix).add(BigInteger.valueOf(idx.toLong()))
        }

        val bytes = num.toByteArray().let {
            if (it.size > 1 && it.first() == 0.toByte()) it.copyOfRange(1, it.size) else it
        }
        val leadingZeros = value.takeWhile { it == '1' }.count()
        return ByteArray(leadingZeros) + bytes
    }

    fun encode(bytes: ByteArray): String {
        if (bytes.isEmpty()) return ""
        var num = BigInteger(1, bytes)
        val radix = BigInteger.valueOf(58)
        val out = StringBuilder()
        while (num > BigInteger.ZERO) {
            val divRem = num.divideAndRemainder(radix)
            num = divRem[0]
            out.append(ALPHABET[divRem[1].toInt()])
        }
        bytes.takeWhile { it == 0.toByte() }.forEach { _ -> out.append('1') }
        return out.reverse().toString()
    }
}
