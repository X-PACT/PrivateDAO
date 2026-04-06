import fs from "fs";
import path from "path";

type Evidence = {
  project: string;
  network: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    depositSuccessCount: number;
    privateTransferSuccessCount: number;
    settleSuccessCount: number;
    executeSuccessCount: number;
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
    corridorPda: string;
    settlementWallet: string;
    validator: string | null;
    transferQueue: string | null;
    depositResult: string;
    privateTransferResult: string;
    withdrawResult: string;
    settleResult: string;
    executeResult: string;
    diagnosticsSnapshotCaptured: boolean;
    depositTxSignature?: string | null;
    transferTxSignature?: string | null;
    withdrawTxSignature?: string | null;
    settleTxSignature?: string | null;
    executeTxSignature?: string | null;
    explorerUrls?: {
      deposit?: string | null;
      transfer?: string | null;
      withdraw?: string | null;
      settle?: string | null;
      execute?: string | null;
    };
    capturedAt: string;
  }>;
  requiredDocs: string[];
  commands: string[];
  status: string;
};

function main() {
  const jsonPath = path.resolve("docs/magicblock/runtime.generated.json");
  const mdPath = path.resolve("docs/magicblock/runtime.generated.md");
  const sourcePath = path.resolve("docs/magicblock/runtime-captures.json");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath) || !fs.existsSync(sourcePath)) {
    throw new Error("missing MagicBlock runtime evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "MagicBlock runtime evidence project mismatch");
  assert(evidence.network === "devnet", "MagicBlock runtime evidence network mismatch");
  assert(evidence.summary.targetCount >= 5, "MagicBlock runtime evidence target count is unexpectedly low");
  assert(evidence.targets.some((target) => target.walletLabel === "Phantom"), "MagicBlock runtime evidence missing Phantom target");
  assert(evidence.targets.some((target) => target.walletLabel === "Solflare"), "MagicBlock runtime evidence missing Solflare target");
  assert(evidence.targets.some((target) => target.walletLabel === "Backpack"), "MagicBlock runtime evidence missing Backpack target");
  assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "MagicBlock runtime evidence missing Glow target");
  assert(evidence.targets.some((target) => target.environmentType === "android-or-mobile"), "MagicBlock runtime evidence missing mobile target");
  assert(evidence.requiredDocs.includes("docs/magicblock/private-payments.md"), "MagicBlock runtime evidence missing feature note");
  assert(evidence.requiredDocs.includes("docs/magicblock/operator-flow.md"), "MagicBlock runtime evidence missing operator flow");
  assert(evidence.requiredDocs.includes("docs/magicblock/runtime-evidence.md"), "MagicBlock runtime evidence missing guide");
  assert(evidence.commands.includes("npm run build:magicblock-runtime"), "MagicBlock runtime evidence missing build command");
  assert(evidence.commands.includes("npm run verify:magicblock-runtime"), "MagicBlock runtime evidence missing verify command");

  for (const capture of evidence.captures) {
    assert(capture.network === "devnet", "MagicBlock runtime capture must remain devnet-scoped");
    assert(Boolean(capture.proposalPublicKey), "MagicBlock runtime capture is missing proposal public key");
    assert(Boolean(capture.corridorPda), "MagicBlock runtime capture is missing corridor PDA");
    assert(Boolean(capture.settlementWallet), "MagicBlock runtime capture is missing settlement wallet");
    if (capture.depositResult === "success") {
      assert(Boolean(capture.depositTxSignature), "successful MagicBlock deposit is missing tx signature");
      assert(Boolean(capture.explorerUrls?.deposit?.includes("devnet")), "successful MagicBlock deposit is missing devnet explorer url");
    }
    if (capture.privateTransferResult === "success") {
      assert(Boolean(capture.transferTxSignature), "successful MagicBlock transfer is missing tx signature");
      assert(Boolean(capture.explorerUrls?.transfer?.includes("devnet")), "successful MagicBlock transfer is missing devnet explorer url");
    }
    if (capture.settleResult === "success") {
      assert(Boolean(capture.validator), "successful MagicBlock settlement is missing validator");
      assert(Boolean(capture.transferQueue), "successful MagicBlock settlement is missing transfer queue");
      assert(Boolean(capture.settleTxSignature), "successful MagicBlock settlement is missing tx signature");
      assert(Boolean(capture.explorerUrls?.settle?.includes("devnet")), "successful MagicBlock settlement is missing devnet explorer url");
    }
    if (capture.executeResult === "success") {
      assert(Boolean(capture.executeTxSignature), "successful MagicBlock payout execution is missing tx signature");
      assert(Boolean(capture.explorerUrls?.execute?.includes("devnet")), "successful MagicBlock payout execution is missing devnet explorer url");
    }
  }

  assert(markdown.includes("# MagicBlock Runtime Evidence"), "MagicBlock runtime markdown missing title");
  assert(markdown.includes("Target Matrix"), "MagicBlock runtime markdown missing target matrix");
  assert(markdown.includes("Honest Boundary"), "MagicBlock runtime markdown missing honest boundary");

  console.log("MagicBlock runtime evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
