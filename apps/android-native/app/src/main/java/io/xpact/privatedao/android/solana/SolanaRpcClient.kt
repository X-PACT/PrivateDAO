package io.xpact.privatedao.android.solana

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class SolanaRpcClient(
    private val endpoint: String,
    private val httpClient: OkHttpClient = OkHttpClient(),
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun getProgramAccounts(programId: String): List<RpcAccount> {
        val params = JsonArray(listOf(
            JsonPrimitive(programId),
            JsonObject(
                mapOf(
                    "encoding" to JsonPrimitive("base64"),
                    "commitment" to JsonPrimitive("confirmed"),
                )
            ),
        ))
        val response = call<RpcProgramAccountsResponse>("getProgramAccounts", params)
        return response.result
    }

    suspend fun getAccountInfo(pubkey: String): RpcAccountInfoValue? {
        val params = JsonArray(listOf(
            JsonPrimitive(pubkey),
            JsonObject(
                mapOf(
                    "encoding" to JsonPrimitive("base64"),
                    "commitment" to JsonPrimitive("confirmed"),
                )
            ),
        ))
        return call<RpcAccountInfoResponse>("getAccountInfo", params).result.value
    }

    suspend fun getLatestBlockhash(): String {
        val params = JsonArray(listOf(JsonObject(mapOf("commitment" to JsonPrimitive("confirmed")))))
        return call<RpcLatestBlockhashResponse>("getLatestBlockhash", params).result.value.blockhash
    }

    suspend fun getSignaturesForAddress(address: String, limit: Int = 10): List<RpcSignatureInfo> {
        val params = JsonArray(listOf(
            JsonPrimitive(address),
            JsonObject(mapOf("limit" to JsonPrimitive(limit))),
        ))
        return call<RpcSignaturesResponse>("getSignaturesForAddress", params).result
    }

    private inline fun <reified T> call(method: String, params: JsonArray): T {
        val payload = json.encodeToString(
            RpcRequest.serializer(),
            RpcRequest(method = method, params = params),
        )
        val request = Request.Builder()
            .url(endpoint)
            .post(payload.toRequestBody("application/json".toMediaType()))
            .build()

        httpClient.newCall(request).execute().use { response ->
            val body = requireNotNull(response.body?.string()) { "Missing RPC response body" }
            if (!response.isSuccessful) error("RPC $method failed: ${response.code} $body")
            return json.decodeFromString(body)
        }
    }
}

@Serializable
private data class RpcRequest(
    val jsonrpc: String = "2.0",
    val id: Int = 1,
    val method: String,
    val params: JsonArray,
)

@Serializable
data class RpcProgramAccountsResponse(val result: List<RpcAccount>)

@Serializable
data class RpcAccount(
    val pubkey: String,
    val account: RpcAccountInfoValue,
)

@Serializable
data class RpcAccountInfoResponse(val result: RpcAccountInfoResult)

@Serializable
data class RpcAccountInfoResult(val value: RpcAccountInfoValue? = null)

@Serializable
data class RpcAccountInfoValue(
    val data: List<String>,
    val executable: Boolean,
    val lamports: Long,
    val owner: String,
    @SerialName("rentEpoch") val rentEpoch: Long,
    val space: Int,
)

@Serializable
data class RpcLatestBlockhashResponse(val result: RpcLatestBlockhashResult)

@Serializable
data class RpcLatestBlockhashResult(val value: RpcBlockhashValue)

@Serializable
data class RpcBlockhashValue(val blockhash: String)

@Serializable
data class RpcSignaturesResponse(val result: List<RpcSignatureInfo>)

@Serializable
data class RpcSignatureInfo(
    val signature: String,
    val slot: Long,
    val err: JsonObject? = null,
    val memo: String? = null,
    @SerialName("blockTime") val blockTime: Long? = null,
)
