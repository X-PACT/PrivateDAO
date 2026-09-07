"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const INPUT = path_1.default.resolve("docs/test-wallet-live-proof.generated.json");
const OUTPUT = path_1.default.resolve("docs/test-wallet-live-proof.generated.md");
function solscanAccount(address) {
    return `https://solscan.io/account/${address}?cluster=devnet`;
}
function solscanTx(signature) {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
}
function formatSol(lamports) {
    return `${(lamports / 1e9).toFixed(4)} SOL`;
}
function formatTimestamp(unix) {
    return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}
function main() {
    const payload = JSON.parse(fs_1.default.readFileSync(INPUT, "utf8"));
    const markdown = `# Test Wallet Live Proof

This note captures a real end-to-end governance run executed on Solana Devnet using local test-only wallets outside git. It is intentionally separate from the canonical \`docs/live-proof.md\` path so the reviewer-facing PDAO proof remains stable.

## Context

- generated at: \`${payload.generatedAt}\`
- mode: \`${payload.mode}\`
- operator wallet: \`${payload.operatorWallet}\`
- recipient wallet: \`${payload.recipientWallet}\`
- program id: \`${payload.programId}\`

## Accounts

- DAO: \`${payload.dao}\`
- DAO explorer: \`${solscanAccount(payload.dao)}\`
- Governance mint: \`${payload.governanceMint}\`
- Governance mint explorer: \`${solscanAccount(payload.governanceMint)}\`
- Treasury PDA: \`${payload.treasury}\`
- Treasury explorer: \`${solscanAccount(payload.treasury)}\`
- Proposal PDA: \`${payload.proposal}\`
- Proposal explorer: \`${solscanAccount(payload.proposal)}\`

## Transactions

${Object.entries(payload.transactions)
        .map(([label, signature]) => `- \`${label}\`: \`${signature}\`\n- Explorer: \`${solscanTx(signature)}\``)
        .join("\n")}

## Observed Invariants

- Proposal result: \`${payload.invariants.status}\`
- \`isExecuted = ${payload.invariants.isExecuted}\`
- \`yesCapital = ${payload.invariants.yesCapital}\`
- \`noCapital = ${payload.invariants.noCapital}\`
- \`revealCount = ${payload.invariants.revealCount} / ${payload.invariants.commitCount}\`
- voting end: \`${formatTimestamp(payload.timings.votingEnd)}\`
- reveal end: \`${formatTimestamp(payload.timings.revealEnd)}\`
- execution unlock: \`${formatTimestamp(payload.timings.executionUnlocksAt)}\`
- treasury before deposit: \`${formatSol(payload.invariants.treasuryBeforeDepositLamports)}\`
- treasury before execute: \`${formatSol(payload.invariants.treasuryBeforeExecuteLamports)}\`
- treasury after execute: \`${formatSol(payload.invariants.treasuryAfterExecuteLamports)}\`
- recipient before: \`${formatSol(payload.invariants.recipientBeforeLamports)}\`
- recipient after: \`${formatSol(payload.invariants.recipientAfterLamports)}\`

## Purpose

This artifact proves that the repository can execute a real test-only Devnet lifecycle with local wallets: \`Create DAO -> Submit proposal -> Commit -> Reveal -> Execute treasury\`. It is not a production-custody or mainnet claim.
`;
    fs_1.default.writeFileSync(OUTPUT, markdown);
    console.log(`Wrote ${path_1.default.relative(process.cwd(), OUTPUT)}`);
}
main();
