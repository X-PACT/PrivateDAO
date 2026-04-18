import fs from "fs";
import path from "path";

import { getCanonicalCustodyProofSnapshot } from "../apps/web/src/lib/canonical-custody-proof";

function line(label: string, value: string | number | boolean | null) {
  return `- ${label}: \`${value ?? "pending"}\``;
}

function main() {
  const snapshot = getCanonicalCustodyProofSnapshot();

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    ...snapshot,
  };

  fs.writeFileSync(
    path.resolve("docs/canonical-custody-proof.generated.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.resolve("docs/canonical-custody-proof.generated.md"),
    buildMarkdown(payload),
  );
  console.log("Wrote canonical custody proof artifacts");
}

function buildMarkdown(payload: ReturnType<typeof getCanonicalCustodyProofSnapshot> & {
  project: string;
  generatedAt: string;
}) {
  return `# Canonical Custody Proof

## Overview

${line("project", payload.project)}
${line("generated at", payload.generatedAt)}
${line("status", payload.status)}
${line("production mainnet claim allowed", payload.productionMainnetClaimAllowed)}
${line("network", payload.network)}
${line("completion", `${payload.completedItems}/${payload.totalItems}`)}

## Existing Devnet Rehearsal

${line("network", payload.multisig.rehearsalSource.network)}
${line("implementation", payload.multisig.rehearsalSource.implementation)}
${line("rehearsal multisig address", payload.multisig.rehearsalSource.address)}
${line("rehearsal multisig creation signature", payload.multisig.rehearsalSource.creationSignature)}
${line("rehearsal multisig explorer", payload.multisig.rehearsalSource.addressExplorerUrl)}
${line("rehearsal creation explorer", payload.multisig.rehearsalSource.creationExplorerUrl)}

## Multisig And Timelock

${line("implementation", payload.multisig.implementation)}
${line("multisig address", payload.multisig.address)}
${line("threshold", payload.multisig.threshold)}
${line("creation signature", payload.multisig.creationSignature)}
${line("rehearsal signature", payload.multisig.rehearsalSignature)}
${line("minimum timelock hours", payload.timelock.minimumHours)}
${line("configured timelock hours", payload.timelock.configuredHours)}
${line("timelock configuration signature", payload.timelock.configurationSignature)}
${line("timelock configuration reference url", payload.timelock.configurationReferenceUrl)}

Explorer links:

- multisig address explorer: ${payload.multisig.addressExplorerUrl ?? "pending"}
- multisig creation explorer: ${payload.multisig.creationExplorerUrl ?? "pending"}
- rehearsal explorer: ${payload.multisig.rehearsalExplorerUrl ?? "pending"}
- timelock config explorer: ${payload.timelock.configurationExplorerUrl ?? "pending"}

## Signer Roster

${payload.signers
  .map(
    (signer) => `### Slot ${signer.slot} · ${signer.role}

${line("public key", signer.publicKey)}
${line("storage class", signer.storageClass)}
${line("backup documented", signer.backupProcedureDocumented)}
${line("explorer", signer.publicKeyExplorerUrl)}
`,
  )
  .join("\n")}

## Authority Transfer Proof

${payload.authorityTransfers
  .map(
    (transfer) => `### ${transfer.surface}

${line("program id", transfer.programId)}
${line("destination authority", transfer.destinationAuthority)}
${line("transfer signature", transfer.transferSignature)}
${line("post-transfer readout", transfer.postTransferReadout)}
${line("program explorer", transfer.programExplorerUrl)}
${line("destination explorer", transfer.destinationExplorerUrl)}
${line("transfer explorer", transfer.transferExplorerUrl)}
${line("post-transfer readout reference", transfer.postTransferReadoutReferenceUrl)}
`,
  )
  .join("\n")}

## Observed Chain Readouts

${payload.observedReadouts
  .map(
    (readout) => `### ${readout.label}

${line("cluster", readout.cluster)}
${line("status", readout.status)}
${line("address", readout.address)}
${line("authority", readout.authority)}
${line("owner", readout.owner)}
${line("program data address", readout.programDataAddress)}
${line("last deploy slot", readout.lastDeploySlot)}
${line("balance sol", readout.balanceSol)}
${line("explorer", readout.explorerUrl)}
${line("observed at", readout.observedAt)}
${line("command", readout.command)}
${line("error", readout.error)}
${line("note", readout.note)}
`,
  )
  .join("\n")}

## Exact Pending Items

${payload.pendingItems.map((item) => `- ${item}`).join("\n")}

## Exact Blocker

${line("blocker id", payload.blocker.id)}
${line("severity", payload.blocker.severity)}
${line("status", payload.blocker.status)}

Next action:

${payload.blocker.nextAction}

Evidence references:

${payload.blocker.evidence.map((item) => `- \`${item}\``).join("\n")}

## Canonical Sources

${payload.rawSources.map((source) => `- [${source.label}](${source.href})`).join("\n")}

## Honest Boundary

This packet is the canonical custody truth surface for PrivateDAO.

It records the real fields, real pending items, and real observed chain readouts available today.

It does not claim that the production multisig, authority transfer signatures, or post-transfer readouts already exist until those values and links are actually recorded.
`;
}

main();
