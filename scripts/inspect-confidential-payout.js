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
        console.error("Usage: yarn ts-node scripts/inspect-confidential-payout.ts --proposal <PROPOSAL_PDA>");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const planPk = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPk, program.programId);
    const info = await provider.connection.getAccountInfo(planPk, "confirmed");
    if (!info) {
        console.log("No confidential payout plan found for this proposal.");
        process.exit(0);
    }
    const plan = await program.account["confidentialPayoutPlan"].fetch(planPk);
    console.log(JSON.stringify({
        plan: planPk.toBase58(),
        dao: plan.dao.toBase58(),
        proposal: plan.proposal.toBase58(),
        configuredBy: plan.configuredBy.toBase58(),
        payoutType: Object.keys(plan.payoutType)[0],
        assetType: Object.keys(plan.assetType)[0],
        settlementRecipient: plan.settlementRecipient.toBase58(),
        tokenMint: plan.tokenMint ? plan.tokenMint.toBase58() : null,
        recipientCount: plan.recipientCount,
        totalAmount: plan.totalAmount.toString(),
        encryptedManifestUri: plan.encryptedManifestUri,
        manifestHash: Buffer.from(plan.manifestHash).toString("hex"),
        ciphertextHash: Buffer.from(plan.ciphertextHash).toString("hex"),
        status: Object.keys(plan.status)[0],
        configuredAt: plan.configuredAt.toString(),
        fundedAt: plan.fundedAt.toString(),
    }, null, 2));
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
