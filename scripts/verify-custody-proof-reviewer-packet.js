"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/custody-proof-reviewer-packet.generated.json");
    const mdPath = path_1.default.resolve("docs/custody-proof-reviewer-packet.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing custody proof reviewer packet artifacts");
    }
    const packet = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(packet.project === "PrivateDAO", "reviewer packet project mismatch");
    assert(packet.custodyStatus === "pending-external", "reviewer packet custody status drifted");
    assert(packet.productionMainnetClaimAllowed === false, "reviewer packet must not allow production mainnet claims");
    assert(packet.trustDecision === "blocked-external-steps", "reviewer packet trust decision mismatch");
    assert(packet.currentTruth.threshold === "2-of-3", "reviewer packet threshold mismatch");
    assert(packet.exactBlocker.id === "upgrade-authority-multisig", "reviewer packet exact blocker mismatch");
    assert(packet.exactBlocker.status === "pending-external", "reviewer packet blocker status mismatch");
    assert(packet.exactPendingItems.includes("multisig public address"), "reviewer packet must keep multisig address pending");
    assert(packet.exactPendingItems.includes("program upgrade authority transfer signature"), "reviewer packet must keep upgrade transfer pending");
    assert(packet.strictIngestionRoute.includes("Run npm run apply:custody-evidence-intake"), "reviewer packet missing apply route");
    assert(packet.judgeFirstTrackOpenings.length === 3, "reviewer packet must include 3 judge-first track openings");
    assert(packet.linkedDocs.includes("docs/canonical-custody-proof.generated.md"), "reviewer packet missing canonical custody proof doc");
    assert(packet.linkedDocs.includes("docs/track-judge-first-openings.generated.md"), "reviewer packet missing track judge-first openings doc");
    assert(packet.linkedDocs.includes("docs/launch-trust-packet.generated.md"), "reviewer packet missing launch trust packet doc");
    assert(packet.canonicalCommands.includes("npm run verify:custody-proof-reviewer-packet"), "reviewer packet missing self verification command");
    assert(packet.canonicalCommands.includes("npm run verify:track-judge-first-openings"), "reviewer packet missing judge-first verification command");
    assert(packet.liveRoutes.includes("https://privatedao.org/custody/"), "reviewer packet missing custody route");
    for (const token of [
        "# Custody Proof Reviewer Packet",
        "What Is Externally Proven Now",
        "Exact Pending Items",
        "Exact Mainnet Blocker",
        "Strict Ingestion Route",
        "Judge-First Track Openings",
        "## Required External Inputs",
        "Run npm run apply:custody-evidence-intake",
        "docs/track-judge-first-openings.generated.md",
        "docs/canonical-custody-proof.generated.md",
        "docs/launch-trust-packet.generated.md",
    ]) {
        assert(markdown.includes(token), `reviewer packet markdown is missing: ${token}`);
    }
    console.log("Custody proof reviewer packet verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
