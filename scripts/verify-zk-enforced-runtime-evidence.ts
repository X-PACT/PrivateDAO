import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    modeActivationSuccessCount: number;
    finalizeSuccessCount: number;
    diagnosticsCaptureCount: number;
    pendingTargets: string[];
  };
  targets: Array<{
    id: string;
    walletLabel: string;
    environmentType: string;
    status: string;
  }>;
  captures: Array<{
    walletLabel: string;
    environmentType: string;
    network: string;
    proposalPublicKey: string;
    receiptModes: {
      vote: string;
      delegation: string;
      tally: string;
    };
    modeActivationResult: string;
    finalizeResult: string;
    diagnosticsSnapshotCaptured: boolean;
    enableModeTxSignature?: string | null;
    finalizeTxSignature?: string | null;
    explorerUrls?: {
      enableMode?: string | null;
      finalize?: string | null;
    };
    capturedAt: string;
  }>;
  requiredDocs: string[];
  commands: string[];
  status: string;
};

function main() {
  const jsonPath = path.resolve("docs/zk-enforced-runtime.generated.json");
  const mdPath = path.resolve("docs/zk-enforced-runtime.generated.md");
  const sourcePath = path.resolve("docs/zk-enforced-runtime-captures.json");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath) || !fs.existsSync(sourcePath)) {
    throw new Error("missing zk-enforced runtime evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "zk-enforced runtime evidence project mismatch");
  assert(evidence.network === "devnet", "zk-enforced runtime evidence network mismatch");
  assert(evidence.summary.targetCount >= 5, "zk-enforced runtime evidence target count is unexpectedly low");
  assert(evidence.targets.some((target) => target.walletLabel === "Phantom"), "zk-enforced runtime evidence missing Phantom target");
  assert(evidence.targets.some((target) => target.walletLabel === "Solflare"), "zk-enforced runtime evidence missing Solflare target");
  assert(evidence.targets.some((target) => target.walletLabel === "Backpack"), "zk-enforced runtime evidence missing Backpack target");
  assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "zk-enforced runtime evidence missing Glow target");
  assert(evidence.targets.some((target) => target.environmentType === "android-or-mobile"), "zk-enforced runtime evidence missing mobile target");
  assert(evidence.requiredDocs.includes("docs/zk-enforced-runtime-evidence.md"), "zk-enforced runtime evidence missing guide doc");
  assert(evidence.requiredDocs.includes("docs/zk-enforced-runtime-captures.json"), "zk-enforced runtime evidence missing source registry");
  assert(evidence.requiredDocs.includes("docs/zk-enforced-operator-flow.md"), "zk-enforced runtime evidence missing operator flow doc");
  assert(evidence.commands.includes("npm run build:zk-enforced-runtime"), "zk-enforced runtime evidence missing build command");
  assert(evidence.commands.includes("npm run verify:zk-enforced-runtime"), "zk-enforced runtime evidence missing verify command");

  for (const capture of evidence.captures) {
    assert(capture.network === "devnet", "zk-enforced runtime capture must remain devnet-scoped");
    assert(Boolean(capture.proposalPublicKey), "zk-enforced runtime capture is missing proposal public key");
    if (capture.modeActivationResult === "success") {
      assert(capture.receiptModes.vote === "zk_enforced", "successful mode activation is missing vote zk_enforced receipt");
      assert(capture.receiptModes.delegation === "zk_enforced", "successful mode activation is missing delegation zk_enforced receipt");
      assert(capture.receiptModes.tally === "zk_enforced", "successful mode activation is missing tally zk_enforced receipt");
      assert(Boolean(capture.enableModeTxSignature), "successful mode activation is missing tx signature");
      assert(Boolean(capture.explorerUrls?.enableMode?.includes("devnet")), "successful mode activation is missing devnet explorer url");
    }
    if (capture.finalizeResult === "success") {
      assert(Boolean(capture.finalizeTxSignature), "successful zk-enforced finalize is missing tx signature");
      assert(Boolean(capture.explorerUrls?.finalize?.includes("devnet")), "successful zk-enforced finalize is missing devnet explorer url");
    }
  }

  assert(markdown.includes("# ZK-Enforced Runtime Evidence"), "zk-enforced runtime markdown missing title");
  assert(markdown.includes("Target Matrix"), "zk-enforced runtime markdown missing target matrix");
  assert(markdown.includes("Honest Boundary"), "zk-enforced runtime markdown missing honest boundary");

  console.log("ZK-enforced runtime evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
