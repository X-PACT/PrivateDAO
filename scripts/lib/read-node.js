"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.__testables = exports.PrivateDaoReadNode = void 0;
exports.resolveDevnetRpcEndpoints = resolveDevnetRpcEndpoints;
// SPDX-License-Identifier: AGPL-3.0-or-later
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const magicblock_payments_1 = require("./magicblock-payments");
const envPath = path.join(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#"))
            continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1)
            continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/\${([^}]+)}/g, (_, k) => process.env[k] ?? "");
        if (!process.env[key])
            process.env[key] = val;
    }
}
function trimValue(value) {
    return (value || "").trim();
}
function isPlaceholderValue(value) {
    const normalized = trimValue(value);
    return (normalized.length === 0 ||
        normalized.includes("${") ||
        normalized === "your_helius_api_key_here" ||
        normalized === "your_alchemy_api_key_here" ||
        normalized === "your_rpc_url_here");
}
function isValidRpcUrl(value) {
    const normalized = trimValue(value);
    return !isPlaceholderValue(normalized) && /^https?:\/\//.test(normalized);
}
function rpcTimeoutMs() {
    const parsed = Number(process.env.PRIVATE_DAO_RPC_TIMEOUT_MS || 8000);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
}
function buildAlchemyDevnetRpc() {
    if (isValidRpcUrl(process.env.ALCHEMY_DEVNET_RPC_URL)) {
        return trimValue(process.env.ALCHEMY_DEVNET_RPC_URL);
    }
    if (!isPlaceholderValue(process.env.ALCHEMY_API_KEY)) {
        return `https://solana-devnet.g.alchemy.com/v2/${trimValue(process.env.ALCHEMY_API_KEY)}`;
    }
    return null;
}
function buildHeliusDevnetRpc() {
    if (!isPlaceholderValue(process.env.HELIUS_API_KEY)) {
        return `https://devnet.helius-rpc.com/?api-key=${trimValue(process.env.HELIUS_API_KEY)}`;
    }
    return null;
}
function resolveDevnetRpcEndpoints() {
    const endpoints = [];
    const add = (rpc) => {
        const candidate = rpc ?? undefined;
        if (!isValidRpcUrl(candidate))
            return;
        const normalized = trimValue(candidate);
        if (!endpoints.includes(normalized))
            endpoints.push(normalized);
    };
    add(process.env.SOLANA_RPC_URL);
    add(buildAlchemyDevnetRpc());
    add(buildHeliusDevnetRpc());
    add(process.env.QUICKNODE_DEVNET_RPC);
    const extra = trimValue(process.env.EXTRA_DEVNET_RPCS);
    if (extra) {
        for (const item of extra.split(","))
            add(item);
    }
    add((0, web3_js_1.clusterApiUrl)("devnet"));
    add("https://api.devnet.solana.com");
    add(process.env.RPC_FAST_DEVNET_RPC);
    return endpoints;
}
const IDL_PATH = path.resolve(__dirname, "..", "..", "target", "idl", "private_dao.json");
const rawIdl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
const coder = new anchor.BorshCoder(rawIdl);
const LOAD_PROFILE_SUMMARIES = [
    {
        name: "50",
        walletCount: 50,
        waveSize: 10,
        fundingWaveSize: 5,
        targetPdaoUi: 100,
        waveCount: 5,
        negativeScenarios: ["wrong-voter-record", "wrong-delegation-marker", "wrong-token-account"],
    },
    {
        name: "100",
        walletCount: 100,
        waveSize: 20,
        fundingWaveSize: 10,
        targetPdaoUi: 100,
        waveCount: 5,
        negativeScenarios: ["wrong-voter-record", "wrong-delegation-marker", "wrong-token-account", "late-reveal"],
    },
    {
        name: "350",
        walletCount: 350,
        waveSize: 50,
        fundingWaveSize: 25,
        targetPdaoUi: 100,
        waveCount: 7,
        negativeScenarios: [
            "invalid-reveal",
            "late-reveal",
            "execute-replay",
            "wrong-vault",
            "wrong-authority",
            "payout-replay",
        ],
    },
    {
        name: "500",
        walletCount: 500,
        waveSize: 25,
        fundingWaveSize: 10,
        targetPdaoUi: 100,
        waveCount: 20,
        negativeScenarios: ["invalid-reveal", "late-reveal", "execute-replay", "wrong-authority", "payout-replay"],
    },
];
function asPublicKey(value) {
    return value.toBase58();
}
function asNumber(value) {
    if (typeof value === "number")
        return value;
    if (typeof value === "bigint")
        return Number(value);
    if (value && typeof value.toNumber === "function")
        return value.toNumber();
    return Number(value || 0);
}
function enumName(value, fallback = "Unknown") {
    if (!value || typeof value !== "object")
        return fallback;
    const keys = Object.keys(value);
    return keys.length ? keys[0] : fallback;
}
function votingConfigLabel(value) {
    return enumName(value, "Unknown");
}
function actionTypeLabel(value) {
    const label = enumName(value, "Unknown");
    return label === "SendSol" ? "Send SOL"
        : label === "SendSpl" ? "Send SPL"
            : label === "SendSpl2022" ? "Send SPL-2022"
                : label;
}
function statusLabel(value) {
    return enumName(value, "Unknown");
}
function proofSystemLabel(value) {
    return enumName(value, "Unknown");
}
function computePhase(proposal, nowTs) {
    if (proposal.isExecuted)
        return "Executed";
    if (["Cancelled", "Vetoed", "Failed"].includes(proposal.status))
        return proposal.status;
    if (proposal.status === "Voting" && nowTs < proposal.votingEnd)
        return "Commit";
    if (proposal.status === "Voting" && nowTs < proposal.revealEnd)
        return "Reveal";
    if (proposal.status === "Passed" && nowTs < proposal.executionUnlocksAt)
        return "Timelocked";
    if (proposal.status === "Passed" && nowTs >= proposal.executionUnlocksAt)
        return "Executable";
    return "Finalized";
}
function deriveProposalZkPolicyPda(proposalPubkey, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-policy"), new web3_js_1.PublicKey(proposalPubkey).toBuffer()], programId)[0].toBase58();
}
function deriveConfidentialPayoutPlanPda(proposalPubkey, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("payout-plan"), new web3_js_1.PublicKey(proposalPubkey).toBuffer()], programId)[0].toBase58();
}
function deriveRefheEnvelopePda(proposalPubkey, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("refhe-envelope"), new web3_js_1.PublicKey(proposalPubkey).toBuffer()], programId)[0].toBase58();
}
function deriveMagicBlockPrivatePaymentCorridorPda(proposalPubkey, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("magicblock-corridor"), new web3_js_1.PublicKey(proposalPubkey).toBuffer()], programId)[0].toBase58();
}
function deriveZkReceiptPda(proposalPubkey, layerSeedByte, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("zk-verify"), new web3_js_1.PublicKey(proposalPubkey).toBuffer(), Buffer.from([layerSeedByte])], programId)[0].toBase58();
}
function mapDaoAccount(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        authority: asPublicKey(decoded.authority),
        daoName: decoded.dao_name,
        governanceToken: asPublicKey(decoded.governance_token),
        quorumPercentage: decoded.quorum_percentage,
        governanceTokenRequired: asNumber(decoded.governance_token_required),
        revealWindowSeconds: asNumber(decoded.reveal_window_seconds),
        executionDelaySeconds: asNumber(decoded.execution_delay_seconds),
        votingConfig: votingConfigLabel(decoded.voting_config),
        proposalCount: asNumber(decoded.proposal_count),
        bump: decoded.bump,
    };
}
function mapProposalAccount(pubkey, decoded) {
    const treasuryAction = decoded.treasury_action
        ? {
            actionType: enumName(decoded.treasury_action.action_type),
            actionTypeLabel: actionTypeLabel(decoded.treasury_action.action_type),
            amountLamports: asNumber(decoded.treasury_action.amount_lamports),
            recipient: asPublicKey(decoded.treasury_action.recipient),
            tokenMint: decoded.treasury_action.token_mint ? asPublicKey(decoded.treasury_action.token_mint) : null,
        }
        : null;
    const proposal = {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposer: asPublicKey(decoded.proposer),
        proposalId: asNumber(decoded.proposal_id),
        title: decoded.title,
        description: decoded.description,
        status: statusLabel(decoded.status),
        votingEnd: asNumber(decoded.voting_end),
        revealEnd: asNumber(decoded.reveal_end),
        executionUnlocksAt: asNumber(decoded.execution_unlocks_at),
        isExecuted: Boolean(decoded.is_executed),
        yesCapital: asNumber(decoded.yes_capital),
        noCapital: asNumber(decoded.no_capital),
        yesCommunity: asNumber(decoded.yes_community),
        noCommunity: asNumber(decoded.no_community),
        commitCount: asNumber(decoded.commit_count),
        revealCount: asNumber(decoded.reveal_count),
        treasuryAction,
        phase: "Finalized",
        zkMode: "Companion",
        zkRequiredLayersMask: 0,
        zkPolicyPda: null,
        confidentialPayoutPlan: null,
        refheEnvelope: null,
        magicblockCorridor: null,
        zkReceiptSummary: [],
        daoDetails: null,
    };
    proposal.phase = computePhase(proposal, Math.floor(Date.now() / 1000));
    return proposal;
}
function mapPolicyAccount(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposal: asPublicKey(decoded.proposal),
        configuredBy: asPublicKey(decoded.configured_by),
        mode: enumName(decoded.mode),
        requiredLayersMask: decoded.required_layers_mask,
        configuredAt: asNumber(decoded.configured_at),
        bump: decoded.bump,
    };
}
function mapConfidentialPayoutPlan(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposal: asPublicKey(decoded.proposal),
        configuredBy: asPublicKey(decoded.configured_by),
        payoutType: enumName(decoded.payout_type),
        assetType: enumName(decoded.asset_type),
        settlementRecipient: asPublicKey(decoded.settlement_recipient),
        tokenMint: decoded.token_mint ? asPublicKey(decoded.token_mint) : null,
        recipientCount: decoded.recipient_count,
        totalAmount: asNumber(decoded.total_amount),
        encryptedManifestUri: decoded.encrypted_manifest_uri,
        manifestHash: Buffer.from(decoded.manifest_hash).toString("hex"),
        ciphertextHash: Buffer.from(decoded.ciphertext_hash).toString("hex"),
        status: enumName(decoded.status),
        configuredAt: asNumber(decoded.configured_at),
        fundedAt: asNumber(decoded.funded_at),
        bump: decoded.bump,
    };
}
function mapRefheEnvelope(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposal: asPublicKey(decoded.proposal),
        payoutPlan: asPublicKey(decoded.payout_plan),
        configuredBy: asPublicKey(decoded.configured_by),
        settledBy: decoded.settled_by ? asPublicKey(decoded.settled_by) : null,
        modelUri: decoded.model_uri,
        policyHash: Buffer.from(decoded.policy_hash).toString("hex"),
        inputCiphertextHash: Buffer.from(decoded.input_ciphertext_hash).toString("hex"),
        evaluationKeyHash: Buffer.from(decoded.evaluation_key_hash).toString("hex"),
        resultCiphertextHash: Buffer.from(decoded.result_ciphertext_hash).toString("hex"),
        resultCommitmentHash: Buffer.from(decoded.result_commitment_hash).toString("hex"),
        proofBundleHash: Buffer.from(decoded.proof_bundle_hash).toString("hex"),
        verifierProgram: decoded.verifier_program ? asPublicKey(decoded.verifier_program) : null,
        status: enumName(decoded.status),
        configuredAt: asNumber(decoded.configured_at),
        settledAt: asNumber(decoded.settled_at),
        bump: decoded.bump,
    };
}
function mapMagicBlockCorridor(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposal: asPublicKey(decoded.proposal),
        payoutPlan: asPublicKey(decoded.payout_plan),
        configuredBy: asPublicKey(decoded.configured_by),
        settledBy: decoded.settled_by ? asPublicKey(decoded.settled_by) : null,
        apiBaseUrl: decoded.api_base_url,
        cluster: decoded.cluster,
        ownerWallet: asPublicKey(decoded.owner_wallet),
        settlementWallet: asPublicKey(decoded.settlement_wallet),
        tokenMint: asPublicKey(decoded.token_mint),
        validator: decoded.validator ? asPublicKey(decoded.validator) : null,
        transferQueue: decoded.transfer_queue ? asPublicKey(decoded.transfer_queue) : null,
        routeHash: Buffer.from(decoded.route_hash).toString("hex"),
        depositAmount: asNumber(decoded.deposit_amount),
        privateTransferAmount: asNumber(decoded.private_transfer_amount),
        withdrawalAmount: asNumber(decoded.withdrawal_amount),
        depositTxSignature: decoded.deposit_tx_signature,
        transferTxSignature: decoded.transfer_tx_signature,
        withdrawTxSignature: decoded.withdraw_tx_signature,
        status: enumName(decoded.status),
        configuredAt: asNumber(decoded.configured_at),
        settledAt: asNumber(decoded.settled_at),
        bump: decoded.bump,
    };
}
function mapReceipt(pubkey, decoded) {
    return {
        pubkey: pubkey.toBase58(),
        dao: asPublicKey(decoded.dao),
        proposal: asPublicKey(decoded.proposal),
        verifiedBy: asPublicKey(decoded.verified_by),
        layer: enumName(decoded.layer),
        proofSystem: proofSystemLabel(decoded.proof_system),
        verificationMode: enumName(decoded.verification_mode),
        verifierProgram: decoded.verifier_program ? asPublicKey(decoded.verifier_program) : null,
        verifiedAt: asNumber(decoded.verified_at),
        bump: decoded.bump,
    };
}
async function fetchMany(connection, keys, commitment) {
    const chunkSize = 100;
    const results = [];
    for (let i = 0; i < keys.length; i += chunkSize) {
        const chunk = keys.slice(i, i + chunkSize);
        const infos = await connection.getMultipleAccountsInfo(chunk, commitment);
        results.push(...infos);
    }
    return results;
}
class PrivateDaoReadNode {
    constructor({ commitment = "confirmed", cacheTtlMs = Number(process.env.PRIVATE_DAO_READ_CACHE_TTL_MS || 15000), programId = new web3_js_1.PublicKey(process.env.PRIVATE_DAO_PROGRAM_ID || rawIdl.address), rpcEndpoints = resolveDevnetRpcEndpoints(), } = {}) {
        this.caches = new Map();
        this.currentRpcIndex = 0;
        this.commitment = commitment;
        this.cacheTtlMs = cacheTtlMs;
        this.programId = programId;
        this.rpcEndpoints = rpcEndpoints;
        this.connection = new web3_js_1.Connection(this.rpcEndpoints[this.currentRpcIndex], this.commitment);
    }
    cacheKey(key, value) {
        return `${key}:${value}`;
    }
    getCached(key) {
        const hit = this.caches.get(key);
        if (!hit || hit.expiresAt < Date.now()) {
            this.caches.delete(key);
            return null;
        }
        return hit.value;
    }
    setCached(key, value) {
        this.caches.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
    }
    currentRpcEndpoint() {
        return this.rpcEndpoints[this.currentRpcIndex];
    }
    cacheStats() {
        for (const [key, value] of this.caches.entries()) {
            if (value.expiresAt < Date.now()) {
                this.caches.delete(key);
            }
        }
        return {
            entryCount: this.caches.size,
            ttlMs: this.cacheTtlMs,
        };
    }
    rotateRpcEndpoint() {
        this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcEndpoints.length;
        this.connection = new web3_js_1.Connection(this.currentRpcEndpoint(), this.commitment);
        return this.currentRpcEndpoint();
    }
    isRecoverableRpcError(error) {
        const message = String(error?.message || error || "").toLowerCase();
        return (message.includes("429") ||
            message.includes("400") ||
            message.includes("fetch failed") ||
            message.includes("network") ||
            message.includes("timed out") ||
            message.includes("node is behind") ||
            message.includes("blockhash not found"));
    }
    async withRpcFallback(operation, attempts = this.rpcEndpoints.length) {
        let lastError = null;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            try {
                return await Promise.race([
                    operation(this.connection),
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`RPC request timed out after ${rpcTimeoutMs()}ms`)), rpcTimeoutMs())),
                ]);
            }
            catch (error) {
                lastError = error;
                if (!this.isRecoverableRpcError(error) || attempt === attempts - 1) {
                    throw error;
                }
                this.rotateRpcEndpoint();
            }
        }
        throw lastError;
    }
    async getRuntimeSnapshot(force = false) {
        const key = this.cacheKey("runtime", "global");
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        const [version, latest, slot, programInfo] = await Promise.all([
            this.withRpcFallback((connection) => connection.getVersion()),
            this.withRpcFallback((connection) => connection.getLatestBlockhash(this.commitment)),
            this.withRpcFallback((connection) => connection.getSlot(this.commitment)),
            this.withRpcFallback((connection) => connection.getAccountInfo(this.programId, this.commitment)),
        ]);
        const snapshot = {
            generatedAt: new Date().toISOString(),
            readPath: "backend-indexer",
            rpcEndpoint: this.currentRpcEndpoint(),
            rpcPoolSize: this.rpcEndpoints.length,
            commitment: this.commitment,
            programId: this.programId.toBase58(),
            slot,
            solanaCore: version["solana-core"] || "unknown",
            featureSet: version["feature-set"] || "unknown",
            latestBlockhash: latest.blockhash,
            lastValidBlockHeight: latest.lastValidBlockHeight,
            programExecutable: Boolean(programInfo?.executable),
            programOwner: programInfo?.owner?.toBase58() || "unavailable",
            cacheTtlMs: this.cacheTtlMs,
        };
        this.setCached(key, snapshot);
        return snapshot;
    }
    async fetchDao(daoPubkey) {
        const key = this.cacheKey("dao", daoPubkey);
        const cached = this.getCached(key);
        if (cached)
            return cached;
        const pubkey = new web3_js_1.PublicKey(daoPubkey);
        const info = await this.withRpcFallback((connection) => connection.getAccountInfo(pubkey, this.commitment));
        if (!info)
            throw new Error(`DAO account not found: ${daoPubkey}`);
        const decoded = coder.accounts.decode("Dao", info.data);
        const dao = mapDaoAccount(pubkey, decoded);
        this.setCached(key, dao);
        return dao;
    }
    async fetchWalletReadiness(daoPubkey, walletPubkey) {
        const dao = await this.fetchDao(daoPubkey);
        const owner = new web3_js_1.PublicKey(walletPubkey);
        const mint = new web3_js_1.PublicKey(dao.governanceToken);
        const parsed = await this.withRpcFallback((connection) => connection.getParsedTokenAccountsByOwner(owner, { mint }, this.commitment));
        const balanceUi = parsed.value.reduce((sum, accountInfo) => {
            const uiAmount = Number(accountInfo.account.data?.parsed?.info?.tokenAmount?.uiAmount || 0);
            return sum + (Number.isFinite(uiAmount) ? uiAmount : 0);
        }, 0);
        return {
            wallet: walletPubkey,
            dao: daoPubkey,
            governanceMint: dao.governanceToken,
            balanceUi,
            readiness: balanceUi > 0 ? "READY" : "NO TOKEN",
        };
    }
    getLoadProfiles() {
        return LOAD_PROFILE_SUMMARIES.map((profile) => ({ ...profile, negativeScenarios: [...profile.negativeScenarios] }));
    }
    async fetchProposals({ dao, force = false } = {}) {
        const key = this.cacheKey("proposals", dao || "all");
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        const accounts = await this.withRpcFallback((connection) => connection.getProgramAccounts(this.programId));
        const proposals = accounts.flatMap((account) => {
            try {
                const decoded = coder.accounts.decode("Proposal", account.account.data);
                return [mapProposalAccount(account.pubkey, decoded)];
            }
            catch {
                return [];
            }
        });
        const filtered = dao ? proposals.filter((proposal) => proposal.dao === dao) : proposals;
        const daoKeys = [...new Set(filtered.map((proposal) => proposal.dao))].map((item) => new web3_js_1.PublicKey(item));
        const policyKeys = filtered.map((proposal) => new web3_js_1.PublicKey(deriveProposalZkPolicyPda(proposal.pubkey, this.programId)));
        const payoutKeys = filtered.map((proposal) => new web3_js_1.PublicKey(deriveConfidentialPayoutPlanPda(proposal.pubkey, this.programId)));
        const refheKeys = filtered.map((proposal) => new web3_js_1.PublicKey(deriveRefheEnvelopePda(proposal.pubkey, this.programId)));
        const magicBlockKeys = filtered.map((proposal) => new web3_js_1.PublicKey(deriveMagicBlockPrivatePaymentCorridorPda(proposal.pubkey, this.programId)));
        const receiptKeys = filtered.flatMap((proposal) => [1, 2, 3].map((seed) => new web3_js_1.PublicKey(deriveZkReceiptPda(proposal.pubkey, seed, this.programId))));
        const [daoInfos, policyInfos, payoutInfos, refheInfos, magicBlockInfos, receiptInfos] = await Promise.all([
            daoKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, daoKeys, this.commitment)) : Promise.resolve([]),
            policyKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, policyKeys, this.commitment)) : Promise.resolve([]),
            payoutKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, payoutKeys, this.commitment)) : Promise.resolve([]),
            refheKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, refheKeys, this.commitment)) : Promise.resolve([]),
            magicBlockKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, magicBlockKeys, this.commitment)) : Promise.resolve([]),
            receiptKeys.length ? this.withRpcFallback((connection) => fetchMany(connection, receiptKeys, this.commitment)) : Promise.resolve([]),
        ]);
        const daoMap = new Map();
        daoInfos.forEach((info, index) => {
            if (!info)
                return;
            const pubkey = daoKeys[index];
            const decoded = coder.accounts.decode("Dao", info.data);
            daoMap.set(pubkey.toBase58(), mapDaoAccount(pubkey, decoded));
        });
        filtered.forEach((proposal, index) => {
            proposal.daoDetails = daoMap.get(proposal.dao) || null;
            const policyInfo = policyInfos[index];
            if (policyInfo) {
                const decoded = coder.accounts.decode("ProposalZkPolicy", policyInfo.data);
                const mapped = mapPolicyAccount(policyKeys[index], decoded);
                proposal.zkMode = mapped.mode;
                proposal.zkRequiredLayersMask = mapped.requiredLayersMask;
                proposal.zkPolicyPda = mapped.pubkey;
            }
            const payoutInfo = payoutInfos[index];
            if (payoutInfo) {
                const decoded = coder.accounts.decode("ConfidentialPayoutPlan", payoutInfo.data);
                proposal.confidentialPayoutPlan = mapConfidentialPayoutPlan(payoutKeys[index], decoded);
            }
            const refheInfo = refheInfos[index];
            if (refheInfo) {
                const decoded = coder.accounts.decode("RefheEnvelope", refheInfo.data);
                proposal.refheEnvelope = mapRefheEnvelope(refheKeys[index], decoded);
            }
            const magicBlockInfo = magicBlockInfos[index];
            if (magicBlockInfo) {
                const decoded = coder.accounts.decode("MagicBlockPrivatePaymentCorridor", magicBlockInfo.data);
                proposal.magicblockCorridor = mapMagicBlockCorridor(magicBlockKeys[index], decoded);
            }
            const offset = index * 3;
            proposal.zkReceiptSummary = [0, 1, 2].map((receiptIndex) => {
                const info = receiptInfos[offset + receiptIndex];
                if (!info) {
                    return {
                        pubkey: deriveZkReceiptPda(proposal.pubkey, receiptIndex + 1, this.programId),
                        dao: proposal.dao,
                        proposal: proposal.pubkey,
                        verifiedBy: "",
                        layer: ["Vote", "Delegation", "Tally"][receiptIndex],
                        proofSystem: "Groth16",
                        verificationMode: "Missing",
                        verifierProgram: null,
                        verifiedAt: 0,
                        bump: 0,
                    };
                }
                const decoded = coder.accounts.decode("ZkVerificationReceipt", info.data);
                return mapReceipt(receiptKeys[offset + receiptIndex], decoded);
            });
            proposal.phase = computePhase(proposal, Math.floor(Date.now() / 1000));
        });
        filtered.sort((a, b) => b.proposalId - a.proposalId);
        this.setCached(key, filtered);
        return filtered;
    }
    async fetchProposal(proposalPubkey) {
        const existing = (await this.fetchProposals()).find((proposal) => proposal.pubkey === proposalPubkey);
        if (!existing)
            throw new Error(`Proposal not found: ${proposalPubkey}`);
        return existing;
    }
    async getOpsOverview(force = false) {
        const key = this.cacheKey("ops-overview", "global");
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        const proposals = await this.fetchProposals({ force });
        const overview = {
            generatedAt: new Date().toISOString(),
            proposals: proposals.length,
            uniqueDaos: new Set(proposals.map((proposal) => proposal.dao)).size,
            zkEnforced: proposals.filter((proposal) => proposal.zkMode === "ZkEnforced").length,
            confidentialPayouts: proposals.filter((proposal) => Boolean(proposal.confidentialPayoutPlan)).length,
            magicblockConfigured: proposals.filter((proposal) => Boolean(proposal.magicblockCorridor)).length,
            magicblockSettled: proposals.filter((proposal) => proposal.magicblockCorridor?.status === "Settled").length,
            refheConfigured: proposals.filter((proposal) => Boolean(proposal.refheEnvelope)).length,
            refheSettled: proposals.filter((proposal) => proposal.refheEnvelope?.status === "Settled").length,
            refheWithVerifier: proposals.filter((proposal) => Boolean(proposal.refheEnvelope?.verifierProgram)).length,
            executableConfidential: proposals.filter((proposal) => Boolean(proposal.confidentialPayoutPlan) && proposal.phase === "Executable").length,
        };
        this.setCached(key, overview);
        return overview;
    }
    async getMagicBlockRuntime(force = false) {
        const key = this.cacheKey("magicblock-runtime", "global");
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        let health = "unavailable";
        try {
            health = (await (0, magicblock_payments_1.getMagicBlockHealth)((0, magicblock_payments_1.magicBlockApiBase)())).status;
        }
        catch {
            health = "unavailable";
        }
        const runtime = {
            apiBase: (0, magicblock_payments_1.magicBlockApiBase)(),
            cluster: (0, magicblock_payments_1.magicBlockCluster)(),
            health,
        };
        this.setCached(key, runtime);
        return runtime;
    }
    async getMagicBlockMintStatus(mint, validator, force = false) {
        const key = this.cacheKey("magicblock-mint", `${mint}:${validator || "default"}`);
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        const status = await (0, magicblock_payments_1.getMagicBlockMintInitializationStatus)({
            mint,
            cluster: (0, magicblock_payments_1.magicBlockCluster)(),
            validator,
        }, (0, magicblock_payments_1.magicBlockApiBase)());
        this.setCached(key, status);
        return status;
    }
    async getMagicBlockBalances(address, mint, force = false) {
        const key = this.cacheKey("magicblock-balances", `${address}:${mint}`);
        if (!force) {
            const cached = this.getCached(key);
            if (cached)
                return cached;
        }
        const [baseBalance, privateBalance] = await Promise.all([
            (0, magicblock_payments_1.getMagicBlockBalance)({ address, mint, cluster: (0, magicblock_payments_1.magicBlockCluster)() }, (0, magicblock_payments_1.magicBlockApiBase)()),
            (0, magicblock_payments_1.getMagicBlockPrivateBalance)({ address, mint, cluster: (0, magicblock_payments_1.magicBlockCluster)() }, (0, magicblock_payments_1.magicBlockApiBase)()),
        ]);
        const balances = { baseBalance, privateBalance };
        this.setCached(key, balances);
        return balances;
    }
}
exports.PrivateDaoReadNode = PrivateDaoReadNode;
exports.__testables = {
    trimValue,
    isPlaceholderValue,
    isValidRpcUrl,
    rpcTimeoutMs,
    buildAlchemyDevnetRpc,
    buildHeliusDevnetRpc,
    actionTypeLabel,
    statusLabel,
    proofSystemLabel,
    computePhase,
    deriveProposalZkPolicyPda,
    deriveConfidentialPayoutPlanPda,
    deriveRefheEnvelopePda,
    deriveMagicBlockPrivatePaymentCorridorPda,
    deriveZkReceiptPda,
    mapDaoAccount,
    mapProposalAccount,
    mapPolicyAccount,
    mapConfidentialPayoutPlan,
    mapRefheEnvelope,
    mapMagicBlockCorridor,
    mapReceipt,
};
