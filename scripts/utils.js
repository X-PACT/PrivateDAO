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
exports.parseArgs = parseArgs;
exports.workspaceProgram = workspaceProgram;
exports.computeProposalCommitment = computeProposalCommitment;
exports.shortKey = shortKey;
exports.formatSol = formatSol;
exports.formatTimestamp = formatTimestamp;
exports.formatDuration = formatDuration;
exports.proposalStatusLabel = proposalStatusLabel;
exports.proposalPhaseLabel = proposalPhaseLabel;
exports.solscanAccountUrl = solscanAccountUrl;
exports.solscanTxUrl = solscanTxUrl;
exports.deriveConfidentialPayoutPlanPda = deriveConfidentialPayoutPlanPda;
exports.deriveRefheEnvelopePda = deriveRefheEnvelopePda;
exports.deriveMagicBlockPrivatePaymentCorridorPda = deriveMagicBlockPrivatePaymentCorridorPda;
exports.deriveDaoSecurityPolicyPda = deriveDaoSecurityPolicyPda;
exports.deriveDaoGovernancePolicyV3Pda = deriveDaoGovernancePolicyV3Pda;
exports.deriveDaoSettlementPolicyV3Pda = deriveDaoSettlementPolicyV3Pda;
exports.deriveProposalExecutionPolicySnapshotPda = deriveProposalExecutionPolicySnapshotPda;
exports.deriveProposalGovernancePolicySnapshotV3Pda = deriveProposalGovernancePolicySnapshotV3Pda;
exports.deriveProposalSettlementPolicySnapshotV3Pda = deriveProposalSettlementPolicySnapshotV3Pda;
exports.deriveRevealRebateVaultV3Pda = deriveRevealRebateVaultV3Pda;
exports.deriveProposalProofVerificationPda = deriveProposalProofVerificationPda;
exports.deriveSettlementEvidencePda = deriveSettlementEvidencePda;
exports.deriveSettlementConsumptionRecordPda = deriveSettlementConsumptionRecordPda;
exports.proofDomainSeparator = proofDomainSeparator;
exports.canonicalProposalPayloadHash = canonicalProposalPayloadHash;
exports.canonicalPayoutFieldsHash = canonicalPayoutFieldsHash;
exports.resolveTokenProgramForMint = resolveTokenProgramForMint;
exports.associatedTokenAddressForMint = associatedTokenAddressForMint;
exports.legacySaltPath = legacySaltPath;
exports.saltPath = saltPath;
exports.ensureSaltDir = ensureSaltDir;
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * utils.ts — shared helpers for PrivateDAO CLI scripts
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const crypto = __importStar(require("crypto"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
// Load .env from project root if it exists
const envPath = path.join(__dirname, "..", ".env");
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
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--")) {
            const key = args[i].slice(2);
            const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
            const parsedNumber = typeof val === "string" ? Number(val) : NaN;
            result[camelKey] =
                typeof val === "string" && Number.isFinite(parsedNumber) && String(parsedNumber) === val.trim()
                    ? parsedNumber
                    : val;
            if (val !== true)
                i++;
        }
    }
    return result;
}
function workspaceProgram() {
    return anchor.workspace.PrivateDao;
}
function computeProposalCommitment(vote, salt, voter, proposal) {
    return crypto
        .createHash("sha256")
        .update(Buffer.concat([Buffer.from([vote ? 1 : 0]), salt, proposal.toBuffer(), voter.toBuffer()]))
        .digest();
}
function shortKey(key) {
    const s = key.toBase58();
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
}
function formatSol(lamports) {
    return `${(Number(lamports) / 1e9).toFixed(4)} SOL`;
}
function formatTimestamp(unix) {
    return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (days)
        parts.push(`${days}d`);
    if (hours)
        parts.push(`${hours}h`);
    if (minutes)
        parts.push(`${minutes}m`);
    if (secs || parts.length === 0)
        parts.push(`${secs}s`);
    return parts.join(" ");
}
function proposalStatusLabel(status) {
    const raw = JSON.stringify(status);
    if (raw.includes("Passed") || raw.includes("passed"))
        return "Passed";
    if (raw.includes("Failed") || raw.includes("failed"))
        return "Failed";
    if (raw.includes("Cancelled") || raw.includes("cancelled"))
        return "Cancelled";
    if (raw.includes("Vetoed") || raw.includes("vetoed"))
        return "Vetoed";
    if (raw.includes("Voting") || raw.includes("voting"))
        return "Voting";
    return raw;
}
function proposalPhaseLabel(proposal, now) {
    const status = proposalStatusLabel(proposal.status);
    if (proposal.isExecuted)
        return "Executed";
    if (status !== "Voting") {
        if (status === "Passed" && now < proposal.executionUnlocksAt.toNumber())
            return "Timelocked";
        if (status === "Passed" && now >= proposal.executionUnlocksAt.toNumber())
            return "Executable";
        return status;
    }
    if (now < proposal.votingEnd.toNumber())
        return "Commit";
    if (now < proposal.revealEnd.toNumber())
        return "Reveal";
    return "ReadyToFinalize";
}
function solscanAccountUrl(address) {
    return `https://solscan.io/account/${address}?cluster=devnet`;
}
function solscanTxUrl(signature) {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
}
function deriveConfidentialPayoutPlanPda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("payout-plan"), proposal.toBuffer()], programId)[0];
}
function deriveRefheEnvelopePda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("refhe-envelope"), proposal.toBuffer()], programId)[0];
}
function deriveMagicBlockPrivatePaymentCorridorPda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("magicblock-corridor"), proposal.toBuffer()], programId)[0];
}
function deriveDaoSecurityPolicyPda(dao, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao-security-policy"), dao.toBuffer()], programId)[0];
}
function deriveDaoGovernancePolicyV3Pda(dao, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao-governance-policy-v3"), dao.toBuffer()], programId)[0];
}
function deriveDaoSettlementPolicyV3Pda(dao, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao-settlement-policy-v3"), dao.toBuffer()], programId)[0];
}
function deriveProposalExecutionPolicySnapshotPda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal-policy-snapshot"), proposal.toBuffer()], programId)[0];
}
function deriveProposalGovernancePolicySnapshotV3Pda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal-governance-snapshot-v3"), proposal.toBuffer()], programId)[0];
}
function deriveProposalSettlementPolicySnapshotV3Pda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal-settlement-policy-v3"), proposal.toBuffer()], programId)[0];
}
function deriveRevealRebateVaultV3Pda(dao, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("reveal-rebate-vault-v3"), dao.toBuffer()], programId)[0];
}
function deriveProposalProofVerificationPda(proposal, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("proposal-proof-verification"), proposal.toBuffer()], programId)[0];
}
function deriveSettlementEvidencePda(proposal, payoutPlan, settlementId, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("settlement-evidence"), proposal.toBuffer(), payoutPlan.toBuffer(), settlementId], programId)[0];
}
function deriveSettlementConsumptionRecordPda(evidence, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("settlement-consumption"), evidence.toBuffer()], programId)[0];
}
function proofDomainSeparator(dao, proposal) {
    return crypto
        .createHash("sha256")
        .update(Buffer.from("PrivateDAO::proof-payload:v1"))
        .update(dao.toBuffer())
        .update(proposal.toBuffer())
        .digest();
}
function canonicalProposalPayloadHash(dao, proposal, version = 2) {
    return crypto
        .createHash("sha256")
        .update(Buffer.from("PrivateDAO::proof-payload:v1"))
        .update(dao.toBuffer())
        .update(proposal.toBuffer())
        .update(Buffer.from([version]))
        .digest();
}
function enumSeedByte(value, mapping) {
    const key = Object.keys(value || {})[0];
    const seed = mapping[key];
    if (!seed)
        throw new Error(`Unsupported enum variant: ${JSON.stringify(value)}`);
    return seed;
}
function canonicalPayoutFieldsHash(dao, proposal, payoutPlan, plan) {
    const tokenMint = plan.tokenMint ? new web3_js_1.PublicKey(plan.tokenMint).toBuffer() : web3_js_1.PublicKey.default.toBuffer();
    const recipientCount = Buffer.alloc(2);
    recipientCount.writeUInt16LE(Number(plan.recipientCount));
    return crypto
        .createHash("sha256")
        .update(Buffer.from("PrivateDAO::payout-payload:v1"))
        .update(dao.toBuffer())
        .update(proposal.toBuffer())
        .update(payoutPlan.toBuffer())
        .update(Buffer.from([enumSeedByte(plan.payoutType, { salary: 1, bonus: 2 })]))
        .update(Buffer.from([enumSeedByte(plan.assetType, { sol: 1, token: 2 })]))
        .update(new web3_js_1.PublicKey(plan.settlementRecipient).toBuffer())
        .update(tokenMint)
        .update(recipientCount)
        .update(new anchor.BN(plan.totalAmount).toArrayLike(Buffer, "le", 8))
        .update(Buffer.from(plan.manifestHash))
        .update(Buffer.from(plan.ciphertextHash))
        .digest();
}
async function resolveTokenProgramForMint(connection, mint) {
    const info = await connection.getAccountInfo(mint, "confirmed");
    if (!info) {
        throw new Error(`Mint account not found: ${mint.toBase58()}`);
    }
    if (!info.owner.equals(spl_token_1.TOKEN_PROGRAM_ID) && !info.owner.equals(spl_token_1.TOKEN_2022_PROGRAM_ID)) {
        throw new Error(`Unsupported token program for mint ${mint.toBase58()}: ${info.owner.toBase58()}`);
    }
    return info.owner;
}
async function associatedTokenAddressForMint(connection, mint, owner, allowOwnerOffCurve = false) {
    const tokenProgram = await resolveTokenProgramForMint(connection, mint);
    return {
        address: (0, spl_token_1.getAssociatedTokenAddressSync)(mint, owner, allowOwnerOffCurve, tokenProgram),
        tokenProgram,
    };
}
function legacySaltPath(proposal) {
    return path.join(os.homedir(), ".privatedao", "salts", `${proposal}.json`);
}
function saltPath(proposal, voter) {
    const voterStr = typeof voter === "string" ? voter : voter.toBase58();
    return path.join(os.homedir(), ".privatedao", "salts", `${proposal}-${voterStr}.json`);
}
function ensureSaltDir() {
    const dir = path.join(os.homedir(), ".privatedao", "salts");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
