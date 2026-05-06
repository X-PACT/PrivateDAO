"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.magicBlockApiBase = magicBlockApiBase;
exports.magicBlockCluster = magicBlockCluster;
exports.getMagicBlockHealth = getMagicBlockHealth;
exports.getMagicBlockBalance = getMagicBlockBalance;
exports.getMagicBlockPrivateBalance = getMagicBlockPrivateBalance;
exports.getMagicBlockMintInitializationStatus = getMagicBlockMintInitializationStatus;
exports.buildMagicBlockInitializeMint = buildMagicBlockInitializeMint;
exports.buildMagicBlockDeposit = buildMagicBlockDeposit;
exports.buildMagicBlockTransfer = buildMagicBlockTransfer;
exports.buildMagicBlockWithdraw = buildMagicBlockWithdraw;
exports.submitMagicBlockUnsignedTransaction = submitMagicBlockUnsignedTransaction;
exports.submitMagicBlockUnsignedTransactionWithWallet = submitMagicBlockUnsignedTransactionWithWallet;
exports.magicBlockRouteHash = magicBlockRouteHash;
const crypto_1 = require("crypto");
const web3_js_1 = require("@solana/web3.js");
function trimValue(value) {
    return (value || "").trim();
}
function normalizeApiBase(base) {
    const resolved = trimValue(base || process.env.MAGICBLOCK_API_BASE || "https://payments.magicblock.app");
    return resolved.replace(/\/+$/, "");
}
function normalizeAmount(value) {
    if (typeof value === "number")
        return value;
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    return Number.isSafeInteger(numeric) && String(numeric) === trimmed ? numeric : trimmed;
}
function magicBlockTimeoutMs() {
    const parsed = Number(process.env.MAGICBLOCK_HTTP_TIMEOUT_MS || 3000);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000;
}
function magicBlockErrorMessage(payload, response) {
    if (payload && typeof payload === "object") {
        const record = payload;
        for (const key of ["error", "message", "reason", "detail"]) {
            const value = record[key];
            if (typeof value === "string" && value.trim())
                return value;
            if (value && typeof value === "object")
                return JSON.stringify(value);
        }
        return JSON.stringify(record);
    }
    if (typeof payload === "string" && payload.trim())
        return payload;
    return `MagicBlock request failed: ${response.status} ${response.statusText}`;
}
function magicBlockApiBase() {
    return normalizeApiBase();
}
function magicBlockCluster() {
    const cluster = trimValue(process.env.MAGICBLOCK_CLUSTER || "devnet").toLowerCase();
    return cluster === "mainnet-beta" ? "mainnet-beta" : "devnet";
}
async function magicBlockFetch(pathname, { method = "GET", query, body } = {}, apiBase = magicBlockApiBase()) {
    const url = new URL(`${normalizeApiBase(apiBase)}${pathname}`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === "")
                continue;
            url.searchParams.set(key, String(value));
        }
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), magicBlockTimeoutMs());
    let response;
    try {
        response = await fetch(url, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`MagicBlock request timed out after ${magicBlockTimeoutMs()}ms`);
        }
        throw error;
    }
    finally {
        clearTimeout(timeout);
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(magicBlockErrorMessage(payload, response));
    }
    return payload;
}
async function getMagicBlockHealth(apiBase) {
    return magicBlockFetch("/health", {}, apiBase);
}
async function getMagicBlockBalance(request, apiBase) {
    return magicBlockFetch("/v1/spl/balance", {
        query: {
            address: request.address,
            mint: request.mint,
            cluster: request.cluster || magicBlockCluster(),
        },
    }, apiBase);
}
async function getMagicBlockPrivateBalance(request, apiBase) {
    return magicBlockFetch("/v1/spl/private-balance", {
        query: {
            address: request.address,
            mint: request.mint,
            cluster: request.cluster || magicBlockCluster(),
        },
    }, apiBase);
}
async function getMagicBlockMintInitializationStatus(request, apiBase) {
    return magicBlockFetch("/v1/spl/is-mint-initialized", {
        query: {
            mint: request.mint,
            cluster: request.cluster || magicBlockCluster(),
            validator: request.validator,
        },
    }, apiBase);
}
async function buildMagicBlockInitializeMint(request, apiBase) {
    return magicBlockFetch("/v1/spl/initialize-mint", {
        method: "POST",
        body: {
            payer: request.payer,
            mint: request.mint,
            cluster: request.cluster || magicBlockCluster(),
            validator: request.validator,
        },
    }, apiBase);
}
async function buildMagicBlockDeposit(request, apiBase) {
    return magicBlockFetch("/v1/spl/deposit", {
        method: "POST",
        body: {
            owner: request.owner,
            amount: normalizeAmount(request.amount),
            cluster: request.cluster || magicBlockCluster(),
            mint: request.mint,
            validator: request.validator,
            initIfMissing: request.initIfMissing,
            initVaultIfMissing: request.initVaultIfMissing,
            initAtasIfMissing: request.initAtasIfMissing,
            idempotent: request.idempotent,
        },
    }, apiBase);
}
async function buildMagicBlockTransfer(request, apiBase) {
    return magicBlockFetch("/v1/spl/transfer", {
        method: "POST",
        body: {
            from: request.from,
            to: request.to,
            mint: request.mint,
            amount: normalizeAmount(request.amount),
            visibility: request.visibility,
            fromBalance: request.fromBalance,
            toBalance: request.toBalance,
            cluster: request.cluster || magicBlockCluster(),
            validator: request.validator,
            initIfMissing: request.initIfMissing,
            initAtasIfMissing: request.initAtasIfMissing,
            initVaultIfMissing: request.initVaultIfMissing,
            memo: request.memo,
            minDelayMs: request.minDelayMs,
            maxDelayMs: request.maxDelayMs,
            split: request.split,
        },
    }, apiBase);
}
async function buildMagicBlockWithdraw(request, apiBase) {
    return magicBlockFetch("/v1/spl/withdraw", {
        method: "POST",
        body: {
            owner: request.owner,
            mint: request.mint,
            amount: normalizeAmount(request.amount),
            cluster: request.cluster || magicBlockCluster(),
            validator: request.validator,
            initIfMissing: request.initIfMissing,
            initAtasIfMissing: request.initAtasIfMissing,
            escrowIndex: request.escrowIndex,
            idempotent: request.idempotent,
        },
    }, apiBase);
}
async function submitMagicBlockUnsignedTransaction(provider, built) {
    const raw = Buffer.from(built.transactionBase64, "base64");
    const version = String(built.version || "").toLowerCase();
    if (version.includes("legacy")) {
        const transaction = web3_js_1.Transaction.from(raw);
        return provider.sendAndConfirm(transaction, []);
    }
    const transaction = web3_js_1.VersionedTransaction.deserialize(raw);
    if (!provider.wallet.signTransaction) {
        throw new Error("Connected wallet does not support transaction signing");
    }
    const signed = await provider.wallet.signTransaction(transaction);
    const signature = await provider.connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
    });
    const latest = await provider.connection.getLatestBlockhash("confirmed");
    await provider.connection.confirmTransaction({
        signature,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
    }, "confirmed");
    return signature;
}
async function submitMagicBlockUnsignedTransactionWithWallet(walletProvider, connection, built) {
    const raw = Buffer.from(built.transactionBase64, "base64");
    const version = String(built.version || "").toLowerCase();
    if (version.includes("legacy")) {
        const transaction = web3_js_1.Transaction.from(raw);
        const latest = await connection.getLatestBlockhash("confirmed");
        transaction.feePayer = walletProvider.publicKey;
        transaction.recentBlockhash = built.recentBlockhash || latest.blockhash;
        const signed = await walletProvider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
        });
        await connection.confirmTransaction({
            signature,
            blockhash: transaction.recentBlockhash,
            lastValidBlockHeight: built.lastValidBlockHeight || latest.lastValidBlockHeight,
        }, "confirmed");
        return signature;
    }
    const versioned = web3_js_1.VersionedTransaction.deserialize(raw);
    const signed = await walletProvider.signTransaction(versioned);
    const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
    });
    const latest = await connection.getLatestBlockhash("confirmed");
    await connection.confirmTransaction({
        signature,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
    }, "confirmed");
    return signature;
}
function magicBlockRouteHash(parts) {
    const routeMaterial = parts
        .filter((item) => item !== null && item !== undefined)
        .map((item) => item instanceof web3_js_1.PublicKey ? item.toBase58() : String(item))
        .join("|");
    return Array.from((0, crypto_1.createHash)("sha256").update(routeMaterial, "utf8").digest());
}
