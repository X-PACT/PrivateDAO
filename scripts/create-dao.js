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
 * create-dao.ts
 * Creates a new PrivateDAO on devnet (or localnet).
 *
 * Usage:
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51 --mode dual
 *   yarn ts-node scripts/create-dao.ts --name "MyDAO" --quorum 51 --mode quadratic
 *
 * Modes: token (default), quadratic, dual
 * --delay N  execution delay in seconds after passing (default 86400 = 24h)
 * --reveal-window N  reveal window in seconds (default 3600 = 1h)
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
async function main() {
    const { name = "TestDAO", quorum = 51, revealWindow = 3600, mode = "token", delay = 86400, governanceMint: governanceMintArg, } = (0, utils_1.parseArgs)();
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    // Build the VotingConfig based on --mode flag
    let votingConfig;
    if (mode === "quadratic") {
        votingConfig = { quadratic: {} };
    }
    else if (mode === "dual") {
        votingConfig = { dualChamber: { capitalThreshold: 50, communityThreshold: 50 } };
    }
    else {
        votingConfig = { tokenWeighted: {} };
    }
    console.log(`\n🔐 PrivateDAO — Creating DAO: "${name}"`);
    console.log(`   Mode:          ${mode}`);
    console.log(`   Quorum:        ${quorum}%`);
    console.log(`   Reveal window: ${revealWindow}s (${(Number(revealWindow) / 3600).toFixed(1)}h)`);
    console.log(`   Exec delay:    ${delay}s (${(Number(delay) / 3600).toFixed(1)}h timelock)`);
    console.log(`   Authority:     ${provider.wallet.publicKey.toBase58()}`);
    const mint = governanceMintArg
        ? new web3_js_1.PublicKey(String(governanceMintArg))
        : await (0, spl_token_1.createMint)(provider.connection, provider.wallet.payer, provider.wallet.publicKey, null, 6);
    const tokenProgram = await (0, utils_1.resolveTokenProgramForMint)(provider.connection, mint);
    console.log(`\n   Governance token: ${mint.toBase58()}`);
    console.log(`   Token program:    ${tokenProgram.toBase58()}`);
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("dao"), provider.wallet.publicKey.toBuffer(), Buffer.from(String(name))], program.programId);
    const tx = await program.methods
        .initializeDao(String(name), Number(quorum), new anchor.BN(0), new anchor.BN(Number(revealWindow)), new anchor.BN(Number(delay)), votingConfig)
        .accounts({
        dao: daoPda,
        governanceToken: mint,
        authority: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const dao = await program.account["dao"].fetch(daoPda);
    console.log(`\n✅ DAO created!`);
    console.log(`   DAO address:      ${daoPda.toBase58()}`);
    console.log(`   Governance token: ${mint.toBase58()}`);
    console.log(`   Tx:               ${tx}`);
    console.log(`   Tx link:          ${(0, utils_1.solscanTxUrl)(tx)}`);
    console.log(`   Proposal count:   ${dao.proposalCount.toString()}`);
    console.log(`\n   Save these for next steps:`);
    console.log(`   DAO_PDA=${daoPda.toBase58()}`);
    console.log(`   GOVERNANCE_MINT=${mint.toBase58()}`);
    console.log(`\n   DAO explorer:  ${(0, utils_1.solscanAccountUrl)(daoPda.toBase58())}`);
    console.log(`   Mint explorer: ${(0, utils_1.solscanAccountUrl)(mint.toBase58())}`);
    console.log(`   Next: yarn create-proposal -- --dao ${daoPda.toBase58()} --title "Fund community work"`);
}
main().catch(console.error);
