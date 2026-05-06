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
    const { dao, proposal, validator, transferQueue, depositTxSignature = "", transferTxSignature, withdrawTxSignature = "", } = (0, utils_1.parseArgs)();
    if (!dao || !proposal || !validator || !transferQueue || !transferTxSignature) {
        console.error("Usage: yarn ts-node scripts/settle-magicblock-corridor.ts --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --validator <PUBKEY> --transfer-queue <PUBKEY> --transfer-tx-signature <SIG> [--deposit-tx-signature <SIG>] [--withdraw-tx-signature <SIG>]");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPk = new web3_js_1.PublicKey(String(dao));
    const proposalPk = new web3_js_1.PublicKey(String(proposal));
    const payoutPlanPk = (0, utils_1.deriveConfidentialPayoutPlanPda)(proposalPk, program.programId);
    const corridorPk = (0, utils_1.deriveMagicBlockPrivatePaymentCorridorPda)(proposalPk, program.programId);
    const tx = await program.methods
        .settleMagicblockPrivatePaymentCorridor(new web3_js_1.PublicKey(String(validator)), new web3_js_1.PublicKey(String(transferQueue)), String(depositTxSignature || "").trim(), String(transferTxSignature).trim(), String(withdrawTxSignature || "").trim())
        .accounts({
        dao: daoPk,
        proposal: proposalPk,
        confidentialPayoutPlan: payoutPlanPk,
        magicblockPrivatePaymentCorridor: corridorPk,
        operator: provider.wallet.publicKey,
    })
        .rpc();
    console.log(`Settled MagicBlock corridor: ${corridorPk.toBase58()}`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
