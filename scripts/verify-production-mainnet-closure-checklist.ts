import fs from "fs";
import path from "path";

type ClosureChecklist = {
  schemaVersion: number;
  project: string;
  status: string;
  productionMainnetClaimAllowed: boolean;
  closedInternalReadiness: Record<string, boolean>;
  remainingExternalClosure: Record<string, boolean>;
  deployFunding: {
    deployOnlyRecommendedSol: number;
    fundingReady: boolean;
  };
  canonicalEvidence: string[];
  finishLineRule: string;
};

function main(): void {
  const jsonPath = path.resolve("docs/production-mainnet-closure-checklist.json");
  const markdownPath = path.resolve("docs/production-mainnet-closure-checklist.md");
  const externalClosurePath = path.resolve("docs/mainnet-external-closure-packet.md");
  const brandOpsPath = path.resolve("docs/brand-search-ops.md");
  const blockersPath = path.resolve("docs/mainnet-blockers.json");

  assertFile(jsonPath);
  assertFile(markdownPath);
  assertFile(externalClosurePath);
  assertFile(brandOpsPath);
  assertFile(blockersPath);

  const checklist = readJson<ClosureChecklist>(jsonPath);
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const externalClosure = fs.readFileSync(externalClosurePath, "utf8");
  const brandOps = fs.readFileSync(brandOpsPath, "utf8");
  const blockers = readJson<{ blockers: Array<{ status: string }> }>(blockersPath);

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
    assertFile(path.resolve(evidencePath));
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

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function assertFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing required file: ${path.relative(process.cwd(), filePath)}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

main();
