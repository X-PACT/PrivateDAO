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
/**
 * deposit-treasury.ts
 * Deposit SOL into a DAO's on-chain treasury PDA.
 *
 * The treasury PDA (seeds = ["treasury", dao_pubkey]) is the source of funds
 * for all treasury actions that pass through governance. Anyone can deposit.
 *
 * Usage:
 *   yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 1.0
 *   yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 0.5
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
async function main() {
    const { dao: daoPdaStr, amount = 0.1 } = (0, utils_1.parseArgs)();
    if (!daoPdaStr) {
        console.error("Error: --dao <DAO_PDA> is required");
        console.error("Usage: yarn ts-node scripts/deposit-treasury.ts --dao <DAO_PDA> --amount 1.0");
        process.exit(1);
    }
    const lamports = Math.floor(parseFloat(String(amount)) * web3_js_1.LAMPORTS_PER_SOL);
    if (lamports <= 0) {
        console.error("Error: --amount must be a positive SOL amount (e.g. --amount 1.0)");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const daoPda = new web3_js_1.PublicKey(String(daoPdaStr));
    const dao = await program.account["dao"].fetch(daoPda);
    const [treasuryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("treasury"), daoPda.toBuffer()], program.programId);
    const balanceBefore = await provider.connection.getBalance(treasuryPda);
    console.log(`\n💰 Depositing ${(0, utils_1.formatSol)(lamports)} into treasury`);
    console.log(`   DAO:      ${dao.daoName}`);
    console.log(`   Treasury: ${treasuryPda.toBase58()}`);
    console.log(`   Depositor: ${provider.wallet.publicKey.toBase58()}`);
    console.log(`   Treasury balance before: ${(0, utils_1.formatSol)(balanceBefore)}`);
    const tx = await program.methods
        .depositTreasury(new anchor.BN(lamports))
        .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        depositor: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const balanceAfter = await provider.connection.getBalance(treasuryPda);
    console.log(`\n✅ Deposit successful!`);
    console.log(`   Transaction: ${tx}`);
    console.log(`   Treasury balance after: ${(0, utils_1.formatSol)(balanceAfter)}`);
    console.log(`   Treasury: ${(0, utils_1.solscanAccountUrl)(treasuryPda.toBase58())}`);
    console.log(`   Tx link:  ${(0, utils_1.solscanTxUrl)(tx)}`);
}
main().catch(console.error);
