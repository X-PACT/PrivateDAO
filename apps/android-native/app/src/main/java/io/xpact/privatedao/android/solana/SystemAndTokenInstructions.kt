package io.xpact.privatedao.android.solana

import io.xpact.privatedao.android.config.PrivateDaoConfig

object SystemAndTokenInstructions {
    private const val mintAccountSize = 82L

    fun createAccountWithSeed(
        payer: String,
        newAccount: String,
        base: String,
        seed: String,
        lamports: Long,
        ownerProgramId: String,
        space: Long = mintAccountSize,
    ): TransactionInstruction {
        val data = Binary.concat(
            Binary.u32Le(3),
            PublicKeyExt.toBytes(base),
            Binary.string(seed),
            Binary.u64Le(lamports),
            Binary.u64Le(space),
            PublicKeyExt.toBytes(ownerProgramId),
        )
        return TransactionInstruction(
            programId = PrivateDaoConfig.systemProgramId,
            accounts = listOf(
                AccountMeta(payer, isSigner = true, isWritable = true),
                AccountMeta(newAccount, isSigner = false, isWritable = true),
                AccountMeta(base, isSigner = true, isWritable = false),
            ),
            data = data,
        )
    }

    fun transfer(
        from: String,
        to: String,
        lamports: Long,
    ): TransactionInstruction {
        val data = Binary.concat(
            Binary.u32Le(2),
            Binary.u64Le(lamports),
        )
        return TransactionInstruction(
            programId = PrivateDaoConfig.systemProgramId,
            accounts = listOf(
                AccountMeta(from, isSigner = true, isWritable = true),
                AccountMeta(to, isSigner = false, isWritable = true),
            ),
            data = data,
        )
    }

    fun initializeMint(
        mint: String,
        mintAuthority: String,
        decimals: Int = 6,
    ): TransactionInstruction {
        val data = Binary.concat(
            byteArrayOf(0),
            byteArrayOf(decimals.toByte()),
            PublicKeyExt.toBytes(mintAuthority),
            byteArrayOf(0),
        )
        return TransactionInstruction(
            programId = PrivateDaoConfig.tokenProgramId,
            accounts = listOf(
                AccountMeta(mint, isSigner = false, isWritable = true),
                AccountMeta(PrivateDaoConfig.rentSysvarId, isSigner = false, isWritable = false),
            ),
            data = data,
        )
    }
}
