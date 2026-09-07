package io.xpact.privatedao.android.data

import android.content.Context

data class StoredVoteEnvelope(
    val proposalPubkey: String,
    val voterPubkey: String,
    val voteYes: Boolean,
    val saltHex: String,
)

class VoteEnvelopeStore(context: Context) {
    private val prefs = context.getSharedPreferences("privatedao_vote_envelopes", Context.MODE_PRIVATE)

    fun save(envelope: StoredVoteEnvelope) {
        val key = "${envelope.proposalPubkey}:${envelope.voterPubkey}"
        prefs.edit()
            .putString("$key:salt", envelope.saltHex)
            .putBoolean("$key:vote", envelope.voteYes)
            .apply()
    }

    fun load(proposalPubkey: String, voterPubkey: String): StoredVoteEnvelope? {
        val key = "$proposalPubkey:$voterPubkey"
        val salt = prefs.getString("$key:salt", null) ?: return null
        return StoredVoteEnvelope(
            proposalPubkey = proposalPubkey,
            voterPubkey = voterPubkey,
            voteYes = prefs.getBoolean("$key:vote", true),
            saltHex = salt,
        )
    }
}
