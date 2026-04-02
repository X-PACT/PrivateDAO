package io.xpact.privatedao.android.solana

data class TransactionInstruction(
    val programId: String,
    val accounts: List<AccountMeta>,
    val data: ByteArray,
)

object LegacyTransactionBuilder {
    fun build(
        feePayer: String,
        recentBlockhash: String,
        instructions: List<TransactionInstruction>,
    ): ByteArray {
        require(instructions.isNotEmpty()) { "At least one instruction is required" }

        val deduped = LinkedHashMap<String, AccountMeta>()
        deduped[feePayer] = AccountMeta(feePayer, isSigner = true, isWritable = true)
        instructions.forEach { ix ->
            ix.accounts.forEach { meta ->
                val existing = deduped[meta.publicKey]
                deduped[meta.publicKey] = when {
                    existing == null -> meta
                    else -> existing.copy(
                        isSigner = existing.isSigner || meta.isSigner,
                        isWritable = existing.isWritable || meta.isWritable,
                    )
                }
            }
            val existingProgram = deduped[ix.programId]
            deduped[ix.programId] = existingProgram?.copy() ?: AccountMeta(ix.programId, isSigner = false, isWritable = false)
        }

        val orderedAccounts = deduped.values.sortedWith(
            compareByDescending<AccountMeta> { it.isSigner }
                .thenByDescending { it.isWritable }
                .thenBy { it.publicKey != feePayer }
        ).sortedBy { if (it.publicKey == feePayer) 0 else 1 }

        val accountIndex = orderedAccounts.mapIndexed { index, meta -> meta.publicKey to index }.toMap()

        val requiredSigners = orderedAccounts.count { it.isSigner }
        val readOnlySigned = orderedAccounts.count { it.isSigner && !it.isWritable }
        val readOnlyUnsigned = orderedAccounts.count { !it.isSigner && !it.isWritable }

        val header = byteArrayOf(requiredSigners.toByte(), readOnlySigned.toByte(), readOnlyUnsigned.toByte())
        val accountKeys = Binary.shortVec(orderedAccounts.size) + orderedAccounts.flatMap { PublicKeyExt.toBytes(it.publicKey).asList() }.toByteArray()
        val recentBlockhashBytes = PublicKeyExt.toBytes(recentBlockhash)
        val instructionBytes = Binary.shortVec(instructions.size) + instructions.flatMap { ix ->
            val accountIndices = ix.accounts.map { meta -> accountIndex.getValue(meta.publicKey).toByte() }.toByteArray()
            buildList {
                add(accountIndex.getValue(ix.programId).toByte())
                addAll(Binary.shortVec(accountIndices.size).asList())
                addAll(accountIndices.asList())
                addAll(Binary.shortVec(ix.data.size).asList())
                addAll(ix.data.asList())
            }
        }.toByteArray()

        val message = header + accountKeys + recentBlockhashBytes + instructionBytes
        val signaturesSection = Binary.shortVec(requiredSigners) + ByteArray(requiredSigners * 64)
        return signaturesSection + message
    }
}
