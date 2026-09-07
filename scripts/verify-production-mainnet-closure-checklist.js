"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/production-mainnet-closure-checklist.json");
    const markdownPath = path_1.default.resolve("docs/production-mainnet-closure-checklist.md");
    const externalClosurePath = path_1.default.resolve("docs/mainnet-external-closure-packet.md");
    const brandOpsPath = path_1.default.resolve("docs/brand-search-ops.md");
    const blockersPath = path_1.default.resolve("docs/mainnet-blockers.json");
    assertFile(jsonPath);
    assertFile(markdownPath);
    assertFile(externalClosurePath);
    assertFile(brandOpsPath);
    assertFile(blockersPath);
    const checklist = readJson(jsonPath);
    const markdown = fs_1.default.readFileSync(markdownPath, "utf8");
    const externalClosure = fs_1.default.readFileSync(externalClosurePath, "utf8");
    const brandOps = fs_1.default.readFileSync(brandOpsPath, "utf8");
    const blockers = readJson(blockersPath);
    assert(checklist.schemaVersion === 1, "unexpected production-mainnet-closure-checklist schema version");
    assert(checklist.project === "PrivateDAO", "closure checklist must be bound to PrivateDAO");
    assert(checklist.status === "pending-external", "closure checklist must preserve pending-external state");
    assert(checklist.productionMainnetClaimAllowed === false, "closure checklist must not allow production claim yet");
    assert(checklist.closedInternalReadiness.pdaoLiveMetadataCutover === true, "pdaoLiveMetadataCutover must be true");
    assert(checklist.closedInternalReadiness.brandSearchVerification === true, "brandSearchVerification must be true");
    assert(checklist.closedInternalReadiness.devnetRehearsalMultisig === true, "devnetRehearsalMultisig must be true");
    assert(checklist.closedInternalReadiness.launchCheckupLocalReady === true, "launchCheckupLocalReady must be true");
    assert(checklist.remainingExternalClosure.productionMultisigCreated === false, "productionMultisigCreated must remain false");
    assert(checklist.remainingExternalClosure.signerCustodyHardened === false, "signerCustodyHardened must remain false");
    assert(checklist.remainingExternalClosure.timelockConfigured === false, "timelockConfigured must remain false");
    assert(checklist.remainingExternalClosure.authorityTransfersComplete === false, "authorityTransfersComplete must remain false");
    assert(checklist.remainingExternalClosure.postTransferReadoutsRecorded === false, "postTransferReadoutsRecorded must remain false");
    assert(checklist.remainingExternalClosure.mainnetCutoverCeremonyComplete === false, "mainnetCutoverCeremonyComplete must remain false");
    assert(checklist.deployFunding.deployOnlyRecommendedSol >= 20, "deployOnlyRecommendedSol must be at least 20");
    assert(checklist.deployFunding.fundingReady === false, "fundingReady must remain false");
    for (const evidencePath of checklist.canonicalEvidence) {
        assertFile(path_1.default.resolve(evidencePath));
        assert(markdown.includes(evidencePath), `closure checklist markdown must reference ${evidencePath}`);
    }
    assert(markdown.includes("Google Search Console verified"), "closure checklist markdown must mention Google verification");
    assert(markdown.includes("Bing Webmaster imported from Google and verified"), "closure checklist markdown must mention Bing verification");
    assert(markdown.includes("20 SOL"), "closure checklist markdown must mention deploy-only funding");
    assert(externalClosure.includes("complete on Devnet"), "external closure packet must mark PDAO live cutover complete on Devnet");
    assert(externalClosure.includes("verify:pdao-live"), "external closure packet must reference verify:pdao-live");
    assert(brandOps.includes("Google Search Console:"), "brand search ops must record Google verification");
    assert(brandOps.includes("domain property verified for `privatedao.org`"), "brand search ops must record the verified Google domain property");
    assert(brandOps.includes("Bing Webmaster Tools:"), "brand search ops must record Bing closure");
    assert(brandOps.includes("verification closed through Google import"), "brand search ops must record the Bing import closure");
    assert(blockers.blockers.some((blocker) => blocker.status !== "complete"), "mainnet blockers must still remain open");
    assert(checklist.finishLineRule.includes("only deploy wallet funding remains"), "finish line rule must preserve the honest boundary");
    console.log("Production mainnet closure checklist verification: PASS (internal closure recorded, external closure still pending)");
}
function readJson(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
}
function assertFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`missing required file: ${path_1.default.relative(process.cwd(), filePath)}`);
    }
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
