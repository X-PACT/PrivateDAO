"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/operational-evidence.generated.json");
    const mdPath = path_1.default.resolve("docs/operational-evidence.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing operational evidence artifacts");
    }
    const evidence = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    if (evidence.project !== "PrivateDAO") {
        throw new Error("operational evidence project mismatch");
    }
    if (evidence.network !== "devnet") {
        throw new Error("operational evidence must remain devnet-scoped");
    }
    if (evidence.transactionSummary.walletCount < 50) {
        throw new Error("operational evidence wallet count is below canonical threshold");
    }
    if (evidence.transactionSummary.totalAttemptCount < 200) {
        throw new Error("operational evidence attempt count is unexpectedly low");
    }
    if ((evidence.transactionSummary.phaseCounts.commit || 0) === 0) {
        throw new Error("operational evidence is missing commit-phase entries");
    }
    if ((evidence.transactionSummary.phaseCounts.reveal || 0) === 0) {
        throw new Error("operational evidence is missing reveal-phase entries");
    }
    if ((evidence.transactionSummary.phaseCounts.execute || 0) === 0) {
        throw new Error("operational evidence is missing execute-phase entries");
    }
    if (evidence.voting.proposalIsolation.executedCount !== evidence.voting.proposalIsolation.proposalCount) {
        throw new Error("operational evidence multi-proposal execution count mismatch");
    }
    if (evidence.voting.proposalIsolation.unexpectedSuccesses !== 0) {
        throw new Error("operational evidence records unexpected multi-proposal successes");
    }
    if (evidence.zk.verificationMode !== "offchain-groth16") {
        throw new Error("operational evidence zk verification mode mismatch");
    }
    if (evidence.zk.onchainAnchorCount < 3 || !evidence.zk.onchainAnchorProposal) {
        throw new Error("operational evidence is missing on-chain zk anchors");
    }
    if (evidence.zk.proofCount < 1 || evidence.zk.verifiedProofCount < 1) {
        throw new Error("operational evidence is missing verified zk proofs");
    }
    if (evidence.adversarial.unexpectedSuccesses !== 0) {
        throw new Error("operational evidence records unexpected adversarial success");
    }
    if (!evidence.resilience.failoverRecovered || !evidence.resilience.staleBlockhashRecovered || !evidence.resilience.staleBlockhashRejected) {
        throw new Error("operational evidence resilience summary is incomplete");
    }
    if (!evidence.collisions.finalizeSingleWinner || !evidence.collisions.executeSingleWinner) {
        throw new Error("operational evidence race summary lost single-winner guarantee");
    }
    if (evidence.collisions.unexpectedSuccesses !== 0) {
        throw new Error("operational evidence records unexpected race success");
    }
    for (const doc of evidence.docs) {
        if (!fs_1.default.existsSync(path_1.default.resolve(doc))) {
            throw new Error(`operational evidence references missing doc: ${doc}`);
        }
    }
    for (const command of [
        "npm run test:devnet:all",
        "npm run test:devnet:multi",
        "npm run test:devnet:race",
        "npm run test:devnet:resilience",
        "npm run build:operational-evidence",
        "npm run verify:operational-evidence",
    ]) {
        if (!evidence.commands.includes(command)) {
            throw new Error(`operational evidence missing command: ${command}`);
        }
    }
    for (const fragment of [
        "Operational Evidence Package",
        "Voting And Lifecycle Evidence",
        "ZK Companion Evidence",
        "Adversarial Evidence",
        "Resilience Evidence",
        "Collision Evidence",
    ]) {
        if (!markdown.includes(fragment)) {
            throw new Error(`operational evidence markdown missing fragment: ${fragment}`);
        }
    }
    console.log("Operational evidence verification: PASS");
}
main();
