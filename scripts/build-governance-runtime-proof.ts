import fs from "fs";
import path from "path";

import {
  GOVERNANCE_RUNTIME_STATUS,
  GOVERNANCE_RUNTIME_STATUS_ORDER,
} from "../apps/web/src/lib/governance-runtime-status";
import {
  type CoreGovernanceInstructionName,
  PRIVATE_DAO_CORE_INSTRUCTION_PARITY,
  PRIVATE_DAO_PROGRAM_ID,
} from "../apps/web/src/lib/onchain-parity.generated";

const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "docs/governance-runtime-proof.generated.json");
const MD_PATH = path.join(ROOT, "docs/governance-runtime-proof.generated.md");

function main() {
  const actions = GOVERNANCE_RUNTIME_STATUS_ORDER.map((action) => {
    const parity = PRIVATE_DAO_CORE_INSTRUCTION_PARITY[action as CoreGovernanceInstructionName];
    const runtime = GOVERNANCE_RUNTIME_STATUS[action];
    return {
      action,
      displayName: parity.displayName,
      instructionName: parity.instructionName,
      liveWalletLane: runtime.liveWalletLane,
      repoScriptProofCaptured: runtime.repoScriptProofCaptured,
      browserWalletProofCaptured: runtime.browserWalletProofCaptured,
      realDeviceProofCaptured: runtime.realDeviceProofCaptured,
      supportNote: runtime.supportNote,
    };
  });

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    network: "devnet",
    programId: PRIVATE_DAO_PROGRAM_ID,
    liveWalletLaneCount: actions.filter((entry) => entry.liveWalletLane).length,
    repoScriptProofCount: actions.filter((entry) => entry.repoScriptProofCaptured).length,
    browserWalletProofCount: actions.filter((entry) => entry.browserWalletProofCaptured).length,
    realDeviceProofCount: actions.filter((entry) => entry.realDeviceProofCaptured).length,
    pendingBrowserWalletProofActions: actions
      .filter((entry) => entry.liveWalletLane && !entry.browserWalletProofCaptured)
      .map((entry) => entry.displayName),
    pendingRealDeviceProofActions: actions
      .filter((entry) => entry.liveWalletLane && !entry.realDeviceProofCaptured)
      .map((entry) => entry.displayName),
    unsupportedExecutionBoundary: "CustomCPI treasury actions remain outside the executable release boundary.",
    actions,
    linkedDocs: [
      "docs/test-wallet-live-proof.generated.md",
      "docs/test-wallet-live-proof-v3.generated.md",
      "docs/runtime-evidence.generated.md",
      "docs/runtime/real-device.generated.md",
      "docs/runtime/real-device.md",
      "docs/launch-trust-packet.generated.md",
      "docs/treasury-reviewer-packet.generated.md",
    ],
    commands: [
      "npm run live-proof",
      "npm run live-proof:v3",
      "npm run build:governance-runtime-proof",
      "npm run verify:governance-runtime-proof",
      "npm run build:real-device-runtime",
      "npm run verify:real-device-runtime",
    ],
    notes: [
      "This packet separates live web wallet capability from runtime proof capture so the product does not overclaim based on shipped code alone.",
      "Repo-script proof exists for the governance core lifecycle, but browser-wallet proof on the web and real-device action proof on Android remain pending until captures are recorded.",
      "The web wallet lane currently covers Create DAO, Create Proposal, Commit Vote, Reveal Vote, Finalize Proposal, and Execute Proposal for standard, SendSol, and SendToken proposals.",
    ],
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(MD_PATH, buildMarkdown(payload));
  console.log(`wrote ${path.relative(ROOT, JSON_PATH)}`);
  console.log(`wrote ${path.relative(ROOT, MD_PATH)}`);
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
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
}) {
  const actionLines = payload.actions
    .map((entry) => {
      return [
        `### ${entry.displayName}`,
        "",
        `- Instruction: \`${entry.instructionName}\``,
        `- Live wallet-first lane: \`${entry.liveWalletLane}\``,
        `- Repo-script proof captured: \`${entry.repoScriptProofCaptured}\``,
        `- Browser-wallet proof captured: \`${entry.browserWalletProofCaptured}\``,
        `- Real-device proof captured: \`${entry.realDeviceProofCaptured}\``,
        `- Note: ${entry.supportNote}`,
      ].join("\n");
    })
    .join("\n\n");

  return `# Governance Runtime Proof Status

## Overview

- Generated at: \`${payload.generatedAt}\`
- Project: \`${payload.project}\`
- Network: \`${payload.network}\`
- Program id: \`${payload.programId}\`
- Live wallet-first actions: \`${payload.liveWalletLaneCount}\`
- Repo-script proofs captured: \`${payload.repoScriptProofCount}\`
- Browser-wallet proofs captured: \`${payload.browserWalletProofCount}\`
- Real-device proofs captured: \`${payload.realDeviceProofCount}\`

## Current Boundary

- Unsupported executable boundary: ${payload.unsupportedExecutionBoundary}
- Pending browser-wallet captures: ${payload.pendingBrowserWalletProofActions.join(", ")}
- Pending real-device captures: ${payload.pendingRealDeviceProofActions.join(", ")}

## Action Status

${actionLines}

## Linked Docs

${payload.linkedDocs.map((doc) => `- \`${doc}\``).join("\n")}

## Commands

${payload.commands.map((command) => `- \`${command}\``).join("\n")}

## Notes

${payload.notes.map((note) => `- ${note}`).join("\n")}
`;
}

main();
