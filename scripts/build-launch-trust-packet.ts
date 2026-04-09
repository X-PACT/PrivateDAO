import fs from "fs";
import path from "path";

type MultisigIntake = {
  status: string;
  productionMainnetClaimAllowed: boolean;
  multisig: {
    requiredThreshold: number;
    requiredSignerCount: number;
    implementation: string;
    address: string | null;
  };
  timelock: {
    minimumHours: number;
    configuredHours: number | null;
  };
  signers: Array<{ publicKey: string | null }>;
  authorityTransfers: Array<{ surface: string; transferSignature: string | null; postTransferReadout: string | null }>;
};

type LaunchChecklist = {
  decision: string;
  items: Array<{ id: string; status: string }>;
};

type MainnetBlockers = {
  decision: string;
  productionMainnetClaimAllowed: boolean;
  blockers: Array<{ id: string; status: string; nextAction: string }>;
};

type RealDeviceEvidence = {
  status: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    pendingTargets: string[];
  };
};

function main() {
  const multisig = readJson<MultisigIntake>("docs/multisig-setup-intake.json");
  const launchOps = readJson<LaunchChecklist>("docs/launch-ops-checklist.json");
  const blockers = readJson<MainnetBlockers>("docs/mainnet-blockers.json");
  const realDevice = readJson<RealDeviceEvidence>("docs/runtime/real-device.generated.json");

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    decision: blockers.decision,
    productionMainnetClaimAllowed: blockers.productionMainnetClaimAllowed,
    custody: {
      status: multisig.status,
      implementation: multisig.multisig.implementation,
      threshold: `${multisig.multisig.requiredThreshold}-of-${multisig.multisig.requiredSignerCount}`,
      multisigAddress: multisig.multisig.address,
      signerSlotsConfigured: multisig.signers.filter((entry) => Boolean(entry.publicKey)).length,
      pendingAuthorityTransfers: multisig.authorityTransfers.filter((entry) => !entry.transferSignature).map((entry) => entry.surface),
      minimumTimelockHours: multisig.timelock.minimumHours,
      configuredTimelockHours: multisig.timelock.configuredHours,
    },
    runtime: {
      status: realDevice.status,
      completedTargetCount: realDevice.summary.completedTargetCount,
      targetCount: realDevice.summary.targetCount,
      pendingTargets: realDevice.summary.pendingTargets,
    },
    audit: {
      status: blockers.blockers.find((entry) => entry.id === "external-audit-completion")?.status ?? "pending-external",
      pendingAction:
        blockers.blockers.find((entry) => entry.id === "external-audit-completion")?.nextAction ??
        "Complete the external audit and record closure.",
    },
    pilot: {
      status: launchOps.decision === "blocked-external-steps" ? "repo-ready-pending-external-target" : "unexpected",
      lifecycle: ["Create DAO", "Submit proposal", "Private vote", "Execute treasury"],
      packs: [
        "Grant Committee Pack",
        "Fund Governance Pack",
        "Gaming DAO Pack",
        "Enterprise DAO Pack",
      ],
    },
    linkedDocs: [
      "docs/multisig-setup-intake.md",
      "docs/production-custody-ceremony.md",
      "docs/authority-transfer-runbook.md",
      "docs/external-audit-engagement.md",
      "docs/audit-handoff.md",
      "docs/runtime/real-device.md",
      "docs/pilot-onboarding-playbook.md",
      "docs/pilot-program.md",
      "docs/trust-package.md",
      "docs/mainnet-blockers.md",
    ],
    requiredExternalInputs: [
      "3 production signer public keys",
      "chosen multisig implementation and address",
      "48+ hour timelock configuration evidence",
      "authority transfer signatures and readouts",
      "real-device wallet captures",
      "external audit report or signed memo",
      "first pilot DAO target and operator contact",
    ],
    commands: [
      "npm run build:launch-trust-packet",
      "npm run verify:launch-trust-packet",
      "npm run verify:multisig-intake",
      "npm run verify:launch-ops",
      "npm run verify:mainnet-blockers",
      "npm run verify:real-device-runtime",
      "npm run check:mainnet",
    ],
  };

  fs.writeFileSync(path.resolve("docs/launch-trust-packet.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/launch-trust-packet.generated.md"), buildMarkdown(payload));
  console.log("Wrote launch trust packet");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  decision: string;
  productionMainnetClaimAllowed: boolean;
  custody: {
    status: string;
    implementation: string;
    threshold: string;
    multisigAddress: string | null;
    signerSlotsConfigured: number;
    pendingAuthorityTransfers: string[];
    minimumTimelockHours: number;
    configuredTimelockHours: number | null;
  };
  runtime: {
    status: string;
    completedTargetCount: number;
    targetCount: number;
    pendingTargets: string[];
  };
  audit: { status: string; pendingAction: string };
  pilot: { status: string; lifecycle: string[]; packs: string[] };
  linkedDocs: string[];
  requiredExternalInputs: string[];
  commands: string[];
}) {
  return `# Launch Trust Packet

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- current decision: \`${payload.decision}\`
- production mainnet claim allowed: \`${payload.productionMainnetClaimAllowed}\`

## Custody Snapshot

- custody status: \`${payload.custody.status}\`
- multisig implementation: \`${payload.custody.implementation}\`
- threshold target: \`${payload.custody.threshold}\`
- multisig address: \`${payload.custody.multisigAddress ?? "pending"}\`
- signer slots configured: \`${payload.custody.signerSlotsConfigured}\`
- minimum timelock hours: \`${payload.custody.minimumTimelockHours}\`
- configured timelock hours: \`${payload.custody.configuredTimelockHours ?? "pending"}\`

Pending authority transfers:

${payload.custody.pendingAuthorityTransfers.map((entry) => `- \`${entry}\``).join("\n")}

## Runtime Snapshot

- runtime status: \`${payload.runtime.status}\`
- completed targets: \`${payload.runtime.completedTargetCount}/${payload.runtime.targetCount}\`

Pending real-device targets:

${payload.runtime.pendingTargets.map((entry) => `- ${entry}`).join("\n")}

## Audit Snapshot

- audit status: \`${payload.audit.status}\`
- next action: ${payload.audit.pendingAction}

## Pilot Snapshot

- pilot status: \`${payload.pilot.status}\`

Lifecycle to prove for the first pilot:

${payload.pilot.lifecycle.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}

Available use-case packs:

${payload.pilot.packs.map((entry) => `- ${entry}`).join("\n")}

## Required External Inputs

${payload.requiredExternalInputs.map((entry) => `- ${entry}`).join("\n")}

## Linked Docs

${payload.linkedDocs.map((entry) => `- \`${entry}\``).join("\n")}

## Canonical Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Honest Boundary

This packet proves that the repository is operationally prepared for custody, audit, runtime capture, and pilot onboarding.

It does not claim those external actions have already happened until the corresponding addresses, signatures, captures, and audit outputs are recorded.
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
