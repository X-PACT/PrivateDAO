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
  const jsonPath = path.resolve("docs/real-device-runtime.generated.json");
  const mdPath = path.resolve("docs/real-device-runtime.generated.md");
  const sourcePath = path.resolve("docs/real-device-runtime-captures.json");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath) || !fs.existsSync(sourcePath)) {
    throw new Error("missing real-device runtime evidence artifacts");
  }

  const evidence = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Evidence;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(evidence.project === "PrivateDAO", "real-device runtime evidence project mismatch");
  assert(evidence.network === "devnet", "real-device runtime evidence network mismatch");
  assert(evidence.summary.targetCount >= 5, "real-device runtime evidence target count is unexpectedly low");
  assert(evidence.targets.some((target) => target.walletLabel === "Phantom"), "real-device runtime evidence missing Phantom target");
  assert(evidence.targets.some((target) => target.walletLabel === "Solflare"), "real-device runtime evidence missing Solflare target");
  assert(evidence.targets.some((target) => target.walletLabel === "Backpack"), "real-device runtime evidence missing Backpack target");
  assert(evidence.targets.some((target) => target.walletLabel === "Glow"), "real-device runtime evidence missing Glow target");
  assert(evidence.targets.some((target) => target.environmentType === "android-or-mobile"), "real-device runtime evidence missing mobile target");
  assert(evidence.requiredDocs.includes("docs/real-device-runtime.md"), "real-device runtime evidence missing guide doc");
  assert(evidence.requiredDocs.includes("docs/real-device-runtime-captures.json"), "real-device runtime evidence missing source registry doc");
  assert(evidence.commands.includes("npm run build:real-device-runtime"), "real-device runtime evidence missing build command");
  assert(evidence.commands.includes("npm run verify:real-device-runtime"), "real-device runtime evidence missing verify command");

  for (const capture of evidence.captures) {
    assert(capture.network === "devnet", "real-device runtime capture must remain devnet-scoped");
    if (capture.submissionResult === "success") {
      assert(Boolean(capture.txSignature), "real-device runtime capture success is missing tx signature");
      assert(Boolean(capture.explorerUrl?.includes("devnet")), "real-device runtime capture success is missing devnet explorer url");
    }
  }

  assert(markdown.includes("# Real-Device Runtime Evidence"), "real-device runtime markdown missing title");
  assert(markdown.includes("Target Matrix"), "real-device runtime markdown missing target matrix");
  assert(markdown.includes("Honest Boundary"), "real-device runtime markdown missing honest boundary");

  console.log("Real-device runtime evidence verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
