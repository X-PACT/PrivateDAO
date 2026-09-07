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
// SPDX-License-Identifier: AGPL-3.0-or-later
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const magicblock_payments_1 = require("./lib/magicblock-payments");
const utils_1 = require("./utils");
async function main() {
    const args = (0, utils_1.parseArgs)();
    const [action = "health"] = process.argv.slice(2).filter((part) => !part.startsWith("--"));
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const apiBase = String(args.apiBase || (0, magicblock_payments_1.magicBlockApiBase)()).trim();
    const cluster = String(args.cluster || (0, magicblock_payments_1.magicBlockCluster)()).trim();
    if (action === "health") {
        console.log(JSON.stringify(await (0, magicblock_payments_1.getMagicBlockHealth)(apiBase), null, 2));
        return;
    }
    if (action === "mint-status") {
        if (!args.mint)
            throw new Error("--mint is required");
        console.log(JSON.stringify(await (0, magicblock_payments_1.getMagicBlockMintInitializationStatus)({
            mint: String(args.mint),
            cluster: cluster,
            validator: args.validator ? String(args.validator) : undefined,
        }, apiBase), null, 2));
        return;
    }
    if (action === "balance" || action === "private-balance") {
        if (!args.address || !args.mint)
            throw new Error("--address and --mint are required");
        const request = {
            address: String(args.address),
            mint: String(args.mint),
            cluster: cluster,
        };
        const payload = action === "balance"
            ? await (0, magicblock_payments_1.getMagicBlockBalance)(request, apiBase)
            : await (0, magicblock_payments_1.getMagicBlockPrivateBalance)(request, apiBase);
        console.log(JSON.stringify(payload, null, 2));
        return;
    }
    if (action === "initialize-mint") {
        if (!args.mint)
            throw new Error("--mint is required");
        const built = await (0, magicblock_payments_1.buildMagicBlockInitializeMint)({
            payer: provider.wallet.publicKey.toBase58(),
            mint: new web3_js_1.PublicKey(String(args.mint)).toBase58(),
            cluster: cluster,
            validator: args.validator ? String(args.validator) : undefined,
        }, apiBase);
        const signature = await (0, magicblock_payments_1.submitMagicBlockUnsignedTransaction)(provider, built);
        console.log(`Initialize mint tx: ${signature}`);
        console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(signature)}`);
        console.log(JSON.stringify({
            validator: built.validator,
            transferQueue: built.transferQueue,
            rentPda: built.rentPda,
        }, null, 2));
        return;
    }
    if (action === "deposit") {
        if (!args.mint || !args.owner || !args.amount)
            throw new Error("--owner, --mint, and --amount are required");
        const built = await (0, magicblock_payments_1.buildMagicBlockDeposit)({
            owner: String(args.owner),
            mint: String(args.mint),
            amount: String(args.amount),
            cluster: cluster,
            validator: args.validator ? String(args.validator) : undefined,
            initIfMissing: true,
            initAtasIfMissing: true,
            initVaultIfMissing: true,
            idempotent: true,
        }, apiBase);
        const signature = await (0, magicblock_payments_1.submitMagicBlockUnsignedTransaction)(provider, built);
        console.log(`Deposit tx: ${signature}`);
        console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(signature)}`);
        return;
    }
    if (action === "transfer") {
        if (!args.mint || !args.from || !args.to || !args.amount)
            throw new Error("--from, --to, --mint, and --amount are required");
        const built = await (0, magicblock_payments_1.buildMagicBlockTransfer)({
            from: String(args.from),
            to: String(args.to),
            mint: String(args.mint),
            amount: String(args.amount),
            visibility: String(args.visibility || "private"),
            fromBalance: String(args.fromBalance || "base"),
            toBalance: String(args.toBalance || "ephemeral"),
            cluster: cluster,
            validator: args.validator ? String(args.validator) : undefined,
            initIfMissing: true,
            initAtasIfMissing: true,
            initVaultIfMissing: true,
            memo: args.memo ? String(args.memo) : undefined,
        }, apiBase);
        const signature = await (0, magicblock_payments_1.submitMagicBlockUnsignedTransaction)(provider, built);
        console.log(`Transfer tx: ${signature}`);
        console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(signature)}`);
        console.log(JSON.stringify({ validator: built.validator, sendTo: built.sendTo }, null, 2));
        return;
    }
    if (action === "withdraw") {
        if (!args.mint || !args.owner || !args.amount)
            throw new Error("--owner, --mint, and --amount are required");
        const built = await (0, magicblock_payments_1.buildMagicBlockWithdraw)({
            owner: String(args.owner),
            mint: String(args.mint),
            amount: String(args.amount),
            cluster: cluster,
            validator: args.validator ? String(args.validator) : undefined,
            initIfMissing: true,
            initAtasIfMissing: true,
            idempotent: true,
        }, apiBase);
        const signature = await (0, magicblock_payments_1.submitMagicBlockUnsignedTransaction)(provider, built);
        console.log(`Withdraw tx: ${signature}`);
        console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(signature)}`);
        return;
    }
    throw new Error(`Unknown action: ${action}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
