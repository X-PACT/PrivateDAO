"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/launch-trust-packet.generated.json");
    const mdPath = path_1.default.resolve("docs/launch-trust-packet.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing launch trust packet artifacts");
    }
    const packet = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(packet.project === "PrivateDAO", "launch trust packet project mismatch");
    assert(packet.decision === "blocked-external-steps", "launch trust packet must preserve blocked-external decision");
    assert(packet.productionMainnetClaimAllowed === false, "launch trust packet must not allow production mainnet claims");
    assert(packet.custody.threshold === "2-of-3", "launch trust packet threshold mismatch");
    assert(packet.custody.minimumTimelockHours >= 48, "launch trust packet timelock floor is too low");
    assert(packet.custody.pendingAuthorityTransfers.includes("program-upgrade-authority"), "launch trust packet missing program authority transfer");
    assert(packet.custody.observedDevnetAuthority === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "launch trust packet observed devnet authority mismatch");
    assert(packet.runtime.targetCount >= 5, "launch trust packet runtime target count is too low");
    assert(packet.runtime.pendingTargets.includes("Phantom"), "launch trust packet missing Phantom pending target");
    assert(packet.audit.status === "pending-external", "launch trust packet audit boundary must remain pending");
    assert(packet.pilot.lifecycle.join(" -> ") === "Create DAO -> Submit proposal -> Private vote -> Execute treasury", "launch trust packet pilot lifecycle mismatch");
    assert(packet.pilot.packs.includes("Grant Committee Pack"), "launch trust packet missing Grant Committee pack");
    assert(packet.v3Evidence.liveProof === "docs/test-wallet-live-proof-v3.generated.md", "launch trust packet missing V3 live proof");
    assert(packet.v3Evidence.status === "devnet-proven", "launch trust packet V3 evidence status mismatch");
    assert(packet.v3Evidence.boundary === "test-wallet-devnet-only", "launch trust packet V3 boundary mismatch");
    assert(packet.linkedDocs.includes("docs/production-custody-ceremony.md"), "launch trust packet missing custody ceremony doc");
    assert(packet.linkedDocs.includes("docs/canonical-custody-proof.generated.md"), "launch trust packet missing canonical custody proof doc");
    assert(packet.linkedDocs.includes("docs/custody-proof-reviewer-packet.generated.md"), "launch trust packet missing custody reviewer packet doc");
    assert(packet.linkedDocs.includes("docs/custody-observed-readouts.json"), "launch trust packet missing custody observed readouts source");
    assert(packet.linkedDocs.includes("docs/governance-hardening-v3.md"), "launch trust packet missing governance v3 doc");
    assert(packet.linkedDocs.includes("docs/settlement-hardening-v3.md"), "launch trust packet missing settlement v3 doc");
    assert(packet.linkedDocs.includes("docs/test-wallet-live-proof-v3.generated.md"), "launch trust packet missing V3 live proof doc");
    assert(packet.linkedDocs.includes("docs/external-audit-engagement.md"), "launch trust packet missing external audit engagement doc");
    assert(packet.linkedDocs.includes("docs/pilot-onboarding-playbook.md"), "launch trust packet missing pilot onboarding playbook");
    assert(packet.commands.includes("npm run verify:launch-trust-packet"), "launch trust packet missing self verification command");
    assert(packet.commands.includes("npm run verify:custody-proof-reviewer-packet"), "launch trust packet missing reviewer packet verification command");
    for (const token of [
        "# Launch Trust Packet",
        "docs/production-custody-ceremony.md",
        "docs/canonical-custody-proof.generated.md",
        "docs/custody-proof-reviewer-packet.generated.md",
        "docs/external-audit-engagement.md",
        "docs/pilot-onboarding-playbook.md",
        "3 production signer public keys",
        "observed devnet authority",
        "Create DAO",
        "Submit proposal",
        "Private vote",
        "Execute treasury",
        "docs/test-wallet-live-proof-v3.generated.md",
        "V3 evidence status",
        "npm run verify:custody-proof-reviewer-packet",
    ]) {
        assert(markdown.includes(token), `launch trust packet markdown is missing: ${token}`);
    }
    console.log("Launch trust packet verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
