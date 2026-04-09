import fs from "fs";
import path from "path";

type ProofV3 = {
  generatedAt: string;
  mode: string;
  operatorWallet: string;
  programId: string;
  governanceV3: {
    dao: string;
    governanceMint: string;
    treasury: string;
    proposal: string;
    governancePolicy: string;
    governanceSnapshot: string;
    revealRebateVault: string;
    recipientWallet: string;
    timings: {
      votingEnd: number;
      revealEnd: number;
      executionUnlocksAt: number;
    };
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
      eligibleCapital: string;
      yesCapital: string;
      revealCount: string;
      commitCount: string;
      revealVaultBeforeLamports: number;
      revealVaultAfterLamports: number;
      treasuryBeforeExecuteLamports: number;
      treasuryAfterExecuteLamports: number;
      recipientBeforeLamports: number;
      recipientAfterLamports: number;
    };
  };
  settlementV3: {
    dao: string;
    treasury: string;
    proposal: string;
    governancePolicy: string;
    governanceSnapshot: string;
    revealRebateVault: string;
    securityPolicy: string;
    settlementPolicy: string;
    settlementSnapshot: string;
    payoutPlan: string;
    refheEnvelope: string;
    magicblockCorridor: string;
    settlementEvidence: string;
    settlementConsumptionRecord: string;
    settlementRecipient: string;
    timings: {
      votingEnd: number;
      revealEnd: number;
      executionUnlocksAt: number;
    };
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
      payoutStatus: string;
      eligibleCapital: string;
      revealCount: string;
      commitCount: string;
      revealVaultBeforeLamports: number;
      revealVaultAfterLamports: number;
      treasuryBeforeExecuteLamports: number;
      treasuryAfterExecuteLamports: number;
      recipientBeforeLamports: number;
      recipientAfterLamports: number;
      evidenceStatus: string;
      evidenceConsumed: boolean;
    };
  };
};

const INPUT = path.resolve("docs/test-wallet-live-proof-v3.generated.json");
const OUTPUT = path.resolve("docs/test-wallet-live-proof-v3.generated.md");

function solscanAccount(address: string) {
  return `https://solscan.io/account/${address}?cluster=devnet`;
}

