"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const submission = readJson("docs/submission-registry.json");
    const proof = readJson("docs/proof-registry.json");
    const attestation = readJson("docs/review-attestation.generated.json");
    const blockers = readJson("docs/mainnet-blockers.json");
    const launchOps = readJson("docs/launch-ops-checklist.json");
    const verified = Object.entries(submission.status)
        .filter(([, status]) => status === "verified")
        .map(([name]) => name);
    const pending = Object.entries(submission.status)
        .filter(([, status]) => status !== "verified")
        .map(([name, status]) => ({ name, status }));
    const markdown = `# Mainnet Readiness Report

This report is generated from the canonical PrivateDAO registries and reviewer artifacts. It exists to summarize what is already verified inside the repository and what still remains outside repository scope before any production cutover.

## Current Identity

- Project: \`${submission.project}\`
- Program ID: \`${submission.programId}\`
- Verification wallet: \`${submission.verificationWallet}\`
- Deploy transaction: \`${proof.deployTx}\`
- DAO PDA: \`${proof.dao}\`
- Governance mint: \`${proof.governanceMint}\`
- Treasury PDA: \`${proof.treasury}\`
- Proposal PDA: \`${proof.proposal}\`
${proof.pdaoToken ? `- PDAO mint: \`${proof.pdaoToken.mint}\`\n- PDAO token program: \`${proof.pdaoToken.programId}\`\n- PDAO token account: \`${proof.pdaoToken.tokenAccount}\`\n- PDAO initial supply: \`${proof.pdaoToken.supplyUi}\`` : ""}

## Verified Internal Surfaces

${verified.map((item) => `- \`${item}\``).join("\n")}

## Pending Or External Dependencies

${pending.map((item) => `- \`${item.name}\` -> \`${item.status}\``).join("\n")}

## Mainnet Production Blocker Register

- Register: \`docs/mainnet-blockers.json\`
- Human-readable register: \`docs/mainnet-blockers.md\`
- Current decision: \`${blockers.decision}\`
- Production mainnet claim allowed: \`${blockers.productionMainnetClaimAllowed}\`

${blockers.blockers
        .map((blocker) => `- \`${blocker.id}\` -> \`${blocker.status}\` (${blocker.category}, ${blocker.severity}, required before \`${blocker.requiredBefore}\`)`)
        .join("\n")}

## Launch Operations Checklist

- Checklist: \`docs/launch-ops-checklist.json\`
- Human-readable checklist: \`docs/launch-ops-checklist.md\`
- Current decision: \`${launchOps.decision}\`
- Production mainnet claim allowed: \`${launchOps.productionMainnetClaimAllowed}\`

${launchOps.items
        .map((item) => `- \`${item.id}\` -> \`${item.status}\` (${item.category}, required before \`${item.requiredBefore}\`)`)
        .join("\n")}

## Reviewer Artifact Summary

- Verification gates tracked: \`${submission.gates.length}\`
- Gate count in review attestation: \`${attestation.gateCount}\`
- Strategy package count: \`${attestation.packageCounts.strategy}\`
- Security package count: \`${attestation.packageCounts.security}\`
- ZK package count: \`${attestation.packageCounts.zk}\`
- Proof package count: \`${attestation.packageCounts.proof}\`
- Operations package count: \`${attestation.packageCounts.operations}\`
- Runtime attestation: \`docs/runtime-attestation.generated.json\`
- PDAO attestation: \`docs/pdao-attestation.generated.json\`
- Go-live criteria: \`docs/go-live-criteria.md\`
- Operational drillbook: \`docs/operational-drillbook.md\`
- Go-live attestation: \`docs/go-live-attestation.generated.json\`
${attestation.zk ? `- ZK stack version: \`${attestation.zk.stackVersion}\`\n- ZK layer count: \`${attestation.zk.entryCount}\`` : ""}
${attestation.cryptographicIntegrity ? `- Integrity algorithm: \`${attestation.cryptographicIntegrity.algorithm}\`\n- Integrity entries: \`${attestation.cryptographicIntegrity.entryCount}\`\n- Integrity aggregate sha256: \`${attestation.cryptographicIntegrity.aggregateSha256}\`` : ""}

## Additive Hardening V3

- Governance hardening note: \`docs/governance-hardening-v3.md\`
- Settlement hardening note: \`docs/settlement-hardening-v3.md\`
- Dedicated V3 live proof: \`docs/test-wallet-live-proof-v3.generated.md\`
- V3 boundary: real Devnet proof for the additive hardening path, not a production-custody or mainnet claim

## Mainnet Conclusion

What is strong now:

- the governance lifecycle is live on devnet
- the additive V3 governance and settlement hardening paths are Devnet-proven
- reviewer-facing proof and security artifacts are published
- the zk companion stack is registry-backed, transcript-backed, and attested
- the PDAO token surface is metadata-backed, attested, and bound to the canonical review package
- the frontend, Android guide, and proof surfaces are integrated into one verification package

What still requires real-world completion before mainnet should be claimed:

- external audit
- production key custody and multisig enforcement
- runtime wallet QA on real client environments
- monitoring, alert delivery, and incident ownership in live infrastructure
- operational cutover from devnet proof to mainnet execution

## Canonical Commands

\`\`\`bash
npm run build:mainnet-readiness-report
npm run build:deployment-attestation
npm run build:runtime-attestation
npm run build:go-live-attestation
npm run build:pdao-attestation
npm run verify:launch-ops
npm run verify:monitoring-alerts
npm run verify:mainnet-blockers
npm run verify:mainnet-readiness-report
npm run verify:deployment-attestation
npm run verify:runtime-attestation
npm run verify:go-live-attestation
npm run verify:pdao-attestation
npm run verify:pdao-live
npm run verify:all
bash scripts/check-mainnet-readiness.sh
\`\`\`

## Honest Boundary

This report is an internal readiness artifact.

It does not claim:

- external audit completion
- automatic mainnet approval
- production rollout completion
- custody policy enforcement outside the repository
`;
    const outPath = path_1.default.resolve("docs/mainnet-readiness.generated.md");
    fs_1.default.writeFileSync(outPath, markdown);
    console.log(`Wrote mainnet readiness report: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
