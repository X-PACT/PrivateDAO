import fs from "fs";
import path from "path";

type Package = {
  project: string;
  packageDecision: string;
  coreArtifacts: string[];
  summary: { acceptedInRepo: number; pendingExternal: number; notInRepo: number };
  readinessAnchor: { project: string; programId: string; verificationWallet: string };
  commands: string[];
};

function main() {
  const jsonPath = path.resolve("docs/mainnet-proof-package.generated.json");
  const mdPath = path.resolve("docs/mainnet-proof-package.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing mainnet proof package artifacts");
  }

  const pkg = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Package;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(pkg.project === "PrivateDAO", "mainnet proof package project mismatch");
  assert(pkg.readinessAnchor.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "mainnet proof package program mismatch");
  assert(pkg.readinessAnchor.verificationWallet === "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD", "mainnet proof package verification wallet mismatch");
  assert(pkg.coreArtifacts.includes("docs/mainnet-acceptance-matrix.generated.md"), "mainnet proof package missing acceptance matrix");
  assert(pkg.coreArtifacts.includes("docs/external-readiness-intake.md"), "mainnet proof package missing external readiness intake");
  assert(pkg.coreArtifacts.includes("docs/operational-evidence.generated.md"), "mainnet proof package missing operational evidence");
  assert(pkg.coreArtifacts.includes("docs/real-device-runtime.generated.md"), "mainnet proof package missing real-device runtime evidence");
  assert(pkg.commands.includes("npm run verify:mainnet-proof-package"), "mainnet proof package missing self verification command");
  assert(pkg.summary.acceptedInRepo >= 5, "mainnet proof package accepted count is unexpectedly low");

  for (const token of [
    "# Mainnet Proof Package",
    "docs/mainnet-readiness.generated.md",
    "docs/mainnet-acceptance-matrix.generated.md",
    "docs/release-drill.generated.md",
    "docs/operational-evidence.generated.md",
    "docs/runtime-evidence.generated.md",
    "docs/real-device-runtime.generated.md",
    "docs/external-readiness-intake.md",
    "npm run verify:mainnet-proof-package",
  ]) {
    assert(markdown.includes(token), `mainnet proof package markdown is missing: ${token}`);
  }

  console.log("Mainnet proof package verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