function solscanTx(signature: string) {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

function formatSol(lamports: number) {
  return `${(lamports / 1e9).toFixed(4)} SOL`;
}

function formatTimestamp(unix: number) {
  return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function txList(transactions: Record<string, string>) {
  return Object.entries(transactions)
    .map(([label, signature]) => `- \`${label}\`: \`${signature}\`\n- Explorer: \`${solscanTx(signature)}\``)
    .join("\n");
}

function main() {
  const payload = JSON.parse(fs.readFileSync(INPUT, "utf8")) as ProofV3;
  const markdown = `# Test Wallet Live Proof V3

This packet captures two real Devnet flows executed with local test-only wallets outside git:

1. \`Governance Hardening V3\` with token-supply quorum and a dedicated reveal rebate vault
2. \`Settlement Hardening V3\` with a proposal-scoped settlement snapshot, REFHE settlement, and verified settlement evidence

## Context

- generated at: \`${payload.generatedAt}\`
- mode: \`${payload.mode}\`
- operator wallet: \`${payload.operatorWallet}\`
- program id: \`${payload.programId}\`

## Governance Hardening V3

### Accounts

- DAO: \`${payload.governanceV3.dao}\`
- Governance mint: \`${payload.governanceV3.governanceMint}\`
- Treasury PDA: \`${payload.governanceV3.treasury}\`
- Proposal PDA: \`${payload.governanceV3.proposal}\`
- Governance policy: \`${payload.governanceV3.governancePolicy}\`
- Governance snapshot: \`${payload.governanceV3.governanceSnapshot}\`
- Reveal rebate vault: \`${payload.governanceV3.revealRebateVault}\`
- Recipient wallet: \`${payload.governanceV3.recipientWallet}\`

### Explorer links

- DAO: \`${solscanAccount(payload.governanceV3.dao)}\`
- Mint: \`${solscanAccount(payload.governanceV3.governanceMint)}\`
- Treasury: \`${solscanAccount(payload.governanceV3.treasury)}\`
- Proposal: \`${solscanAccount(payload.governanceV3.proposal)}\`

### Transactions

${txList(payload.governanceV3.transactions)}

### Observed invariants

- status: \`${payload.governanceV3.invariants.status}\`
- \`isExecuted = ${payload.governanceV3.invariants.isExecuted}\`
- \`eligibleCapital = ${payload.governanceV3.invariants.eligibleCapital}\`
- \`yesCapital = ${payload.governanceV3.invariants.yesCapital}\`
- \`revealCount = ${payload.governanceV3.invariants.revealCount} / ${payload.governanceV3.invariants.commitCount}\`
- voting end: \`${formatTimestamp(payload.governanceV3.timings.votingEnd)}\`
- reveal end: \`${formatTimestamp(payload.governanceV3.timings.revealEnd)}\`
- execution unlock: \`${formatTimestamp(payload.governanceV3.timings.executionUnlocksAt)}\`
- reveal rebate vault before: \`${formatSol(payload.governanceV3.invariants.revealVaultBeforeLamports)}\`
- reveal rebate vault after: \`${formatSol(payload.governanceV3.invariants.revealVaultAfterLamports)}\`
- treasury before execute: \`${formatSol(payload.governanceV3.invariants.treasuryBeforeExecuteLamports)}\`
- treasury after execute: \`${formatSol(payload.governanceV3.invariants.treasuryAfterExecuteLamports)}\`
- recipient before: \`${formatSol(payload.governanceV3.invariants.recipientBeforeLamports)}\`
- recipient after: \`${formatSol(payload.governanceV3.invariants.recipientAfterLamports)}\`

## Settlement Hardening V3

### Accounts

- DAO: \`${payload.settlementV3.dao}\`
- Treasury PDA: \`${payload.settlementV3.treasury}\`
- Proposal PDA: \`${payload.settlementV3.proposal}\`
- Security policy: \`${payload.settlementV3.securityPolicy}\`
- Governance policy: \`${payload.settlementV3.governancePolicy}\`
- Governance snapshot: \`${payload.settlementV3.governanceSnapshot}\`
- Settlement policy: \`${payload.settlementV3.settlementPolicy}\`
- Settlement snapshot: \`${payload.settlementV3.settlementSnapshot}\`
- Payout plan: \`${payload.settlementV3.payoutPlan}\`
- REFHE envelope: \`${payload.settlementV3.refheEnvelope}\`
- MagicBlock corridor PDA: \`${payload.settlementV3.magicblockCorridor}\`
- Settlement evidence: \`${payload.settlementV3.settlementEvidence}\`
- Settlement consumption record: \`${payload.settlementV3.settlementConsumptionRecord}\`
- Recipient wallet: \`${payload.settlementV3.settlementRecipient}\`

### Explorer links

- DAO: \`${solscanAccount(payload.settlementV3.dao)}\`
- Treasury: \`${solscanAccount(payload.settlementV3.treasury)}\`
- Proposal: \`${solscanAccount(payload.settlementV3.proposal)}\`
- Settlement evidence: \`${solscanAccount(payload.settlementV3.settlementEvidence)}\`
- Payout plan: \`${solscanAccount(payload.settlementV3.payoutPlan)}\`

### Transactions

${txList(payload.settlementV3.transactions)}

### Observed invariants

- status: \`${payload.settlementV3.invariants.status}\`
- \`isExecuted = ${payload.settlementV3.invariants.isExecuted}\`
- payout status: \`${payload.settlementV3.invariants.payoutStatus}\`
- evidence status: \`${payload.settlementV3.invariants.evidenceStatus}\`
- \`evidenceConsumed = ${payload.settlementV3.invariants.evidenceConsumed}\`
- \`eligibleCapital = ${payload.settlementV3.invariants.eligibleCapital}\`
- \`revealCount = ${payload.settlementV3.invariants.revealCount} / ${payload.settlementV3.invariants.commitCount}\`
- voting end: \`${formatTimestamp(payload.settlementV3.timings.votingEnd)}\`
- reveal end: \`${formatTimestamp(payload.settlementV3.timings.revealEnd)}\`
- execution unlock: \`${formatTimestamp(payload.settlementV3.timings.executionUnlocksAt)}\`
- reveal rebate vault before: \`${formatSol(payload.settlementV3.invariants.revealVaultBeforeLamports)}\`
- reveal rebate vault after: \`${formatSol(payload.settlementV3.invariants.revealVaultAfterLamports)}\`
- treasury before execute: \`${formatSol(payload.settlementV3.invariants.treasuryBeforeExecuteLamports)}\`
- treasury after execute: \`${formatSol(payload.settlementV3.invariants.treasuryAfterExecuteLamports)}\`
- recipient before: \`${formatSol(payload.settlementV3.invariants.recipientBeforeLamports)}\`
- recipient after: \`${formatSol(payload.settlementV3.invariants.recipientAfterLamports)}\`

## Purpose

This artifact proves that the repository now carries a real Devnet proof for both \`Governance Hardening V3\` and \`Settlement Hardening V3\`. It is still a test-wallet Devnet artifact, not a production-custody or mainnet claim.
`;

  fs.writeFileSync(OUTPUT, markdown);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT)}`);
}

main();
