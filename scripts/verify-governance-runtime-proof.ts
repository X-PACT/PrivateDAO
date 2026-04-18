import fs from "fs";
import path from "path";

type GovernanceRuntimeProof = {
  project: string;
  network: string;
  programId: string;
  liveWalletLaneCount: number;
  repoScriptProofCount: number;
  browserWalletProofCount: number;
  realDeviceProofCount: number;
  pendingBrowserWalletProofActions: string[];
  pendingRealDeviceProofActions: string[];
  unsupportedExecutionBoundary: string;
  actions: Array<{
    action: string;
    displayName: string;
    instructionName: string;
    liveWalletLane: boolean;
    repoScriptProofCaptured: boolean;
    browserWalletProofCaptured: boolean;
    realDeviceProofCaptured: boolean;
    supportNote: string;
  }>;
  linkedDocs: string[];
  commands: string[];
  notes: string[];
};

function main() {
  const jsonPath = path.resolve("docs/governance-runtime-proof.generated.json");
  const mdPath = path.resolve("docs/governance-runtime-proof.generated.md");
  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing governance runtime proof artifacts");
  }

  const packet = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as GovernanceRuntimeProof;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(packet.project === "PrivateDAO", "project mismatch");
  assert(packet.network === "devnet", "network mismatch");
  assert(packet.programId === "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx", "program id mismatch");
  assert(packet.liveWalletLaneCount === 6, "live wallet lane count mismatch");
  assert(packet.repoScriptProofCount === 6, "repo-script proof count mismatch");
  assert(packet.browserWalletProofCount === 6, "browser-wallet proof count should match the captured Solflare cycle");
  assert(packet.realDeviceProofCount === 3, "real-device proof count should match the captured Android stages");
  assert(packet.actions.length === 6, "action count mismatch");
  assert(packet.pendingBrowserWalletProofActions.length === 0, "pending browser proof list mismatch");
  assert(packet.pendingRealDeviceProofActions.length === 3, "pending real-device proof list mismatch");
  assert(
    packet.unsupportedExecutionBoundary.includes("CustomCPI"),
    "unsupported execution boundary must mention CustomCPI",
  );

  for (const action of ["Create DAO", "Create Proposal", "Commit Vote", "Reveal Vote", "Finalize Proposal", "Execute Proposal"]) {
    assert(markdown.includes(`### ${action}`), `markdown missing action section: ${action}`);
  }
  for (const action of ["Reveal Vote", "Finalize Proposal", "Execute Proposal"]) {
    assert(packet.pendingRealDeviceProofActions.includes(action), `missing real-device pending action: ${action}`);
  }

  for (const doc of [
    "docs/test-wallet-live-proof.generated.md",
    "docs/test-wallet-live-proof-v3.generated.md",
    "docs/runtime-evidence.generated.md",
    "docs/runtime/real-device.generated.md",
  ]) {
    assert(packet.linkedDocs.includes(doc), `missing linked doc: ${doc}`);
  }

  for (const command of [
    "npm run live-proof",
    "npm run live-proof:v3",
    "npm run build:governance-runtime-proof",
    "npm run verify:governance-runtime-proof",
  ]) {
    assert(packet.commands.includes(command), `missing command: ${command}`);
  }

  assert(markdown.includes("# Governance Runtime Proof Status"), "markdown missing title");
  assert(markdown.includes("Pending browser-wallet captures"), "markdown missing pending browser section");
  assert(markdown.includes("Pending real-device captures"), "markdown missing pending device section");
  assert(markdown.includes("Pending browser-wallet captures: none"), "markdown should show no pending browser captures");
  assert(markdown.includes("Real-device proofs captured: `3`"), "markdown should show Android progress");

  console.log("Governance runtime proof verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
