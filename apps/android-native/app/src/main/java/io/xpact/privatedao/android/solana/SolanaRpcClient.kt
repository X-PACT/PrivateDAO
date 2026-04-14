package io.xpact.privatedao.android.solana

import android.util.Log
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.nio.charset.StandardCharsets
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class SolanaRpcClient(
    endpoints: List<String>,
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .retryOnConnectionFailure(true)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build(),
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    private data class CachedBlockhash(
        val value: String,
        val capturedAtMillis: Long,
    )

    private data class RpcCandidate(
        val baseUrl: String,
        val requestUrl: String,
    )

    private companion object {
        const val TAG = "SolanaRpcClient"
        const val EMPTY_RPC_RETRY_COUNT = 3
        const val RPC_RETRY_BACKOFF_MS = 350L
        const val BLOCKHASH_CACHE_WINDOW_MS = 20_000L
        const val BLOCKHASH_MAX_STALENESS_MS = 90_000L
        const val BLOCKHASH_FETCH_ATTEMPTS = 6
        const val BLOCKHASH_FETCH_BACKOFF_MS = 1_000L
    }

    private val endpointUrls: List<String> =
        endpoints
            .map(String::trim)
            .filter(String::isNotEmpty)
            .distinct()
            .ifEmpty { listOf("https://api.devnet.solana.com") }
    @Volatile
    private var preferredEndpointUrl: String = endpointUrls.first()
    private val blockhashMutex = Mutex()
    @Volatile
    private var cachedBlockhash: CachedBlockhash? = null

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
        latestCachedBlockhash(BLOCKHASH_CACHE_WINDOW_MS)?.let {
            return it.value
        }

        return blockhashMutex.withLock {
            latestCachedBlockhash(BLOCKHASH_CACHE_WINDOW_MS)?.let {
                return@withLock it.value
            }

            val resolved = resolveBlockhashWithRetry()

            cachedBlockhash = CachedBlockhash(
                value = resolved,
                capturedAtMillis = System.currentTimeMillis(),
            )
            resolved
        }
    }

    suspend fun getRecentBlockhash(): String {
        latestCachedBlockhash(BLOCKHASH_CACHE_WINDOW_MS)?.let {
            return it.value
        }
        return blockhashMutex.withLock {
            latestCachedBlockhash(BLOCKHASH_CACHE_WINDOW_MS)?.let {
                return@withLock it.value
            }
            val resolved = resolveBlockhashWithRetry()
            cachedBlockhash = CachedBlockhash(
                value = resolved,
                capturedAtMillis = System.currentTimeMillis(),
            )
            resolved
        }
    }

    private fun latestCachedBlockhash(maxAgeMillis: Long): CachedBlockhash? =
        cachedBlockhash?.takeIf { System.currentTimeMillis() - it.capturedAtMillis <= maxAgeMillis }

    private fun resolveBlockhashWithRetry(): String {
        val latestParams = JsonArray(listOf(JsonObject(mapOf("commitment" to JsonPrimitive("confirmed")))))
        var lastError: Throwable? = null

        repeat(BLOCKHASH_FETCH_ATTEMPTS) { attempt ->
            val latestAttempt = runCatching {
                call<RpcLatestBlockhashResponse>("getLatestBlockhash", latestParams).result.value.blockhash
            }
            if (latestAttempt.isSuccess) {
                return latestAttempt.getOrThrow()
            }
            lastError = latestAttempt.exceptionOrNull()

            val recentAttempt = runCatching { getRecentBlockhashUncached() }
            if (recentAttempt.isSuccess) {
                return recentAttempt.getOrThrow()
            }
            lastError = recentAttempt.exceptionOrNull() ?: lastError

            if (attempt < BLOCKHASH_FETCH_ATTEMPTS - 1) {
                val backoffMillis = BLOCKHASH_FETCH_BACKOFF_MS * (attempt + 1)
                Log.w(TAG, "Blockhash fetch attempt ${attempt + 1} failed; retrying in ${backoffMillis}ms")
                Thread.sleep(backoffMillis)
            }
        }

        latestCachedBlockhash(BLOCKHASH_MAX_STALENESS_MS)?.let { cached ->
            Log.w(
                TAG,
                "Using stale cached blockhash captured ${System.currentTimeMillis() - cached.capturedAtMillis}ms ago after repeated fetch failures",
            )
            return cached.value
        }

        throw requireNotNull(lastError) { "Blockhash fetch failed without a captured error" }
    }

    private fun getRecentBlockhashUncached(): String {
        val params = JsonArray(listOf(JsonObject(mapOf("commitment" to JsonPrimitive("confirmed")))))
        return call<RpcRecentBlockhashResponse>("getRecentBlockhash", params).result.value.blockhash
    }

    suspend fun getMinimumBalanceForRentExemption(space: Int): Long {
        val params = JsonArray(listOf(JsonPrimitive(space)))
        return call<RpcLongResponse>("getMinimumBalanceForRentExemption", params).result
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
        var lastError: Throwable? = null

        repeat(EMPTY_RPC_RETRY_COUNT) { attempt ->
            for (candidate in candidateUrls()) {
                val request = Request.Builder()
                    .url(candidate.requestUrl)
                    .addHeader("Accept", "application/json")
                    .addHeader("Accept-Encoding", "identity")
                    .addHeader("Cache-Control", "no-cache")
                    .addHeader("Connection", "close")
                    .addHeader("User-Agent", "PrivateDAO-Android/1.0")
                    .post(payload.toRequestBody("application/json".toMediaType()))
                    .build()

                try {
                    httpClient.newCall(request).execute().use { response ->
                        val bodyBytes = response.body?.bytes() ?: ByteArray(0)
                        val body = String(bodyBytes, StandardCharsets.UTF_8).trim()
                        if (!response.isSuccessful) {
                            error("RPC $method failed: ${response.code} $body")
                        }
                        if (body.isEmpty()) {
                            error(
                                "RPC $method returned an empty response body " +
                                    "(endpoint=${candidate.requestUrl}, code=${response.code}, contentLength=${response.body?.contentLength() ?: -1})"
                            )
                        }
                        if (preferredEndpointUrl != candidate.baseUrl) {
                            Log.i(TAG, "RPC $method switching preferred endpoint to ${candidate.baseUrl}")
                            preferredEndpointUrl = candidate.baseUrl
                        }
                        return json.decodeFromString(body)
                    }
                } catch (error: SerializationException) {
                    lastError = IllegalStateException(
                        "RPC $method returned malformed JSON on attempt ${attempt + 1} via ${candidate.requestUrl}",
                        error,
                    )
                } catch (error: IllegalStateException) {
                    lastError = error
                    Log.w(TAG, "RPC $method attempt ${attempt + 1} failed via ${candidate.requestUrl}: ${error.message}")
                } catch (error: Throwable) {
                    throw error
                }
            }

            if (attempt < EMPTY_RPC_RETRY_COUNT - 1) {
                Thread.sleep(RPC_RETRY_BACKOFF_MS * (attempt + 1))
            }
        }

        throw requireNotNull(lastError) { "RPC $method failed without a captured error" }
    }

    private fun candidateUrls(): List<RpcCandidate> {
        val orderedBaseUrls = listOf(preferredEndpointUrl) + endpointUrls.filterNot { it == preferredEndpointUrl }
        return orderedBaseUrls
            .flatMap { baseUrl ->
                val normalized = baseUrl.trim()
                val withSlash = normalized.trimEnd('/') + "/"
                listOf(normalized, withSlash)
                    .distinct()
                    .map { requestUrl -> RpcCandidate(baseUrl = normalized, requestUrl = requestUrl) }
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
data class RpcRecentBlockhashResponse(val result: RpcRecentBlockhashResult)

@Serializable
data class RpcRecentBlockhashResult(val value: RpcRecentBlockhashValue)

@Serializable
data class RpcRecentBlockhashValue(val blockhash: String)

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

@Serializable
data class RpcLongResponse(val result: Long)
