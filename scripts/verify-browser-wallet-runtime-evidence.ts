import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    successfulConnectCount: number;
    successfulSubmissionCount: number;
    diagnosticsCaptureCount: number;
    actionCoverageCount: number;
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
    actionsCovered: string[];
    connectResult: string;
    signingResult: string;
    submissionResult: string;
    diagnosticsSnapshotCaptured: boolean;
    txSignature?: string | null;
    explorerUrl?: string | null;
    capturedAt: string;
  }>;
  requiredDocs: string[];
  commands: string[];
  status: string;
};

function main() {
  const jsonPath = path.resolve("docs/runtime/browser-wallet.generated.json");
  const mdPath = path.resolve("docs/runtime/browser-wallet.generated.md");
  const sourcePath = path.resolve("docs/runtime/browser-wallet-captures.json");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath) || !fs.existsSync(sourcePath)) {
    throw new Error("missing browser-wallet runtime evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "browser-wallet runtime evidence project mismatch");
  assert(evidence.network === "devnet", "browser-wallet runtime evidence network mismatch");
  assert(evidence.summary.targetCount >= 4, "browser-wallet runtime evidence target count is unexpectedly low");
  assert(
    evidence.targets.some((target) => target.walletLabel === "Phantom"),
    "browser-wallet runtime evidence missing Phantom target",
  );
  assert(
    evidence.targets.some((target) => target.walletLabel === "Solflare"),
    "browser-wallet runtime evidence missing Solflare target",
  );
  assert(
    evidence.targets.some((target) => target.walletLabel === "Backpack"),
    "browser-wallet runtime evidence missing Backpack target",
  );
  assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "browser-wallet runtime evidence missing Glow target");
  assert(evidence.requiredDocs.includes("docs/runtime/browser-wallet.md"), "browser-wallet runtime evidence missing guide doc");
  assert(
    evidence.requiredDocs.includes("docs/runtime/browser-wallet-captures.json"),
    "browser-wallet runtime evidence missing source registry doc",
  );
  assert(
    evidence.commands.includes("npm run build:browser-wallet-runtime"),
    "browser-wallet runtime evidence missing build command",
  );
  assert(
    evidence.commands.includes("npm run verify:browser-wallet-runtime"),
    "browser-wallet runtime evidence missing verify command",
  );

  for (const capture of evidence.captures) {
    assert(capture.network === "devnet", "browser-wallet runtime capture must remain devnet-scoped");
    assert(capture.actionsCovered.length >= 1, "browser-wallet runtime capture must record action coverage");
    if (capture.submissionResult === "success") {
      assert(Boolean(capture.txSignature), "browser-wallet runtime capture success is missing tx signature");
      assert(Boolean(capture.explorerUrl?.includes("devnet")), "browser-wallet runtime capture success is missing devnet explorer url");
    }
  }

  assert(markdown.includes("# Browser-Wallet Runtime Evidence"), "browser-wallet runtime markdown missing title");
  assert(markdown.includes("Target Matrix"), "browser-wallet runtime markdown missing target matrix");
  assert(markdown.includes("Honest Boundary"), "browser-wallet runtime markdown missing honest boundary");

  console.log("Browser-wallet runtime evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
