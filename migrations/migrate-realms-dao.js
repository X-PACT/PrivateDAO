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
 * migrate-realms-dao.ts
 * MIGRATION TRACK (Sunrise)
 *
 * Migrates an existing Realms DAO to use PrivateDAO for voting privacy.
 *
 * What this does:
 *   1. Verifies the existing Realms governance account exists on-chain
 *   2. Creates a PrivateDAO using the caller-supplied governance token mint
 *   3. Records the Realms governance pubkey in the DAO (for provenance)
 *   4. Outputs a migration report with the new PrivateDAO address and config
 *
 * What this does NOT do (by design):
 *   - Does NOT move treasury funds (members keep control)
 *   - Does NOT cancel existing Realms proposals (they complete normally)
 *   - Does NOT require governance token migration (same token, new voting)
 *
 * Usage:
 *   yarn ts-node migrations/migrate-realms-dao.ts \
 *     --governance <REALMS_GOVERNANCE_PUBKEY> \
 *     --name "MyDAO-Private" \
 *     --quorum 51 \
 *     --reveal-window 86400
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../scripts/utils");
async function main() {
    const { governance: governanceStr, name, quorum = 51, revealWindow = 86400, mint: mintStr, } = (0, utils_1.parseArgs)();
    if (!governanceStr) {
        console.error("Error: --governance <REALMS_GOVERNANCE_PUBKEY> is required");
        printUsage();
        process.exit(1);
    }
    if (!name) {
        console.error("Error: --name <DAO_NAME> is required");
        printUsage();
        process.exit(1);
    }
    if (!mintStr) {
        console.error("Error: --mint <GOVERNANCE_TOKEN_MINT> is required");
        console.error("  (Find this in your Realms DAO settings — the community token mint)");
        process.exit(1);
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const governancePubkey = new web3_js_1.PublicKey(governanceStr);
    const mintPubkey = new web3_js_1.PublicKey(mintStr);
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  🔐 PrivateDAO — Realms Migration Tool`);
    console.log(`${"═".repeat(60)}`);
    console.log(`\n  Realms governance: ${governancePubkey.toBase58()}`);
    console.log(`  Governance token:  ${mintPubkey.toBase58()}`);
    console.log(`  New DAO name:      ${name}`);
    console.log(`  Quorum:            ${quorum}%`);
    console.log(`  Reveal window:     ${revealWindow}s (${(revealWindow / 3600).toFixed(1)}h)`);
    console.log(`  Migrating as:      ${provider.wallet.publicKey.toBase58()}`);
    // Verify governance account exists on-chain
    console.log(`\n  Verifying Realms governance account...`);
    const govAccount = await provider.connection.getAccountInfo(governancePubkey);
    if (!govAccount) {
        console.error(`\n❌ Governance account not found on ${provider.connection.rpcEndpoint}`);
        console.error(`   Check you're on the right network (devnet/mainnet-beta)`);
        process.exit(1);
    }
    console.log(`  ✅ Governance account found (${govAccount.data.length} bytes)`);
    // Derive new DAO PDA
    const [daoPda] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("dao"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(name),
    ], program.programId);
    console.log(`\n  New PrivateDAO address: ${daoPda.toBase58()}`);
    // Check if already migrated
    try {
        const existing = await program.account["dao"].fetch(daoPda);
        console.log(`\n⚠️  DAO already exists: ${existing.daoName}`);
        console.log(`   Migration may have already been run.`);
        console.log(`   Use a different --name to create a new DAO.`);
        process.exit(0);
    }
    catch {
        // Account doesn't exist — proceed
    }
    console.log(`\n  Running migration...`);
    const tx = await program.methods
        .migrateFromRealms(name, governancePubkey, quorum, new anchor.BN(revealWindow), new anchor.BN(86400), // 24h execution timelock
    { dualChamber: { capitalThreshold: 50, communityThreshold: 50 } })
        .accounts({
        dao: daoPda,
        governanceToken: mintPubkey,
        authority: provider.wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .rpc();
    const dao = await program.account["dao"].fetch(daoPda);
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  ✅ MIGRATION COMPLETE`);
    console.log(`${"═".repeat(60)}`);
    console.log(`\n  New PrivateDAO`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  Address:           ${daoPda.toBase58()}`);
    console.log(`  Name:              ${dao.daoName}`);
    console.log(`  Governance token:  ${dao.governanceToken.toBase58()}`);
    console.log(`  Quorum:            ${dao.quorumPercentage}%`);
    console.log(`  Reveal window:     ${dao.revealWindowSeconds}s`);
    console.log(`  Migrated from:     ${dao.migratedFromRealms?.toBase58()}`);
    console.log(`  Transaction:       ${tx}`);
    console.log(`  Tx link:           ${(0, utils_1.solscanTxUrl)(tx)}`);
    console.log(`  DAO explorer:      ${(0, utils_1.solscanAccountUrl)(daoPda.toBase58())}`);
    console.log(`\n  What changed vs Realms:`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  ❌ Old: Public voting (whale buys visible)`);
    console.log(`  ✅ New: Commit-reveal (tally hidden until reveal)`);
    console.log(`  ❌ Old: Vote immediately counted (intimidation)`);
    console.log(`  ✅ New: No live tally — zero bandwagon effect`);
    console.log(`  ℹ️  This helper records source governance provenance only`);
    console.log(`  ℹ️  Realms proposal/execution wiring remains a separate integration task`);
    console.log(`\n  Next steps:`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  1. Fund treasury:`);
    console.log(`     yarn ts-node scripts/deposit-treasury.ts --dao ${daoPda.toBase58()}`);
    console.log(`  2. Create your first private proposal:`);
    console.log(`     yarn ts-node scripts/create-proposal.ts --dao ${daoPda.toBase58()}`);
    console.log(`  3. Share the DAO address with your members`);
    console.log(`     DAO_PDA=${daoPda.toBase58()}`);
    // Write migration report
    const report = {
        migration: {
            timestamp: new Date().toISOString(),
            network: provider.connection.rpcEndpoint,
            transaction: tx,
        },
        source: {
            realms_governance: governancePubkey.toBase58(),
            governance_token: mintPubkey.toBase58(),
        },
        result: {
            private_dao: daoPda.toBase58(),
            dao_name: dao.daoName,
            quorum_percentage: dao.quorumPercentage,
            reveal_window_seconds: dao.revealWindowSeconds.toString(),
        },
    };
    const reportPath = `./migration-report-${Date.now()}.json`;
    require("fs").writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  Migration report saved: ${reportPath}`);
}
function printUsage() {
    console.error(`
Usage:
  yarn ts-node migrations/migrate-realms-dao.ts \\
    --governance <REALMS_GOVERNANCE_PUBKEY> \\
    --name <NEW_DAO_NAME> \\
    --mint <GOVERNANCE_TOKEN_MINT> \\
    [--quorum 51] \\
    [--reveal-window 86400]
`);
}
main().catch(console.error);
