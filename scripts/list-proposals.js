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
 * list-proposals.ts
 * Read live proposal accounts for the current program and print a compact operator view.
 *
 * Usage:
 *   yarn ts-node scripts/list-proposals.ts
 *   yarn ts-node scripts/list-proposals.ts --limit 20
 *   yarn ts-node scripts/list-proposals.ts --dao <DAO_PDA>
 */
const anchor = __importStar(require("@coral-xyz/anchor"));
const utils_1 = require("./utils");
async function main() {
    const { dao: daoFilter, limit = 12 } = (0, utils_1.parseArgs)();
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = (0, utils_1.workspaceProgram)();
    const accounts = (await program.account.proposal.all());
    const now = Math.floor(Date.now() / 1000);
    const filtered = accounts
        .filter(({ account }) => !daoFilter || account.dao.toBase58() === String(daoFilter))
        .sort((a, b) => b.account.proposalId.toNumber() - a.account.proposalId.toNumber())
        .slice(0, Number(limit));
    console.log(`\n📡 PrivateDAO live proposals`);
    console.log(`   Program:  ${program.programId.toBase58()}`);
    console.log(`   Cluster:  devnet`);
    if (daoFilter)
        console.log(`   DAO:      ${daoFilter}`);
    console.log(`   Loaded:   ${filtered.length}`);
    if (filtered.length === 0) {
        console.log(`\n   No proposal accounts matched the current filter.`);
        return;
    }
    for (const { publicKey, account } of filtered) {
        const status = (0, utils_1.proposalStatusLabel)(account.status);
        const phase = (0, utils_1.proposalPhaseLabel)(account, now);
        const timing = phase === "Commit"
            ? `commit closes in ${(0, utils_1.formatDuration)(account.votingEnd.toNumber() - now)}`
            : phase === "Reveal"
                ? `reveal closes in ${(0, utils_1.formatDuration)(account.revealEnd.toNumber() - now)}`
                : phase === "Timelocked"
                    ? `execute in ${(0, utils_1.formatDuration)(account.executionUnlocksAt.toNumber() - now)}`
                    : phase === "Executable"
                        ? "ready to execute"
                        : `status ${status}`;
        console.log(`\n${"═".repeat(72)}`);
        console.log(`PROP-${String(account.proposalId.toNumber()).padStart(3, "0")}  ${phase}  ${status}`);
        console.log(`${account.title}`);
        console.log(`Proposal PDA: ${publicKey.toBase58()}`);
        console.log(`DAO:          ${account.dao.toBase58()}`);
        console.log(`Commits:      ${account.commitCount.toString()}   Reveals: ${account.revealCount.toString()}`);
        console.log(`Capital:      YES ${account.yesCapital.toString()} / NO ${account.noCapital.toString()}`);
        console.log(`Community:    YES ${account.yesCommunity.toString()} / NO ${account.noCommunity.toString()}`);
        console.log(`Voting end:   ${(0, utils_1.formatTimestamp)(account.votingEnd.toNumber())}`);
        console.log(`Reveal end:   ${(0, utils_1.formatTimestamp)(account.revealEnd.toNumber())}`);
        console.log(`Execution:    ${(0, utils_1.formatTimestamp)(account.executionUnlocksAt.toNumber())}`);
        console.log(`Next:         ${timing}`);
        console.log(`Explorer:     ${(0, utils_1.solscanAccountUrl)(publicKey.toBase58())}`);
    }
}
main().catch(console.error);
