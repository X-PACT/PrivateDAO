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
const utils_1 = require("./utils");
async function main() {
    const { proposal } = (0, utils_1.parseArgs)();
    if (!proposal) {
        console.error("Usage: yarn ts-node scripts/inspect-magicblock-corridor.ts --proposal <PROPOSAL_PDA>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const corridorPk = (0, utils_1.deriveMagicBlockPrivatePaymentCorridorPda)(proposalPk, program.programId);
    const corridor = await program.account.magicBlockPrivatePaymentCorridor.fetchNullable(corridorPk);
    if (!corridor) {
        console.log(`No MagicBlock corridor found for proposal ${proposalPk.toBase58()}`);
        return;
    }
    console.log(JSON.stringify({
        pubkey: corridorPk.toBase58(),
        dao: corridor.dao.toBase58(),
        proposal: corridor.proposal.toBase58(),
        payoutPlan: corridor.payoutPlan.toBase58(),
        configuredBy: corridor.configuredBy.toBase58(),
        settledBy: corridor.settledBy ? corridor.settledBy.toBase58() : null,
        apiBaseUrl: corridor.apiBaseUrl,
        cluster: corridor.cluster,
        ownerWallet: corridor.ownerWallet.toBase58(),
        settlementWallet: corridor.settlementWallet.toBase58(),
        tokenMint: corridor.tokenMint.toBase58(),
        validator: corridor.validator ? corridor.validator.toBase58() : null,
        transferQueue: corridor.transferQueue ? corridor.transferQueue.toBase58() : null,
        routeHash: Buffer.from(corridor.routeHash).toString("hex"),
        depositAmount: corridor.depositAmount.toString(),
        privateTransferAmount: corridor.privateTransferAmount.toString(),
        withdrawalAmount: corridor.withdrawalAmount.toString(),
        depositTxSignature: corridor.depositTxSignature,
        transferTxSignature: corridor.transferTxSignature,
        withdrawTxSignature: corridor.withdrawTxSignature,
        status: Object.keys(corridor.status)[0],
        configuredAt: corridor.configuredAt.toString(),
        settledAt: corridor.settledAt.toString(),
    }, null, 2));
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
