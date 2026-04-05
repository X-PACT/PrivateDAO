import fs from "fs";
import path from "path";

type Matrix = {
  project: string;
  programId: string;
  verificationWallet: string;
  acceptanceDecision: string;
  summary: {
    acceptedInRepo: number;
    pendingExternal: number;
    notInRepo: number;
    runtimeWalletCount: number;
  };
  rows: Array<{
    layer: string;
    status: string;
    evidence: string[];
    rationale: string;
  }>;
};

function main() {
  const jsonPath = path.resolve("docs/mainnet-acceptance-matrix.generated.json");
  const mdPath = path.resolve("docs/mainnet-acceptance-matrix.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing mainnet acceptance matrix artifacts");
  }

  const matrix = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Matrix;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(matrix.project === "PrivateDAO", "acceptance matrix project mismatch");
  assert(matrix.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "acceptance matrix program mismatch");
  assert(matrix.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "acceptance matrix verification wallet mismatch");
  assert(matrix.summary.acceptedInRepo >= 5, "acceptance matrix accepted count is unexpectedly low");
  assert(matrix.summary.pendingExternal >= 2, "acceptance matrix pending count is unexpectedly low");
  assert(matrix.rows.some((row) => row.layer === "governance-lifecycle" && row.status === "accepted-in-repo"), "acceptance matrix missing governance lifecycle row");
  assert(matrix.rows.some((row) => row.layer === "external-audit" && row.status === "pending-external"), "acceptance matrix missing external audit row");
  assert(matrix.rows.some((row) => row.layer === "real-device-wallet-qa" && row.status === "pending-external"), "acceptance matrix missing real-device QA row");
  assert(matrix.rows.some((row) => row.layer === "strategy-engine-and-live-performance" && row.status === "not-in-repo"), "acceptance matrix missing strategy boundary row");

  for (const token of [
    "# Mainnet Acceptance Matrix",
    "acceptance decision",
    "governance-lifecycle",
    "external-audit",
    "real-device-wallet-qa",
    "docs/external-readiness-intake.md",
    "docs/real-device-runtime.generated.md",
    "docs/operational-evidence.generated.md",
    "docs/runtime-evidence.generated.md",
    "docs/release-drill.generated.md",
  ]) {
    assert(markdown.includes(token), `acceptance matrix markdown is missing: ${token}`);
  }

  console.log("Mainnet acceptance matrix verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
