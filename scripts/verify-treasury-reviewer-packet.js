"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/treasury-reviewer-packet.generated.json");
    const mdPath = path_1.default.resolve("docs/treasury-reviewer-packet.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing treasury reviewer packet artifacts");
    }
    const packet = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(packet.project === "PrivateDAO", "treasury reviewer packet project mismatch");
    assert(packet.treasuryNetwork === "Solana Testnet", "treasury reviewer packet network mismatch");
    assert(packet.custodyStatus === "pending-external", "treasury reviewer packet custody status drifted");
    assert(packet.productionMainnetClaimAllowed === false, "treasury reviewer packet must not allow mainnet claim");
    assert(packet.trustDecision === "blocked-external-steps", "treasury reviewer packet trust decision mismatch");
    assert(packet.exactBlocker.id === "upgrade-authority-multisig", "treasury reviewer packet blocker mismatch");
    assert(packet.exactBlocker.status === "pending-external", "treasury reviewer packet blocker status mismatch");
    assert(packet.strictSenderChecklist.length >= 5, "treasury reviewer packet checklist too short");
    assert(packet.referenceLinkedRails.length === 3, "treasury reviewer packet must include 3 rails");
    assert(packet.referenceLinkedRails.every((item) => item.receiveAddress && item.explorerUrl), "treasury reviewer packet rails missing explorer links");
    assert(packet.reviewerTruthLinks.includes("docs/canonical-custody-proof.generated.md"), "treasury reviewer packet missing canonical proof");
    assert(packet.reviewerTruthLinks.includes("docs/reviewer-telemetry-packet.generated.md"), "treasury reviewer packet missing telemetry packet");
    assert(packet.commercialPaymentsAlignment.some((item) => item.slug === "payments" && item.fit === "strong"), "treasury reviewer packet missing payments alignment");
    assert(packet.exactPendingItems.includes("multisig public address"), "treasury reviewer packet must keep multisig address pending");
    assert(packet.canonicalCommands.includes("npm run build:treasury-reviewer-packet"), "treasury reviewer packet missing build command");
    assert(packet.canonicalCommands.includes("npm run apply:custody-evidence-intake"), "treasury reviewer packet missing apply route");
    assert(packet.liveRoutes.includes("https://privatedao.org/services/"), "treasury reviewer packet missing services route");
    for (const token of [
        "# Treasury Reviewer Packet",
        "## Strict Sender Checklist",
        "## Reference-Linked Rails",
        "## Reviewer Truth Links",
        "## Commercial + Payments Focus Alignment",
        "## Exact Mainnet Blocker",
        "docs/reviewer-telemetry-packet.generated.md",
        "docs/canonical-custody-proof.generated.md",
    ]) {
        assert(markdown.includes(token), `treasury reviewer packet markdown is missing: ${token}`);
    }
    console.log("Treasury reviewer packet verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
